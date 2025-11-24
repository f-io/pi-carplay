import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { NavLink } from 'react-router-dom'
import { settingsRoutes } from '@renderer/routes/settings'
import { map } from 'lodash'
import { StackItem } from './subPages/StackItem'
import { useTheme } from '@mui/material'
import { RouteProp } from '../../../routes'
import { THEME } from '../../../constants'

export const NewSettings = () => {
  const theme = useTheme()
  const _settingsRoutes = settingsRoutes()

  console.log(_settingsRoutes)

  const list = _settingsRoutes
    .slice(1, _settingsRoutes.length)
    .sort((a: RouteProp, b: RouteProp) => (a.order || 0) - (b.order || 0))

  return (
    <Box
      id="settings-root"
      className={theme.palette.mode === THEME.DARK ? 'App-header-dark' : 'App-header-light'}
      sx={{
        px: 3.5,
        py: 2.25,
        display: 'flex',
        flexDirection: 'column'
      }}
      height="calc(100vh - 64px)"
    >
      <Stack spacing={0} sx={{ overflow: 'auto', height: '100%' }}>
        {map(list, (item: RouteProp, index: number) => {
          return (
            <StackItem key={index} withForwardIcon>
              <NavLink to={item.path || '#'} key={index}>
                {item.title}
              </NavLink>
            </StackItem>
          )
        })}
      </Stack>
    </Box>
  )
}
