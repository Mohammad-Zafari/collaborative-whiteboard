export type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'select' | 'highlighter' | 'hand';

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  tool: Tool;
  points: Point[];
  color: string;
  width: number;
  opacity?: number;
  strokeStyle?: StrokeStyle;
  userId: string;
  userName: string;
  timestamp: number;
}

export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'arrow';
  start: Point;
  end: Point;
  color: string;
  width: number;
  fill?: boolean;
  opacity?: number;
  strokeStyle?: StrokeStyle;
  userId: string;
  userName: string;
  timestamp: number;
}

export interface TextElement {
  id: string;
  text: string;
  position: Point;
  color: string;
  fontSize: number;
  opacity?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  userId: string;
  userName: string;
  timestamp: number;
}

export type DrawingElement = Stroke | Shape | TextElement;

export function isStroke(element: DrawingElement): element is Stroke {
  return 'points' in element;
}

export function isShape(element: DrawingElement): element is Shape {
  return 'type' in element && 'start' in element && 'end' in element;
}

export function isText(element: DrawingElement): element is TextElement {
  return 'text' in element && 'fontSize' in element;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  joinedAt: number;
  lastSeen: number;
}

export interface CursorPosition {
  x: number;
  y: number;
  userId: string;
  userName: string;
  color: string;
}
