import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Trello,
} from 'lucide-react'
import { useBoardStore } from '@/store/boardStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { signOutUser } from '@/firebase/auth'
import { createBoard } from '@/firebase/firestore'
import { BOARD_COLORS } from '@/utils/priority'
import { cn } from '@/lib/cn'
import toast from 'react-hot-toast'

export function Sidebar() {
  const { boards, setActiveBoardId, activeBoardId, setBoards } = useBoardStore()
  const { user } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')

  async function handleCreateBoard() {
    if (!newBoardTitle.trim() || !user) return
    try {
      const color = BOARD_COLORS[Math.floor(Math.random() * BOARD_COLORS.length)]
      const board = await createBoard(user.uid, newBoardTitle.trim(), color)
      setBoards([...boards, board])
      setActiveBoardId(board.id)
      navigate(`/board/${board.id}`)
      setNewBoardTitle('')
      setCreating(false)
      toast.success('Board created')
    } catch {
      toast.error('Failed to create board')
    }
  }

  async function handleSignOut() {
    await signOutUser()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'fixed left-0 top-0 z-30 flex h-full flex-col overflow-hidden bg-gray-900 text-white lg:relative lg:z-auto',
        )}
      >
        <div className="flex min-w-[240px] flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Trello size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">Mini Trello</span>
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto p-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mb-1"
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

            <div className="mt-4">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Boards
                </span>
                <button
                  onClick={() => setCreating(true)}
                  className="rounded p-1 hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="New board"
                >
                  <Plus size={14} />
                </button>
              </div>

              <AnimatePresence>
                {creating && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mb-2 px-1"
                  >
                    <input
                      autoFocus
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateBoard()
                        if (e.key === 'Escape') setCreating(false)
                      }}
                      placeholder="Board name..."
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={handleCreateBoard}
                        className="flex-1 rounded-lg bg-blue-600 py-1.5 text-xs font-medium hover:bg-blue-700 transition-colors"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setCreating(false)}
                        className="flex-1 rounded-lg bg-gray-700 py-1.5 text-xs font-medium hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-0.5">
                {boards.map((board) => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    onClick={() => setActiveBoardId(board.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      activeBoardId === board.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white',
                    )}
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: board.color }}
                    />
                    <span className="truncate">{board.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* User */}
          <div className="border-t border-gray-700 p-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold">
                {user?.displayName?.[0]?.toUpperCase() ?? 'G'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {user?.displayName ?? 'Guest'}
                </p>
                <p className="truncate text-xs text-gray-400">{user?.isGuest ? 'Guest' : user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-1/2 z-40 hidden -translate-y-1/2 rounded-r-lg bg-gray-900 p-1.5 text-gray-400 hover:text-white lg:flex"
        style={{ left: sidebarOpen ? 240 : 0 }}
      >
        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>
    </>
  )
}
