import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BASE_STORAGE_PATH =
    process.env.NEXT_STORAGE_PATH && process.env.NEXT_STORAGE_PATH.trim() !== ""
        ? process.env.NEXT_STORAGE_PATH
        : path.join(process.cwd(), "uploads", "Images"); // fallback

export async function POST(req: NextRequest) {
    try {
        const { image, filename, folder } = await req.json();

        if (!image || !folder) {
            return NextResponse.json(
                { error: "Image and folder are required" },
                { status: 400 }
            );
        }

        // Make sure root exists
        if (!fs.existsSync(BASE_STORAGE_PATH)) {
            fs.mkdirSync(BASE_STORAGE_PATH, { recursive: true });
        }

        // Subfolder (e.g. "SC", "Signatures")
        const targetDir = path.join(BASE_STORAGE_PATH, folder);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Convert base64 -> buffer
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // File path
        const filePath = path.join(
            targetDir,
            filename || `image-${Date.now()}.jpg`
        );

        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({ success: true, filePath });
    } catch (err: any) {
        console.error("Error saving image:", err);
        return NextResponse.json(
            { error: "Failed to save image" },
            { status: 500 }
        );
    }
}
