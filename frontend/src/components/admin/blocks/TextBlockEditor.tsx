import { useState } from 'react'
import { Eye, Edit3 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { TextBlock, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'

export default function TextBlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockComponentProps<TextBlock>) {
  const [isPreview, setIsPreview] = useState(false)

  return (
    <BlockWrapper
      title="Text Block"
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
      actions={
        <button
          onClick={() => setIsPreview(!isPreview)}
          className={`p-1.5 rounded transition-colors ${
            isPreview ? 'bg-copper-400/20 text-copper-400' : 'text-steel-400 hover:text-copper-400'
          }`}
          title={isPreview ? 'Edit' : 'Preview'}
        >
          {isPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    >
      {isPreview ? (
        <div className="prose prose-invert prose-sm max-w-none p-4 bg-steel-900 rounded-lg min-h-[200px]">
          <ReactMarkdown>{block.content || '*No content yet*'}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate({ ...block, content: e.target.value })}
          placeholder="Write your content in Markdown..."
          rows={10}
          className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 resize-y font-mono text-sm"
        />
      )}
      <p className="text-xs text-steel-500 mt-2">
        Supports Markdown: **bold**, *italic*, # headings, - lists, [links](url), `code`
      </p>
    </BlockWrapper>
  )
}


