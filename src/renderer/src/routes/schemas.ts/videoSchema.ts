import { SettingsNode } from '../types'
import { ScreenResolution } from '../../components/pages/newSettings/pages/screenResolution'

export const videoSchema: SettingsNode = {
  type: 'route',
  route: 'video',
  label: 'Video',
  children: [
    {
      type: 'route',
      label: 'Stream Resolution',
      route: 'streamResolution',
      children: [
        {
          path: 'width',
          type: 'custom',
          label: 'Stream Resolution',
          component: ScreenResolution
        }
      ]
    },
    {
      type: 'number',
      label: 'FPS',
      path: 'fps',
      page: {
        title: 'FPS',
        description: 'FPS'
      }
    }
  ]
}
