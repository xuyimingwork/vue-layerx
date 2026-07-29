import type { Component } from 'vue'

export interface DemoFile {
  name: string
  code: string
}

export interface DemoItem {
  id: string
  level: number
  title: string
  description: string
  tags: string[]
  component: Component
  files: DemoFile[]
}

export interface DemoGroup {
  id: string
  title: string
  subtitle: string
  items: DemoItem[]
}
