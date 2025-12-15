import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        let idNumber = url.searchParams.get("scid"); // <--- match what the service sends

        if (!idNumber) return NextResponse.json({ exists: false });

        // Remove non-digits just in case
        idNumber = idNumber.replace(/\D/g, "");

        // Ensure 6-digit zero-padded string
        const paddedId = idNumber.padStart(6, "0");

        console.log("Checking SCID for middle ID:", paddedId);

        const [rows]: any = await pool.query(
            `SELECT SCID
             FROM tblsc
             WHERE TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(SCID, '-', 3), '-', -1)) = ?`,
            [paddedId]
        );

        console.log("DB rows found:", rows);

        const exists = Array.isArray(rows) && rows.length > 0;
        return NextResponse.json({ exists });
    } catch (err) {
        console.error("SCID check error:", err);
        return NextResponse.json({ exists: false }, { status: 500 });
    }
}
