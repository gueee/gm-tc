import { useState, useRef, useCallback } from 'react'
import { Eye, Edit3, Upload, FileUp, AlertCircle, CheckCircle, X } from 'lucide-react'
import Plot from 'react-plotly.js'
import { ChartBlock, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'

// Type for parsed JSON data
interface ParsedJsonData {
  data: Record<string, unknown>[]
  fields: string[]
}

export default function ChartBlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockComponentProps<ChartBlock>) {
  const [isPreview, setIsPreview] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  // Modal state for field selection
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [pendingData, setPendingData] = useState<ParsedJsonData | null>(null)
  const [selectedXField, setSelectedXField] = useState('')
  const [selectedYField, setSelectedYField] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse and validate JSON data
  const parseJsonData = useCallback((content: string): ParsedJsonData | null => {
    try {
      const trimmed = content.trim()
      if (!trimmed.startsWith('[')) return null

      const parsed = JSON.parse(trimmed)
      if (!Array.isArray(parsed) || parsed.length === 0) return null

      const firstObj = parsed[0]
      if (typeof firstObj !== 'object' || firstObj === null) return null

      // Get all numeric fields
      const fields = Object.keys(firstObj).filter(key =>
        typeof firstObj[key] === 'number'
      )

      if (fields.length < 2) return null

      return { data: parsed, fields }
    } catch {
      return null
    }
  }, [])

  // Handle file upload - directly opens field selection modal
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null)
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = parseJsonData(content)

      if (result) {
        // JSON - Open modal for field selection
        setPendingData(result)
        setSelectedXField(result.fields[0])
        setSelectedYField(result.fields.length > 1 ? result.fields[1] : result.fields[0])
        setShowFieldModal(true)
      } else {
        // Try CSV parsing - also opens field selection modal
        const csvResult = parseCSV(content)
        if (csvResult) {
          setPendingData(csvResult)
          setSelectedXField(csvResult.fields[0])
          setSelectedYField(csvResult.fields.length > 1 ? csvResult.fields[1] : csvResult.fields[0])
          setShowFieldModal(true)
        } else {
          setParseError('Could not parse file. Ensure JSON array of objects with numeric fields, or CSV with header row.')
        }
      }
    }
    reader.onerror = () => setParseError('Failed to read file')
    reader.readAsText(file)

    // Reset input for re-upload
    event.target.value = ''
  }, [parseJsonData])

  // Parse CSV data - returns parsed data with field names for selection
  const parseCSV = useCallback((content: string): ParsedJsonData | null => {
    const lines = content.trim().split('\n')
    if (lines.length < 2) return null

    // First line is header
    const headers = lines[0].split(',').map(s => s.trim())
    const data: Record<string, unknown>[] = []

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim())
      if (parts.length >= headers.length) {
        const row: Record<string, unknown> = {}
        headers.forEach((header, idx) => {
          const val = parseFloat(parts[idx])
          if (!isNaN(val)) row[header] = val
        })
        if (Object.keys(row).length > 0) data.push(row)
      }
    }

    if (data.length === 0) return null

    // Get numeric fields
    const fields = headers.filter(h => typeof data[0][h] === 'number')
    return fields.length >= 2 ? { data, fields } : null
  }, [])

  // Apply data to block - this is the ONLY place we call onUpdate for data
  const applyData = useCallback((x: number[], y: number[], xLabel: string, yLabel: string) => {
    const newBlock: ChartBlock = {
      ...block,
      data: [{ x, y, name: 'Data' }],
      xAxisLabel: block.xAxisLabel || xLabel,
      yAxisLabel: block.yAxisLabel || yLabel,
    }
    onUpdate(newBlock)
  }, [block, onUpdate])

  // Confirm field selection from modal
  const confirmFieldSelection = useCallback(() => {
    if (!pendingData || !selectedXField || !selectedYField) return

    try {
      const x = pendingData.data.map(p => Number(p[selectedXField]))
      const y = pendingData.data.map(p => Number(p[selectedYField]))

      if (x.some(isNaN) || y.some(isNaN)) {
        setParseError('Selected fields contain non-numeric values')
        return
      }

      // Sample data if too large - use LTTB-like approach to preserve shape
      // Target ~10000 points for smooth charts while keeping all time range
      const MAX_POINTS = 10000
      let finalX = x
      let finalY = y
      if (x.length > MAX_POINTS) {
        const step = Math.ceil(x.length / MAX_POINTS)
        // Always keep first and last points to preserve time range
        finalX = [x[0]]
        finalY = [y[0]]
        for (let i = step; i < x.length - 1; i += step) {
          finalX.push(x[i])
          finalY.push(y[i])
        }
        finalX.push(x[x.length - 1])
        finalY.push(y[y.length - 1])
      }

      applyData(finalX, finalY, selectedXField, selectedYField)

      // Close modal and clear pending data
      setShowFieldModal(false)
      setPendingData(null)
      setParseError(null)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to import data')
    }
  }, [pendingData, selectedXField, selectedYField, applyData])

  // Cancel field selection
  const cancelFieldSelection = useCallback(() => {
    setShowFieldModal(false)
    setPendingData(null)
  }, [])

  const hasData = block.data && block.data.length > 0 && block.data[0].x.length > 0

  return (
    <>
      {/* Field Selection Modal */}
      {showFieldModal && pendingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-steel-800 border border-steel-600 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Select Chart Fields</h3>
              <button onClick={cancelFieldSelection} className="text-steel-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-steel-400 mb-4">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-400" />
              Loaded {pendingData.data.length.toLocaleString()} data points
              {pendingData.data.length > 5000 && (
                <span className="text-amber-400"> (will sample to ~5000 for performance)</span>
              )}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">X Axis (horizontal)</label>
                <select
                  value={selectedXField}
                  onChange={(e) => setSelectedXField(e.target.value)}
                  className="w-full px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-400"
                >
                  {pendingData.fields.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">Y Axis (vertical)</label>
                <select
                  value={selectedYField}
                  onChange={(e) => setSelectedYField(e.target.value)}
                  className="w-full px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-copper-400"
                >
                  {pendingData.fields.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-steel-500 mb-4">
              Available fields: {pendingData.fields.join(', ')}
            </p>

            <div className="flex gap-3">
              <button
                onClick={cancelFieldSelection}
                className="flex-1 px-4 py-2 bg-steel-700 text-steel-300 rounded-lg hover:bg-steel-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmFieldSelection}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 font-medium rounded-lg hover:bg-copper-300 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Data
              </button>
            </div>
          </div>
        </div>
      )}

      <BlockWrapper
        title="Chart Block"
        onDelete={onDelete}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        isFirst={isFirst}
        isLast={isLast}
        actions={
          hasData && (
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`p-1.5 rounded transition-colors ${
                isPreview ? 'bg-copper-400/20 text-copper-400' : 'text-steel-400 hover:text-copper-400'
              }`}
              title={isPreview ? 'Configure' : 'Preview'}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )
        }
      >
        {isPreview && hasData ? (
          <div className="bg-steel-900 rounded-lg p-4">
            <Plot
              data={block.data.map((d) => ({
                x: d.x,
                y: d.y,
                type: block.chartType === 'bar' ? 'bar' : 'scatter',
                mode: block.chartType === 'scatter' ? 'markers' : 'lines',
                name: d.name || 'Data',
                line: { color: '#D4A574', width: 2 },
                marker: { color: '#D4A574', size: 4 },
                fill: block.chartType === 'line' ? 'tozeroy' : undefined,
                fillcolor: 'rgba(212, 165, 116, 0.15)',
                hovertemplate: `<b>${block.xAxisLabel || 'X'}: %{x}</b><br>${block.yAxisLabel || 'Y'}: %{y}<extra></extra>`,
              }))}
              layout={{
                title: block.title ? {
                  text: block.title,
                  font: { color: '#fff', size: 16 },
                } : undefined,
                paper_bgcolor: 'transparent',
                plot_bgcolor: '#1a2332',
                font: { color: '#a8b8c8', family: 'Inter, Arial, sans-serif' },
                xaxis: {
                  title: block.xAxisLabel ? { text: block.xAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
                  gridcolor: 'rgba(212, 165, 116, 0.1)',
                  zeroline: false,
                  showgrid: true,
                  tickfont: { color: '#8a9aaa', size: 11 },
                  rangeslider: { visible: true, bgcolor: '#1a2332', bordercolor: '#374151', thickness: 0.1 },
                },
                yaxis: {
                  title: block.yAxisLabel ? { text: block.yAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
                  gridcolor: 'rgba(212, 165, 116, 0.1)',
                  zeroline: false,
                  showgrid: true,
                  tickfont: { color: '#8a9aaa', size: 11 },
                },
                showlegend: block.showLegend,
                margin: { l: 60, r: 40, t: 50, b: 50 },
                hovermode: 'x unified',
                dragmode: 'zoom',
                autosize: true,
              }}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
                scrollZoom: true,
                doubleClick: 'reset',
              }}
              style={{ width: '100%', height: '400px' }}
              useResizeHandler
            />
            <p className="text-xs text-steel-500 mt-2 text-center">
              Scroll to zoom • Drag to pan • Double-click to reset • Hover for data values
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart Config */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">Chart Title</label>
                <input
                  type="text"
                  value={block.title}
                  onChange={(e) => onUpdate({ ...block, title: e.target.value })}
                  className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
                  placeholder="Chart title..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">Chart Type</label>
                <select
                  value={block.chartType}
                  onChange={(e) =>
                    onUpdate({ ...block, chartType: e.target.value as 'scatter' | 'line' | 'bar' })
                  }
                  className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
                >
                  <option value="line">Line</option>
                  <option value="scatter">Scatter</option>
                  <option value="bar">Bar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">X Axis Label</label>
                <input
                  type="text"
                  value={block.xAxisLabel || ''}
                  onChange={(e) => onUpdate({ ...block, xAxisLabel: e.target.value })}
                  className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
                  placeholder="X axis label..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">Y Axis Label</label>
                <input
                  type="text"
                  value={block.yAxisLabel || ''}
                  onChange={(e) => onUpdate({ ...block, yAxisLabel: e.target.value })}
                  className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
                  placeholder="Y axis label..."
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`showLegend-${block.id}`}
                checked={block.showLegend}
                onChange={(e) => onUpdate({ ...block, showLegend: e.target.checked })}
                className="w-4 h-4 rounded border-steel-700 bg-steel-900 text-copper-400 focus:ring-copper-400"
              />
              <label htmlFor={`showLegend-${block.id}`} className="text-sm text-steel-300">
                Show legend
              </label>
            </div>

            {/* Data Import - Simple file upload */}
            <div className="border-t border-steel-700 pt-4">
              <label className="block text-sm font-medium text-steel-300 mb-2">
                Import Data
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-steel-900 border-2 border-dashed border-steel-600 rounded-lg text-steel-300 hover:border-copper-400 hover:text-copper-400 transition-colors"
              >
                <FileUp className="w-5 h-5" />
                <span>Click to upload JSON or CSV file</span>
              </button>

              <p className="text-xs text-steel-500 mt-2 text-center">
                JSON: array of objects with numeric fields • CSV: x,y values per line
              </p>

              {parseError && (
                <div className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {parseError}
                </div>
              )}
            </div>

            {/* Current Data Info */}
            {hasData && (
              <div className="border-t border-steel-700 pt-4">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Data loaded: {block.data[0].x.length.toLocaleString()} points</span>
                </div>
                <div className="text-xs text-steel-500 bg-steel-900 rounded p-2 font-mono max-h-24 overflow-y-auto">
                  First 5: {block.data[0].x.slice(0, 5).map((x, i) => `(${x.toFixed(2)}, ${block.data[0].y[i].toFixed(2)})`).join(', ')}
                  {block.data[0].x.length > 5 && '...'}
                </div>
                <button
                  onClick={() => setIsPreview(true)}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 text-sm font-medium rounded-lg hover:bg-copper-300 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Preview Chart
                </button>
              </div>
            )}
          </div>
        )}
      </BlockWrapper>
    </>
  )
}

