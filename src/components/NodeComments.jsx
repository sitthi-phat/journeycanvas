import React, { useState } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';

// Per-element comment thread. Renders a toggle with a count badge and, when open,
// a bulleted list of comments for this node plus an inline composer.
export default function NodeComments({ nodeId, defaultOpen = false }) {
  const comments = useStore((s) => s.comments.filter((c) => c.nodeId === nodeId));
  const addComment = useStore((s) => s.addComment);
  const deleteComment = useStore((s) => s.deleteComment);

  const [open, setOpen] = useState(defaultOpen);
  const [text, setText] = useState('');

  const handleAdd = () => {
    const value = text.trim();
    if (!value) return;
    addComment(nodeId, value, null, null);
    setText('');
  };

  return (
    <div className="nodrag nowheel" style={{ marginTop: '10px' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'transparent',
          border: 'none',
          color: comments.length > 0 ? 'var(--accent-color)' : 'var(--text-secondary)',
          fontSize: '10px',
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0
        }}
      >
        <MessageSquare size={11} />
        Comments{comments.length > 0 ? ` (${comments.length})` : ''}
      </button>

      {open && (
        <div
          style={{
            marginTop: '6px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '8px'
          }}
        >
          {comments.length === 0 ? (
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '6px' }}>
              No comments yet.
            </div>
          ) : (
            <ul style={{ listStyle: 'disc', paddingLeft: '16px', margin: '0 0 8px 0', maxHeight: '140px', overflowY: 'auto' }}>
              {comments.map((c) => (
                <li key={c.id} style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{c.author}: </span>
                  {c.content}
                  <button
                    onClick={() => deleteComment(c.id)}
                    title="Delete comment"
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0 0 4px', verticalAlign: 'middle' }}
                  >
                    <Trash2 size={9} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div style={{ display: 'flex', gap: '4px' }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Comment… @name to mention"
              style={{
                flex: 1,
                background: 'var(--bg-panel-solid)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '10px',
                padding: '3px 6px',
                borderRadius: '4px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleAdd}
              style={{
                background: 'var(--bg-panel-solid)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '2px 6px',
                cursor: 'pointer',
                color: 'var(--text-primary)'
              }}
            >
              <Send size={10} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
