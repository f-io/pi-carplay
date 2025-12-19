import { ExtraConfig } from '@main/Globals'

export type SettingsCustomPageProps<TStore> = {
  state: TStore
  onChange: <K extends keyof TStore>(value: TStore[K]) => void
}

export type SettingsCustomNode<TStore> = {
  type: 'custom'
  label: string
  path?: keyof TStore
  component: React.ComponentType<SettingsCustomPageProps<TStore>>
}

export type StreamResolutionProps = SettingsCustomPageProps<ExtraConfig>
