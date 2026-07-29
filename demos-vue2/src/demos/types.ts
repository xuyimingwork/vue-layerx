export interface DemoFile {
  name: string
  code: string
}

export interface DemoItem {
  id: string
  title: string
  description: string
  tags: string[]
  component: object
  files: DemoFile[]
}

export interface DemoGroup {
  id: string
  title: string
  subtitle: string
  items: DemoItem[]
}
