import { useState, useRef } from 'react'
import { Eye, Edit3, ListOrdered, Table, Circle, Minus } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { TextBlock, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'

// Types for our custom list handling
type ListType = 'dash' | 'circle' | 'number' | 'letter'

interface ListBlock {
  type: ListType
  items: ListItem[]
}

interface ListItem {
  content: string
  children: ListBlock | null
}

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
          // Check if it's a nested list or continuation
          if (currentInfo) {
            // Nested list item - for now, add as sub-item text
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

// Process inline markdown (bold, italic, code, links) to HTML
function processInlineMarkdown(text: string): string {
  let result = text
  
  // Bold: **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic: *text* or _text_ (but not if it's a list marker)
  // Use negative lookbehind/lookahead to avoid matching isolated asterisks
  result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
  result = result.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>')
  
  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
  
  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-copper-400 hover:text-copper-300 underline">$1</a>')
  
  return result
}

// Generate HTML for a list block
function generateListHTML(type: ListType, items: string[]): string {
  const listClass = `custom-list custom-list-${type}`
  const tag = type === 'number' || type === 'letter' ? 'ol' : 'ul'
  const typeAttr = type === 'letter' ? ' type="a"' : ''

  const itemsHTML = items.map((item) => `<li>${processInlineMarkdown(item)}</li>`).join('\n')

  return `<${tag} class="${listClass}"${typeAttr}>\n${itemsHTML}\n</${tag}>`
}

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

  // Preprocess content to convert custom lists to HTML
  const preprocessedContent = parseListBlocks(block.content || '')

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
            rehypePlugins={[rehypeRaw]}
            components={{
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
            {preprocessedContent || '*No content yet*'}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 p-2 bg-steel-800 rounded-t-lg border border-steel-700 border-b-0">
            <span className="text-xs text-steel-500 mr-2">Lists:</span>

            {/* Dash List */}
            <button
              onClick={() => insertAtCursor('- ')}
              className="p-1.5 rounded text-steel-400 hover:text-copper-400 hover:bg-steel-700 transition-colors"
              title="Dash list (- item)"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Circle List */}
            <button
              onClick={() => insertAtCursor('* ')}
              className="p-1.5 rounded text-steel-400 hover:text-copper-400 hover:bg-steel-700 transition-colors"
              title="Circle list (* item)"
            >
              <Circle className="w-3.5 h-3.5" />
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
              className="p-1.5 rounded text-steel-400 hover:text-copper-400 hover:bg-steel-700 transition-colors flex items-center"
              title="Lettered list (a) item)"
            >
              <span className="text-xs font-bold leading-none">a)</span>
            </button>

            <div className="w-px h-4 bg-steel-600 mx-1" />

            <span className="text-xs text-steel-500 mr-2">Other:</span>

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
            placeholder="Write your content in Markdown...

List examples:
- Dash item (renders with —)
* Circle item (renders with ○)
1. Numbered item
a) Lettered item

Indent with 2 spaces for sub-items or continuation."
            rows={10}
            className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-b-lg rounded-t-none text-white placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 resize-y font-mono text-sm"
          />
        </div>
      )}
      <p className="text-xs text-steel-500 mt-2">
        <span className="text-copper-400">Lists:</span> - dash, * circle, 1. numbers, a) letters — indent with 2 spaces for sub-items
        <br />
        <span className="text-copper-400">Format:</span> **bold**, *italic*, # headings, [links](url), `code`
        <br />
        <span className="text-copper-400">Tables:</span> | Header | Header | with |---| separators
      </p>
    </BlockWrapper>
  )
}
