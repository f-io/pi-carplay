import { Typography } from '@mui/material'
import { StackItem } from './stackItem'
import { SettingsItemRow } from './settingsItemRow'
import { SettingsFieldControl } from './SettingsFieldControl'
import { SettingsNode } from '../../../../routes'

type Props<T> = {
  node: SettingsNode
  value: T
  onChange: (v: T) => void
  onClick?: () => void
}

export const SettingsFieldRow = <T,>({ node, value, onChange, onClick }: Props<T>) => {
  if (onClick) {
    return (
      <StackItem withForwardIcon onClick={onClick}>
        <Typography>{node.label}</Typography>
      </StackItem>
    )
  }

  return (
    <SettingsItemRow label={node.label}>
      <SettingsFieldControl node={node} value={value} onChange={onChange} />
    </SettingsItemRow>
  )
}
