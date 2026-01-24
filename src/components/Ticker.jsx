import { memo } from 'react';
import { formatPrice } from '../utils/math';

const Ticker = memo(({ items, theme }) => {
  return (
    <div style={{
      overflowX: 'auto',
      borderBottom: `0.5px solid ${theme.border}`,
      background: theme.surface,
      cursor: 'grab',
      WebkitOverflowScrolling: 'touch'
    }}>
      <div style={{
        display: 'flex',
        gap: 24,
        padding: '8px 16px',
        whiteSpace: 'nowrap',
        minWidth: 'max-content'
      }}>
        {[...Array(2)].map((_, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 24 }}>
            {items.map(item => (
              <span key={`${item.key}-${idx}`} style={{ display: 'flex', gap: 6, fontSize: 12, opacity: 0.8 }}>
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span>${formatPrice(item.price || 0)}</span>
                <span style={{ color: (item.change || 0) >= 0 ? theme.green : theme.red }}>
                  {(item.change || 0) >= 0 ? '▲' : '▼'}{Math.abs(item.change || 0).toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if items actually changed (deep comparison of prices)
  if (prevProps.items.length !== nextProps.items.length) return false;

  for (let i = 0; i < prevProps.items.length; i++) {
    const prev = prevProps.items[i];
    const next = nextProps.items[i];
    if (prev.price !== next.price || prev.change !== next.change) {
      return false; // Props changed, do re-render
    }
  }

  return true; // Props same, skip re-render
});

Ticker.displayName = 'Ticker';

export default Ticker;
