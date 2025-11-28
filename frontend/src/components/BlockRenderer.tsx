import ReactMarkdown from 'react-markdown'
import Plot from 'react-plotly.js'

// Block types (duplicated to avoid circular dependency with admin blocks)
type BlockType = 'text' | 'chart' | 'image' | 'code'

interface BaseBlock {
  id: string
  type: BlockType
}

interface TextBlock extends BaseBlock {
  type: 'text'
  content: string
}

interface ChartBlock extends BaseBlock {
  type: 'chart'
  title: string
  chartType: 'scatter' | 'line' | 'bar'
  data: {
    x: number[]
    y: number[]
    name?: string
  }[]
  xAxisLabel?: string
  yAxisLabel?: string
  showLegend?: boolean
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

// Main BlockRenderer component
export default function BlockRenderer({ blocks }: BlockRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null
  }

  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </div>
  )
}

// Individual block renderer
function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':
      return <TextBlockView block={block} />
    case 'chart':
      return <ChartBlockView block={block} />
    case 'image':
      return <ImageBlockView block={block} />
    case 'code':
      return <CodeBlockView block={block} />
    default:
      return null
  }
}

// Text block - renders markdown
function TextBlockView({ block }: { block: TextBlock }) {
  if (!block.content) return null

  return (
    <div className="prose prose-invert prose-copper max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-white mt-10 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-white mt-6 mb-3">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-steel-300 mb-4 leading-relaxed">{children}</p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-copper-400 hover:text-copper-300 underline"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-steel-300 mb-4 space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-steel-300 mb-4 space-y-2">{children}</ol>
          ),
          code: ({ className, children }) => {
            const isInline = !className
            return isInline ? (
              <code className="px-1.5 py-0.5 bg-steel-800 text-copper-400 rounded text-sm">
                {children}
              </code>
            ) : (
              <code className="block p-4 bg-steel-800 rounded-lg overflow-x-auto text-sm">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="bg-steel-800 rounded-lg p-4 overflow-x-auto mb-4">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-copper-400 pl-4 italic text-steel-400 my-4">
              {children}
            </blockquote>
          ),
        }}
      >
        {block.content}
      </ReactMarkdown>
    </div>
  )
}

// Chart block - renders Plotly chart
function ChartBlockView({ block }: { block: ChartBlock }) {
  const hasData = block.data && block.data.length > 0 && block.data[0].x?.length > 0

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

      <div className="w-full h-[400px] md:h-[500px]">
        <Plot
          data={block.data.map((d) => ({
            x: d.x,
            y: d.y,
            type: block.chartType === 'bar' ? 'bar' : 'scatter',
            mode: block.chartType === 'scatter' ? 'markers' : 'lines+markers',
            name: d.name || 'Data',
            marker: { color: '#D4A574' },
            line: { color: '#D4A574', width: 2 },
            fill: block.chartType === 'line' ? 'tozeroy' : undefined,
            fillcolor: block.chartType === 'line' ? 'rgba(212, 165, 116, 0.15)' : undefined,
            hovertemplate: `<b>${block.xAxisLabel || 'X'}: %{x}</b><br>${block.yAxisLabel || 'Y'}: %{y}<extra></extra>`,
          }))}
          layout={{
            title: undefined,
            paper_bgcolor: 'transparent',
            plot_bgcolor: '#1a2332',
            font: { color: '#a8b8c8', family: 'Inter, Arial, sans-serif' },
            xaxis: {
              title: block.xAxisLabel ? { text: block.xAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
              gridcolor: 'rgba(212, 165, 116, 0.1)',
              zeroline: false,
              showgrid: true,
              tickfont: { color: '#8a9aaa', size: 11 },
            },
            yaxis: {
              title: block.yAxisLabel ? { text: block.yAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
              gridcolor: 'rgba(212, 165, 116, 0.1)',
              zeroline: false,
              showgrid: true,
              tickfont: { color: '#8a9aaa', size: 11 },
            },
            showlegend: block.showLegend,
            legend: { font: { color: '#a8b8c8' } },
            margin: { l: 60, r: 40, t: 20, b: 50 },
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
          style={{ width: '100%', height: '100%' }}
          useResizeHandler
        />
      </div>

      <div className="mt-4 pt-4 border-t border-steel-700 text-sm text-steel-400">
        <span className="text-copper-400 font-medium">Tip:</span> Scroll to zoom, click and drag to pan. Double-click to reset view.
      </div>
    </div>
  )
}

// Image block
function ImageBlockView({ block }: { block: ImageBlock }) {
  if (!block.url) return null

  return (
    <figure className="my-6">
      <img
        src={block.url}
        alt={block.alt}
        className="w-full rounded-xl border border-steel-700"
        loading="lazy"
      />
      {block.caption && (
        <figcaption className="mt-3 text-center text-sm text-steel-400 italic">
          {block.caption}
        </figcaption>
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
        <span className="text-xs font-medium text-copper-400 uppercase tracking-wider">
          {block.language || 'code'}
        </span>
        <button
          onClick={() => navigator.clipboard.writeText(block.code)}
          className="text-xs text-steel-400 hover:text-copper-400 transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="bg-steel-900 rounded-b-lg p-4 overflow-x-auto border border-steel-700 border-t-0">
        <code className="text-sm text-steel-300 font-mono whitespace-pre">
          {block.code}
        </code>
      </pre>
    </div>
  )
}

