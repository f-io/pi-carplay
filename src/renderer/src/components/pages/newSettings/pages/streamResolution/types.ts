import { ExtraConfig } from '@main/Globals'

export type SettingsCustomPageProps<TStore> = {
  state: TStore
  onChange: <K extends keyof TStore>(key: K, value: TStore[K]) => void
}

export type StreamResolutionProps = SettingsCustomPageProps<ExtraConfig>
