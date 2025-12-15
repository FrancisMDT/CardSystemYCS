import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        // Check if the `id` column exists in tblsc
        const [rows]: any = await pool.query(
            `SHOW COLUMNS FROM tblsc LIKE 'id'`
        );

        const hasIdColumn = Array.isArray(rows) && rows.length > 0;

        return NextResponse.json({ success: true, hasIdColumn });
    } catch (err) {
        console.error("Metadata fetch error:", err);
        return NextResponse.json({ success: false, hasIdColumn: false }, { status: 500 });
    }
}
