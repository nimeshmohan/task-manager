import { useState, useEffect } from 'react'
import { Trash2, Calendar, Flag, Tag } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useUIStore } from '@/store/uiStore'
import { useBoardStore } from '@/store/boardStore'
import { updateTask, deleteTask } from '@/firebase/firestore'
import { PRIORITY_CONFIG, TAG_COLORS } from '@/utils/priority'
import { cn } from '@/lib/cn'
import type { Priority, TagColor } from '@/types'
import toast from 'react-hot-toast'

export function TaskModal() {
  const { activeTaskId, setActiveTaskId } = useUIStore()
  const { tasks, columns, updateColumnLocally } = useBoardStore()

  const task = tasks.find((t) => t.id === activeTaskId)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [dueDate, setDueDate] = useState('')
  const [tags, setTags] = useState<TagColor[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setPriority(task.priority)
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '')
      setTags(task.tags)
    }
  }, [task])

  async function handleSave() {
    if (!task || !title.trim()) return
    setSaving(true)
    try {
      const updates = {
        title: title.trim(),
        description,
        priority,
        tags,
        dueDate: dueDate ? new Date(dueDate).getTime() : null,
      }
      await updateTask(task.id, updates)
      useBoardStore.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === task.id ? { ...t, ...updates } : t)),
      }))
      toast.success('Task updated')
      setActiveTaskId(null)
    } catch {
      toast.error('Failed to update task')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!task) return
    try {
      await deleteTask(task.columnId, task.id)
      const col = columns.find((c) => c.id === task.columnId)
      if (col) {
        updateColumnLocally(col.id, { cardOrder: col.cardOrder.filter((id) => id !== task.id) })
      }
      useBoardStore.setState((s) => ({ tasks: s.tasks.filter((t) => t.id !== task.id) }))
      toast.success('Task deleted')
      setActiveTaskId(null)
    } catch {
      toast.error('Failed to delete task')
    }
  }

  function toggleTag(tag: TagColor) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  return (
    <Modal open={!!activeTaskId} onClose={() => setActiveTaskId(null)} size="lg">
      {task && (
        <div className="space-y-5">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add a description..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Flag size={14} /> Priority
            </label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-all',
                    PRIORITY_CONFIG[p].bg,
                    PRIORITY_CONFIG[p].color,
                    priority === p ? 'ring-2 ring-offset-1 ring-blue-500' : 'opacity-60 hover:opacity-100',
                  )}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Tag size={14} /> Tags
            </label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(TAG_COLORS) as TagColor[]).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'h-6 w-6 rounded-full transition-all',
                    TAG_COLORS[tag],
                    tags.includes(tag) ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'opacity-50 hover:opacity-80',
                  )}
                  title={tag}
                />
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="mb-1 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Calendar size={14} /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="flex justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <Trash2 size={14} /> Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setActiveTaskId(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
