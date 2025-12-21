# Collaborative Whiteboard

A real-time collaborative whiteboard built with Next.js 15, TypeScript, and Supabase. Draw together with your team in real-time with smooth performance and an intuitive interface.

## Features

### Phase 1: Core Drawing ✅ (COMPLETED)
- ✅ HTML5 Canvas with smooth drawing
- ✅ Pen and Eraser tools
- ✅ Color picker (10 preset colors)
- ✅ Adjustable stroke width (5 sizes)
- ✅ Undo/Redo functionality
- ✅ Clear canvas
- ✅ Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

### Phase 2: Real-time Collaboration ✅ (COMPLETED - Needs Supabase Config)
- ✅ Multi-user support with Supabase Realtime
- ✅ Live stroke synchronization
- ✅ User presence tracking
- ✅ Room-based collaboration
- ✅ Persistent storage in PostgreSQL
- ✅ Load historical strokes on room join
- 🔧 **Action Required**: [Configure Supabase](./REALTIME_SETUP.md) to enable

### Phase 3: UX Polish ✅ (COMPLETED)
- ✅ Remote cursor sharing with user names and colors
- ✅ Participant list sidebar with stats
- ✅ Export canvas as PNG/JPEG
- ✅ Copy canvas to clipboard
- ✅ Dark mode with theme persistence
- ✅ Enhanced UI/UX

### Phase 4: Persistence (Planned)
- ⏳ Save strokes to database
- ⏳ Load room history
- ⏳ Export canvas as PNG
- ⏳ Portfolio integration

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Canvas**: HTML5 Canvas API
- **Real-time**: Supabase Realtime (Phase 2)
- **Database**: Supabase PostgreSQL (Phase 4)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- For real-time features (Phase 2+): Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd collaborative-whiteboard
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Usage

1. Click "Create New Room" on the home page
2. Start drawing on the canvas
3. Share the room link with others (real-time features coming in Phase 2)

## Project Structure

```
collaborative-whiteboard/
├── app/
│   ├── board/[slug]/       # Whiteboard room page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   └── whiteboard/
│       ├── Canvas.tsx      # Main canvas component
│       └── Toolbar.tsx     # Drawing toolbar
├── lib/
│   └── canvas/
│       ├── drawing.ts      # Drawing engine
│       └── utils.ts        # Utility functions
├── store/
│   └── whiteboard.ts       # Zustand state management
└── types/
    └── whiteboard.ts       # TypeScript types
```

## Keyboard Shortcuts

- `Ctrl+Z` / `Cmd+Z` - Undo
- `Ctrl+Y` / `Cmd+Y` - Redo
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - Redo

## Development Roadmap

- [x] **Phase 1**: Single-user canvas with drawing tools
- [x] **Phase 2**: Real-time collaboration with Supabase (code complete, needs config)
- [x] **Phase 3**: Cursor sharing and UX improvements (COMPLETE!)
- [ ] **Phase 4**: Advanced features (shapes, text, selection)

## Quick Start

### Without Supabase (Local Mode)
```bash
npm install
npm run dev
```
Open http://localhost:3001 - All drawing features work locally!

### With Supabase (Full Real-time)
1. Follow [REALTIME_SETUP.md](./REALTIME_SETUP.md) to configure Supabase
2. Add credentials to `.env.local`
3. Restart dev server
4. Open same room in multiple windows to see real-time collaboration!

## Architecture Highlights

### Drawing Engine
- Custom HTML5 Canvas implementation for optimal performance
- Quadratic curve smoothing for natural-looking strokes
- Device pixel ratio support for sharp rendering on high-DPI displays
- Layered rendering approach for future optimization

### State Management
- Zustand for lightweight, efficient state management
- Immutable stroke history for undo/redo
- Optimistic updates for immediate feedback

### Performance
- requestAnimationFrame for smooth 60fps rendering
- Event throttling for cursor movements (Phase 3)
- Efficient stroke batching for network transmission (Phase 2)

## Contributing

This project is part of a portfolio. Contributions and suggestions are welcome!

## License

MIT
