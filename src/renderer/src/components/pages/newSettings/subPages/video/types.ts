import { ExtraConfig } from '@main/Globals'
import { DefaultDialogProps } from '../../components/dialog/types'

export type ScreenResolutionProps = DefaultDialogProps<
  VideoSettingKey,
  { width: number; height: number }
>

export type FpsProps = DefaultDialogProps<'fps', { fps: number }>

export type VideoSettingKey = keyof Pick<ExtraConfig, 'width' | 'height' | 'fps'>
