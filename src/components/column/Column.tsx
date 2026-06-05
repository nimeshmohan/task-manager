import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskCard } from '@/components/task/TaskCard'
import { AddTask } from '@/components/task/AddTask'
import { useBoardStore } from '@/store/boardStore'
import { useUIStore } from '@/store/uiStore'
import { updateColumn, deleteColumn } from '@/firebase/firestore'
import { cn } from '@/lib/cn'
import type { Column as ColumnType } from '@/types'
import toast from 'react-hot-toast'

interface ColumnProps {
  column: ColumnType
  boardId: string
}

export function Column({ column, boardId }: ColumnProps) {
  const { tasks, updateColumnLocally } = useBoardStore()
  const { searchQuery, priorityFilter } = useUIStore()
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(column.title)
  const [menuOpen, setMenuOpen] = useState(false)

  const { attributes, listeners, setNodeRef: sortableRef, transform, transition, isDragging } =
    useSortable({ id: column.id, data: { type: 'column' } })

  const { setNodeRef: droppableRef } = useDroppable({ id: column.id })

  const columnTasks = column.cardOrder
    .map((id) => tasks.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => {
      if (!t) return false
      const matchesSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPriority = !priorityFilter || t.priority === priorityFilter
      return matchesSearch && matchesPriority
    })

  const style = { transform: CSS.Transform.toString(transform), transition }

  async function saveTitle() {
    if (!editTitle.trim() || editTitle === column.title) {
      setEditTitle(column.title)
      setEditing(false)
      return
    }
    try {
      await updateColumn(column.id, { title: editTitle.trim() })
      updateColumnLocally(column.id, { title: editTitle.trim() })
    } catch {
      toast.error('Failed to rename column')
    }
    setEditing(false)
  }

  async function handleDelete() {
    try {
      await deleteColumn(boardId, column.id)
      useBoardStore.setState((s) => ({
        columns: s.columns.filter((c) => c.id !== column.id),
        boards: s.boards.map((b) =>
          b.id === boardId
            ? { ...b, columnOrder: b.columnOrder.filter((id) => id !== column.id) }
            : b,
        ),
      }))
      toast.success('Column deleted')
    } catch {
      toast.error('Failed to delete column')
    }
    setMenuOpen(false)
  }

  return (
    <div
      ref={sortableRef}
      style={style}
      className={cn(
        'flex w-72 shrink-0 flex-col rounded-2xl bg-gray-100 dark:bg-gray-800/60 transition-opacity',
        isDragging && 'opacity-40',
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical size={16} />
        </div>

        {editing ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle()
              if (e.key === 'Escape') {
                setEditTitle(column.title)
                setEditing(false)
              }
            }}
            className="flex-1 rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        ) : (
          <h3 className="flex-1 text-sm font-semibold text-gray-700 dark:text-gray-200">
            {column.title}
          </h3>
        )}

        <span className="text-xs font-medium text-gray-400">{columnTasks.length}</span>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <MoreHorizontal size={16} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 z-20 mt-1 w-36 rounded-xl bg-white py-1 shadow-lg dark:bg-gray-900"
                >
                  <button
                    onClick={() => { setEditing(true); setMenuOpen(false) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    <Pencil size={14} /> Rename
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tasks */}
      <div
        ref={droppableRef}
        className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-3 pb-3 min-h-[60px]"
      >
        <SortableContext items={column.cardOrder} strategy={verticalListSortingStrategy}>
          {columnTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>

      {/* Add task */}
      <div className="px-3 pb-3">
        <AddTask boardId={boardId} columnId={column.id} />
      </div>
    </div>
  )
}
