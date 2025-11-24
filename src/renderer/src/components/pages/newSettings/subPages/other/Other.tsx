// import { settingsSubPath } from '@renderer/routes/settings/nested'
import { SettingsLayout } from '@renderer/components/layouts/SettingsLayout'
import { StackItem } from '../StackItem'
import { Typography } from '@mui/material'
import { NavLink } from 'react-router-dom'

export const Other = () => {
  const settingsSubPath = {}
  return (
    <SettingsLayout>
      <StackItem>
        <NavLink to={settingsSubPath?.viewMode}>
          <Typography>UI theme</Typography>
        </NavLink>
      </StackItem>

      <StackItem>
        <NavLink to={settingsSubPath?.advanced}>
          <Typography>Advanced</Typography>
        </NavLink>
      </StackItem>
    </SettingsLayout>
  )
}
