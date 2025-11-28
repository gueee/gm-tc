export type BlockType = 'text' | 'chart' | 'image' | 'code'

export interface BaseBlock {
  id: string
  type: BlockType
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  content: string // Markdown content
}

// Chart data series with individual settings
export interface ChartDataSeries {
  x: number[]
  y: number[]
  name?: string
  color?: string
  useSecondaryY?: boolean
}

// Annotation on chart
export interface ChartAnnotation {
  x: number
  y: number
  text: string
  showArrow?: boolean
}

// Shape overlay (highlight region)
export interface ChartShape {
  type: 'rect' | 'line'
  x0: number
  x1: number
  y0: number
  y1: number
  color?: string
  opacity?: number
}

export interface ChartBlock extends BaseBlock {
  type: 'chart'
  title: string
  chartType: 'scatter' | 'line' | 'bar' | 'area' | 'histogram' | 'pie' | 'box'
  data: ChartDataSeries[]
  xAxisLabel?: string
  yAxisLabel?: string
  showLegend?: boolean
  // New options
  showSpikelines?: boolean
  smoothLine?: boolean
  lineColor?: string
  xAxisType?: 'linear' | 'log' | 'date'
  yAxisType?: 'linear' | 'log'
  trendline?: 'none' | 'linear' | 'moving-avg'
  annotations?: ChartAnnotation[]
  shapes?: ChartShape[]
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  url: string
  alt: string
  caption?: string
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  code: string
}

export type Block = TextBlock | ChartBlock | ImageBlock | CodeBlock

export interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

export interface BlockComponentProps<T extends Block = Block> {
  block: T
  onUpdate: (block: T) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}



