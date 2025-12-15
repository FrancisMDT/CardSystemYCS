// api/login/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Convert secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
        }

        const [rows]: any = await pool.query(
            "SELECT * FROM tblusers WHERE Username = ?",
            [username]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
        }

        const user = rows[0];
        const isMatch =
            (await bcrypt.compare(password, user.Password).catch(() => false)) ||
            password === user.Password;

        if (!isMatch) {
            return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
        }

        // ✅ Generate JWT with jose
        const token = await new SignJWT({
            id: user.UserID,
            username: user.Username,
            designation: user.Designation,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("8h")
            .sign(secret);

        const { Password, ...safeUser } = user;

        // ✅ return JSON + set cookie
        const res = NextResponse.json({ success: true, user: safeUser });
        res.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 8, // 8h
        });

        return res;
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
