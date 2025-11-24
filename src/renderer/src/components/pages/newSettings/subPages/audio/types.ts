import { ExtraConfig } from '@main/Globals'
import { DefaultDialogProps } from '../../components/dialog/types'

export type MediaDelayProps = DefaultDialogProps<'mediaDelay', { mediaDelay: number }>

export type AudioVolumeProps = DefaultDialogProps<'audioVolume', { audioVolume: number }>

export type NavVolumeProps = DefaultDialogProps<'navVolume', { navVolume: number }>

export type AudioSettingKey = keyof Pick<
  ExtraConfig,
  'mediaDelay' | 'audioVolume' | 'navVolume' | 'mediaSound'
>
