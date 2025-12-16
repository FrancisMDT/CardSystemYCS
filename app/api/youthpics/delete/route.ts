import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const BASE_PATH = process.env.NEXT_STORAGE_PATH!.trim();

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const youthid = searchParams.get("youthid");

        if (!youthid) {
            return NextResponse.json(
                { success: false, error: "Missing YouthID" },
                { status: 400 }
            );
        }

        const folders = ["Images", "Signature"];
        const results: {
            type: string;
            file: string;
            success: boolean;
            error?: string;
        }[] = [];

        for (const folder of folders) {
            const fileJpg = path.join(BASE_PATH, folder, `${youthid}.jpg`);
            const filePng = path.join(BASE_PATH, folder, `${youthid}.png`);

            let deleted = false;

            try {
                await fs.unlink(fileJpg);
                results.push({ type: folder, file: `${youthid}.jpg`, success: true });
                deleted = true;
            } catch { }

            if (!deleted) {
                try {
                    await fs.unlink(filePng);
                    results.push({ type: folder, file: `${youthid}.png`, success: true });
                    deleted = true;
                } catch { }
            }

            if (!deleted) {
                results.push({
                    type: folder,
                    file: `${youthid}`,
                    success: false,
                    error: "File not found",
                });
            }
        }

        const deletedFiles = results.filter(r => r.success).map(r => r.file);

        return NextResponse.json({
            message: deletedFiles.length ? "Files deleted successfully" : "No files deleted",
            deletedFiles,
        });

    } catch (error: any) {
        console.error("Error deleting files:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
