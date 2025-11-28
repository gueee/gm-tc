import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import Plot from 'react-plotly.js'

// Block types (matching admin blocks types)
type BlockType = 'text' | 'chart' | 'image' | 'code'

interface BaseBlock {
  id: string
  type: BlockType
}

interface TextBlock extends BaseBlock {
  type: 'text'
  content: string
}

interface ChartDataSeries {
  x: number[]
  y: number[]
  name?: string
  color?: string
  useSecondaryY?: boolean
}

interface ChartBlock extends BaseBlock {
  type: 'chart'
  title: string
  chartType: 'scatter' | 'line' | 'bar' | 'area' | 'histogram' | 'pie' | 'box'
  data: ChartDataSeries[]
  xAxisLabel?: string
  yAxisLabel?: string
  showLegend?: boolean
  showSpikelines?: boolean
  smoothLine?: boolean
  lineColor?: string
  xAxisType?: 'linear' | 'log' | 'date'
  yAxisType?: 'linear' | 'log'
}

interface ImageBlock extends BaseBlock {
  type: 'image'
  url: string
  alt: string
  caption?: string
}

interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  code: string
}

type Block = TextBlock | ChartBlock | ImageBlock | CodeBlock

interface BlockRendererProps {
  blocks: Block[]
}

// Color palette
const SERIES_COLORS = [
  '#D4A574', '#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'
]

// Main BlockRenderer component
export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) return null
  return (
    <div className="space-y-8">
      {blocks.map((block) => <RenderBlock key={block.id} block={block} />)}
    </div>
  )
}

// Individual block renderer
function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'text': return <TextBlockView block={block} />
    case 'chart': return <ChartBlockView block={block} />
    case 'image': return <ImageBlockView block={block} />
    case 'code': return <CodeBlockView block={block} />
    default: return null
  }
}

// Text block - renders markdown
function TextBlockView({ block }: { block: TextBlock }) {
  if (!block.content) return null
  return (
    <div className="prose prose-invert prose-copper max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-bold text-white mt-10 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h3>,
          p: ({ children }) => <p className="text-steel-300 mb-4 leading-relaxed">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} className="text-copper-400 hover:text-copper-300 underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>{children}</a>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside text-steel-300 mb-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside text-steel-300 mb-4 space-y-2">{children}</ol>,
          code: ({ className, children }) => {
            const isInline = !className
            return isInline
              ? <code className="px-1.5 py-0.5 bg-steel-800 text-copper-400 rounded text-sm">{children}</code>
              : <code className="block p-4 bg-steel-800 rounded-lg overflow-x-auto text-sm">{children}</code>
          },
          pre: ({ children }) => <pre className="bg-steel-800 rounded-lg p-4 overflow-x-auto mb-4">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-copper-400 pl-4 italic text-steel-400 my-4">{children}</blockquote>,
        }}
      >
        {block.content}
      </ReactMarkdown>
    </div>
  )
}

