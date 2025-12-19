import { SettingsNode } from '../types'
import { StreamResolution } from '../../components/pages/newSettings/pages/streamResolution'
import { ExtraConfig } from '@main/Globals'

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
      path: 'height',
      children: [
        {
          path: 'width',
          type: 'custom',
          label: 'Stream Resolution',
          displayValue: true,
          component: StreamResolution
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
