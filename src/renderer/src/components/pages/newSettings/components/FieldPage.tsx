import { MenuItem, Select, Slider, Stack, Switch, TextField, Typography } from '@mui/material'
import NumberSpinner from './numberSpinner/numberSpinner'

export const SettingsFieldInput = ({ field, value, onChange }: Props) => {
  switch (field.type) {
    case 'string':
      return <TextField value={value ?? ''} onChange={(e) => onChange(e.target.value)} fullWidth />

    case 'number':
      return (
        <NumberSpinner
          size="small"
          value={value ?? 0}
          onValueChange={(e) => {
            onChange(Number(e))
          }}
        />
      )

    case 'boolean':
      return <Switch checked={!!value} onChange={(_, v) => onChange(v)} />

    case 'color':
      return <TextField value={value} onChange={onChange} />

    case 'slider':
      return (
        <Slider
          value={Math.round((value ?? 1.0) * 100)}
          max={100}
          step={5}
          marks
          valueLabelDisplay="auto"
          onChange={(_, v) => onChange(field.path as keyof T, (v / 100) as T[keyof T])}
        />
      )

    case 'select':
      return (
        <Select
          labelId="select-camera"
          id="select-camera"
          size="small"
          value={value}
          sx={{
            minWidth: '200px'
          }}
          onChange={(_, v) => onChange(field.path as keyof T, v as T[keyof T])}
        >
          {field.options.map((cam) => (
            <MenuItem key={cam.label || 'none'} value={cam.value}>
              {cam.label}
            </MenuItem>
          ))}
        </Select>
      )

    default:
      return null
  }
}

export const FieldPage = (node) => {
  const { node: field, value, onChange } = node

  return (
    <Stack spacing={2}>
      {field.page?.title && <Typography variant="h6">{field.page?.title}</Typography>}

      <SettingsFieldInput field={field} value={value} onChange={onChange} autoFocus />

      {field.page?.description && (
        <Typography variant="body2" color="text.secondary">
          {field.page?.description}
        </Typography>
      )}
    </Stack>
  )
}
