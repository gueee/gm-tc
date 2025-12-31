import { useState, useRef } from 'react'
import { Eye, Edit3, List, ListOrdered, Table, Circle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Insert text at cursor position or wrap selected text
  const insertAtCursor = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = block.content || ''
    const selectedText = text.substring(start, end)

    let newText: string
    let newCursorPos: number

    if (selectedText) {
      // Wrap selected text with prefix/suffix per line
      const lines = selectedText.split('\n')
      const wrappedLines = lines.map((line, idx) => {
        // For numbered lists, increment the number
        if (prefix === '1. ') {
          return `${idx + 1}. ${line}${suffix}`
        }
        // For lettered lists, increment the letter
        if (prefix === 'a) ') {
          const letter = String.fromCharCode(97 + idx) // a, b, c...
          return `${letter}) ${line}${suffix}`
        }
        return `${prefix}${line}${suffix}`
      })
      const wrapped = wrappedLines.join('\n')
      newText = text.substring(0, start) + wrapped + text.substring(end)
      newCursorPos = start + wrapped.length
    } else {
      // Just insert at cursor
      newText = text.substring(0, start) + prefix + suffix + text.substring(end)
      newCursorPos = start + prefix.length
    }

    onUpdate({ ...block, content: newText })

    // Restore focus and cursor position after React re-render
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Insert a markdown table template
  const insertTable = () => {
    const tableTemplate = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`
    insertAtCursor('\n' + tableTemplate + '\n')
  }

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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              ul: ({ children }) => <ul className="list-disc list-outside text-steel-300 mb-4 space-y-2 pl-6">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-outside text-steel-300 mb-4 space-y-2 pl-6">{children}</ol>,
              table: ({ children }) => (
                <table className="w-full border-collapse my-4">{children}</table>
              ),
              thead: ({ children }) => (
                <thead className="bg-steel-800 border-b-2 border-copper-400/30">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left text-sm font-semibold text-copper-400 border border-steel-700">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-sm text-steel-300 border border-steel-700">
                  {children}
                </td>
              ),
              tr: ({ children }) => (
                <tr className="border-b border-steel-700/50 hover:bg-steel-800/50">{children}</tr>
              ),
            }}
          >
            {block.content || '*No content yet*'}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 p-2 bg-steel-800 rounded-t-lg border border-steel-700 border-b-0">
            <span className="text-xs text-steel-500 mr-2">Format:</span>

            {/* Bullet List */}
            <button
              onClick={() => insertAtCursor('- ')}
              className="p-1.5 rounded text-steel-400 hover:text-copper-400 hover:bg-steel-700 transition-colors"
              title="Bullet list (- item)"
            >
              <List className="w-4 h-4" />
            </button>

            {/* Numbered List */}
            <button
              onClick={() => insertAtCursor('1. ')}
              className="p-1.5 rounded text-steel-400 hover:text-copper-400 hover:bg-steel-700 transition-colors"
              title="Numbered list (1. item)"
            >
              <ListOrdered className="w-4 h-4" />
            </button>

            {/* Lettered List */}
            <button
              onClick={() => insertAtCursor('a) ')}
              className="p-1.5 rounded text-steel-400 hover:text-copper-400 hover:bg-steel-700 transition-colors flex items-center gap-0.5"
              title="Lettered list (a) item)"
            >
              <span className="text-xs font-bold">a)</span>
            </button>

            <div className="w-px h-4 bg-steel-600 mx-1" />

            {/* Dot/Circle marker */}
            <button
              onClick={() => insertAtCursor('• ')}
              className="p-1.5 rounded text-steel-400 hover:text-copper-400 hover:bg-steel-700 transition-colors"
              title="Dot marker (•)"
            >
              <Circle className="w-3 h-3 fill-current" />
            </button>

            <div className="w-px h-4 bg-steel-600 mx-1" />

            {/* Insert Table */}
            <button
              onClick={insertTable}
              className="p-1.5 rounded text-steel-400 hover:text-copper-400 hover:bg-steel-700 transition-colors"
              title="Insert table"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => onUpdate({ ...block, content: e.target.value })}
            placeholder="Write your content in Markdown..."
            rows={10}
            className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-b-lg rounded-t-none text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 resize-y font-mono text-sm"
          />
        </div>
      )}
      <p className="text-xs text-steel-500 mt-2">
        <span className="text-copper-400">Markdown:</span> **bold**, *italic*, # headings, - bullets, 1. numbers, a) letters, [links](url), `code`
        <br />
        <span className="text-copper-400">Tables:</span> | Header | Header | with |---| separators
      </p>
    </BlockWrapper>
  )
}
