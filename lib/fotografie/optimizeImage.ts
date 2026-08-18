export const PHOTO_MAX_SOURCE_BYTES = 30 * 1024 * 1024;
export const PHOTO_MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const PHOTO_MAX_LONG_EDGE = 2200;
export const PHOTO_JPEG_QUALITY = 0.78;

export type OptimizedPhoto = {
  file: File;
  originalBytes: number;
  optimizedBytes: number;
  wasOptimized: boolean;
};

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('De foto kon niet worden geoptimaliseerd.')),
      'image/jpeg',
      quality,
    );
  });
}

async function decodeWithImageBitmap(file: File) {
  if (typeof createImageBitmap !== 'function') return null;

  try {
    // createImageBitmap decodeert grote JPEG's doorgaans sneller dan een <img>
    // en houdt de decode buiten de gewone DOM-imageflow.
    return await createImageBitmap(file, {
      imageOrientation: 'from-image',
      premultiplyAlpha: 'none',
      colorSpaceConversion: 'default',
    });
  } catch {
    return null;
  }
}

function loadImageFallback(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Foto ${file.name} kon niet worden gelezen.`));
    };
    image.src = url;
  });
}

async function encodeFast(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
) {
  // OffscreenCanvas voorkomt waar ondersteund extra DOM-layoutwerk.
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      const canvas = new OffscreenCanvas(width, height);
      const context = canvas.getContext('2d', { alpha: false });
      if (context) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);

        let blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: PHOTO_JPEG_QUALITY });

        // Meestal is één encode voldoende. Alleen indien nodig één tweede poging.
        if (blob.size > PHOTO_MAX_UPLOAD_BYTES) {
          blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.68 });
        }
        return blob;
      }
    } catch {
      // Val terug op gewone canvas.
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('De browser kon de foto niet verwerken.');

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(source, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);

  let blob = await canvasToBlob(canvas, PHOTO_JPEG_QUALITY);

  // Geen trage kwaliteitslus meer: maximaal één extra encode.
  if (blob.size > PHOTO_MAX_UPLOAD_BYTES) {
    blob = await canvasToBlob(canvas, 0.68);
  }

  // Geef geheugen onmiddellijk vrij bij grote fotoshoots.
  canvas.width = 1;
  canvas.height = 1;

  return blob;
}

/**
 * Snelle browseroptimalisatie:
 * - decodeert bij voorkeur via createImageBitmap;
 * - schaalt meteen terug naar max. 2200 px;
 * - gebruikt maximaal twee JPEG-encodes;
 * - geeft bitmap/canvas-geheugen onmiddellijk vrij.
 *
 * Het originele File-object zelf wordt niet aangepast en kan rechtstreeks
 * naar Cloudflare R2 worden gestuurd.
 */
export async function optimizePhotoForGallery(source: File): Promise<OptimizedPhoto> {
  if (!(source.type === 'image/jpeg' || /\.jpe?g$/i.test(source.name))) {
    throw new Error('Alleen JPG- en JPEG-bestanden zijn toegestaan.');
  }

  if (source.size > PHOTO_MAX_SOURCE_BYTES) {
    throw new Error(`${source.name} is groter dan 30 MB. Exporteer deze foto eerst kleiner.`);
  }

  let bitmap: ImageBitmap | null = await decodeWithImageBitmap(source);
  let fallbackImage: HTMLImageElement | null = null;

  try {
    if (!bitmap) {
      fallbackImage = await loadImageFallback(source);
    }

    const sourceWidth = bitmap?.width ?? fallbackImage?.naturalWidth ?? 0;
    const sourceHeight = bitmap?.height ?? fallbackImage?.naturalHeight ?? 0;

    if (!sourceWidth || !sourceHeight) {
      throw new Error(`${source.name} heeft geen leesbare afbeeldingsafmetingen.`);
    }

    const longest = Math.max(sourceWidth, sourceHeight);
    const scale = Math.min(1, PHOTO_MAX_LONG_EDGE / longest);
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));

    const drawable: CanvasImageSource = bitmap ?? fallbackImage!;
    const blob = await encodeFast(drawable, sourceWidth, sourceHeight, width, height);

    if (blob.size > PHOTO_MAX_UPLOAD_BYTES) {
      throw new Error(`${source.name} blijft na optimalisatie groter dan 2 MB. Exporteer deze foto kleiner.`);
    }

    const baseName = source.name.replace(/\.(jpe?g)$/i, '') || 'foto';
    const file = new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: source.lastModified,
    });

    return {
      file,
      originalBytes: source.size,
      optimizedBytes: file.size,
      wasOptimized: file.size < source.size || scale < 1,
    };
  } finally {
    bitmap?.close();
    bitmap = null;
    fallbackImage = null;
  }
}
