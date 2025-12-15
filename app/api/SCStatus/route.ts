import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req: NextRequest) {
    try {
        const { scid, status } = await req.json();

        if (!scid || !status) {
            return NextResponse.json(
                { success: false, message: "Missing scid or status" },
                { status: 400 }
            );
        }

        await pool.query(`UPDATE tblsc SET Status = ? WHERE SCID = ?`, [status, scid]);

        return NextResponse.json({
            success: true,
            message: `Status updated to ${status}`,
            data: { scid, status },
        });
    } catch (err) {
        console.error("Error updating status:", err);
        return NextResponse.json(
            { success: false, message: "Failed to update status" },
            { status: 500 }
        );
    }
}
