import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { NavLink } from 'react-router-dom'
import { map } from 'lodash'
import { StackItem } from './components/stackItem/StackItem'
import { useTheme } from '@mui/material'
import { RouteProps } from '../../../routes'
import { settingsSubRoutes } from '../../../routes/settings/settings'

export const NewSettings = () => {
  const theme = useTheme()

  const filteredByLevel = settingsSubRoutes.filter(({ level }) => level === 1)

  return (
    <Box
      id="settings-root"
      className={theme.palette.mode === 'dark' ? 'App-header-dark' : 'App-header-light'}
      sx={{
        px: 3.5,
        py: 2.25,
        display: 'flex',
        flexDirection: 'column'
      }}
      height="calc(100vh - 64px)"
    >
      <Stack spacing={0} sx={{ overflow: 'auto', height: '100%' }}>
        {map(filteredByLevel, (item: RouteProps, index: number) => {
          return (
            <StackItem key={index} withForwardIcon>
              <NavLink to={item.path} key={index}>
                {item.title}
              </NavLink>
            </StackItem>
          )
        })}
      </Stack>
    </Box>
  )
}
