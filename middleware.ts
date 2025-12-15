// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const encoder = new TextEncoder();
const secret = encoder.encode(JWT_SECRET);

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("token")?.value;

    // Allow static files, images, favicon, and API routes
    if (pathname.startsWith("/_next") || pathname === "/favicon.ico" || pathname.startsWith("/api")) {
        return NextResponse.next();
    }

    // No token → redirect to /signin
    if (!token) {
        if (pathname === "/signin") return NextResponse.next();
        return NextResponse.redirect(new URL("/signin", req.url));
    }

    try {
        await jwtVerify(token, secret);

        // Logged-in users: allow all pages except /signin
        if (pathname === "/signin") {
            // Optional: redirect to /home or /dashboard if you want
            return NextResponse.redirect(new URL("/home", req.url));
        }

        return NextResponse.next();
    } catch (err) {
        console.error("JWT verify error:", err);

        // Invalid token → redirect to /signin
        const res = NextResponse.redirect(new URL("/signin", req.url));
        res.cookies.set("token", "", { maxAge: 0, path: "/" });
        return res;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
