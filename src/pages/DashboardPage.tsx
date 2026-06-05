import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Trash2, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { useBoardStore } from '@/store/boardStore'
import { useAuthStore } from '@/store/authStore'
import { useBoards } from '@/hooks/useBoards'
import { createBoard, deleteBoard } from '@/firebase/firestore'
import { BOARD_COLORS } from '@/utils/priority'
import toast from 'react-hot-toast'

export function DashboardPage() {
  useBoards()
  const { boards, setActiveBoardId } = useBoardStore()
  const { user } = useAuthStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [selectedColor, setSelectedColor] = useState(BOARD_COLORS[0])
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!newTitle.trim() || !user) return
    setCreating(true)
    try {
      await createBoard(user.uid, newTitle.trim(), selectedColor)
      setNewTitle('')
      setModalOpen(false)
      toast.success('Board created')
    } catch {
      toast.error('Failed to create board')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(e: React.MouseEvent, boardId: string) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await deleteBoard(boardId)
      useBoardStore.setState((s) => ({ boards: s.boards.filter((b) => b.id !== boardId) }))
      toast.success('Board deleted')
    } catch {
      toast.error('Failed to delete board')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Boards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {boards.length} board{boards.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Board
        </Button>
      </div>

      {boards.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No boards yet"
          description="Create your first board to start organizing your tasks."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} /> Create Board
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boards.map((board, i) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/board/${board.id}`}
                onClick={() => setActiveBoardId(board.id)}
                className="group relative flex h-36 flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
                style={{ backgroundColor: board.color }}
              >
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <h3 className="relative font-semibold text-white">{board.title}</h3>
                <div className="relative flex items-center justify-between">
                  <span className="text-xs text-white/70">
                    {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, board.id)}
                    className="rounded-lg p-1.5 text-white/60 hover:bg-white/20 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Board" size="sm">
        <div className="space-y-4">
          <Input
            label="Board name"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            placeholder="My Project"
            autoFocus
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {BOARD_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className="h-7 w-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: selectedColor === c ? `3px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating || !newTitle.trim()}>
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
