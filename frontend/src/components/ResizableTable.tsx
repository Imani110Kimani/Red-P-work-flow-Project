import React, { useRef, useState } from 'react';

interface ResizableTableProps {
  columns: Array<{ key: string; label: string; minWidth?: number; maxWidth?: number }>;
  data: Array<Record<string, any>>;
}

export const ResizableTable: React.FC<ResizableTableProps> = ({ columns, data }) => {
  const [colWidths, setColWidths] = useState<number[]>(columns.map(col => col.minWidth || 120));
  const resizingCol = useRef<number | null>(null);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const onMouseDown = (idx: number, e: React.MouseEvent) => {
    resizingCol.current = idx;
    startX.current = e.clientX;
    startWidth.current = colWidths[idx];
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (resizingCol.current === null) return;
    const delta = e.clientX - startX.current;
    let newWidth = startWidth.current + delta;
    const minWidth = columns[resizingCol.current].minWidth || 80;
    const maxWidth = columns[resizingCol.current].maxWidth || 400;
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    setColWidths(widths => widths.map((w, i) => (i === resizingCol.current ? newWidth : w)));
  };

  const onMouseUp = () => {
    resizingCol.current = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <table className="resizable-table" style={{ width: '100%', tableLayout: 'fixed' }}>
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th
              key={col.key}
              style={{ width: colWidths[idx], minWidth: col.minWidth || 80, maxWidth: col.maxWidth || 400, position: 'relative' }}
            >
              <span>{col.label}</span>
              <span
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  width: 8,
                  cursor: 'col-resize',
                  zIndex: 2,
                  userSelect: 'none',
                }}
                onMouseDown={e => onMouseDown(idx, e)}
              />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col, idx) => (
              <td key={col.key} style={{ width: colWidths[idx], minWidth: col.minWidth || 80, maxWidth: col.maxWidth || 400 }}>
                {row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResizableTable;
