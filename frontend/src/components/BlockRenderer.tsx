import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import Plot from 'react-plotly.js'

// Types for our custom list handling
type ListType = 'dash' | 'circle' | 'number' | 'letter'

// Detect list type from a line
function detectListType(line: string): { type: ListType; content: string } | null {
  const trimmed = line.trimStart()

  // Dash list: - item
  if (/^- (.+)$/.test(trimmed)) {
    return { type: 'dash', content: trimmed.slice(2) }
  }
  // Circle list: * item
  if (/^\* (.+)$/.test(trimmed)) {
    return { type: 'circle', content: trimmed.slice(2) }
  }
  // Numbered list: 1. item, 2. item, etc.
  if (/^\d+\. (.+)$/.test(trimmed)) {
    const match = trimmed.match(/^\d+\. (.+)$/)
    return { type: 'number', content: match![1] }
  }
  // Lettered list: a) item, b) item, etc.
  if (/^[a-z]\) (.+)$/i.test(trimmed)) {
    const match = trimmed.match(/^[a-z]\) (.+)$/i)
    return { type: 'letter', content: match![1] }
  }

  return null
}

// Get indent level (number of leading spaces / 2 or tabs)
function getIndentLevel(line: string): number {
  const match = line.match(/^(\s*)/)
  if (!match) return 0
  const spaces = match[1].replace(/\t/g, '  ').length
  return Math.floor(spaces / 2)
}

// Parse content into list blocks and regular text
function parseListBlocks(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const listInfo = detectListType(line)

    if (listInfo && getIndentLevel(line) === 0) {
      // Start of a top-level list - collect all consecutive list items of same type
      const listType = listInfo.type
      const listItems: string[] = []

      while (i < lines.length) {
        const currentLine = lines[i]
        const currentInfo = detectListType(currentLine)
        const indent = getIndentLevel(currentLine)

        // Check if this line is part of the list
        if (currentInfo && indent === 0 && currentInfo.type === listType) {
          // Same type list item at root level
          listItems.push(currentInfo.content)
          i++
        } else if (indent > 0 && listItems.length > 0) {
          // Indented content - append to last item
          if (currentInfo) {
            // Nested list item
            listItems[listItems.length - 1] += `<br/>&nbsp;&nbsp;${getListMarker(currentInfo.type)} ${currentInfo.content}`
          } else if (currentLine.trim()) {
            // Continuation text
            listItems[listItems.length - 1] += `<br/>&nbsp;&nbsp;${currentLine.trim()}`
          }
          i++
        } else if (!currentLine.trim() && i + 1 < lines.length) {
          // Empty line - check if next line continues the list
          const nextLine = lines[i + 1]
          const nextInfo = detectListType(nextLine)
          if (nextInfo && getIndentLevel(nextLine) === 0 && nextInfo.type === listType) {
            i++
            continue
          } else {
            break
          }
        } else {
          break
        }
      }

      // Generate HTML for the list
      result.push(generateListHTML(listType, listItems))
    } else {
      // Regular line, pass through
      result.push(line)
      i++
    }
  }

  return result.join('\n')
}

// Get the marker character for display
function getListMarker(type: ListType): string {
  switch (type) {
    case 'dash': return '–'
    case 'circle': return '○'
    case 'number': return '•'
    case 'letter': return '•'
    default: return '•'
  }
}

// Generate HTML for a list block
function generateListHTML(type: ListType, items: string[]): string {
  const listClass = `custom-list custom-list-${type}`
  const tag = type === 'number' || type === 'letter' ? 'ol' : 'ul'
  const typeAttr = type === 'letter' ? ' type="a"' : ''

  const itemsHTML = items.map((item) => `<li>${item}</li>`).join('\n')

  return `<${tag} class="${listClass}"${typeAttr}>\n${itemsHTML}\n</${tag}>`
}

// Block types (matching admin blocks types)
type BlockType = 'text' | 'chart' | 'image' | 'gallery' | 'code' | 'table'

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

interface GalleryImage {
  url: string
  alt: string
  caption?: string
}

