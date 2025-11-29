import { useRef, useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { ImageBlock, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'
import api from '../../../services/api'

export default function ImageBlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockComponentProps<ImageBlock>) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      onUpdate({ ...block, url: response.data.url, alt: block.alt || file.name })
    } catch (error: any) {
      console.error('Upload failed:', error)
      setUploadError(error.response?.data?.detail || 'Upload failed')
    } finally {
      setIsUploading(false)
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

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
        {/* Upload button */}
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-copper-400 text-steel-900 font-medium rounded-lg hover:bg-copper-300 disabled:opacity-50 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <span className="text-sm text-steel-500">or enter URL below</span>
        </div>

        {uploadError && (
          <p className="text-sm text-red-400">{uploadError}</p>
        )}

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



