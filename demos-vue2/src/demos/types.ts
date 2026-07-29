export interface DemoItem {
  id: string
  title: string
  description: string
  tags: string[]
  component: object
}

export interface DemoGroup {
  id: string
  title: string
  subtitle: string
  items: DemoItem[]
}
