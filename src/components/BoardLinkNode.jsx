import React from 'react';
import { NodeResizer } from '@xyflow/react';
import { Link2, ChevronRight, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import NodeHandles from './NodeHandles';

// A link to another board in the SAME workspace. Pick a board → it shows that
// board's name → clicking it opens that board (also works in Presentation view).
export default function BoardLinkNode({ id, data, selected }) {
  const updateNodeData = useStore((s) => s.updateNodeData);
  const deleteNode = useStore((s) => s.deleteNode);
  const boardsList = useStore((s) => s.boardsList);
  const currentBoardId = useStore((s) => s.boardId);
  const loadBoard = useStore((s) => s.loadBoard);

  const options = boardsList.filter((b) => b.id !== currentBoardId);
  const target = data.boardId ? boardsList.find((b) => b.id === data.boardId) : null;
  const targetName = target?.name || data.boardName || 'Unknown board';
  const missing = data.boardId && !target; // linked board not in this workspace anymore

  const pick = (boardId) => {
    const b = boardsList.find((o) => o.id === boardId);
    if (b) updateNodeData(id, { boardId: b.id, boardName: b.name });
  };
  const open = () => { if (data.boardId) loadBoard(data.boardId); };

  return (
    <div className={`board-link-node ${selected ? 'selected' : ''}`} style={{ width: '100%', height: '100%' }}>
      <NodeResizer isVisible={selected} minWidth={160} minHeight={46} />
      <NodeHandles />

      {selected && (
        <button className="node-delete-btn board-link-del nodrag" onClick={() => deleteNode(id)} title="Delete">
          <Trash2 size={12} />
        </button>
      )}

      {data.boardId ? (
        <button
          className="board-link-go"
          onClick={open}
          title={missing ? 'Linked board not found in this workspace' : `Open “${targetName}” — drag to move`}
        >
          <Link2 size={14} className="board-link-icon" />
          <span className="board-link-name">{targetName}</span>
          <ChevronRight size={15} className="board-link-arrow" />
        </button>
      ) : (
        <div className="board-link-pick nodrag">
          <Link2 size={14} className="board-link-icon" />
          <select value="" onChange={(e) => pick(e.target.value)}>
            <option value="" disabled>Link a board…</option>
            {options.length === 0 && <option value="" disabled>No other boards here</option>}
            {options.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}

      {data.boardId && selected && (
        <select className="board-link-change nodrag" value={data.boardId} onChange={(e) => pick(e.target.value)}>
          {boardsList.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      )}
    </div>
  );
}
