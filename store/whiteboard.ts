import { create } from 'zustand';
import { Stroke, Tool, Participant, CursorPosition } from '@/types/whiteboard';

interface WhiteboardState {
  // Canvas State
  strokes: Stroke[];
  redoStack: Stroke[];
  
  // Tool State
  currentTool: Tool;
  currentColor: string;
  currentWidth: number;
  
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
  undo: () => void;
  redo: () => void;
  clear: () => void;
  removeStrokeById: (strokeId: string) => void;
  addStrokeById: (strokeId: string) => void;
  getLastStrokeId: () => string | null;
  getLastRedoStrokeId: () => string | null;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  setUserId: (id: string) => void;
  setUserName: (name: string) => void;
  setRoomId: (id: string) => void;
  setParticipants: (participants: Participant[]) => void;
  updateCursor: (userId: string, cursor: CursorPosition) => void;
  removeCursor: (userId: string) => void;
  loadStrokes: (strokes: Stroke[]) => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  // Initial State
  strokes: [],
  redoStack: [],
  currentTool: 'pen',
  currentColor: '#000000',
  currentWidth: 2,
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
  
  undo: () =>
    set((state) => {
      if (state.strokes.length === 0) return state;
      const newStrokes = [...state.strokes];
      const lastStroke = newStrokes.pop();
      return {
        strokes: newStrokes,
        redoStack: lastStroke ? [...state.redoStack, lastStroke] : state.redoStack,
      };
    }),
  
  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const newRedoStack = [...state.redoStack];
      const strokeToRedo = newRedoStack.pop();
      return {
        strokes: strokeToRedo ? [...state.strokes, strokeToRedo] : state.strokes,
        redoStack: newRedoStack,
      };
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
      const strokeIndex = state.strokes.findIndex(s => s.id === strokeId);
      if (strokeIndex === -1) {
        console.warn('⚠️ Stroke not found for undo:', strokeId);
        return state;
      }
      
      const newStrokes = [...state.strokes];
      const removedStroke = newStrokes.splice(strokeIndex, 1)[0];
      
      console.log('↩️ Removed stroke by ID:', strokeId, 'from position:', strokeIndex);
      
      return {
        strokes: newStrokes,
        redoStack: removedStroke ? [...state.redoStack, removedStroke] : state.redoStack,
      };
    }),

  addStrokeById: (strokeId) =>
    set((state) => {
      const strokeToAdd = state.redoStack.find(s => s.id === strokeId);
      if (!strokeToAdd) {
        console.warn('⚠️ Stroke not found in redo stack:', strokeId);
        return state;
      }
      
      const newRedoStack = state.redoStack.filter(s => s.id !== strokeId);
      
      console.log('↪️ Added stroke back by ID:', strokeId);
      
      return {
        strokes: [...state.strokes, strokeToAdd],
        redoStack: newRedoStack,
      };
    }),
  
  clear: () =>
    set({
      strokes: [],
      redoStack: [],
    }),
  
  setTool: (tool) => set({ currentTool: tool }),
  setColor: (color) => set({ currentColor: color }),
  setWidth: (width) => set({ currentWidth: width }),
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
}));