interface GalleryBlock extends BaseBlock {
  type: 'gallery'
  images: GalleryImage[]
  columns?: 2 | 3 | 4
}

interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  code: string
}

interface TableBlock extends BaseBlock {
  type: 'table'
  caption?: string
  headers: string[]
  rows: string[][]
  striped?: boolean
  bordered?: boolean
  compact?: boolean
}

type Block = TextBlock | ChartBlock | ImageBlock | GalleryBlock | CodeBlock | TableBlock

interface BlockRendererProps {
  blocks: Block[]
}

// Color palette for multiple series
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
    case 'gallery': return <GalleryBlockView block={block} />
    case 'code': return <CodeBlockView block={block} />
    case 'table': return <TableBlockView block={block} />
    default: return null
  }
}

// Text block - renders markdown with GFM table support and custom list styles
function TextBlockView({ block }: { block: TextBlock }) {
  if (!block.content) return null

  // Preprocess content to convert custom lists to HTML
  const preprocessedContent = parseListBlocks(block.content)

  return (
    <div className="prose prose-invert prose-copper max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
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
          code: ({ className, children }) => {
            const isInline = !className
            return isInline
              ? <code className="px-1.5 py-0.5 bg-steel-800 text-copper-400 rounded text-sm">{children}</code>
              : <code className="block p-4 bg-steel-800 rounded-lg overflow-x-auto text-sm">{children}</code>
          },
          pre: ({ children }) => <pre className="bg-steel-800 rounded-lg p-4 overflow-x-auto mb-4">{children}</pre>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-copper-400 pl-4 italic text-steel-400 my-4">{children}</blockquote>,
          // Table components for GFM tables
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-steel-800 border-b-2 border-copper-400/30">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-sm font-semibold text-copper-400 border border-steel-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-sm text-steel-300 border border-steel-700">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-steel-700/50 hover:bg-steel-800/50 transition-colors">{children}</tr>
          ),
        }}
      >
        {preprocessedContent}
      </ReactMarkdown>
    </div>
  )
}

