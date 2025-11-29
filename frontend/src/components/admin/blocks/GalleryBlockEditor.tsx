import { useRef, useState } from 'react'
import { Loader2, X, Plus } from 'lucide-react'
import { GalleryBlock, GalleryImage, BlockComponentProps } from './types'
import BlockWrapper from './BlockWrapper'
import api from '../../../services/api'

export default function GalleryBlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: BlockComponentProps<GalleryBlock>) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    const newImages: GalleryImage[] = []

    try {
      // Upload all files
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        newImages.push({
          url: response.data.url,
          alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt
          caption: ''
        })
      }

      onUpdate({ ...block, images: [...block.images, ...newImages] })
    } catch (error: any) {
      console.error('Upload failed:', error)
      setUploadError(error.response?.data?.detail || 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function updateImage(index: number, updates: Partial<GalleryImage>) {
    const newImages = [...block.images]
    newImages[index] = { ...newImages[index], ...updates }
    onUpdate({ ...block, images: newImages })
  }

  function removeImage(index: number) {
    const newImages = block.images.filter((_, i) => i !== index)
    onUpdate({ ...block, images: newImages })
  }

  function moveImage(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= block.images.length) return
    const newImages = [...block.images]
    const [moved] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, moved)
    onUpdate({ ...block, images: newImages })
  }

  return (
    <BlockWrapper
      title="Gallery Block"
      onDelete={onDelete}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    >
      <div className="space-y-4">
        {/* Upload button and column selector */}
        <div className="flex items-center gap-4 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
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
              <Plus className="w-4 h-4" />
            )}
            {isUploading ? 'Uploading...' : 'Add Images'}
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm text-steel-400">Columns:</label>
            <select
              value={block.columns || 3}
              onChange={(e) => onUpdate({ ...block, columns: Number(e.target.value) as 2 | 3 | 4 })}
              className="px-3 py-1.5 bg-steel-900 border border-steel-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-copper-400"
            >
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>

          <span className="text-sm text-steel-500">
            {block.images.length} image{block.images.length !== 1 ? 's' : ''}
          </span>
        </div>

        {uploadError && (
          <p className="text-sm text-red-400">{uploadError}</p>
        )}

        {/* Image grid */}
        {block.images.length > 0 && (
          <div className={`grid gap-4 grid-cols-${block.columns || 3}`} style={{
            gridTemplateColumns: `repeat(${block.columns || 3}, minmax(0, 1fr))`
          }}>
            {block.images.map((image, index) => (
              <div
                key={index}
                className="relative bg-steel-900 border border-steel-700 rounded-lg overflow-hidden group"
              >
                {/* Image */}
                <div className="aspect-square">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => moveImage(index, index - 1)}
                    disabled={index === 0}
                    className="p-2 bg-steel-800 rounded-lg text-steel-300 hover:text-white disabled:opacity-30"
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30"
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveImage(index, index + 1)}
                    disabled={index === block.images.length - 1}
                    className="p-2 bg-steel-800 rounded-lg text-steel-300 hover:text-white disabled:opacity-30"
                    title="Move right"
                  >
                    →
                  </button>
                </div>

                {/* Alt & Caption inputs */}
                <div className="p-2 space-y-1">
                  <input
                    type="text"
                    value={image.alt}
                    onChange={(e) => updateImage(index, { alt: e.target.value })}
                    placeholder="Alt text"
                    className="w-full px-2 py-1 bg-steel-800 border border-steel-700 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-copper-400"
                  />
                  <input
                    type="text"
                    value={image.caption || ''}
                    onChange={(e) => updateImage(index, { caption: e.target.value })}
                    placeholder="Caption (optional)"
                    className="w-full px-2 py-1 bg-steel-800 border border-steel-700 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-copper-400"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {block.images.length === 0 && (
          <div className="text-center py-8 text-steel-500 border-2 border-dashed border-steel-700 rounded-lg">
            Click "Add Images" to upload photos
          </div>
        )}
      </div>
    </BlockWrapper>
  )
}

