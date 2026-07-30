export interface User {
  id: number
  name: string
  title: string
  status: 'draft' | 'active' | 'rejected'
}

let seq = 3

const db: User[] = [
  { id: 1, name: 'Alice', title: '产品经理', status: 'active' },
  { id: 2, name: 'Bob', title: '工程师', status: 'draft' },
]

function delay(ms = 220) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function getUserListApi(): Promise<User[]> {
  await delay(80)
  return db.map((u) => ({ ...u }))
}

export async function getUserApi(id: number): Promise<User> {
  await delay()
  const row = db.find((u) => u.id === id)
  if (!row) throw new Error(`用户 #${id} 不存在`)
  return { ...row }
}

export async function createUserApi(input: {
  name: string
  title: string
}): Promise<User> {
  await delay()
  const row: User = {
    id: ++seq,
    name: input.name.trim(),
    title: input.title.trim(),
    status: 'draft',
  }
  db.push(row)
  return { ...row }
}

export async function updateUserApi(
  id: number,
  input: { name: string; title: string },
): Promise<User> {
  await delay()
  const row = db.find((u) => u.id === id)
  if (!row) throw new Error(`用户 #${id} 不存在`)
  row.name = input.name.trim()
  row.title = input.title.trim()
  return { ...row }
}

export async function auditUserApi(
  id: number,
  decision: 'approve' | 'reject',
): Promise<User> {
  await delay(320)
  const row = db.find((u) => u.id === id)
  if (!row) throw new Error(`用户 #${id} 不存在`)
  if (row.status !== 'draft') {
    throw new Error(`用户 #${id} 当前状态为「${row.status}」，无法审核`)
  }
  row.status = decision === 'approve' ? 'active' : 'rejected'
  return { ...row }
}
