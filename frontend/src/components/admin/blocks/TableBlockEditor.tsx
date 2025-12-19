import { Plus, Trash2, GripVertical } from 'lucide-react'
import { TableBlock, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'

export default function TableBlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockComponentProps<TableBlock>) {
  const columnCount = block.headers.length || 1

  // Add a new column
  function addColumn() {
    const newHeaders = [...block.headers, `Column ${columnCount + 1}`]
    const newRows = block.rows.map(row => [...row, ''])
    onUpdate({ ...block, headers: newHeaders, rows: newRows })
  }

  // Remove a column by index
  function removeColumn(colIndex: number) {
    if (columnCount <= 1) return
    const newHeaders = block.headers.filter((_, i) => i !== colIndex)
    const newRows = block.rows.map(row => row.filter((_, i) => i !== colIndex))
    onUpdate({ ...block, headers: newHeaders, rows: newRows })
  }

  // Add a new row
  function addRow() {
    const emptyRow = Array(columnCount).fill('')
    onUpdate({ ...block, rows: [...block.rows, emptyRow] })
  }

  // Remove a row by index
  function removeRow(rowIndex: number) {
    onUpdate({ ...block, rows: block.rows.filter((_, i) => i !== rowIndex) })
  }

  // Update a header cell
  function updateHeader(colIndex: number, value: string) {
    const newHeaders = [...block.headers]
    newHeaders[colIndex] = value
    onUpdate({ ...block, headers: newHeaders })
  }

  // Update a data cell
  function updateCell(rowIndex: number, colIndex: number, value: string) {
    const newRows = block.rows.map((row, rIdx) => {
      if (rIdx !== rowIndex) return row
      const newRow = [...row]
      newRow[colIndex] = value
      return newRow
    })
    onUpdate({ ...block, rows: newRows })
  }

  return (
    <BlockWrapper
      title="Table Block"
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >
      <div className="space-y-4">
        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-steel-300 mb-2">
            Caption (optional)
          </label>
          <input
            type="text"
            value={block.caption || ''}
            onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
            placeholder="Table caption..."
            className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400"
          />
        </div>

        {/* Style Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-steel-300 cursor-pointer">
            <input
              type="checkbox"
              checked={block.striped || false}
              onChange={(e) => onUpdate({ ...block, striped: e.target.checked })}
              className="w-4 h-4 rounded border-steel-600 bg-steel-800 text-copper-400 focus:ring-copper-400 focus:ring-offset-0"
            />
            Striped rows
          </label>
          <label className="flex items-center gap-2 text-sm text-steel-300 cursor-pointer">
            <input
              type="checkbox"
              checked={block.bordered || false}
              onChange={(e) => onUpdate({ ...block, bordered: e.target.checked })}
              className="w-4 h-4 rounded border-steel-600 bg-steel-800 text-copper-400 focus:ring-copper-400 focus:ring-offset-0"
            />
            Bordered cells
          </label>
          <label className="flex items-center gap-2 text-sm text-steel-300 cursor-pointer">
            <input
              type="checkbox"
              checked={block.compact || false}
              onChange={(e) => onUpdate({ ...block, compact: e.target.checked })}
              className="w-4 h-4 rounded border-steel-600 bg-steel-800 text-copper-400 focus:ring-copper-400 focus:ring-offset-0"
            />
            Compact
          </label>
        </div>

        {/* Table Editor */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header Row */}
            <thead>
              <tr>
                <th className="w-8"></th>
                {block.headers.map((header, colIndex) => (
                  <th key={colIndex} className="relative group">
                    <input
                      type="text"
                      value={header}
                      onChange={(e) => updateHeader(colIndex, e.target.value)}
                      placeholder={`Header ${colIndex + 1}`}
                      className="w-full px-3 py-2 bg-steel-800 border border-steel-600 text-copper-400 font-semibold text-sm placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 focus:z-10"
                    />
                    {columnCount > 1 && (
                      <button
                        onClick={() => removeColumn(colIndex)}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
                        title="Remove column"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </th>
                ))}
                <th className="w-10">
                  <button
                    onClick={addColumn}
                    className="p-2 text-steel-400 hover:text-copper-400 transition-colors"
                    title="Add column"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </th>
              </tr>
            </thead>

            {/* Data Rows */}
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group/row">
                  <td className="w-8 text-center">
                    <GripVertical className="w-4 h-4 text-steel-600 inline-block" />
                  </td>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex}>
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                        placeholder="..."
                        className="w-full px-3 py-2 bg-steel-900 border border-steel-700 text-steel-300 text-sm placeholder-steel-600 focus:outline-none focus:ring-2 focus:ring-copper-400"
                      />
                    </td>
                  ))}
                  <td className="w-10">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="p-2 text-steel-600 hover:text-red-400 transition-colors opacity-0 group-hover/row:opacity-100"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <button
          onClick={addRow}
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-steel-700 rounded-lg text-steel-400 hover:border-copper-400 hover:text-copper-400 transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Add Row
        </button>

        {/* Preview hint */}
        {block.rows.length > 0 && (
          <p className="text-xs text-steel-500 text-center">
            {block.headers.length} columns × {block.rows.length} rows
          </p>
        )}
      </div>
    </BlockWrapper>
  )
}

