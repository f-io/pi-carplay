import { RoutePath, RouteProps } from '../types'
import { NewSettings } from '../../components/pages'
import { settingsPaths } from './constants'
import {
  General,
  Audio,
  Video,
  // KeyBindings,
  // Advanced,
  Other
  // Sources,
  // UiTheme,
  // About
} from '../../components/pages/newSettings/subPages'
import { generalRoutes } from './general'
import { appearanceRoutes } from './appearance'

export const settingsRoutes: () => RouteProps = () => {
  return [
    {
      path: `/${RoutePath.NewSettings}`,
      component: NewSettings
    },
    {
      path: settingsPaths.general,
      component: () => <General routes={generalRoutes} />,
      title: 'General',
      order: 0
    },
    {
      path: settingsPaths.video,
      component: Video,
      title: 'Video',
      order: 1
    },
    {
      path: settingsPaths.audio,
      component: Audio,
      title: 'Audio',
      order: 2
    },
    {
      path: settingsPaths.appearance,
      component: Other,
      title: 'Appearance',
      order: 3,
      sub: appearanceRoutes
    }
  ]
}
