import { AudioSettingKey } from './types'
import { SETTINGS_DIALOGS } from '../types'

export const audioSettingsUIConfig: Record<
  AudioSettingKey,
  {
    label: string
    dialog?: SETTINGS_DIALOGS
    display?: (state: Record<AudioSettingKey, number>) => string | number
    customVariantValues?: string[]
  }
> = {
  mediaDelay: {
    label: 'Media Delay',
    dialog: SETTINGS_DIALOGS.MEDIA_DELAY,
    display: (state) => state.mediaDelay
  },
  audioVolume: {
    label: 'Audio Volume',
    dialog: SETTINGS_DIALOGS.AUDIO_VOLUME,
    display: (state) => Math.round((state.audioVolume || 0) * 100)
  },
  navVolume: {
    label: 'Navigation Volume',
    dialog: SETTINGS_DIALOGS.NAV_VOLUME,
    display: (state) => Math.round((state.navVolume || 0) * 100)
  },
  mediaSound: {
    label: 'Sampling Frequency',
    customVariantValues: ['111', '222']
  }
}
