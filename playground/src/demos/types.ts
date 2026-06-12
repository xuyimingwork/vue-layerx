import type { Component } from 'vue'

export interface DemoItem {
  id: string
  level: number
  title: string
  description: string
  tags: string[]
  component: Component
}

export interface DemoGroup {
  id: string
  title: string
  subtitle: string
  items: DemoItem[]
}
