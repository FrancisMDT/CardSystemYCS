export default function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = imageSrc;
    return new Promise((resolve, reject) => {
        img.onload = () => {
            // Force output to 200x200
            const outputWidth = 200;
            const outputHeight = 200;
            canvas.width = outputWidth;
            canvas.height = outputHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("No canvas context");

            ctx.drawImage(
                img,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                outputWidth,
                outputHeight
            );

            resolve(canvas.toDataURL("image/jpeg"));
        };
        img.onerror = reject;
    });
}
