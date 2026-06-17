import { useState, useEffect } from 'react';

const CELL_H = 40;
const SPINS   = 5;
const BASE_DURATION = 5200;

function SlotDigit({ digit, duration, startDelay }: { digit: number; duration: number; startDelay: number }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGo(true), 80);
    return () => clearTimeout(t);
  }, []);

  const finalY = (SPINS * 10 + digit) * CELL_H;

  return (
    <div className="overflow-hidden" style={{ height: CELL_H }}>
      <div
        style={{
          transform: go ? `translateY(-${finalY}px)` : 'translateY(0)',
          transition: go
            ? `transform ${duration}ms cubic-bezier(0.04, 0.92, 0.06, 1) ${startDelay}ms`
            : 'none',
          willChange: 'transform',
        }}
      >
        {Array.from({ length: SPINS }, (_, s) =>
          Array.from({ length: 10 }, (_, n) => (
            <div key={`s${s}n${n}`} className="flex items-center justify-center font-black text-3xl leading-none text-text" style={{ height: CELL_H }}>{n}</div>
          ))
        )}
        {Array.from({ length: digit + 1 }, (_, n) => (
          <div key={`l${n}`} className="flex items-center justify-center font-black text-3xl leading-none text-text" style={{ height: CELL_H }}>{n}</div>
        ))}
      </div>
    </div>
  );
}

export function SlotCounter({ value, globalDelay = 0 }: { value: number; globalDelay?: number }) {
  const digits = String(value).split('').map(Number);
  return (
    <div className="flex items-center gap-[1px]">
      {digits.map((d, i) => (
        <SlotDigit
          key={i}
          digit={d}
          duration={BASE_DURATION - i * 80}
          startDelay={globalDelay + i * 100}
        />
      ))}
    </div>
  );
}
