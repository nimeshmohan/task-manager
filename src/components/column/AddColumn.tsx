import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createColumn } from '@/firebase/firestore'
import { useBoardStore } from '@/store/boardStore'
import toast from 'react-hot-toast'

interface AddColumnProps {
  boardId: string
}

export function AddColumn({ boardId }: AddColumnProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!title.trim()) return
    setLoading(true)
    try {
      const col = await createColumn(boardId, title.trim())
      useBoardStore.setState((s) => ({
        columns: [...s.columns, col],
        boards: s.boards.map((b) =>
          b.id === boardId ? { ...b, columnOrder: [...b.columnOrder, col.id] } : b,
        ),
      }))
      setTitle('')
      setOpen(false)
      toast.success('Column added')
    } catch {
      toast.error('Failed to add column')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-12 w-72 shrink-0 items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 px-4 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 dark:border-gray-600 dark:hover:border-blue-500 transition-colors"
      >
        <Plus size={16} /> Add column
      </button>
    )
  }

  return (
    <div className="w-72 shrink-0 rounded-2xl bg-gray-100 p-4 dark:bg-gray-800/60">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleAdd()
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="Column name..."
        className="w-full rounded-lg border border-blue-500 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-white"
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading || !title.trim()}
          className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
