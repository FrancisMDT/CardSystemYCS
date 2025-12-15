import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { jwtVerify } from "jose";
import { SeniorCardModel } from "@/app/models/SeniorCard/seniorCardModel";
import { v4 as uuidv4 } from "uuid";

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
    const [rows]: any = await pool.query(`SHOW COLUMNS FROM tblsc LIKE 'id'`);
    return Array.isArray(rows) && rows.length > 0;
}

export async function GET(req: NextRequest) {
    try {
        if (!(await verifyToken(req))) {
            return NextResponse.json({ success: false, data: [] }, { status: 401 });
        }

        const url = new URL(req.url);
        const query = url.searchParams.get("query")?.trim() || "";

        let sql = `SELECT * FROM tblsc`;
        const params: any[] = [];

        if (query) {
            const terms = query.split(",").map(t => t.trim()).filter(Boolean);
            const whereClauses = terms.map(() => `(SCID LIKE ? OR Fullname LIKE ? OR Status LIKE ?)`);
            params.push(...terms.flatMap(term => [`%${term}%`, `%${term}%`, `%${term}%`]));
            sql += " WHERE " + whereClauses.join(" AND ");
            const firstTerm = terms[0];
            sql += ` ORDER BY CASE
                WHEN SCID LIKE ? OR Fullname LIKE ? OR Status LIKE ? THEN 1
                ELSE 2
            END`;
            params.push(`%${firstTerm}%`, `%${firstTerm}%`, `%${firstTerm}%`);
        }

        sql += ` LIMIT ${DEFAULT_LIMIT}`;
        const [rows]: any = await pool.query(sql, params);

        const results = rows.map((row: any) => ({
            scid: row.SCID,
            fullName: row.Fullname,
            birthDate: row.BirthDate,
            address: row.Address,
            contactPerson: row.ContactPerson,
            contactNum: row.ContactNum,
            contactAddress: row.ContactAddress,
            status: row.Status,
            dateID: row.DateID,
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
        return NextResponse.json({ success: false, data: [], message: "Unauthorized" }, { status: 401 });
    }

    try {
        const body: SeniorCardModel = await req.json();
        const idExists = await hasIdColumn();

        const [existing] = await pool.query("SELECT SCID FROM tblsc WHERE SCID = ?", [body.scid]);
        if (Array.isArray(existing) && existing.length > 0) {
            return NextResponse.json(
                { success: false, data: [], message: `SCID ${body.scid} already exists` },
                { status: 400 }
            );
        }

        if (idExists) {
            const newId = uuidv4();
            await pool.query(
                `INSERT INTO tblsc (SCID, Fullname, BirthDate, Address, ContactPerson, ContactNum, ContactAddress, Status, DateID)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    
                    body.scid,
                    body.fullName,
                    body.birthDate,
                    body.address,
                    body.contactPerson,
                    body.contactNum,
                    body.contactAddress,
                    "ID",
                ]
            );
        } else {
            await pool.query(
                `INSERT INTO tblsc (SCID, Fullname, BirthDate, Address, ContactPerson, ContactNum, ContactAddress, Status, DateID)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [
                    body.scid,
                    body.fullName,
                    body.birthDate,
                    body.address,
                    body.contactPerson,
                    body.contactNum,
                    body.contactAddress,
                    "ID",
                ]
            );
        }

        return NextResponse.json({ success: true, data: [body], message: "SCID added successfully" });
    } catch (err) {
        console.error("Insert error:", err);
        return NextResponse.json({ success: false, data: [], message: `Server error: ${err}` }, { status: 500 });
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
        const body: SeniorCardModel = await req.json();
        const idExists = await hasIdColumn();

        if (idExists) {
            // SCID can be edited, use id as key
            await pool.query(
                `UPDATE tblsc
                 SET SCID = ?, Fullname = ?, BirthDate = ?, Address = ?, ContactPerson = ?, ContactNum = ?, ContactAddress = ?, Status = ?, DateID = ?
                 WHERE id = ?`,
                [
                    body.scid,
                    body.fullName,
                    formatDateForMySQL(body.birthDate),
                    body.address,
                    body.contactPerson,
                    body.contactNum,
                    body.contactAddress,
                    body.status,
                    formatDateForMySQL(body.dateID),
                    body.id,
                ]
            );
        } else {
            // SCID cannot be edited
            await pool.query(
                `UPDATE tblsc
                 SET Fullname = ?, BirthDate = ?, Address = ?, ContactPerson = ?, ContactNum = ?, ContactAddress = ?, Status = ?, DateID = ?
                 WHERE SCID = ?`,
                [
                    body.fullName,
                    formatDateForMySQL(body.birthDate),
                    body.address,
                    body.contactPerson,
                    body.contactNum,
                    body.contactAddress,
                    body.status,
                    formatDateForMySQL(body.dateID),
                    body.scid,
                ]
            );
        }

        // Pick the correct SELECT query
        const [rows]: any = await pool.query(
            idExists ? "SELECT * FROM tblsc WHERE id = ?" : "SELECT * FROM tblsc WHERE SCID = ?",
            idExists ? [body.id] : [body.scid]
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
        const scid = url.searchParams.get("scid");
        const id = url.searchParams.get("id");
        const idExists = await hasIdColumn();

        let where = "";
        let value: string | null = null;

        if (idExists && id) {
            where = "id = ?";
            value = id;
        } else if (scid) {
            where = "SCID = ?";
            value = scid;
        } else {
            return NextResponse.json(
                { success: false, message: "No valid identifier provided" },
                { status: 400 }
            );
        }

        await pool.query(`DELETE FROM tblsc WHERE ${where}`, [value]);

        return NextResponse.json({
            success: true,
            message: `Record with ${id ? "id" : "SCID"}=${value} deleted successfully`,
        });
    } catch (err: any) {
        console.error("Delete error:", err);
        return NextResponse.json(
            { success: false, message: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}

