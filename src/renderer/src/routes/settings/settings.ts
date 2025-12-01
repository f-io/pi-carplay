import { General } from '../../components/pages/newSettings/pages'
import { RouteProps } from '../types'
import { settingsPaths } from './paths'
import { ConnectionAndNetwork } from '../../components/pages/newSettings/pages/connectionAndNetwork'
import { CarName } from '../../components/pages/newSettings/pages/carName'
import { WifiType } from '../../components/pages/newSettings/pages/wifiType'
import { WifiChannel } from '../../components/pages/newSettings/pages/wifiChannel'
import { DeviceAndSources } from '../../components/pages/newSettings/pages/deviceAndSources'
import { Camera } from '../../components/pages/newSettings/pages/camera'
import { MicType } from '../../components/pages/newSettings/pages/micType'
import { AudioDelay } from '../../components/pages/newSettings/pages/audioDelay'

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
  {
    path: settingsPaths.deviceAndSources,
    component: DeviceAndSources,
    title: 'Device and Sources',
    level: 2
  },
  // Other second level
  {
    path: settingsPaths.carname,
    component: CarName,
    title: 'Car Name',
    level: 3
  },
  {
    path: settingsPaths.wifitype,
    component: WifiType,
    title: 'WiFi Type',
    level: 3
  },
  {
    path: settingsPaths.wifiChannel,
    component: WifiChannel,
    title: 'WiFi Channel',
    level: 3
  },
  {
    path: settingsPaths.camera,
    component: Camera,
    title: 'Camera',
    level: 3
  },
  {
    path: settingsPaths.micType,
    component: MicType,
    title: 'Mic Type',
    level: 3
  },
  {
    path: settingsPaths.audioDelay,
    component: AudioDelay,
    title: 'AudioDelay',
    level: 3
  }
  // // Other third level
]