// Chart block - full-featured Plotly chart
function ChartBlockView({ block }: { block: ChartBlock }) {
  const hasData = block.data && block.data.length > 0 && block.data[0]?.x?.length > 0

  // Build traces for each data series
  const plotTraces = useMemo((): Plotly.Data[] => {
    if (!hasData) return []

    return block.data.map((series, idx) => {
      const color = series.color || SERIES_COLORS[idx % SERIES_COLORS.length]
      const isScatter = block.chartType === 'scatter'
      const isArea = block.chartType === 'area'

      const trace: Plotly.Data = {
        x: series.x,
        y: series.y,
        type: 'scatter',
        mode: isScatter ? 'markers' : 'lines',
        name: series.name || `Series ${idx + 1}`,
        marker: { color, size: 6 },
        line: {
          color,
          width: 2,
          shape: block.smoothLine ? 'spline' : 'linear'
        },
        yaxis: series.useSecondaryY ? 'y2' : 'y',
        hovertemplate: `<b>${series.name || 'Data'}</b><br>` +
          `${block.xAxisLabel || 'X'}: %{x:.2f}<br>` +
          `${block.yAxisLabel || 'Y'}: %{y:.2f}<extra></extra>`,
      }

      // Area fill
      if (isArea) {
        (trace as any).fill = 'tozeroy'
        ;(trace as any).fillcolor = color + '26'
      }

      return trace
    })
  }, [block, hasData])

  // Build layout with all features
  const plotLayout = useMemo((): Partial<Plotly.Layout> => {
    const hasSecondaryY = block.data?.some(s => s.useSecondaryY) || false
    const showSpikes = block.showSpikelines === true

    const layout: Partial<Plotly.Layout> = {
      paper_bgcolor: '#1a2332',
      plot_bgcolor: '#1a2332',
      font: { color: '#a8b8c8', family: 'Inter, Arial, sans-serif' },
      margin: { l: 60, r: hasSecondaryY ? 60 : 30, t: 20, b: 80 },
      height: 450,
      autosize: true,
      showlegend: block.showLegend || (block.data?.length || 0) > 1,
      legend: {
        font: { color: '#a8b8c8' },
        bgcolor: 'rgba(26, 35, 50, 0.8)',
        x: 0.01,
        y: 0.99,
      },
      hovermode: 'x unified',
      dragmode: 'zoom',

      // X-axis with range slider
      xaxis: {
        title: block.xAxisLabel ? { text: block.xAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
        type: block.xAxisType || 'linear',
        gridcolor: 'rgba(212, 165, 116, 0.15)',
        zeroline: false,
        tickfont: { color: '#8a9aaa', size: 11 },
        showspikes: showSpikes,
        spikemode: showSpikes ? 'across' : undefined,
        spikethickness: showSpikes ? 1 : undefined,
        spikecolor: showSpikes ? '#D4A574' : undefined,
        rangeslider: {
          visible: true,
          bgcolor: '#1a2332',
          bordercolor: '#374151',
          thickness: 0.1
        },
      },

      // Y-axis (primary)
      yaxis: {
        title: block.yAxisLabel ? { text: block.yAxisLabel, font: { color: '#a8b8c8', size: 12 } } : undefined,
        type: block.yAxisType || 'linear',
        gridcolor: 'rgba(212, 165, 116, 0.15)',
        zeroline: false,
        tickfont: { color: '#8a9aaa', size: 11 },
        showspikes: showSpikes,
        spikemode: showSpikes ? 'across' : undefined,
        spikethickness: showSpikes ? 1 : undefined,
        spikecolor: showSpikes ? '#D4A574' : undefined,
      },
    }

    // Secondary Y-axis (only add if needed)
    if (hasSecondaryY) {
      layout.yaxis2 = {
        title: { text: 'Secondary', font: { color: '#a8b8c8', size: 12 } },
        overlaying: 'y',
        side: 'right',
        gridcolor: 'rgba(99, 102, 241, 0.15)',
        zeroline: false,
        tickfont: { color: '#8a9aaa', size: 11 },
      }
    }

    return layout
  }, [block])

  // Plotly config
  const plotConfig: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    scrollZoom: true,
    doubleClick: 'reset',
  }

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
      <div className="w-full" style={{ height: '500px' }}>
        <Plot
          data={plotTraces}
          layout={plotLayout}
          config={plotConfig}
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

// Gallery block
function GalleryBlockView({ block }: { block: GalleryBlock }) {
  if (!block.images || block.images.length === 0) return null

  const columns = block.columns || 3

  return (
    <div className="my-6">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {block.images.map((image, index) => (
          <figure key={index} className="group relative overflow-hidden rounded-lg border border-steel-700">
            <img
              src={image.url}
              alt={image.alt}
              className="w-full aspect-square object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            {image.caption && (
              <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-sm text-white">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
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

// Table block
function TableBlockView({ block }: { block: TableBlock }) {
  if (!block.headers || block.headers.length === 0) return null

  const cellPadding = block.compact ? 'px-3 py-1.5' : 'px-4 py-3'

  return (
    <div className="my-6 overflow-x-auto">
      <table className={`w-full border-collapse ${block.bordered ? 'border border-steel-700' : ''}`}>
        {block.caption && (
          <caption className="text-sm text-steel-400 italic mb-3 text-left">
            {block.caption}
          </caption>
        )}
        <thead>
          <tr className="bg-steel-800 border-b-2 border-copper-400/30">
            {block.headers.map((header, idx) => (
              <th
                key={idx}
                className={`${cellPadding} text-left text-sm font-semibold text-copper-400 ${
                  block.bordered ? 'border border-steel-700' : ''
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={`
                border-b border-steel-700/50
                ${block.striped && rowIdx % 2 === 1 ? 'bg-steel-800/50' : ''}
                hover:bg-steel-800/70 transition-colors
              `}
            >
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className={`${cellPadding} text-sm text-steel-300 ${
                    block.bordered ? 'border border-steel-700' : ''
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
