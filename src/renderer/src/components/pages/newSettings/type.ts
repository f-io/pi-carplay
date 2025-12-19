import { ReactNode } from 'react'
import { SettingsNode } from '../../../routes'
import { ExtraConfig } from '../../../../../main/Globals'

export interface StackItemProps {
  children?: ReactNode
  withForwardIcon?: boolean
  value?: string
  showValue?: boolean
  onClick?: () => void
  node?: SettingsNode<ExtraConfig>
}
