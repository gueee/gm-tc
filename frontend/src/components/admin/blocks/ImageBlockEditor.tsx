import { ImageBlock, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'

export default function ImageBlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockComponentProps<ImageBlock>) {
  return (
    <BlockWrapper
      title="Image Block"
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-steel-300 mb-2">Image URL</label>
          <input
            type="url"
            value={block.url}
            onChange={(e) => onUpdate({ ...block, url: e.target.value })}
            className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Alt Text</label>
            <input
              type="text"
              value={block.alt}
              onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
              className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
              placeholder="Image description..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-steel-300 mb-2">Caption (optional)</label>
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => onUpdate({ ...block, caption: e.target.value })}
              className="w-full px-3 py-2 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
              placeholder="Caption text..."
            />
          </div>
        </div>

        {/* Preview */}
        {block.url && (
          <div className="mt-4 rounded-lg overflow-hidden bg-steel-900 p-4">
            <img
              src={block.url}
              alt={block.alt}
              className="max-w-full h-auto rounded-lg mx-auto"
              style={{ maxHeight: '300px' }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            {block.caption && (
              <p className="text-sm text-steel-400 text-center mt-2 italic">{block.caption}</p>
            )}
          </div>
        )}
      </div>
    </BlockWrapper>
  )
}


