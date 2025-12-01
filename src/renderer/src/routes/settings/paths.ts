import { RoutePath } from '../types'

export const settingsPaths = {
  // Base
  general: `/${RoutePath.NewSettings}/general`,
  video: `/${RoutePath.NewSettings}/video`,
  audio: `/${RoutePath.NewSettings}/audio`,
  appearance: `/${RoutePath.NewSettings}/appearance`,

  // General
  connectionAndNetwork: `/${RoutePath.NewSettings}/connectionAndNetwork`,
  carname: `/${RoutePath.NewSettings}/carname`,
  autoconnect: `/${RoutePath.NewSettings}/autoconnect`,
  wifitype: `/${RoutePath.NewSettings}/wifitype`,
  wifiChannel: `/${RoutePath.NewSettings}/wifichannel`,

  // Sources
  deviceAndSources: `/${RoutePath.NewSettings}/deviceAndSources`,
  micType: `/${RoutePath.NewSettings}/micType`,
  camera: `/${RoutePath.NewSettings}/camera`,

  // Single
  audioDelay: `/${RoutePath.NewSettings}/audioDelay`,

  // Dongle params
  dongleParams: `/${RoutePath.NewSettings}/dongleParams`,

  keybindings: `/${RoutePath.NewSettings}/keybindings`,

  about: `/${RoutePath.NewSettings}/about`
}
