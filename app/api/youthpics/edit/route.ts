import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const BASE_PATH = process.env.NEXT_STORAGE_PATH!.trim();

export async function POST(req: NextRequest) {
    try {
        const { oldYouthid, newYouthid } = await req.json();

        if (!oldYouthid || !newYouthid) {
            return NextResponse.json(
                { success: false, error: "Missing oldYouthid or newYouthid" },
                { status: 400 }
            );
        }

        const folders = ["Images", "Signature"];
        const results: {
            type: string;
            oldName: string;
            newName: string;
            success: boolean;
            error?: string;
        }[] = [];

        for (const folder of folders) {
            const exts = [".jpg", ".png"];
            let renamed = false;

            for (const ext of exts) {
                const oldPath = path.join(BASE_PATH, folder, `${oldYouthid}${ext}`);
                const newPath = path.join(BASE_PATH, folder, `${newYouthid}${ext}`);

                try {
                    await fs.rename(oldPath, newPath);
                    results.push({
                        type: folder,
                        oldName: `${oldYouthid}${ext}`,
                        newName: `${newYouthid}${ext}`,
                        success: true,
                    });
                    renamed = true;
                    break; // stop after first match
                } catch { }
            }

            if (!renamed) {
                results.push({
                    type: folder,
                    oldName: oldYouthid,
                    newName: newYouthid,
                    success: false,
                    error: "File not found",
                });
            }
        }

        return NextResponse.json({ success: true, results });
    } catch (error: any) {
        console.error("Error renaming files:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
