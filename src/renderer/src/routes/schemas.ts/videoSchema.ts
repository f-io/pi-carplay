import { SettingsNode } from '../types'
import { ScreenResolution } from '../../components/pages/newSettings/pages/screenResolution'
import { ExtraConfig } from '../../../../main/Globals'

export const videoSchema: SettingsNode<ExtraConfig> = {
  type: 'route',
  route: 'video',
  label: 'Video',
  path: '',
  children: [
    {
      type: 'route',
      label: 'Stream Resolution',
      route: 'streamResolution',
      path: '',
      children: [
        {
          path: 'width',
          type: 'custom',
          label: 'Stream Resolution',
          displayValue: true,
          component: ScreenResolution
        }
      ]
    },
    {
      type: 'number',
      label: 'FPS',
      path: 'fps',
      displayValue: true,
      page: {
        title: 'FPS',
        description: 'FPS'
      }
    }
  ]
}
