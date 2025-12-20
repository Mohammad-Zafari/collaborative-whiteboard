export type Tool = 'pen' | 'eraser';

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
  userId: string;
  userName: string;
  timestamp: number;
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
