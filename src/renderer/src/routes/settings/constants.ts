import { RoutePath } from '../types'

export const settingsPaths = {
  general: `/${RoutePath.NewSettings}/general`,
  audio: `/${RoutePath.NewSettings}/audio`,
  video: `/${RoutePath.NewSettings}/video`,
  appearance: `/${RoutePath.NewSettings}/appearance`
}

export const settingsSubPath = {
  connectionNetwork: `${settingsPaths.general}/connectionNetwork`,
  devicesSources: `${settingsPaths.general}/devicesSources`,
  dongle: `${settingsPaths.general}/dongle`,
  keybindings: `${settingsPaths.general}/keybindings`,
  about: `${settingsPaths.general}/about`,
  ui: `${settingsPaths.appearance}/ui`
}
