import { settingsSubPath } from './constants'
import { UiTheme } from '../../components/pages/newSettings/subPages'

export const appearanceRoutes = [
  {
    component: UiTheme,
    title: 'Dark Mode',
    order: 1
  },
  {
    path: settingsSubPath.ui,
    component: UiTheme,
    title: 'UI Accent Colors',
    order: 2
  }
]
