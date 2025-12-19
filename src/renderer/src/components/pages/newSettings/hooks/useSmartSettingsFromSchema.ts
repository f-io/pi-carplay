import { useMemo } from 'react'
import { useSmartSettings } from './useSmartSettings'
import { getValueByPath } from '../utils'
import { SettingsNode } from '../../../../routes'
import { ExtraConfig } from '../../../../../../main/Globals'

type FlatSettings = Record<string, any>
type Overrides<T> = Record<
  keyof T,
  {
    transform?: (value: any, prev?: any) => any
    validate?: (value: any) => boolean
  }
>

const walkSchema = (
  node: SettingsNode<ExtraConfig>,
  settings: any,
  initial: FlatSettings,
  overrides: Overrides<FlatSettings>
) => {
  if ('path' in node) {
    initial[node.path] = getValueByPath(settings, node.path)

    if ('transform' in node && node.transform) {
      overrides[node.path] = { transform: node.transform }
    }
  }

  if (node.type === 'route') {
    node.children.forEach((child) => walkSchema(child, settings, initial, overrides))
  }
}

export const useSmartSettingsFromSchema = (
  rootSchema: SettingsNode<ExtraConfig>,
  settings: any
) => {
  const { initialState, overrides } = useMemo(() => {
    const initialState: FlatSettings = {}
    const overrides: Overrides<FlatSettings> = {}

    walkSchema(rootSchema, settings ?? {}, initialState, overrides)

    return { initialState, overrides }
  }, [rootSchema, settings])

  return useSmartSettings(initialState, settings ?? {}, { overrides })
}
