/**
 * Client-side Image Optimization and Compression
 * Prevents Firestore 1MB (1,048,576 bytes) document size limit errors.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

/**
 * Optimizes and compresses any image (File, Blob, or base64 DataURL)
 * using an off-screen HTML5 Canvas.
 */
export async function optimizeImage(
  input: File | Blob | string,
  options: OptimizeImageOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.80,
    format = 'image/webp'
  } = options;

  let dataUrl: string;
  if (typeof input === 'string') {
    dataUrl = input;
  } else {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(input);
    });
  }

  // If already a remote HTTP/HTTPS URL, no need to compress
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Scale down proportionally if larger than maximum bounds
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Ensure minimum non-zero dimensions
      width = Math.max(1, width);
      height = Math.max(1, height);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If converting to JPEG, draw dark background in case of transparent PNG
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#06090e';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      try {
        // Try WebP first (best compression/quality ratio)
        let output = canvas.toDataURL(format, quality);

        // Fallback to JPEG if browser doesn't support WebP export
        if (output.startsWith('data:image/png') && format !== 'image/png') {
          output = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(output);
      } catch (e) {
        console.warn('Canvas export warning, falling back to original:', e);
        resolve(dataUrl);
      }
    };

    img.onerror = (err) => {
      console.warn('Failed to load image for compression:', err);
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Calculates the UTF-8 byte size of a JavaScript object/string
 */
export function estimateObjectSize(obj: unknown): number {
  try {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return new Blob([str]).size;
  } catch {
    return 0;
  }
}
