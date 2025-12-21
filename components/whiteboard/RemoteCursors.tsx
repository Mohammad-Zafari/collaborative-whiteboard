'use client';

import { useWhiteboardStore } from '@/store/whiteboard';
import RemoteCursor from './RemoteCursor';

export default function RemoteCursors() {
  const { remoteCursors } = useWhiteboardStore();

  return (
    <>
      {Array.from(remoteCursors.values()).map((cursor) => (
        <RemoteCursor key={cursor.userId} cursor={cursor} />
      ))}
    </>
  );
}
