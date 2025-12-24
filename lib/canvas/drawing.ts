import { Point, Stroke, Tool, Shape, TextElement, DrawingElement, isStroke, isShape, isText } from '@/types/whiteboard';

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

    const { points, color, width, tool, opacity = 100, strokeStyle = 'solid' } = stroke;

    this.ctx.save();
    
    // Set opacity
    this.ctx.globalAlpha = opacity / 100;
    
    if (tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else if (tool === 'highlighter') {
      this.ctx.globalCompositeOperation = 'multiply';
      this.ctx.strokeStyle = color;
      this.ctx.globalAlpha = 0.3; // Highlighter is always semi-transparent
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = color;
    }
    
    this.ctx.lineWidth = width;
    
    // Set stroke style
    if (strokeStyle === 'dashed') {
      this.ctx.setLineDash([width * 3, width * 2]);
    } else if (strokeStyle === 'dotted') {
      this.ctx.setLineDash([width, width]);
    } else {
      this.ctx.setLineDash([]);
    }
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

  public drawShape(shape: Shape) {
    const { start, end, color, width, type, fill, opacity = 100, strokeStyle = 'solid' } = shape;

    this.ctx.save();
    this.ctx.globalAlpha = opacity / 100;
    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Set stroke style
    if (strokeStyle === 'dashed') {
      this.ctx.setLineDash([width * 3, width * 2]);
    } else if (strokeStyle === 'dotted') {
      this.ctx.setLineDash([width, width]);
    } else {
      this.ctx.setLineDash([]);
    }

    switch (type) {
      case 'rectangle':
        const rectWidth = end.x - start.x;
        const rectHeight = end.y - start.y;
        if (fill) {
          this.ctx.fillRect(start.x, start.y, rectWidth, rectHeight);
        } else {
          this.ctx.strokeRect(start.x, start.y, rectWidth, rectHeight);
        }
        break;

      case 'circle':
        // Draw circle from corner to corner (like rectangle)
        const minX = Math.min(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxX = Math.max(start.x, end.x);
        const maxY = Math.max(start.y, end.y);
        const width = maxX - minX;
        const height = maxY - minY;
        const centerX = minX + width / 2;
        const centerY = minY + height / 2;
        const radius = Math.min(width, height) / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        if (fill) {
          this.ctx.fill();
        } else {
          this.ctx.stroke();
        }
        break;

      case 'line':
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
        break;

      case 'arrow':
        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;

        this.ctx.beginPath();
        this.ctx.moveTo(end.x, end.y);
        this.ctx.lineTo(
          end.x - arrowLength * Math.cos(angle - arrowAngle),
          end.y - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.moveTo(end.x, end.y);
        this.ctx.lineTo(
          end.x - arrowLength * Math.cos(angle + arrowAngle),
          end.y - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.stroke();
        break;
    }

    this.ctx.restore();
  }

  public drawText(textElement: TextElement) {
    const { text, position, color, fontSize, opacity = 100, fontWeight = 'normal', fontStyle = 'normal', fontFamily = 'sans-serif' } = textElement;

    this.ctx.save();
    this.ctx.globalAlpha = opacity / 100;
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.textBaseline = 'top';
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillText(text, position.x, position.y);
    this.ctx.restore();
  }

  public drawElement(element: DrawingElement) {
    if (isStroke(element)) {
      this.drawStroke(element);
    } else if (isShape(element)) {
      this.drawShape(element);
    } else if (isText(element)) {
      this.drawText(element);
    }
  }

  public drawAllStrokes(strokes: Stroke[]) {
    this.clear();
    strokes.forEach((stroke) => this.drawStroke(stroke));
  }

  public drawAllElements(elements: DrawingElement[]) {
    this.clear();
    elements.forEach((element) => this.drawElement(element));
  }

  public getCanvasPoint(clientX: number, clientY: number): Point {
    const rect = this.canvas.getBoundingClientRect();
    // Get position relative to canvas element in CSS pixels
    // getBoundingClientRect accounts for any CSS transforms, borders, etc.
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Ensure coordinates are within canvas bounds
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const clampedY = Math.max(0, Math.min(y, rect.height));
    
    return { x: clampedX, y: clampedY };
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }
}
