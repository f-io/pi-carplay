import { settingsSubPath } from './constants'
import { KeyBindings, UiTheme, About } from '../../components/pages/newSettings/subPages'

export const generalRoutes = [
  {
    component: UiTheme,
    title: 'Fullscreen',
    order: 1
  },
  {
    path: settingsSubPath.connectionNetwork,
    component: UiTheme,
    title: 'Connection & Network',
    order: 2
  },
  {
    path: settingsSubPath.devicesSources,
    component: UiTheme,
    title: 'Devices & Sources',
    order: 3
  },
  {
    component: UiTheme,
    title: 'Car specific Audio Delay',
    order: 4
  },
  {
    path: settingsSubPath.dongle,
    component: UiTheme,
    title: 'Advanced Dongle Parameters',
    order: 5
  },
  {
    path: settingsSubPath.keybindings,
    component: KeyBindings,
    title: 'Keybindings',
    order: 6
  },
  {
    path: settingsSubPath.about,
    component: About,
    title: 'About',
    order: 7
  }
]
