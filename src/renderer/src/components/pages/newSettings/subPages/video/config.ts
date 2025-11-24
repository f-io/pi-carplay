import { VideoSettingKey } from './types'
import { SETTINGS_DIALOGS } from '../types'

export const videoSettingsUIConfig: Record<
  VideoSettingKey,
  {
    label: string
    dialog?: SETTINGS_DIALOGS
    display?: (state: Record<VideoSettingKey, number>) => string | number
    customVariantValues?: string[]
  }
> = {
  width: {
    label: 'Screen Size',
    dialog: SETTINGS_DIALOGS.SCREEN_RESOLUTION,
    display: (state) => `${state.width} x ${state.height}`
  },
  height: {
    label: 'Screen Size'
  },
  fps: {
    label: 'FPS',
    dialog: SETTINGS_DIALOGS.FPS,
    display: (state) => state.fps
  }
}
