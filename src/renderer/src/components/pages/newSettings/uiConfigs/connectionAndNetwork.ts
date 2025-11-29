import { settingsPaths } from '../../../../routes/settings/paths'

export const connectionAndNetworkSettingsUIConfig: Record<
  string,
  {
    label: string
    type: string
    path?: string
  }
> = {
  carName: { label: 'Carname', type: 'route', path: settingsPaths.carname },
  autoConn: { label: 'Autoconnect', type: 'toggle', path: settingsPaths.autoconnect },
  wifiType: { label: 'WiFi type', type: 'route', path: settingsPaths.wifitype },
  wifiChannel: { label: 'WiFi channel', type: 'route', path: settingsPaths.wifiChannel }
}
