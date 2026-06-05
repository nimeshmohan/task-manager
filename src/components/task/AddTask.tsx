import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { createTask } from '@/firebase/firestore'
import { useBoardStore } from '@/store/boardStore'
import toast from 'react-hot-toast'

interface AddTaskProps {
  boardId: string
  columnId: string
}

export function AddTask({ boardId, columnId }: AddTaskProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const { updateColumnLocally, columns } = useBoardStore()

  async function handleAdd() {
    if (!title.trim()) return
    setLoading(true)
    try {
      const task = await createTask(boardId, columnId, title.trim())
      useBoardStore.setState((s) => ({ tasks: [...s.tasks, task] }))
      const col = columns.find((c) => c.id === columnId)
      if (col) {
        updateColumnLocally(columnId, { cardOrder: [...col.cardOrder, task.id] })
      }
      setTitle('')
      setOpen(false)
    } catch {
      toast.error('Failed to add task')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Plus size={16} />
        Add task
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleAdd()
          }
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="Task title..."
        rows={2}
        className="w-full rounded-lg border border-blue-500 bg-white p-3 text-sm text-gray-900 shadow focus:outline-none dark:bg-gray-800 dark:text-white"
      />
      <div className="flex gap-2">
        <button
          onClick={handleAdd}
          disabled={loading || !title.trim()}
          className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
