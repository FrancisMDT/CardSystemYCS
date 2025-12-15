export const uploadImage = async (
    image: string,
    folder: "Images" | "Signature",
    filename?: string
) => {
    const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, filename, folder }),
    });

    if (!res.ok) throw new Error("Failed to upload image");
    return res.json();
};
