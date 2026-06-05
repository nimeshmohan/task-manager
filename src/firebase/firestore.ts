import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore'
import type { User as FirebaseUser } from 'firebase/auth'
import { db } from './config'
import type { Board, Column, Task } from '@/types'

// ── Users ──────────────────────────────────────────────
export async function createUserDoc(user: FirebaseUser, isGuest: boolean) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? 'Guest User',
      photoURL: user.photoURL,
      isGuest,
      boardIds: [],
      createdAt: Date.now(),
    })
  }
}

// ── Boards ─────────────────────────────────────────────
export function subscribeToBoards(userId: string, cb: (boards: Board[]) => void) {
  const q = query(collection(db, 'boards'), where('memberIds', 'array-contains', userId))
  return onSnapshot(q, (snap) => {
    const boards = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Board))
    cb(boards)
  })
}

export async function createBoard(userId: string, title: string, color: string): Promise<Board> {
  const now = Date.now()
  const boardRef = await addDoc(collection(db, 'boards'), {
    title,
    description: '',
    ownerId: userId,
    memberIds: [userId],
    columnOrder: [],
    color,
    createdAt: now,
    updatedAt: now,
  })

  const batch = writeBatch(db)
  const columnIds: string[] = []
  const defaultCols = ['To Do', 'In Progress', 'Review', 'Done']

  for (const colTitle of defaultCols) {
    const colRef = doc(collection(db, 'columns'))
    batch.set(colRef, {
      boardId: boardRef.id,
      title: colTitle,
      cardOrder: [],
      createdAt: now,
    })
    columnIds.push(colRef.id)
  }

  batch.update(boardRef, { columnOrder: columnIds })
  await batch.commit()

  const snap = await getDoc(boardRef)
  return { id: snap.id, ...snap.data() } as Board
}

export async function updateBoard(boardId: string, data: Partial<Board>) {
  await updateDoc(doc(db, 'boards', boardId), { ...data, updatedAt: Date.now() })
}

export async function deleteBoard(boardId: string) {
  const colSnap = await getDocs(query(collection(db, 'columns'), where('boardId', '==', boardId)))
  const batch = writeBatch(db)

  for (const colDoc of colSnap.docs) {
    const taskSnap = await getDocs(query(collection(db, 'tasks'), where('columnId', '==', colDoc.id)))
    taskSnap.docs.forEach((t) => batch.delete(t.ref))
    batch.delete(colDoc.ref)
  }

  batch.delete(doc(db, 'boards', boardId))
  await batch.commit()
}

// ── Columns ────────────────────────────────────────────
export function subscribeToColumns(boardId: string, cb: (cols: Column[]) => void) {
  const q = query(collection(db, 'columns'), where('boardId', '==', boardId))
  return onSnapshot(q, (snap) => {
    const cols = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Column))
    cb(cols)
  })
}

export async function createColumn(boardId: string, title: string): Promise<Column> {
  const now = Date.now()
  const colRef = await addDoc(collection(db, 'columns'), {
    boardId,
    title,
    cardOrder: [],
    createdAt: now,
  })
  await updateDoc(doc(db, 'boards', boardId), {
    columnOrder: arrayUnion(colRef.id),
    updatedAt: now,
  })
  const snap = await getDoc(colRef)
  return { id: snap.id, ...snap.data() } as Column
}

export async function updateColumn(columnId: string, data: Partial<Column>) {
  await updateDoc(doc(db, 'columns', columnId), data)
}

export async function deleteColumn(boardId: string, columnId: string) {
  const batch = writeBatch(db)
  const taskSnap = await getDocs(query(collection(db, 'tasks'), where('columnId', '==', columnId)))
  taskSnap.docs.forEach((t) => batch.delete(t.ref))
  batch.delete(doc(db, 'columns', columnId))
  batch.update(doc(db, 'boards', boardId), { columnOrder: arrayRemove(columnId) })
  await batch.commit()
}

export async function updateColumnOrder(boardId: string, columnOrder: string[]) {
  await updateDoc(doc(db, 'boards', boardId), { columnOrder, updatedAt: Date.now() })
}

export async function updateCardOrder(columnId: string, cardOrder: string[]) {
  await updateDoc(doc(db, 'columns', columnId), { cardOrder })
}

// ── Tasks ──────────────────────────────────────────────
export function subscribeToTasks(boardId: string, cb: (tasks: Task[]) => void) {
  const q = query(collection(db, 'tasks'), where('boardId', '==', boardId))
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task))
    cb(tasks)
  })
}

export async function createTask(
  boardId: string,
  columnId: string,
  title: string,
): Promise<Task> {
  const now = Date.now()
  const taskRef = await addDoc(collection(db, 'tasks'), {
    boardId,
    columnId,
    title,
    description: '',
    priority: 'medium',
    tags: [],
    dueDate: null,
    assigneeId: null,
    createdAt: now,
    updatedAt: now,
  })
  await updateDoc(doc(db, 'columns', columnId), { cardOrder: arrayUnion(taskRef.id) })
  const snap = await getDoc(taskRef)
  return { id: snap.id, ...snap.data() } as Task
}

export async function updateTask(taskId: string, data: Partial<Task>) {
  await updateDoc(doc(db, 'tasks', taskId), { ...data, updatedAt: Date.now() })
}

export async function deleteTask(columnId: string, taskId: string) {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'tasks', taskId))
  batch.update(doc(db, 'columns', columnId), { cardOrder: arrayRemove(taskId) })
  await batch.commit()
}

export async function moveTaskBetweenColumns(
  taskId: string,
  fromColumnId: string,
  toColumnId: string,
  newCardOrder: string[],
  fromCardOrder: string[],
) {
  const batch = writeBatch(db)
  batch.update(doc(db, 'tasks', taskId), { columnId: toColumnId, updatedAt: Date.now() })
  batch.update(doc(db, 'columns', fromColumnId), { cardOrder: fromCardOrder })
  batch.update(doc(db, 'columns', toColumnId), { cardOrder: newCardOrder })
  await batch.commit()
}
