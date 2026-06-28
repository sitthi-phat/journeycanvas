import React from 'react';
import { Handle, Position } from '@xyflow/react';

// Connection anchors on every side and corner. With ConnectionMode.Loose set on the
// canvas, each handle can both start and receive a link, so users can connect from
// the top, bottom, left, right, or any corner of an element.
const HANDLES = [
  { id: 't', position: Position.Top },
  { id: 'r', position: Position.Right },
  { id: 'b', position: Position.Bottom },
  { id: 'l', position: Position.Left },
  { id: 'tl', position: Position.Top, style: { left: 8 } },
  { id: 'tr', position: Position.Top, style: { left: 'calc(100% - 8px)' } },
  { id: 'bl', position: Position.Bottom, style: { left: 8 } },
  { id: 'br', position: Position.Bottom, style: { left: 'calc(100% - 8px)' } }
];

export default function NodeHandles() {
  return (
    <>
      {HANDLES.map((h) => (
        <Handle key={h.id} id={h.id} type="source" position={h.position} style={h.style} />
      ))}
    </>
  );
}
