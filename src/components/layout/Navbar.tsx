import { Menu, Moon, Sun, Search, Share2 } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { useBoardStore } from '@/store/boardStore'
import toast from 'react-hot-toast'

export function Navbar() {
  const { darkMode, toggleDarkMode, setSidebarOpen, sidebarOpen, searchQuery, setSearchQuery } =
    useUIStore()
  const { getActiveBoard } = useBoardStore()
  const board = getActiveBoard()

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
      >
        <Menu size={20} />
      </button>

      {board && (
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: board.color }}
          />
          <h1 className="text-sm font-semibold text-gray-900 dark:text-white">{board.title}</h1>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {board && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(board.id)
              toast.success('Board ID copied — share it to invite others!')
            }}
            title="Copy board ID to share"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Share2 size={15} />
            <span className="hidden sm:inline">Share</span>
          </button>
        )}

        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
