/**
 * Export canvas as PNG image with white background
 */
export function exportCanvasAsPNG(canvas: HTMLCanvasElement, filename: string = 'whiteboard.png') {
  try {
    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      console.error('Failed to get 2D context');
      return;
    }

    // Fill with white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the original canvas on top
    tempCtx.drawImage(canvas, 0, 0);

    // Convert temp canvas to blob
    tempCanvas.toBlob((blob) => {
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
 * Export canvas as JPEG image with white background
 */
export function exportCanvasAsJPEG(
  canvas: HTMLCanvasElement,
  filename: string = 'whiteboard.jpg',
  quality: number = 0.95
) {
  try {
    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      console.error('Failed to get 2D context');
      return;
    }

    // Fill with white background (important for JPEG which doesn't support transparency)
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the original canvas on top
    tempCtx.drawImage(canvas, 0, 0);

    // Convert temp canvas to blob
    tempCanvas.toBlob(
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
 * Copy canvas to clipboard with white background
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement) {
  try {
    // Create a temporary canvas with white background
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    if (!tempCtx) {
      throw new Error('Failed to get 2D context');
    }

    // Fill with white background
    tempCtx.fillStyle = '#FFFFFF';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw the original canvas on top
    tempCtx.drawImage(canvas, 0, 0);

    // Convert temp canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      tempCanvas.toBlob(resolve, 'image/png');
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
