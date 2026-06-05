import { create } from 'zustand'

interface UIState {
  darkMode: boolean
  sidebarOpen: boolean
  activeTaskId: string | null
  searchQuery: string
  priorityFilter: string | null
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void
  setActiveTaskId: (id: string | null) => void
  setSearchQuery: (q: string) => void
  setPriorityFilter: (p: string | null) => void
}

const savedDark = localStorage.getItem('darkMode') === 'true'
if (savedDark) document.documentElement.classList.add('dark')

export const useUIStore = create<UIState>((set) => ({
  darkMode: savedDark,
  sidebarOpen: true,
  activeTaskId: null,
  searchQuery: '',
  priorityFilter: null,

  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode
      localStorage.setItem('darkMode', String(next))
      document.documentElement.classList.toggle('dark', next)
      return { darkMode: next }
    }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveTaskId: (id) => set({ activeTaskId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setPriorityFilter: (p) => set({ priorityFilter: p }),
}))
