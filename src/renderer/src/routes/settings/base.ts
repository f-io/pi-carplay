import { RoutePath, RouteProps } from '../types'
import { settingsSubRoutes } from './settings'
import { NewSettings } from '../../components/pages'

export const settingsRoutes: RouteProps[] = [
  {
    path: `/${RoutePath.NewSettings}`,
    component: NewSettings
  },
  ...settingsSubRoutes
]
