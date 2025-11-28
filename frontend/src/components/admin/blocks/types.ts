export type BlockType = 'text' | 'chart' | 'image' | 'code'

export interface BaseBlock {
  id: string
  type: BlockType
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  content: string // Markdown content
}

export interface ChartBlock extends BaseBlock {
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



