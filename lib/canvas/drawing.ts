import { Point, Stroke, Tool } from '@/types/whiteboard';

export class DrawingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get canvas context');
    }
    this.ctx = context;
    this.setupCanvas();
  }

  private setupCanvas() {
    // Set canvas size to match display size
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    
    // Scale context to match device pixel ratio
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Set default drawing properties
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  public resize() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.setupCanvas();
    this.ctx.putImageData(imageData, 0, 0);
  }

  public clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public drawStroke(stroke: Stroke) {
    if (stroke.points.length < 2) return;

    const { points, color, width, tool } = stroke;

    this.ctx.save();
    
    if (tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = color;
    }
    
    this.ctx.lineWidth = width;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    // Use quadratic curves for smoother lines
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    // Draw last segment
    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];
    this.ctx.quadraticCurveTo(
      secondLastPoint.x,
      secondLastPoint.y,
      lastPoint.x,
      lastPoint.y
    );
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  public drawAllStrokes(strokes: Stroke[]) {
    this.clear();
    strokes.forEach((stroke) => this.drawStroke(stroke));
  }

  public getCanvasPoint(clientX: number, clientY: number): Point {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }
}
