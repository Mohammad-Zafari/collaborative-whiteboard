'use client';

import { CursorPosition } from '@/types/whiteboard';

interface RemoteCursorProps {
  cursor: CursorPosition;
}

export default function RemoteCursor({ cursor }: RemoteCursorProps) {
  return (
    <div
      className="absolute pointer-events-none z-50 transition-transform duration-75"
      style={{
        left: `${cursor.x}px`,
        top: `${cursor.y}px`,
        transform: 'translate(-2px, -2px)',
      }}
    >
      {/* Cursor pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        <path
          d="M5.65376 12.3673L13.1844 16.2485C13.6263 16.4713 14.1585 16.2235 14.2205 15.7425L15.2866 7.35725C15.3583 6.81522 14.7747 6.42089 14.3081 6.69869L5.65376 12.3673Z"
          fill={cursor.color}
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* User name label */}
      <div
        className="absolute top-5 left-3 whitespace-nowrap text-xs font-medium px-2 py-1 rounded shadow-lg"
        style={{
          backgroundColor: cursor.color,
          color: '#ffffff',
        }}
      >
        {cursor.userName}
      </div>
    </div>
  );
}
