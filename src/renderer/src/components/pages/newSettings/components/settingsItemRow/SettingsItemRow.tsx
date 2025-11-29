import { NavLink } from 'react-router-dom'
import { Typography, Switch } from '@mui/material'
import { StackItem } from '../stackItem'

export const SettingsItemRow = ({ config, item, state, onClick, onChange }) => {
  const cfg = config[item]

  const isItemRoute = cfg.type === 'route' && !!cfg.path

  if (isItemRoute) {
    return (
      <StackItem value={state[item]} withForwardIcon>
        <NavLink to={cfg.path as string}>{cfg.label}</NavLink>
      </StackItem>
    )
  }

  const controlledElement = () => {
    switch (config[item].type) {
      case 'toggle':
        return Switch
      default:
        return Typography
    }
  }

  const Element = controlledElement()

  return (
    <StackItem onClick={onClick}>
      <Typography>{config[item].label}</Typography>

      <Element
        checked={!!state[item]}
        onChange={(e) => onChange(item, e.target.checked)}
        slotProps={{ input: { 'aria-label': item } }}
        style={{
          justifyContent: 'flex-end'
        }}
      >
        {state[item]}
      </Element>
    </StackItem>
  )
}
