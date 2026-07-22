export interface Member {
  id: string
  name: string
  role: string
}

export const members: Member[] = [
  { id: '1', name: 'Alice', role: '产品' },
  { id: '2', name: 'Bob', role: '工程' },
  { id: '3', name: 'Carol', role: '设计' },
  { id: '4', name: 'Dave', role: '工程' },
]
