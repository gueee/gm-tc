import { useState, useRef } from 'react'
import { Eye, Edit3, Upload, FileUp, AlertCircle } from 'lucide-react'
import Plot from 'react-plotly.js'
import { ChartBlock, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'

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
  const [dataInput, setDataInput] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [detectedFields, setDetectedFields] = useState<string[]>([])
  const [xField, setXField] = useState('x')
  const [yField, setYField] = useState('y')
  const [rawJsonData, setRawJsonData] = useState<Record<string, unknown>[] | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    console.log('handleFileUpload triggered')
    const file = event.target.files?.[0]
    if (!file) {
      console.log('No file selected')
      return
    }
    console.log('File selected:', file.name, 'size:', file.size)

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      console.log('File read complete, content length:', content.length)
      setDataInput(content)
      // Auto-detect JSON structure
      detectJsonFields(content)
    }
    reader.onerror = () => {
      console.log('File read error')
      setParseError('Failed to read file')
    }
    reader.readAsText(file)

    // Reset input so same file can be selected again
    event.target.value = ''
  }

  // Detect JSON fields for field selection
  function detectJsonFields(content: string) {
    console.log('detectJsonFields called, content length:', content.length)
    setParseError(null)
    setDetectedFields([])
    setRawJsonData(null)

    try {
      console.log('Content starts with [:', content.trim().startsWith('['))
      if (content.trim().startsWith('[')) {
        const parsed = JSON.parse(content)
        console.log('Parsed successfully, is array:', Array.isArray(parsed), 'length:', parsed.length)
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('First object:', parsed[0])
          // Get all numeric fields from first object
          const fields = Object.keys(parsed[0]).filter(
            (key) => typeof parsed[0][key] === 'number'
          )
          console.log('Detected numeric fields:', fields)
          if (fields.length >= 2) {
            console.log('Setting detected fields and raw data')
            setDetectedFields(fields)
            setRawJsonData(parsed)
            // Auto-select first two fields
            setXField(fields[0])
            setYField(fields.length > 1 ? fields[1] : fields[0])
            return
          }
        }
      }
    } catch (err) {
      console.log('JSON parse error:', err)
      // Not JSON or invalid - that's fine, will try CSV on import
    }
  }

  // Import data using selected fields
  function importWithSelectedFields() {
    console.log('importWithSelectedFields called')
    console.log('rawJsonData:', rawJsonData ? `${rawJsonData.length} items` : 'null')
    console.log('xField:', xField, 'yField:', yField)

    if (!rawJsonData || !xField || !yField) {
      console.log('Missing data - rawJsonData:', !!rawJsonData, 'xField:', xField, 'yField:', yField)
      return
    }

    try {
      console.log('Extracting x and y arrays...')
      const x = rawJsonData.map((p) => Number(p[xField]))
      const y = rawJsonData.map((p) => Number(p[yField]))
      console.log('Extracted', x.length, 'points. First 3 x:', x.slice(0,3), 'First 3 y:', y.slice(0,3))

      if (x.some(isNaN) || y.some(isNaN)) {
        throw new Error('Selected fields must contain numeric values')
      }

      console.log('Calling onUpdate...')
      onUpdate({
        ...block,
        data: [{ x, y, name: 'Data' }],
        xAxisLabel: block.xAxisLabel || xField,
        yAxisLabel: block.yAxisLabel || yField,
      })
      console.log('onUpdate called successfully')
      setDataInput('')
      setDetectedFields([])
      setRawJsonData(null)
    } catch (err) {
      console.log('Error:', err)
      setParseError(err instanceof Error ? err.message : 'Failed to import data')
    }
  }

  // Parse CSV or simple JSON data
  function handleDataImport() {
    setParseError(null)

    try {
      // Try JSON first
      if (dataInput.trim().startsWith('[') || dataInput.trim().startsWith('{')) {
        const parsed = JSON.parse(dataInput)

        // Handle array of objects with arbitrary fields
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check for simple x,y format
          if ('x' in parsed[0] && 'y' in parsed[0]) {
            const x = parsed.map((p: {x: number}) => p.x)
            const y = parsed.map((p: {y: number}) => p.y)
            onUpdate({
              ...block,
              data: [{ x, y, name: 'Data' }],
            })
            setDataInput('')
            setDetectedFields([])
            setRawJsonData(null)
            return
          }

          // Otherwise, detect fields and show selector
          detectJsonFields(dataInput)
          if (detectedFields.length > 0) {
            setParseError('JSON detected! Select X and Y fields below, then click "Import with Selected Fields"')
            return
          }
        }

        // Handle {x: [], y: []} format
        if ('x' in parsed && 'y' in parsed) {
          onUpdate({
            ...block,
            data: [{ x: parsed.x, y: parsed.y, name: parsed.name || 'Data' }],
          })
          setDataInput('')
          return
        }

        throw new Error('JSON format not recognized. Use [{x,y},...] or upload file and select fields.')
      }

      // Parse as CSV (x,y per line)
      const lines = dataInput.trim().split('\n')
      const x: number[] = []
      const y: number[] = []

      for (const line of lines) {
        const parts = line.split(',').map((s) => s.trim())
        if (parts.length >= 2) {
          const xVal = parseFloat(parts[0])
          const yVal = parseFloat(parts[1])
          if (!isNaN(xVal) && !isNaN(yVal)) {
            x.push(xVal)
            y.push(yVal)
          }
        }
      }

      if (x.length === 0) {
        throw new Error('No valid data points found. Use format: x,y per line')
      }

      onUpdate({
        ...block,
        data: [{ x, y, name: 'Data' }],
      })
      setDataInput('')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse data')
    }
  }

  const hasData = block.data && block.data.length > 0 && block.data[0].x.length > 0
  console.log('ChartBlockEditor render - hasData:', hasData, 'block.data:', block.data?.length, 'points:', block.data?.[0]?.x?.length)

  return (
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
              mode: block.chartType === 'scatter' ? 'markers' : 'lines+markers',
              name: d.name || 'Data',
              marker: { color: '#D97706' },
              line: { color: '#D97706' },
            }))}
            layout={{
              title: block.title ? {
                text: block.title,
                font: { color: '#fff', size: 16 },
              } : undefined,
              paper_bgcolor: 'transparent',
              plot_bgcolor: '#1a1f2e',
              font: { color: '#9ca3af' },
              xaxis: {
                title: block.xAxisLabel ? { text: block.xAxisLabel } : undefined,
                gridcolor: '#374151',
                zerolinecolor: '#374151',
              },
              yaxis: {
                title: block.yAxisLabel ? { text: block.yAxisLabel } : undefined,
                gridcolor: '#374151',
                zerolinecolor: '#374151',
              },
              showlegend: block.showLegend,
              margin: { l: 60, r: 30, t: 50, b: 50 },
            }}
            config={{
              displayModeBar: true,
              scrollZoom: true,
              modeBarButtonsToAdd: ['pan2d', 'zoom2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d'],
              displaylogo: false,
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

          {/* Data Import */}
          <div className="border-t border-steel-700 pt-4">
            <label className="block text-sm font-medium text-steel-300 mb-2">
              Import Data
            </label>

            {/* File Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-steel-900 border-2 border-dashed border-steel-600 rounded-lg text-steel-300 hover:border-copper-400 hover:text-copper-400 transition-colors"
            >
              <FileUp className="w-5 h-5" />
              Upload CSV or JSON file
            </button>

            <p className="text-xs text-steel-500 mb-2 text-center">— or paste data below —</p>

            <textarea
              value={dataInput}
              onChange={(e) => setDataInput(e.target.value)}
              placeholder={`CSV (x,y per line):\n100,0.52\n200,0.48\n\nOr JSON:\n[{"x":100,"y":0.52}]`}
              rows={5}
              className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-copper-400 resize-y"
            />
            {parseError && (
              <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {parseError}
              </div>
            )}

            {/* Field Selection for JSON with named fields */}
            {detectedFields.length > 0 && (
              <div className="mt-3 p-3 bg-steel-800 border border-copper-400/30 rounded-lg">
                <p className="text-sm text-copper-400 font-medium mb-3">
                  ✓ JSON loaded! Select which fields to use:
                </p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-steel-400 mb-1">X Axis (horizontal)</label>
                    <select
                      value={xField}
                      onChange={(e) => setXField(e.target.value)}
                      className="w-full px-2 py-1.5 bg-steel-900 border border-steel-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-copper-400"
                    >
                      {detectedFields.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-steel-400 mb-1">Y Axis (vertical)</label>
                    <select
                      value={yField}
                      onChange={(e) => setYField(e.target.value)}
                      className="w-full px-2 py-1.5 bg-steel-900 border border-steel-600 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-copper-400"
                    >
                      {detectedFields.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-steel-500 mb-2">
                  Available fields: {detectedFields.join(', ')}
                </p>
                <button
                  onClick={importWithSelectedFields}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 text-sm font-medium rounded-lg hover:bg-copper-300 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import with Selected Fields
                </button>
              </div>
            )}

            {!detectedFields.length && (
              <button
                id={`import-btn-${block.id}`}
                onClick={handleDataImport}
                disabled={!dataInput.trim()}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 text-sm font-medium rounded-lg hover:bg-copper-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import Pasted Data
              </button>
            )}
          </div>

          {/* Current Data Preview */}
          {hasData && (
            <div className="border-t border-steel-700 pt-4">
              <p className="text-sm text-steel-400 mb-2">
                Current data: {block.data[0].x.length} points
              </p>
              <div className="text-xs text-steel-500 bg-steel-900 rounded p-2 font-mono max-h-24 overflow-y-auto">
                First 5: {block.data[0].x.slice(0, 5).map((x, i) => `(${x}, ${block.data[0].y[i]})`).join(', ')}
                {block.data[0].x.length > 5 && '...'}
              </div>
            </div>
          )}
        </div>
      )}
    </BlockWrapper>
  )
}

