import { General } from '../../components/pages/newSettings/pages'
import { RouteProps } from '../types'
import { settingsPaths } from './paths'
import { ConnectionAndNetwork } from '../../components/pages/newSettings/pages/connectionAndNetwork'
import { CarName } from '../../components/pages/newSettings/pages/carName'

export const settingsSubRoutes: RouteProps[] = [
  {
    path: settingsPaths.general,
    component: General,
    title: 'General',
    level: 1
  },
  // Other first level
  {
    path: settingsPaths.connectionAndNetwork,
    component: ConnectionAndNetwork,
    title: 'Connection and Network',
    level: 2
  },
  // Other second level
  {
    path: settingsPaths.carname,
    component: CarName,
    title: 'Car Name',
    level: 3
  }
  // // Other third level
]
