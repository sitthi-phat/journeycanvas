import React from 'react';

// Sentiment scale for the "emotional curve" of a journey step
export const EMOTIONS = ['😀', '🙂', '😐', '🙁', '😞'];

export default function EmotionPicker({ value, onChange }) {
  return (
    <div className="emotion-picker">
      {EMOTIONS.map((e) => (
        <button
          key={e}
          type="button"
          className={`emotion-btn ${value === e ? 'active' : ''}`}
          onClick={() => onChange(value === e ? '' : e)}
          title={value === e ? 'Clear sentiment' : 'Set sentiment'}
        >
          {e}
        </button>
      ))}
    </div>
  );
}
