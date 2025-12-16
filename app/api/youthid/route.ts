import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";
import { YouthCardModel } from "@/app/models/SeniorCard/youthCardModel";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const secret = new TextEncoder().encode(JWT_SECRET); // jose requires Uint8Array
const DEFAULT_LIMIT = 50;

// ✅ Verify JWT from cookie
async function verifyToken(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    if (!token) return false;

    try {
        await jwtVerify(token, secret);
        return true;
    } catch {
        return false;
    }
}

// ✅ Check if id column exists
async function hasIdColumn() {
    const [rows]: any = await pool.query(`SHOW COLUMNS FROM tblyouth LIKE 'id'`);
    return Array.isArray(rows) && rows.length > 0;
}

export async function GET(req: NextRequest) {
    try {
        if (!(await verifyToken(req))) {
            return NextResponse.json({ success: false, data: [] }, { status: 401 });
        }

        const url = new URL(req.url);
        const query = url.searchParams.get("query")?.trim() || "";

        let sql = `SELECT * FROM tblyouth`;
        const params: any[] = [];

        if (query) {
            const terms = query.split(",").map(t => t.trim()).filter(Boolean);
            const whereClauses = terms.map(() => `(YouthID LIKE ? OR Fullname LIKE ? OR Status LIKE ?)`);
            params.push(...terms.flatMap(term => [`%${term}%`, `%${term}%`, `%${term}%`]));
            sql += " WHERE " + whereClauses.join(" AND ");
            const firstTerm = terms[0];
            sql += ` ORDER BY CASE
                WHEN YouthID LIKE ? OR Fullname LIKE ? OR Status LIKE ? THEN 1
                ELSE 2
            END`;
            params.push(`%${firstTerm}%`, `%${firstTerm}%`, `%${firstTerm}%`);
        }

        sql += ` LIMIT ${DEFAULT_LIMIT}`;
        const [rows]: any = await pool.query(sql, params);

        const results = rows.map((row: any) => ({
            youthid: row.YouthID,
            fullName: row.Fullname,
            birthDate: row.BirthDate,
            address: row.Address,
            contactPerson: row.ContactPerson,
            contactNum: row.ContactNum,
            contactAddress: row.ContactAddress,
            status: row.Status,
            dateID: row.DateID,
            affiliates: row.Affiliates,
            id: row.id || null, // include id if exists
        }));

        return NextResponse.json({ success: true, data: results });
    } catch (err) {
        console.error("Search error:", err);
        return NextResponse.json({ success: false, data: [] }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    if (!(await verifyToken(req))) {
        return NextResponse.json(
            { success: false, data: [], message: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const body: YouthCardModel = await req.json();
        const idExists = await hasIdColumn();

        // Check if YouthID already exists
        const [existing] = await pool.query(
            "SELECT YouthID FROM tblyouth WHERE YouthID = ?",
            [body.youthid]
        );
        if (Array.isArray(existing) && existing.length > 0) {
            return NextResponse.json(
                { success: false, data: [], message: `YouthID ${body.youthid} already exists` },
                { status: 400 }
            );
        }

        // Insert new record with Status = "not_printed"
        const insertQuery = `
            INSERT INTO tblyouth
            (YouthID, Fullname, BirthDate, Address, barangay, ContactPerson, ContactNum, ContactAddress, Status, DateID, Affiliates)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `;
        const insertValues = [
            body.youthid,
            body.fullName,
            body.birthDate,
            body.address,
            body.barangay,
            body.contactPerson,
            body.contactNum,
            body.contactAddress,
            "ID",
            body.affiliates || "ID",
        ];

        await pool.query(insertQuery, insertValues);

        return NextResponse.json({
            success: true,
            data: [body],
            message: "YouthID added successfully",
        });
    } catch (err) {
        console.error("Insert error:", err);
        return NextResponse.json(
            { success: false, data: [], message: `Server error: ${err}` },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    if (!(await verifyToken(req))) {
        return NextResponse.json({ success: false, data: [] }, { status: 401 });
    }

    function formatDateForMySQL(dateStr: string) {
        if (!dateStr) return null; // handle null/empty gracefully
        const d = new Date(dateStr);
        return `${d.getFullYear()}-${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    }

    try {
        const body: YouthCardModel = await req.json();
        const idExists = await hasIdColumn();

        if (idExists) {
            // YouthID can be edited, use id as key
            await pool.query(
                `UPDATE tblyouth
                 SET YouthID = ?, Fullname = ?, BirthDate = ?, Address = ?, Barangay = ?, ContactPerson = ?, ContactNum = ?, ContactAddress = ?, Status = ?, DateID = ?
                 WHERE id = ?`,
                [
                    body.youthid,
                    body.fullName,
                    formatDateForMySQL(body.birthDate),
                    body.address,
                    body.barangay,
                    body.contactPerson,
                    body.contactNum,
                    body.contactAddress,
                    body.status,
                    formatDateForMySQL(body.dateID),
                    body.id,
                ]
            );
        } else {
            // YouthID cannot be edited
            await pool.query(
                `UPDATE tblyouth
                 SET Fullname = ?, BirthDate = ?, Address = ?, Barangay = ?, ContactPerson = ?, ContactNum = ?, ContactAddress = ?, Status = ?, DateID = ?
                 WHERE YouthID = ?`,
                [
                    body.fullName,
                    formatDateForMySQL(body.birthDate),
                    body.address,
                    body.barangay,
                    body.contactPerson,
                    body.contactNum,
                    body.contactAddress,
                    body.status,
                    formatDateForMySQL(body.dateID),
                    body.youthid,
                ]
            );
        }

        // Pick the correct SELECT query
        const [rows]: any = await pool.query(
            idExists ? "SELECT * FROM tblyouth WHERE id = ?" : "SELECT * FROM tblyouth WHERE YouthID = ?",
            idExists ? [body.id] : [body.youthid]
        );

        if (!rows || rows.length === 0) {
            return NextResponse.json({ success: false, data: [] }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: rows });
    } catch (err) {
        console.error("Update error:", err);
        return NextResponse.json({ success: false, data: [], status: 500 });
    }
}


export async function DELETE(req: NextRequest) {
    if (!(await verifyToken(req))) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const url = new URL(req.url);
        const YouthID = url.searchParams.get("YouthID");
        const id = url.searchParams.get("id");
        const idExists = await hasIdColumn();

        let where = "";
        let value: string | null = null;

        if (idExists && id) {
            where = "id = ?";
            value = id;
        } else if (YouthID) {
            where = "YouthID = ?";
            value = YouthID;
        } else {
            return NextResponse.json(
                { success: false, message: "No valid identifier provided" },
                { status: 400 }
            );
        }

        await pool.query(`DELETE FROM tblyouth WHERE ${where}`, [value]);

        return NextResponse.json({
            success: true,
            message: `Record with ${id ? "id" : "YouthID"}=${value} deleted successfully`,
        });
    } catch (err: any) {
        console.error("Delete error:", err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}

