import { Type, BarChart3, Image, Code } from 'lucide-react'
import { Block, BlockType, TextBlock, ChartBlock, ImageBlock, CodeBlock } from './types'
import TextBlockEditor from './TextBlockEditor'
import ChartBlockEditor from './ChartBlockEditor'
import ImageBlockEditor from './ImageBlockEditor'
import CodeBlockEditor from './CodeBlockEditor'

interface BlockEditorProps {
  blocks: Block[]
  onChange: (blocks: Block[]) => void
}

const BLOCK_TYPES: { type: BlockType; icon: typeof Type; label: string }[] = [
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'chart', icon: BarChart3, label: 'Chart' },
  { type: 'image', icon: Image, label: 'Image' },
  { type: 'code', icon: Code, label: 'Code' },
]

function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function createEmptyBlock(type: BlockType): Block {
  const id = generateId()

  switch (type) {
    case 'text':
      return { id, type: 'text', content: '' } as TextBlock
    case 'chart':
      return {
        id,
        type: 'chart',
        title: '',
        chartType: 'line',
        data: [],
        xAxisLabel: '',
        yAxisLabel: '',
        showLegend: false,
      } as ChartBlock
    case 'image':
      return { id, type: 'image', url: '', alt: '', caption: '' } as ImageBlock
    case 'code':
      return { id, type: 'code', language: 'javascript', code: '' } as CodeBlock
  }
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  function addBlock(type: BlockType) {
    onChange([...blocks, createEmptyBlock(type)])
  }

  function updateBlock(index: number, block: Block) {
    const newBlocks = [...blocks]
    newBlocks[index] = block
    onChange(newBlocks)
  }

  function deleteBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index))
  }

  function moveBlock(index: number, direction: 'up' | 'down') {
    const newBlocks = [...blocks]
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (targetIndex < 0 || targetIndex >= newBlocks.length) return

    ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
    onChange(newBlocks)
  }

  return (
    <div className="space-y-4">
      {/* Blocks */}
      {blocks.map((block, index) => {
        const props = {
          block,
          onUpdate: (b: Block) => updateBlock(index, b),
          onDelete: () => deleteBlock(index),
          onMoveUp: () => moveBlock(index, 'up'),
          onMoveDown: () => moveBlock(index, 'down'),
          isFirst: index === 0,
          isLast: index === blocks.length - 1,
        }

        switch (block.type) {
          case 'text':
            return <TextBlockEditor key={block.id} {...props} block={block} />
          case 'chart':
            return <ChartBlockEditor key={block.id} {...props} block={block} />
          case 'image':
            return <ImageBlockEditor key={block.id} {...props} block={block} />
          case 'code':
            return <CodeBlockEditor key={block.id} {...props} block={block} />
          default:
            return null
        }
      })}

      {/* Add Block Buttons */}
      <div className="flex flex-wrap items-center gap-2 p-4 border-2 border-dashed border-steel-700 rounded-xl">
        <span className="text-sm text-steel-500 mr-2">Add block:</span>
        {BLOCK_TYPES.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => addBlock(type)}
            className="flex items-center gap-2 px-3 py-2 bg-steel-800 border border-steel-700 rounded-lg text-steel-300 hover:bg-steel-700 hover:text-copper-400 hover:border-copper-400/50 transition-colors"
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="text-center py-8 text-steel-500">
          <p className="mb-2">No content blocks yet.</p>
          <p className="text-sm">Click a button above to add your first block.</p>
        </div>
      )}
    </div>
  )
}

