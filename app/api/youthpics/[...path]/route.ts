import { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";

const BASE_PATH = process.env.NEXT_STORAGE_PATH!.trim();

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ path: string[] }> } // params is a Promise
) {
    try {
        const { path: pathArray } = await context.params; // ✅ await required
        const filePath = path.join(BASE_PATH, ...pathArray);

        const fileBuffer = await fs.readFile(filePath);
        const fileBytes = new Uint8Array(fileBuffer); // convert Buffer -> Uint8Array

        let contentType = "application/octet-stream";
        if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (filePath.endsWith(".png")) {
            contentType = "image/png";
        }

        return new Response(fileBytes, {
            headers: { "Content-Type": contentType },
        });
    } catch (error) {
        console.error("Error serving file:", error);
        return new Response("File not found", { status: 404 });
    }
}
