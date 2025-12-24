'use client';

import { useWhiteboardStore } from '@/store/whiteboard';
import RemoteCursor from './RemoteCursor';
import { CursorPosition } from '@/types/whiteboard';

export default function RemoteCursors() {
  const { remoteCursors } = useWhiteboardStore();

  const cursors: CursorPosition[] = Array.from(remoteCursors.values());

  return (
    <>
      {cursors.map((cursor) => (
        <RemoteCursor key={cursor.userId} cursor={cursor} />
      ))}
    </>
  );
}
