import { CodeBlock, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'bash',
  'json',
  'html',
  'css',
  'gcode',
  'markdown',
  'sql',
  'yaml',
]

export default function CodeBlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockComponentProps<CodeBlock>) {
  return (
    <BlockWrapper
      title="Code Block"
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-steel-300 mb-2">Language</label>
          <select
            value={block.language}
            onChange={(e) => onUpdate({ ...block, language: e.target.value })}
            className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-steel-300 mb-2">Code</label>
          <textarea
            value={block.code}
            onChange={(e) => onUpdate({ ...block, code: e.target.value })}
            placeholder="Paste your code here..."
            rows={12}
            className="w-full px-4 py-3 bg-steel-900 border border-steel-700 rounded-lg text-green-400 placeholder-steel-500 focus:outline-none focus:ring-2 focus:ring-copper-400 resize-y font-mono text-sm"
            spellCheck={false}
          />
        </div>
      </div>
    </BlockWrapper>
  )
}


