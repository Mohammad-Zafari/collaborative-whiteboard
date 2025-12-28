import { create } from 'zustand';
import { Stroke, Tool, Participant, CursorPosition, Shape, TextElement, DrawingElement, StrokeStyle, isStroke, isShape, isText } from '@/types/whiteboard';

interface WhiteboardState {
  // Canvas State
  strokes: Stroke[];
  shapes: Shape[];
  textElements: TextElement[];
  redoStack: DrawingElement[];
  
  // Tool State
  currentTool: Tool;
  currentColor: string;
  currentWidth: number;
  fillShapes: boolean;
  selectedElement: DrawingElement | null;
  opacity: number;
  strokeStyle: StrokeStyle;
  fontSize: number;
  
  // View State
  zoom: number;
  panX: number;
  panY: number;
  showGrid: boolean;
  
  // User State
  userId: string;
  userName: string;
  
  // Room State
  roomId: string;
  participants: Participant[];
  
  // Cursor State
  remoteCursors: Map<string, CursorPosition>;
  
  // Actions
  addStroke: (stroke: Stroke) => void;
  addShape: (shape: Shape) => void;
  addText: (text: TextElement) => void;
  removeElement: (element: DrawingElement) => void;
  updateElement: (element: DrawingElement) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  removeStrokeById: (strokeId: string) => void;
  addStrokeById: (strokeId: string) => void;
  getLastStrokeId: () => string | null;
  getLastRedoStrokeId: () => string | null;
  getAllElements: () => DrawingElement[];
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  setFillShapes: (fill: boolean) => void;
  setSelectedElement: (element: DrawingElement | null) => void;
  setOpacity: (opacity: number) => void;
  setStrokeStyle: (style: StrokeStyle) => void;
  setFontSize: (size: number) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  setShowGrid: (show: boolean) => void;
  setUserId: (id: string) => void;
  setUserName: (name: string) => void;
  setRoomId: (id: string) => void;
  setParticipants: (participants: Participant[]) => void;
  updateCursor: (userId: string, cursor: CursorPosition) => void;
  removeCursor: (userId: string) => void;
  loadStrokes: (strokes: Stroke[]) => void;
  loadElements: (elements: DrawingElement[]) => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  // Initial State
  strokes: [],
  shapes: [],
  textElements: [],
  redoStack: [],
  currentTool: 'pen',
  currentColor: '#000000',
  currentWidth: 2,
  fillShapes: false,
  selectedElement: null,
  opacity: 100,
  strokeStyle: 'solid',
  fontSize: 24,
  zoom: 1,
  panX: 0,
  panY: 0,
  showGrid: false,
  userId: '',
  userName: 'Anonymous',
  roomId: '',
  participants: [],
  remoteCursors: new Map(),
  
  // Actions
  addStroke: (stroke) =>
    set((state) => ({
      strokes: [...state.strokes, stroke],
      redoStack: [], // Clear redo stack when new action is performed
    })),

  addShape: (shape) =>
    set((state) => ({
      shapes: [...state.shapes, shape],
      redoStack: [],
    })),

  addText: (text) =>
    set((state) => ({
      textElements: [...state.textElements, text],
      redoStack: [],
    })),

  removeElement: (element) =>
    set((state) => {
      if ('points' in element) {
        return {
          strokes: state.strokes.filter((s) => s.id !== element.id),
          redoStack: [...state.redoStack, element],
        };
      } else if ('type' in element && 'start' in element) {
        return {
          shapes: state.shapes.filter((s) => s.id !== element.id),
          redoStack: [...state.redoStack, element],
        };
      } else if ('text' in element) {
        return {
          textElements: state.textElements.filter((t) => t.id !== element.id),
          redoStack: [...state.redoStack, element],
        };
      }
      return state;
    }),

  updateElement: (element) =>
    set((state) => {
      if ('points' in element) {
        return {
          strokes: state.strokes.map((s) => (s.id === element.id ? element : s)),
        };
      } else if ('type' in element && 'start' in element) {
        return {
          shapes: state.shapes.map((s) => (s.id === element.id ? element : s)),
        };
      } else if ('text' in element) {
        return {
          textElements: state.textElements.map((t) => (t.id === element.id ? element : t)),
        };
      }
      return state;
    }),

  getAllElements: () => {
    const state = get();
    return [...state.strokes, ...state.shapes, ...state.textElements].sort(
      (a, b) => a.timestamp - b.timestamp
    );
  },
  
  undo: () =>
    set((state) => {
      const allElements = [...state.strokes, ...state.shapes, ...state.textElements].sort(
        (a, b) => a.timestamp - b.timestamp
      );
      if (allElements.length === 0) return state;
      
      const lastElement = allElements[allElements.length - 1];
      
      if (isStroke(lastElement)) {
        const newStrokes = state.strokes.filter(s => s.id !== lastElement.id);
        return {
          strokes: newStrokes,
          redoStack: [...state.redoStack, lastElement],
        };
      } else if (isShape(lastElement)) {
        const newShapes = state.shapes.filter(s => s.id !== lastElement.id);
        return {
          shapes: newShapes,
          redoStack: [...state.redoStack, lastElement],
        };
      } else if (isText(lastElement)) {
        const newTextElements = state.textElements.filter(t => t.id !== lastElement.id);
        return {
          textElements: newTextElements,
          redoStack: [...state.redoStack, lastElement],
        };
      }
      return state;
    }),
  
  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const newRedoStack = [...state.redoStack];
      const elementToRedo = newRedoStack.pop();
      
