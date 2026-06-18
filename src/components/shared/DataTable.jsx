import { EmptyState } from './EmptyState'
import { Table2 } from 'lucide-react'

/**
 * Reusable data table.
 * columns: [{ key, header, render?(row), align?: 'left'|'right'|'center', width?, className? }]
 * data: array of rows. onRowClick(row) optional. filters: React node rendered above.
 */
export function DataTable({
  columns,
  data,
  onRowClick,
  filters,
  emptyTitle = 'No records',
  emptyMessage = 'Nothing to show here yet.',
  rowKey = (row, i) => row.id ?? i,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-card">
      {filters && <div className="border-b border-black/5 bg-offwhite/60 px-4 py-3">{filters}</div>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-graytext ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={rowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-black/5 last:border-0 transition-colors ${
                  onRowClick ? 'cursor-pointer hover:bg-green-light/40' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                    } ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <EmptyState icon={Table2} title={emptyTitle} message={emptyMessage} />
      )}
    </div>
  )
}

export default DataTable
