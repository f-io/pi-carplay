import { MenuItem, Select, Slider, Switch, Typography } from '@mui/material'
import { SettingsItemRow, StackItem } from './components'
import { SettingsNode } from '../../../routes'

type Props<T> = {
  node: SettingsNode
  value: T
  onChange: <K extends keyof T>(key: K, value: T[K]) => void
  onClick: () => void
}

export const SettingsNodeRenderer = <T extends Record<string, any>>({
  node,
  value,
  onChange,
  onClick
}: Props<T>) => {
  if (onClick) {
    return (
      <StackItem withForwardIcon onClick={onClick}>
        <Typography>{node.label}</Typography>
      </StackItem>
    )
  }

  switch (node.type) {
    case 'checkbox':
      return (
        <SettingsItemRow label={node.label}>
          <Switch
            checked={!!value}
            onChange={(e) => onChange(node.path as keyof T, e.target.checked as T[keyof T])}
          />
        </SettingsItemRow>
      )

    case 'number':
    case 'string':
      return (
        <SettingsItemRow label={node.label}>
          <input
            value={value}
            onChange={(e) => onChange(node.path as keyof T, e.target.value as T[keyof T])}
          />
        </SettingsItemRow>
      )

    case 'select':
      return (
        <SettingsItemRow label={node.label}>
          <Select
            labelId="select-camera"
            id="select-camera"
            size="small"
            value={value}
            sx={{
              minWidth: '200px'
            }}
            onChange={(_, v) => onChange(node.path as keyof T, v as T[keyof T])}
          >
            {node.options.map((cam) => (
              <MenuItem key={cam.label || 'none'} value={cam.value}>
                {cam.label}
              </MenuItem>
            ))}
          </Select>
        </SettingsItemRow>
      )

    case 'slider':
      return (
        <SettingsItemRow label={node.label}>
          <Slider
            value={Math.round((value ?? 1.0) * 100)}
            max={100}
            step={5}
            marks
            valueLabelDisplay="auto"
            onChange={(_, v) => onChange(node.path as keyof T, (v / 100) as T[keyof T])}
          />
        </SettingsItemRow>
      )

    case 'color':
      return (
        <SettingsItemRow label={node.label}>
          <div style={{ width: '100px', height: '30px', backgroundColor: value || 'red' }} />
        </SettingsItemRow>
      )

    default:
      return null
  }
}
