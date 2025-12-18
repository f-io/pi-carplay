import { SettingsNode } from '../types'

export const audioSchema: SettingsNode = {
  type: 'route',
  route: 'audio',
  label: 'Audio',
  children: [
    {
      type: 'slider',
      label: 'Music',
      path: 'audioVolume',
      page: {
        title: 'Music',
        description: 'Music'
      }
    },
    {
      type: 'slider',
      label: 'Navigation',
      path: 'navVolume',
      page: {
        title: 'Navigation',
        description: 'Navigation'
      }
    },
    {
      type: 'slider',
      label: 'Siri',
      path: 'siriVolume',
      page: {
        title: 'Siri',
        description: 'Siri'
      }
    },
    {
      type: 'slider',
      label: 'Phone call',
      path: 'callVolume',
      page: {
        title: 'Phone call',
        description: 'Phone call'
      }
    },
    {
      type: 'number',
      label: 'Audio Buffering',
      path: 'audioJitterMs', // TODO is it correct path in the config.json?
      page: {
        title: 'Audio Buffering',
        description: 'Audio Buffering'
      }
    },
    {
      type: 'select',
      label: 'Sampling Frequency',
      path: 'camera',
      options: [
        {
          label: '44.1 kHz',
          value: 0
        },
        {
          label: '48 kHz',
          value: 1
        }
      ],
      page: {
        title: 'Sampling Frequency',
        description: 'Sampling Frequency'
      }
    },
    {
      type: 'select',
      label: 'Call Quality',
      path: 'callquality',
      options: [
        {
          label: 'Low',
          value: 0
        },
        {
          label: 'Medium',
          value: 1
        },
        {
          label: 'High',
          value: 2
        }
      ],
      page: {
        title: 'Call Quality',
        description: 'Call Quality'
      }
    },
    {
      type: 'checkbox',
      label: 'Audio',
      path: 'audio'
    }
  ]
}
