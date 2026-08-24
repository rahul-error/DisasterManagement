import { useMemo } from 'react';

interface QRCodeProps {
  value: string;
  size?: number;
}

// Lightweight QR-like visual pattern generator (mock QR for ticket scanning)
// Not a real scannable QR code — a visual placeholder for the MVP.
export function MockQRCode({ value, size = 200 }: QRCodeProps) {
  const grid = useMemo(() => {
    const cells = 21; // standard QR module count
    const matrix: boolean[][] = [];

    // Simple hash-based pseudo-random pattern derived from the value
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
    }
    let seed = Math.abs(hash) || 1;

    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let r = 0; r < cells; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < cells; c++) {
        row.push(rand() > 0.5);
      }
      matrix.push(row);
    }

    // Add finder patterns (the 3 corner squares)
    const drawFinder = (startR: number, startC: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[startR + r][startC + c] = isBorder || isInner;
        }
      }
      // Clear the ring around finder
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            const rr = startR + r;
            const cc = startC + c;
            if (rr >= 0 && rr < cells && cc >= 0 && cc < cells) {
              matrix[rr][cc] = false;
            }
          }
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, cells - 7);
    drawFinder(cells - 7, 0);

    return matrix;
  }, [value]);

  const cellSize = size / grid.length;

  return (
    <div className="bg-white p-3 rounded-lg inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {grid.map((row, r) =>
          row.map((isBlack, c) =>
            isBlack ? (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize}
                y={r * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#102a43"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
