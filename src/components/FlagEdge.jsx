import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from '@xyflow/react';
import { useStore } from '../store/useStore';

// Edge drawn out of a Decision. Click the pill to flag it Yes (green) / No (red) / unset.
export default function FlagEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd }) {
  const setEdgeBranch = useStore((s) => s.setEdgeBranch);
  const [path, labelX, labelY] = getSmoothStepPath({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition });

  const branch = data?.branch;
  const color = branch === 'true' ? '#10b981' : branch === 'false' ? '#ef4444' : '#1f2733';
  const next = branch === 'true' ? 'false' : branch === 'false' ? null : 'true';
  const text = branch === 'true' ? '✓ Yes' : branch === 'false' ? '✗ No' : 'Flag';

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} interactionWidth={24} style={{ stroke: color, strokeWidth: 2 }} />
      <EdgeLabelRenderer>
        <button
          className="flag-edge-btn nodrag nopan"
          title="Flag this branch Yes / No"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
            background: branch === 'true' ? '#10b981' : branch === 'false' ? '#ef4444' : '#ffffff',
            color: branch ? '#ffffff' : 'var(--text-secondary)',
            border: `1px solid ${branch ? color : 'var(--border-color)'}`
          }}
          onClick={(e) => { e.stopPropagation(); setEdgeBranch(id, next); }}
        >
          {text}
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
