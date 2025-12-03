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
  iBoxVersion: `/${RoutePath.NewSettings}/iBoxVersion`,
  phoneWorkMode: `/${RoutePath.NewSettings}/phoneWorkMode`,
  packetMax: `/${RoutePath.NewSettings}/packetMax`,
  androidAuto: `/${RoutePath.NewSettings}/androidAuto`,
  dpi: `/${RoutePath.NewSettings}/dpi`,
  format: `/${RoutePath.NewSettings}/format`,

  keybindings: `/${RoutePath.NewSettings}/keybindings`,

  about: `/${RoutePath.NewSettings}/about`,

  streamResolution: `/${RoutePath.NewSettings}/streamResolution`,
  fps: `/${RoutePath.NewSettings}/fps`
}
