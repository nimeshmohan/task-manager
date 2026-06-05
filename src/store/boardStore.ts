import { create } from 'zustand'
import type { Board, Column, Task } from '@/types'

interface BoardState {
  boards: Board[]
  columns: Column[]
  tasks: Task[]
  activeBoardId: string | null
  setBoards: (boards: Board[]) => void
  setColumns: (columns: Column[]) => void
  setTasks: (tasks: Task[]) => void
  setActiveBoardId: (id: string | null) => void
  getActiveBoard: () => Board | undefined
  getColumnsForBoard: (boardId: string) => Column[]
  getTasksForColumn: (columnId: string) => Task[]
  updateColumnLocally: (columnId: string, data: Partial<Column>) => void
  updateBoardLocally: (boardId: string, data: Partial<Board>) => void
  moveTaskLocally: (
    taskId: string,
    fromColId: string,
    toColId: string,
    fromOrder: string[],
    toOrder: string[],
  ) => void
  reorderColumnsLocally: (boardId: string, newOrder: string[]) => void
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  columns: [],
  tasks: [],
  activeBoardId: null,

  setBoards: (boards) => set({ boards }),
  setColumns: (columns) => set({ columns }),
  setTasks: (tasks) => set({ tasks }),
  setActiveBoardId: (id) => set({ activeBoardId: id }),

  getActiveBoard: () => {
    const { boards, activeBoardId } = get()
    return boards.find((b) => b.id === activeBoardId)
  },

  getColumnsForBoard: (boardId) => get().columns.filter((c) => c.boardId === boardId),

  getTasksForColumn: (columnId) => get().tasks.filter((t) => t.columnId === columnId),

  updateColumnLocally: (columnId, data) =>
    set((s) => ({
      columns: s.columns.map((c) => (c.id === columnId ? { ...c, ...data } : c)),
    })),

  updateBoardLocally: (boardId, data) =>
    set((s) => ({
      boards: s.boards.map((b) => (b.id === boardId ? { ...b, ...data } : b)),
    })),

  moveTaskLocally: (taskId, fromColId, toColId, fromOrder, toOrder) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, columnId: toColId } : t)),
      columns: s.columns.map((c) => {
        if (c.id === fromColId) return { ...c, cardOrder: fromOrder }
        if (c.id === toColId) return { ...c, cardOrder: toOrder }
        return c
      }),
    })),

  reorderColumnsLocally: (boardId, newOrder) =>
    set((s) => ({
      boards: s.boards.map((b) => (b.id === boardId ? { ...b, columnOrder: newOrder } : b)),
    })),
}))