      if (!elementToRedo) return state;
      
      if (isStroke(elementToRedo)) {
        return {
          strokes: [...state.strokes, elementToRedo],
          redoStack: newRedoStack,
        };
      } else if (isShape(elementToRedo)) {
        return {
          shapes: [...state.shapes, elementToRedo],
          redoStack: newRedoStack,
        };
      } else if (isText(elementToRedo)) {
        return {
          textElements: [...state.textElements, elementToRedo],
          redoStack: newRedoStack,
        };
      }
      return state;
    }),

  getLastStrokeId: () => {
    const state = get();
    return state.strokes.length > 0 ? state.strokes[state.strokes.length - 1].id : null;
  },

  getLastRedoStrokeId: () => {
    const state = get();
    return state.redoStack.length > 0 ? state.redoStack[state.redoStack.length - 1].id : null;
  },

  removeStrokeById: (strokeId) =>
    set((state) => {
      // Check strokes
      const strokeIndex = state.strokes.findIndex(s => s.id === strokeId);
      if (strokeIndex !== -1) {
        const newStrokes = [...state.strokes];
        const removedStroke = newStrokes.splice(strokeIndex, 1)[0];
        console.log('↩️ Removed stroke by ID:', strokeId);
        return {
          strokes: newStrokes,
          redoStack: [...state.redoStack, removedStroke],
        };
      }
      
      // Check shapes
      const shapeIndex = state.shapes.findIndex(s => s.id === strokeId);
      if (shapeIndex !== -1) {
        const newShapes = [...state.shapes];
        const removedShape = newShapes.splice(shapeIndex, 1)[0];
        console.log('↩️ Removed shape by ID:', strokeId);
        return {
          shapes: newShapes,
          redoStack: [...state.redoStack, removedShape],
        };
      }
      
      // Check text elements
      const textIndex = state.textElements.findIndex(t => t.id === strokeId);
      if (textIndex !== -1) {
        const newTextElements = [...state.textElements];
        const removedText = newTextElements.splice(textIndex, 1)[0];
        console.log('↩️ Removed text by ID:', strokeId);
        return {
          textElements: newTextElements,
          redoStack: [...state.redoStack, removedText],
        };
      }
      
      console.warn('⚠️ Element not found for undo:', strokeId);
      return state;
    }),

  addStrokeById: (strokeId) =>
    set((state) => {
      const elementToAdd = state.redoStack.find(s => s.id === strokeId);
      if (!elementToAdd) {
        console.warn('⚠️ Element not found in redo stack:', strokeId);
        return state;
      }
      
      const newRedoStack = state.redoStack.filter(s => s.id !== strokeId);
      
      console.log('↪️ Added element back by ID:', strokeId);
      
      if (isStroke(elementToAdd)) {
        return {
          strokes: [...state.strokes, elementToAdd],
          redoStack: newRedoStack,
        };
      } else if (isShape(elementToAdd)) {
        return {
          shapes: [...state.shapes, elementToAdd],
          redoStack: newRedoStack,
        };
      } else if (isText(elementToAdd)) {
        return {
          textElements: [...state.textElements, elementToAdd],
          redoStack: newRedoStack,
        };
      }
      
      return state;
    }),
  
  clear: () =>
    set({
      strokes: [],
      shapes: [],
      textElements: [],
      redoStack: [],
    }),
  
  setTool: (tool) => set({ currentTool: tool }),
  setColor: (color) => set({ currentColor: color }),
  setWidth: (width) => set({ currentWidth: width }),
  setFillShapes: (fill) => set({ fillShapes: fill }),
  setSelectedElement: (element) => set({ selectedElement: element }),
  setOpacity: (opacity) => set({ opacity }),
  setStrokeStyle: (strokeStyle) => set({ strokeStyle }),
  setFontSize: (fontSize) => set({ fontSize }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (panX, panY) => set({ panX, panY }),
  setShowGrid: (showGrid) => set({ showGrid }),
  setUserId: (id) => set({ userId: id }),
  setUserName: (name) => set({ userName: name }),
  setRoomId: (id) => set({ roomId: id }),
  setParticipants: (participants) => set({ participants }),
  
  updateCursor: (userId, cursor) =>
    set((state) => {
      const newCursors = new Map(state.remoteCursors);
      newCursors.set(userId, cursor);
      return { remoteCursors: newCursors };
    }),
  
  removeCursor: (userId) =>
    set((state) => {
      const newCursors = new Map(state.remoteCursors);
      newCursors.delete(userId);
      return { remoteCursors: newCursors };
    }),
  
  loadStrokes: (strokes) => set({ strokes, redoStack: [] }),
  
  loadElements: (elements) => {
    const strokes = elements.filter((e): e is Stroke => 'points' in e);
    const shapes = elements.filter((e): e is Shape => 'type' in e && 'start' in e);
    const textElements = elements.filter((e): e is TextElement => 'text' in e && 'fontSize' in e);
    set({ strokes, shapes, textElements, redoStack: [] });
  },
}));