// Chart block - renders Plotly chart
function ChartBlockView({ block }: { block: ChartBlock }) {
  const hasData = block.data && block.data.length > 0 && block.data[0]?.x?.length > 0

  // Build traces
  const plotTraces = useMemo(() => {
    if (!hasData) return []
    const traces: Plotly.Data[] = []

    block.data.forEach((series, idx) => {
      const color = series.color || SERIES_COLORS[idx % SERIES_COLORS.length]
      // Use 'lines' for line/area, 'markers' for scatter
      const mode = block.chartType === 'scatter' ? 'markers' : 'lines'

      const trace: Plotly.Data = {
        x: series.x,
        y: series.y,
        type: 'scatter' as const,
        mode: mode as any,
        name: series.name || `Series ${idx + 1}`,
        marker: { color, size: 6 },
        line: { color, width: 2 },
      }

      // Only add fill for area charts
      if (block.chartType === 'area') {
        (trace as any).fill = 'tozeroy'
        ;(trace as any).fillcolor = color + '26'
      }

      traces.push(trace)
    })

    return traces
  }, [block, hasData])

  // Build layout
  const plotLayout = useMemo((): Partial<Plotly.Layout> => {
    const hasSecondaryY = block.data?.some(s => s.useSecondaryY) || false
    
    return {
      paper_bgcolor: 'transparent',
      plot_bgcolor: '#1a2332',
      font: { color: '#a8b8c8', family: 'Inter, Arial, sans-serif' },
      xaxis: {
        title: block.xAxisLabel ? { text: block.xAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
        type: (block.xAxisType || 'linear') as any,
        gridcolor: 'rgba(212, 165, 116, 0.1)',
        zeroline: false,
        showgrid: true,
        tickfont: { color: '#8a9aaa', size: 11 },
        showspikes: block.showSpikelines || false,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#D4A574',
      },
      yaxis: {
        title: block.yAxisLabel ? { text: block.yAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
        type: (block.yAxisType || 'linear') as any,
        gridcolor: 'rgba(212, 165, 116, 0.1)',
        zeroline: false,
        showgrid: true,
        tickfont: { color: '#8a9aaa', size: 11 },
        showspikes: block.showSpikelines || false,
        spikemode: 'across',
        spikethickness: 1,
        spikecolor: '#D4A574',
      },
      yaxis2: hasSecondaryY ? {
        title: { text: 'Secondary', font: { color: '#a8b8c8', size: 12 } },
        overlaying: 'y',
        side: 'right',
        gridcolor: 'rgba(99, 102, 241, 0.1)',
        zeroline: false,
        showgrid: false,
        tickfont: { color: '#8a9aaa', size: 11 },
      } : undefined,
      showlegend: block.showLegend || (block.data?.length || 0) > 1,
      legend: { font: { color: '#a8b8c8' }, bgcolor: 'rgba(26, 35, 50, 0.8)' },
      margin: { l: 60, r: hasSecondaryY ? 60 : 40, t: 20, b: 50 },
      hovermode: 'x unified',
      dragmode: 'zoom',
      autosize: true,
      height: 400,
    }
  }, [block])

  if (!hasData) {
    return (
      <div className="bg-steel-900 border border-steel-700 rounded-xl p-6 text-center text-steel-400">
        <p>No chart data available</p>
      </div>
    )
  }

  return (
    <div className="bg-steel-900 border border-steel-700 rounded-xl p-4 md:p-6">
      {block.title && (
        <h3 className="text-xl font-semibold text-white mb-4">{block.title}</h3>
      )}
      <div className="w-full" style={{ height: '400px' }}>
        <Plot
          data={plotTraces}
          layout={plotLayout}
          config={{
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            scrollZoom: true,
            doubleClick: 'reset',
          }}
          style={{ width: '100%', height: '100%' }}
          useResizeHandler
        />
      </div>
      <div className="mt-4 pt-4 border-t border-steel-700 text-sm text-steel-400">
        <span className="text-copper-400 font-medium">Tip:</span> Scroll to zoom, drag to pan. Double-click to reset view.
      </div>
    </div>
  )
}

// Image block
function ImageBlockView({ block }: { block: ImageBlock }) {
  if (!block.url) return null
  return (
    <figure className="my-6">
      <img src={block.url} alt={block.alt} className="w-full rounded-xl border border-steel-700" loading="lazy" />
      {block.caption && (
        <figcaption className="mt-3 text-center text-sm text-steel-400 italic">{block.caption}</figcaption>
      )}
    </figure>
  )
}

// Code block
function CodeBlockView({ block }: { block: CodeBlock }) {
  if (!block.code) return null
  return (
    <div className="my-6">
      <div className="flex items-center justify-between bg-steel-800 rounded-t-lg px-4 py-2 border-b border-steel-700">
        <span className="text-xs font-medium text-copper-400 uppercase tracking-wider">{block.language || 'code'}</span>
        <button onClick={() => navigator.clipboard.writeText(block.code)} className="text-xs text-steel-400 hover:text-copper-400 transition-colors">Copy</button>
      </div>
      <pre className="bg-steel-900 rounded-b-lg p-4 overflow-x-auto border border-steel-700 border-t-0">
        <code className="text-sm text-steel-300 font-mono whitespace-pre">{block.code}</code>
      </pre>
    </div>
  )
}
