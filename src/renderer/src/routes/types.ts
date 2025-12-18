import { ComponentType } from 'react'

export enum RoutePath {
  Home = 'home',
  Settings = 'settings',
  NewSettings = 'new-settings',
  Camera = 'camera',
  Media = 'media',
  Info = 'info'
}

export type BaseFieldNode = {
  label: string
  path?: string
  page?: {
    title?: string
    description?: string
  }
}

export type CheckboxNode = BaseFieldNode & {
  type: 'checkbox'
}

export type NumberNode = BaseFieldNode & {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

export type StringNode = BaseFieldNode & {
  type: 'string'
}

export type ColorNode = BaseFieldNode & {
  type: 'color'
}

export type SelectNode = BaseFieldNode & {
  type: 'select'
  options: Array<{ label: string; value: string | number }>
}

export type ToggleNode = BaseFieldNode & {
  type: 'toggle'
  path: string
}

// TODO
export type SliderNode = BaseFieldNode & {
  type: 'slider'
  path: string
}

export type SettingsCustomNode = BaseFieldNode & {
  type: 'custom'
  component: ComponentType
}

export type RouteNode = BaseFieldNode & {
  type: 'route'
  label: string
  route: string
  children: SettingsNode[]
}

export type SettingsNode =
  | RouteNode
  | ToggleNode
  | CheckboxNode
  | SelectNode
  | NumberNode
  | StringNode
  | ColorNode
  | SliderNode
  | SettingsCustomNode
