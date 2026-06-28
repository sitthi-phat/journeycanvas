import React from 'react';
import { X, Copy, FileSpreadsheet, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import confetti from 'canvas-confetti';

export default function MatrixModal({ isOpen, onClose }) {
  const { matrixMarkdown } = useStore();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  // Simple markdown table parser to render beautiful HTML table
  const parseMarkdownTable = (mdText) => {
    if (!mdText) return null;
    const lines = mdText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const tableLines = lines.filter(line => line.startsWith('|'));
    
    if (tableLines.length < 2) return null;

    const headers = tableLines[0]
      .split('|')
      .map(h => h.trim())
      .filter((h, i) => i > 0 && i < tableLines[0].split('|').length - 1);

    // Skip divider row (index 1)
    const rows = tableLines.slice(2).map(row => {
      return row
        .split('|')
        .map(cell => cell.trim())
        .filter((cell, i) => i > 0 && i < row.split('|').length - 1);
    });

    return { headers, rows };
  };

  const tableData = parseMarkdownTable(matrixMarkdown);

  const handleCopy = () => {
    navigator.clipboard.writeText(matrixMarkdown);
    setCopied(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="matrix-modal-backdrop">
      <div className="matrix-modal-content">
        <div className="matrix-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>System Architecture Synthesis Matrix</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="matrix-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
            AI has synthesized your User & Application journey connections, cleaning up clutter and grouping relations cleanly by system module, actors, actions, and application responses.
          </p>

          {tableData ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="matrix-table-rendered">
                <thead>
                  <tr>
                    {tableData.headers.map((h, i) => (
                      <th key={i}>{h.replace(/\*\*/g, '')}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} dangerouslySetInnerHTML={{ 
                          __html: cell
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/`([^`]+)`/g, '<code>$1</code>')
                        }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="matrix-empty">
              No matrix compiled yet. Go back to canvas and click <strong>"AI Orchestrator"</strong> to structure your workspace and generate the developer matrix.
            </div>
          )}
        </div>

        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          {tableData && (
            <button className="btn" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied & Celebrated!' : 'Copy Markdown Matrix'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
