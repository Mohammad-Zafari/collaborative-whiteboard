/**
 * Export canvas as PNG image
 */
export function exportCanvasAsPNG(canvas: HTMLCanvasElement, filename: string = 'whiteboard.png') {
  try {
    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Failed to create blob from canvas');
        return;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Error exporting canvas:', error);
    throw error;
  }
}

/**
 * Export canvas as JPEG image
 */
export function exportCanvasAsJPEG(
  canvas: HTMLCanvasElement,
  filename: string = 'whiteboard.jpg',
  quality: number = 0.95
) {
  try {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
      },
      'image/jpeg',
      quality
    );
  } catch (error) {
    console.error('Error exporting canvas:', error);
    throw error;
  }
}

/**
 * Copy canvas to clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement) {
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      throw new Error('Failed to create blob from canvas');
    }

    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
      }),
    ]);

    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw error;
  }
}
