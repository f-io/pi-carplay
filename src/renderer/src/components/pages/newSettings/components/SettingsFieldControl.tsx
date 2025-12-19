import { MenuItem, Select, Slider, Switch, TextField } from '@mui/material'
import NumberSpinner from './numberSpinner/numberSpinner'
import { SettingsNode } from '../../../../routes'
import { ExtraConfig } from '@main/Globals'

type Props<T> = {
  node: SettingsNode<ExtraConfig>
  value: T
  onChange: (v: T) => void
}

export const SettingsFieldControl = <T,>({ node, value, onChange }: Props<T>) => {
  switch (node.type) {
    case 'string':
      return (
        <TextField value={value ?? ''} onChange={(e) => onChange(e.target.value as T)} fullWidth />
      )

    case 'number':
      return (
        <NumberSpinner
          size="small"
          value={value ?? 0}
          onValueChange={(v) => onChange(Number(v) as T)}
        />
      )

    case 'checkbox':
      return <Switch checked={value} onChange={(_, v) => onChange(v as T)} />

    case 'slider':
      return (
        <Slider
          value={Math.round((value ?? 1.0) * 100)}
          max={100}
          step={5}
          marks
          valueLabelDisplay="auto"
          onChange={(_, v) => onChange(((v as number) / 100) as T)}
        />
      )

    case 'select':
      return (
        <Select
          size="small"
          value={value}
          sx={{ minWidth: 200 }}
          onChange={(e) => onChange(e.target.value as T)}
        >
          {node.options.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      )

    case 'color':
      return (
        <TextField
          type="color"
          value={value || '#ff0000'}
          style={{
            width: '100px',
            height: 'auto'
          }}
          onChange={(e) => onChange(e.target.value as T)}
        />
      )

    default:
      return null
  }
}
