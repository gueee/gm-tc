import { useState, useRef, useCallback, useMemo } from 'react'
import { Eye, Edit3, Upload, AlertCircle, CheckCircle, X, Plus, Trash2, TrendingUp } from 'lucide-react'
import Plot from 'react-plotly.js'
import { ChartBlock, ChartDataSeries, ChartAnnotation, ChartShape, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'

// Type for parsed data
interface ParsedData {
  data: Record<string, unknown>[]
  fields: string[]
}

// Color palette for multiple series
const SERIES_COLORS = [
  '#D4A574', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'
]

// Calculate linear regression trendline
function calculateLinearTrendline(x: number[], y: number[]): { x: number[], y: number[] } {
  const n = x.length
  if (n < 2) return { x: [], y: [] }
  
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0)
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0)
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n
  
  const minX = Math.min(...x)
  const maxX = Math.max(...x)
  return {
    x: [minX, maxX],
    y: [slope * minX + intercept, slope * maxX + intercept]
  }
}

// Calculate moving average
function calculateMovingAverage(x: number[], y: number[], window = 10): { x: number[], y: number[] } {
  if (y.length < window) return { x, y }
  
  const avgX: number[] = []
  const avgY: number[] = []
  
  for (let i = window - 1; i < y.length; i++) {
    const sum = y.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0)
    avgX.push(x[i])
    avgY.push(sum / window)
  }
  
  return { x: avgX, y: avgY }
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
  const [activeTab, setActiveTab] = useState<'data' | 'options' | 'annotations'>('data')
  
  // Modal state for field selection
  const [showFieldModal, setShowFieldModal] = useState(false)
  const [pendingData, setPendingData] = useState<ParsedData | null>(null)
  const [selectedXField, setSelectedXField] = useState('')
  const [selectedYField, setSelectedYField] = useState('')
  const [selectedSeriesName, setSelectedSeriesName] = useState('')
  const [editingSeriesIndex, setEditingSeriesIndex] = useState<number | null>(null)
  
  // Annotation modal
  const [showAnnotationModal, setShowAnnotationModal] = useState(false)
  const [newAnnotation, setNewAnnotation] = useState<ChartAnnotation>({ x: 0, y: 0, text: '', showArrow: true })
  
  // Shape modal
  const [showShapeModal, setShowShapeModal] = useState(false)
  const [newShape, setNewShape] = useState<ChartShape>({ type: 'rect', x0: 0, x1: 100, y0: 0, y1: 100, color: '#D4A574', opacity: 0.2 })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Parse JSON data
  const parseJsonData = useCallback((content: string): ParsedData | null => {
    try {
      const trimmed = content.trim()
      if (!trimmed.startsWith('[')) return null
      const parsed = JSON.parse(trimmed)
      if (!Array.isArray(parsed) || parsed.length === 0) return null
      const firstObj = parsed[0]
      if (typeof firstObj !== 'object' || firstObj === null) return null
      const fields = Object.keys(firstObj).filter(key => typeof firstObj[key] === 'number')
      if (fields.length < 2) return null
      return { data: parsed, fields }
    } catch {
      return null
    }
  }, [])

  // Parse CSV data
  const parseCSV = useCallback((content: string): ParsedData | null => {
    const lines = content.trim().split('\n')
    if (lines.length < 2) return null
    const headers = lines[0].split(',').map(s => s.trim())
    const data: Record<string, unknown>[] = []
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
    const fields = headers.filter(h => typeof data[0][h] === 'number')
    return fields.length >= 2 ? { data, fields } : null
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null)
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const result = parseJsonData(content) || parseCSV(content)
      if (result) {
        setPendingData(result)
        setSelectedXField(result.fields[0])
        setSelectedYField(result.fields.length > 1 ? result.fields[1] : result.fields[0])
        setSelectedSeriesName(`Series ${block.data.length + 1}`)
        setEditingSeriesIndex(null)
        setShowFieldModal(true)
      } else {
        setParseError('Could not parse file. Ensure JSON array or CSV with header row.')
      }
    }
    reader.onerror = () => setParseError('Failed to read file')
    reader.readAsText(file)
    event.target.value = ''
  }, [parseJsonData, parseCSV, block.data.length])

  // Apply data as new or updated series
  const confirmFieldSelection = useCallback(() => {
    if (!pendingData || !selectedXField || !selectedYField) return
    try {
      let x = pendingData.data.map(p => Number(p[selectedXField]))
      let y = pendingData.data.map(p => Number(p[selectedYField]))
      if (x.some(isNaN) || y.some(isNaN)) {
        setParseError('Selected fields contain non-numeric values')
        return
      }
      // Sample if too large
      const MAX_POINTS = 10000
      if (x.length > MAX_POINTS) {
        const step = Math.ceil(x.length / MAX_POINTS)
        const sampledX = [x[0]]
        const sampledY = [y[0]]
        for (let i = step; i < x.length - 1; i += step) {
          sampledX.push(x[i])
          sampledY.push(y[i])
        }
        sampledX.push(x[x.length - 1])
        sampledY.push(y[y.length - 1])
        x = sampledX
        y = sampledY
      }
      
      const newSeries: ChartDataSeries = {
        x, y,
        name: selectedSeriesName || `Series ${block.data.length + 1}`,
        color: SERIES_COLORS[block.data.length % SERIES_COLORS.length],
        useSecondaryY: false
      }
      
      let newData: ChartDataSeries[]
      if (editingSeriesIndex !== null) {
        newData = [...block.data]
        newData[editingSeriesIndex] = { ...newData[editingSeriesIndex], ...newSeries }
      } else {
        newData = [...block.data, newSeries]
      }
      
      onUpdate({
        ...block,
        data: newData,
        xAxisLabel: block.xAxisLabel || selectedXField,
        yAxisLabel: block.yAxisLabel || selectedYField,
      })
      
      setShowFieldModal(false)
      setPendingData(null)
      setParseError(null)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to import data')
    }
  }, [pendingData, selectedXField, selectedYField, selectedSeriesName, editingSeriesIndex, block, onUpdate])

  // Delete series
  const deleteSeries = (index: number) => {
    const newData = block.data.filter((_, i) => i !== index)
    onUpdate({ ...block, data: newData })
  }

  // Update series property
  const updateSeries = (index: number, updates: Partial<ChartDataSeries>) => {
    const newData = [...block.data]
    newData[index] = { ...newData[index], ...updates }
    onUpdate({ ...block, data: newData })
  }

  // Add annotation
  const addAnnotation = () => {
    const annotations = [...(block.annotations || []), newAnnotation]
    onUpdate({ ...block, annotations })
    setShowAnnotationModal(false)
    setNewAnnotation({ x: 0, y: 0, text: '', showArrow: true })
  }

  // Delete annotation
  const deleteAnnotation = (index: number) => {
    const annotations = (block.annotations || []).filter((_, i) => i !== index)
    onUpdate({ ...block, annotations })
  }

  // Add shape
  const addShape = () => {
    const shapes = [...(block.shapes || []), newShape]
    onUpdate({ ...block, shapes })
    setShowShapeModal(false)
    setNewShape({ type: 'rect', x0: 0, x1: 100, y0: 0, y1: 100, color: '#D4A574', opacity: 0.2 })
  }

  // Delete shape
  const deleteShape = (index: number) => {
    const shapes = (block.shapes || []).filter((_, i) => i !== index)
    onUpdate({ ...block, shapes })
  }

  const hasData = block.data && block.data.length > 0 && block.data[0]?.x?.length > 0

  // Build Plotly traces
  const plotTraces = useMemo(() => {
    if (!hasData) return []
    
    const traces: Plotly.Data[] = []
    
    block.data.forEach((series, idx) => {
      const color = series.color || SERIES_COLORS[idx % SERIES_COLORS.length]
      
      // Determine trace type and mode
      let traceType: string = 'scatter'
      let mode: string = 'lines'
      let fill: string | undefined
      
      switch (block.chartType) {
        case 'scatter':
          mode = 'markers'
          break
        case 'line':
          mode = 'lines'
          fill = 'tozeroy'
          break
        case 'area':
          mode = 'lines'
          fill = 'tozeroy'
          break
        case 'bar':
          traceType = 'bar'
          break
        case 'histogram':
          traceType = 'histogram'
          break
        case 'box':
          traceType = 'box'
          break
        case 'pie':
          traceType = 'pie'
          break
      }
      
      const trace: any = {
        x: series.x,
        y: series.y,
        type: traceType,
        mode: mode,
        name: series.name || `Series ${idx + 1}`,
        marker: { color, size: 6 },
        line: { 
          color, 
          width: 2,
          shape: block.smoothLine ? 'spline' : 'linear'
        },
        yaxis: series.useSecondaryY ? 'y2' : 'y',
        hovertemplate: `<b>${series.name || 'Data'}</b><br>${block.xAxisLabel || 'X'}: %{x}<br>${block.yAxisLabel || 'Y'}: %{y}<extra></extra>`,
      }
      
      if (fill && block.chartType !== 'scatter') {
        trace.fill = fill
        trace.fillcolor = color.replace(')', ', 0.15)').replace('rgb', 'rgba').replace('#', 'rgba(').replace(/^rgba\(([A-Fa-f0-9]{6})/, (_, hex) => {
          const r = parseInt(hex.slice(0, 2), 16)
          const g = parseInt(hex.slice(2, 4), 16)
          const b = parseInt(hex.slice(4, 6), 16)
          return `rgba(${r}, ${g}, ${b}`
        }) + ', 0.15)'
      }
      
      if (traceType === 'pie') {
        trace.labels = series.x.map((_, i) => `Item ${i + 1}`)
        trace.values = series.y
      }
      
      traces.push(trace)
      
      // Add trendline if enabled
      if (block.trendline === 'linear' && traceType === 'scatter') {
        const trend = calculateLinearTrendline(series.x, series.y)
        traces.push({
          x: trend.x,
          y: trend.y,
          type: 'scatter',
          mode: 'lines',
          name: `${series.name} (trend)`,
          line: { color, width: 2, dash: 'dash' },
          hoverinfo: 'skip',
        })
      } else if (block.trendline === 'moving-avg' && traceType === 'scatter') {
        const avg = calculateMovingAverage(series.x, series.y, Math.max(10, Math.floor(series.x.length / 50)))
        traces.push({
          x: avg.x,
          y: avg.y,
          type: 'scatter',
          mode: 'lines',
          name: `${series.name} (avg)`,
          line: { color, width: 2, dash: 'dot' },
          hoverinfo: 'skip',
        })
      }
    })
    
    return traces
  }, [block, hasData])

  // Build Plotly layout
  const plotLayout = useMemo((): Partial<Plotly.Layout> => {
    const hasSecondaryY = block.data.some(s => s.useSecondaryY)
    
    return {
      title: block.title ? { text: block.title, font: { color: '#fff', size: 16 } } : undefined,
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#1a2332',
      font: { color: '#a8b8c8', family: 'Inter, Arial, sans-serif' },
      xaxis: {
        title: block.xAxisLabel ? { text: block.xAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
        type: block.xAxisType || 'linear',
        gridcolor: 'rgba(212, 165, 116, 0.1)',
        zeroline: false,
        showgrid: true,
        tickfont: { color: '#8a9aaa', size: 11 },
        showspikes: block.showSpikelines,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#D4A574',
        rangeslider: { visible: true, bgcolor: '#1a2332', bordercolor: '#374151', thickness: 0.08 },
      },
      yaxis: {
        title: block.yAxisLabel ? { text: block.yAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
        type: block.yAxisType || 'linear',
        gridcolor: 'rgba(212, 165, 116, 0.1)',
        zeroline: false,
        showgrid: true,
        tickfont: { color: '#8a9aaa', size: 11 },
        showspikes: block.showSpikelines,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#D4A574',
      },
      yaxis2: hasSecondaryY ? {
        title: { text: 'Secondary', font: { color: '#a8b8c8', size: 12 } },
        overlaying: 'y',
        side: 'right',
        type: block.yAxisType || 'linear',
        gridcolor: 'rgba(99, 102, 241, 0.1)',
        zeroline: false,
        showgrid: false,
        tickfont: { color: '#8a9aaa', size: 11 },
      } : undefined,
      showlegend: block.showLegend || block.data.length > 1,
      legend: { font: { color: '#a8b8c8' }, bgcolor: 'rgba(26, 35, 50, 0.8)' },
      margin: { l: 60, r: hasSecondaryY ? 60 : 40, t: 50, b: 80 },
      hovermode: 'x unified',
      dragmode: 'zoom',
      autosize: true,
      annotations: (block.annotations || []).map(a => ({
        x: a.x,
        y: a.y,
        text: a.text,
        showarrow: a.showArrow,
        arrowhead: 2,
        arrowcolor: '#D4A574',
        font: { color: '#fff', size: 12 },
        bgcolor: 'rgba(26, 35, 50, 0.9)',
        bordercolor: '#D4A574',
        borderwidth: 1,
        borderpad: 4,
      })),
      shapes: (block.shapes || []).map(s => ({
        type: s.type,
        x0: s.x0,
        x1: s.x1,
        y0: s.y0,
        y1: s.y1,
        fillcolor: s.color || '#D4A574',
        opacity: s.opacity || 0.2,
        line: { width: 0 },
      })),
    }
  }, [block])

  const plotConfig: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d', 'autoScale2d'],
    scrollZoom: true,
    doubleClick: 'reset',
  }

  return (
    <>
      {/* Field Selection Modal */}
      {showFieldModal && pendingData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-steel-800 border border-steel-600 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingSeriesIndex !== null ? 'Edit Series' : 'Add Data Series'}
              </h3>
              <button onClick={() => setShowFieldModal(false)} className="text-steel-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-steel-400 mb-4">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-400" />
              Loaded {pendingData.data.length.toLocaleString()} data points
            </p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">Series Name</label>
                <input
                  type="text"
                  value={selectedSeriesName}
                  onChange={(e) => setSelectedSeriesName(e.target.value)}
                  className="w-full px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white"
                  placeholder="e.g., Temperature, Pressure..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">X Axis Field</label>
                <select
                  value={selectedXField}
                  onChange={(e) => setSelectedXField(e.target.value)}
                  className="w-full px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white"
                >
                  {pendingData.fields.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-steel-300 mb-2">Y Axis Field</label>
                <select
                  value={selectedYField}
                  onChange={(e) => setSelectedYField(e.target.value)}
                  className="w-full px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white"
                >
                  {pendingData.fields.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowFieldModal(false)} className="flex-1 px-4 py-2 bg-steel-700 text-steel-300 rounded-lg hover:bg-steel-600">
                Cancel
              </button>
              <button onClick={confirmFieldSelection} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 font-medium rounded-lg hover:bg-copper-300">
                <Upload className="w-4 h-4" />
                {editingSeriesIndex !== null ? 'Update' : 'Add Series'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Annotation Modal */}
      {showAnnotationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-steel-800 border border-steel-600 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add Annotation</h3>
            <div className="space-y-3 mb-4">
              <input type="number" placeholder="X position" value={newAnnotation.x} onChange={(e) => setNewAnnotation({ ...newAnnotation, x: Number(e.target.value) })} className="w-full px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white" />
              <input type="number" placeholder="Y position" value={newAnnotation.y} onChange={(e) => setNewAnnotation({ ...newAnnotation, y: Number(e.target.value) })} className="w-full px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white" />
              <input type="text" placeholder="Text" value={newAnnotation.text} onChange={(e) => setNewAnnotation({ ...newAnnotation, text: e.target.value })} className="w-full px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white" />
              <label className="flex items-center gap-2 text-steel-300">
                <input type="checkbox" checked={newAnnotation.showArrow} onChange={(e) => setNewAnnotation({ ...newAnnotation, showArrow: e.target.checked })} />
                Show arrow
              </label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAnnotationModal(false)} className="flex-1 px-4 py-2 bg-steel-700 text-steel-300 rounded-lg">Cancel</button>
              <button onClick={addAnnotation} className="flex-1 px-4 py-2 bg-copper-400 text-steel-900 rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Shape Modal */}
      {showShapeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-steel-800 border border-steel-600 rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add Highlight Region</h3>
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="X start" value={newShape.x0} onChange={(e) => setNewShape({ ...newShape, x0: Number(e.target.value) })} className="px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white" />
                <input type="number" placeholder="X end" value={newShape.x1} onChange={(e) => setNewShape({ ...newShape, x1: Number(e.target.value) })} className="px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white" />
                <input type="number" placeholder="Y start" value={newShape.y0} onChange={(e) => setNewShape({ ...newShape, y0: Number(e.target.value) })} className="px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white" />
                <input type="number" placeholder="Y end" value={newShape.y1} onChange={(e) => setNewShape({ ...newShape, y1: Number(e.target.value) })} className="px-3 py-2 bg-steel-900 border border-steel-600 rounded-lg text-white" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-steel-300 text-sm">Color:</label>
                <input type="color" value={newShape.color} onChange={(e) => setNewShape({ ...newShape, color: e.target.value })} className="w-10 h-8 rounded cursor-pointer" />
                <label className="text-steel-300 text-sm ml-4">Opacity:</label>
                <input type="range" min="0.1" max="0.8" step="0.1" value={newShape.opacity} onChange={(e) => setNewShape({ ...newShape, opacity: Number(e.target.value) })} className="flex-1" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowShapeModal(false)} className="flex-1 px-4 py-2 bg-steel-700 text-steel-300 rounded-lg">Cancel</button>
              <button onClick={addShape} className="flex-1 px-4 py-2 bg-copper-400 text-steel-900 rounded-lg">Add</button>
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
              className={`p-1.5 rounded transition-colors ${isPreview ? 'bg-copper-400/20 text-copper-400' : 'text-steel-400 hover:text-copper-400'}`}
            >
              {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )
        }
      >
        {isPreview && hasData ? (
          <div className="bg-steel-900 rounded-lg p-4">
            <Plot data={plotTraces} layout={plotLayout} config={plotConfig} style={{ width: '100%', height: '450px' }} useResizeHandler />
            <p className="text-xs text-steel-500 mt-2 text-center">
              Scroll to zoom • Drag to pan • Double-click to reset • Use range slider for time navigation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-steel-700">
              {(['data', 'options', 'annotations'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tab ? 'bg-steel-700 text-copper-400' : 'text-steel-400 hover:text-white'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'data' && (
              <div className="space-y-4">
                {/* Basic Config */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-steel-300 mb-2">Chart Title</label>
                    <input type="text" value={block.title} onChange={(e) => onUpdate({ ...block, title: e.target.value })} className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm" placeholder="Chart title..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-steel-300 mb-2">Chart Type</label>
                    <select value={block.chartType} onChange={(e) => onUpdate({ ...block, chartType: e.target.value as any })} className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm">
                      <option value="line">Line</option>
                      <option value="area">Area</option>
                      <option value="scatter">Scatter</option>
                      <option value="bar">Bar</option>
                      <option value="histogram">Histogram</option>
                      <option value="box">Box Plot</option>
                      <option value="pie">Pie</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-steel-300 mb-2">X Axis Label</label>
                    <input type="text" value={block.xAxisLabel || ''} onChange={(e) => onUpdate({ ...block, xAxisLabel: e.target.value })} className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-steel-300 mb-2">Y Axis Label</label>
                    <input type="text" value={block.yAxisLabel || ''} onChange={(e) => onUpdate({ ...block, yAxisLabel: e.target.value })} className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm" />
                  </div>
                </div>

                {/* Data Series */}
                <div className="border-t border-steel-700 pt-4">
                  <label className="block text-sm font-medium text-steel-300 mb-2">Data Series</label>
                  {block.data.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {block.data.map((series, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-steel-900 rounded-lg">
                          <input type="color" value={series.color || SERIES_COLORS[idx]} onChange={(e) => updateSeries(idx, { color: e.target.value })} className="w-8 h-8 rounded cursor-pointer border-0" />
                          <span className="flex-1 text-sm text-white">{series.name || `Series ${idx + 1}`}</span>
                          <span className="text-xs text-steel-500">{series.x.length} pts</span>
                          {block.data.length > 1 && (
                            <label className="flex items-center gap-1 text-xs text-steel-400">
                              <input type="checkbox" checked={series.useSecondaryY || false} onChange={(e) => updateSeries(idx, { useSecondaryY: e.target.checked })} />
                              2nd Y
                            </label>
                          )}
                          <button onClick={() => deleteSeries(idx)} className="p-1 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-steel-500 mb-3">No data series yet. Import data to add.</p>
                  )}
                  <input ref={fileInputRef} type="file" accept=".csv,.json,.txt" onChange={handleFileUpload} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-steel-900 border-2 border-dashed border-steel-600 rounded-lg text-steel-300 hover:border-copper-400 hover:text-copper-400 transition-colors">
                    <Plus className="w-5 h-5" />
                    <span>Add Data Series (JSON/CSV)</span>
                  </button>
                  {parseError && (
                    <div className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {parseError}
                    </div>
                  )}
                </div>

                {hasData && (
                  <button onClick={() => setIsPreview(true)} className="flex items-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 text-sm font-medium rounded-lg hover:bg-copper-300">
                    <Eye className="w-4 h-4" />
                    Preview Chart
                  </button>
                )}
              </div>
            )}

            {activeTab === 'options' && (
              <div className="space-y-4">
                {/* Display Options */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 text-sm text-steel-300">
                    <input type="checkbox" checked={block.showLegend} onChange={(e) => onUpdate({ ...block, showLegend: e.target.checked })} />
                    Legend
                  </label>
                  <label className="flex items-center gap-2 text-sm text-steel-300">
                    <input type="checkbox" checked={block.showSpikelines} onChange={(e) => onUpdate({ ...block, showSpikelines: e.target.checked })} />
                    Crosshair
                  </label>
                  <label className="flex items-center gap-2 text-sm text-steel-300">
                    <input type="checkbox" checked={block.smoothLine} onChange={(e) => onUpdate({ ...block, smoothLine: e.target.checked })} />
                    Smooth lines
                  </label>
                </div>

                {/* Axis Types */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-steel-300 mb-2">X Axis Scale</label>
                    <select value={block.xAxisType || 'linear'} onChange={(e) => onUpdate({ ...block, xAxisType: e.target.value as any })} className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm">
                      <option value="linear">Linear</option>
                      <option value="log">Logarithmic</option>
                      <option value="date">Date/Time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-steel-300 mb-2">Y Axis Scale</label>
                    <select value={block.yAxisType || 'linear'} onChange={(e) => onUpdate({ ...block, yAxisType: e.target.value as any })} className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm">
                      <option value="linear">Linear</option>
                      <option value="log">Logarithmic</option>
                    </select>
                  </div>
                </div>

                {/* Trendline */}
                <div>
                  <label className="block text-sm font-medium text-steel-300 mb-2">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Trendline
                  </label>
                  <select value={block.trendline || 'none'} onChange={(e) => onUpdate({ ...block, trendline: e.target.value as any })} className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm">
                    <option value="none">None</option>
                    <option value="linear">Linear Regression</option>
                    <option value="moving-avg">Moving Average</option>
                  </select>
                </div>

                {/* Global Color (fallback) */}
                <div>
                  <label className="block text-sm font-medium text-steel-300 mb-2">Default Color</label>
                  <input type="color" value={block.lineColor || '#D4A574'} onChange={(e) => onUpdate({ ...block, lineColor: e.target.value })} className="w-16 h-10 rounded cursor-pointer" />
                </div>
              </div>
            )}

            {activeTab === 'annotations' && (
              <div className="space-y-4">
                {/* Annotations */}
                <div>
                  <label className="block text-sm font-medium text-steel-300 mb-2">Text Annotations</label>
                  {(block.annotations || []).length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {(block.annotations || []).map((ann, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-steel-900 rounded-lg text-sm">
                          <span className="text-steel-400">({ann.x}, {ann.y})</span>
                          <span className="flex-1 text-white truncate">{ann.text}</span>
                          <button onClick={() => deleteAnnotation(idx)} className="p-1 text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-steel-500 mb-2">No annotations yet.</p>
                  )}
                  <button onClick={() => setShowAnnotationModal(true)} className="flex items-center gap-2 px-3 py-2 bg-steel-700 text-steel-300 rounded-lg hover:bg-steel-600 text-sm">
                    <Plus className="w-4 h-4" /> Add Annotation
                  </button>
                </div>

                {/* Shapes */}
                <div>
                  <label className="block text-sm font-medium text-steel-300 mb-2">Highlight Regions</label>
                  {(block.shapes || []).length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {(block.shapes || []).map((shape, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-steel-900 rounded-lg text-sm">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: shape.color, opacity: shape.opacity }} />
                          <span className="text-steel-400">X: {shape.x0}-{shape.x1}, Y: {shape.y0}-{shape.y1}</span>
                          <button onClick={() => deleteShape(idx)} className="p-1 text-red-400 ml-auto"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-steel-500 mb-2">No highlight regions yet.</p>
                  )}
                  <button onClick={() => setShowShapeModal(true)} className="flex items-center gap-2 px-3 py-2 bg-steel-700 text-steel-300 rounded-lg hover:bg-steel-600 text-sm">
                    <Plus className="w-4 h-4" /> Add Region
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </BlockWrapper>
    </>
  )
}
