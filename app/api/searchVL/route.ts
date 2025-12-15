import { NextRequest, NextResponse } from "next/server";
import  pool  from "@/lib/db";

export async function GET(req: NextRequest) {
    const { search } = Object.fromEntries(req.nextUrl.searchParams.entries());

    if (!search || search.toString().trim() === "") {
        return NextResponse.json({ data: [], message: "No search term provided." });
    }

    try {
        const query = `
            SELECT idnum, fullname, address, brgy
            FROM tblvl
            WHERE fullname LIKE ?
            LIMIT 50
        `;

        const [rows] = await pool.query(query, [`%${search}%`]);

        return NextResponse.json({ data: rows });
    } catch (error) {
        console.error("DB search error:", error);
        return NextResponse.json({ data: [], error: "Failed to fetch data." }, { status: 500 });
    }
}
