export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type TagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink'

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  isGuest: boolean
}

export interface Board {
  id: string
  title: string
  description: string
  ownerId: string
  memberIds: string[]
  columnOrder: string[]
  color: string
  createdAt: number
  updatedAt: number
}

export interface Column {
  id: string
  boardId: string
  title: string
  cardOrder: string[]
  createdAt: number
}

export interface Task {
  id: string
  boardId: string
  columnId: string
  title: string
  description: string
  priority: Priority
  tags: TagColor[]
  dueDate: number | null
  assigneeId: string | null
  createdAt: number
  updatedAt: number
}

export interface DragItem {
  id: string
  type: 'column' | 'task'
}
