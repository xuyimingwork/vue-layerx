export type UserId = 'alice' | 'bob' | 'carol' | 'dave' | 'eve'

export interface User {
  id: UserId
  name: string
  role: string
  bio: string
  friends: UserId[]
}

export const users: Record<UserId, User> = {
  alice: {
    id: 'alice',
    name: 'Alice',
    role: '产品',
    bio: '负责增长与表单体验。',
    friends: ['bob', 'carol'],
  },
  bob: {
    id: 'bob',
    name: 'Bob',
    role: '工程',
    bio: '做弹层基础设施。',
    friends: ['alice', 'dave'],
  },
  carol: {
    id: 'carol',
    name: 'Carol',
    role: '设计',
    bio: '关心页内与弹层的一致呈现。',
    friends: ['alice', 'eve'],
  },
  dave: {
    id: 'dave',
    name: 'Dave',
    role: '工程',
    bio: '喜欢把 demo 写清楚。',
    friends: ['bob'],
  },
  eve: {
    id: 'eve',
    name: 'Eve',
    role: '运营',
    bio: '经常从详情里跳到另一个人。',
    friends: ['carol'],
  },
}

export function getUser(id: UserId): User {
  return users[id]
}
