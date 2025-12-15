import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ success: true });

    // Clear the token cookie
    res.cookies.set("token", "", { maxAge: 0, path: "/" });

    return res;
}
