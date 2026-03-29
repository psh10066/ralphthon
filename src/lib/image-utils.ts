export async function resizeImage(file: File, maxSize = 1920, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        let result = canvas.toDataURL("image/jpeg", quality);

        // 5MB 초과 시 추가 압축
        if (result.length > 5 * 1024 * 1024) {
          const smallerMax = 1280;
          const ratio2 = Math.min(smallerMax / img.width, smallerMax / img.height);
          canvas.width = Math.round(img.width * ratio2);
          canvas.height = Math.round(img.height * ratio2);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          result = canvas.toDataURL("image/jpeg", 0.6);
        }

        resolve(result);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
