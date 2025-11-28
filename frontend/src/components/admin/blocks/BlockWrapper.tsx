import { ReactNode } from 'react'
import { GripVertical, Trash2, ChevronUp, ChevronDown } from 'lucide-react'

interface BlockWrapperProps {
  title: string
  children: ReactNode
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
  actions?: ReactNode
}

export default function BlockWrapper({
  title,
  children,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  actions,
}: BlockWrapperProps) {
  return (
    <div className="bg-steel-800 border border-steel-700 rounded-xl overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-steel-800/50 border-b border-steel-700">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-steel-500 cursor-grab" />
          <span className="text-sm font-medium text-steel-300">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 text-steel-400 hover:text-copper-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 text-steel-400 hover:text-copper-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-steel-400 hover:text-red-400 transition-colors"
            title="Delete block"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  )
}


