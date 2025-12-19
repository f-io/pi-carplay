import { About } from '../../components/pages/newSettings/pages/about'
import { KeyBindings } from '../../components/pages/newSettings/pages/keybindings'
import { SettingsNode } from '../types'
import { ExtraConfig } from '../../../../main/Globals'

export const generalSchema: SettingsNode<ExtraConfig> = {
  route: 'general',
  label: 'General',
  type: 'route',
  path: '',
  children: [
    {
      type: 'checkbox',
      label: 'Fullscreen',
      path: 'kiosk'
    },
    {
      type: 'route',
      route: 'connections',
      label: 'Connections',
      path: '',
      children: [
        {
          type: 'string',
          label: 'Car name',
          path: 'carName',
          displayValue: true,
          page: {
            title: 'Car name',
            description: 'Car name'
          }
        },
        {
          type: 'checkbox',
          label: 'Auto Connect',
          path: 'autoConn'
        },
        {
          type: 'route',
          route: 'wifi',
          label: 'Wi-Fi',
          path: '',
          children: [
            {
              type: 'number',
              label: 'Wi-Fi number',
              path: 'wifiType',
              displayValue: true,
              page: {
                title: 'Wi-Fi number',
                description: 'Wi-Fi number'
              }
            },
            {
              type: 'number',
              label: 'Wi-Fi channel',
              path: 'wifiChannel',
              displayValue: true,
              page: {
                title: 'Wi-Fi channel',
                description: 'Wi-Fi channel'
              }
            }
          ]
        }
      ]
    },
    {
      type: 'route',
      label: 'Devices & Sources',
      route: 'deviceandsources',
      path: '',
      children: [
        {
          type: 'select',
          label: 'Camera',
          path: 'camera',
          displayValue: true,
          options: [
            {
              label: 'string',
              value: 'string'
            }
          ],
          page: {
            title: 'Camera',
            description: 'Camera'
          }
        },
        {
          type: 'select',
          label: 'Mic type',
          path: 'micType',
          displayValue: true,
          options: [
            {
              label: 'string',
              value: 'string'
            }
          ],
          page: {
            title: 'Mic type',
            description: 'Mic type'
          }
        }
      ]
    },
    {
      type: 'route',
      label: 'Advanced Dongle Parameters',
      route: 'dongle',
      path: '',
      children: [
        {
          type: 'number',
          label: 'iBox Version',
          path: 'iBoxVersion',
          displayValue: true,
          page: {
            title: 'iBox Version',
            description: 'iBox Version'
          }
        },
        {
          type: 'number',
          label: 'Phone Work Mode',
          path: 'phoneWorkMode',
          displayValue: true,
          page: {
            title: 'Phone Work Mode',
            description: 'Phone Work Mode'
          }
        },
        {
          type: 'number',
          label: 'Packet Max',
          path: 'packetMax',
          displayValue: true,
          page: {
            title: 'Packet Max',
            description: 'Packet Max'
          }
        },
        {
          type: 'route',
          route: 'androidauto',
          label: 'Android Auto',
          path: '',
          children: [
            {
              type: 'number',
              label: 'DPI',
              path: 'dpi',
              displayValue: true,
              page: {
                title: 'DPI',
                description: 'DPI'
              }
            },
            {
              type: 'number',
              label: 'Format',
              path: 'format',
              displayValue: true,
              page: {
                title: 'Format',
                description: 'Format'
              }
            }
          ]
        }
      ]
    },
    {
      type: 'number',
      label: 'Car specific Audio Delay',
      path: 'audiodelay',
      displayValue: true,
      page: {
        title: 'Car specific Audio Delay',
        description: 'Car specific Audio Delay'
      }
    },
    {
      type: 'route',
      label: 'Keybindings',
      route: 'keybindings',
      path: '',
      children: [
        {
          path: 'keybindings',
          type: 'custom',
          label: 'Keybindings',
          component: KeyBindings
        }
      ]
    },
    {
      type: 'route',
      label: 'About',
      route: 'about',
      path: '',
      children: [
        {
          path: 'about',
          type: 'custom',
          label: 'About',
          component: About
        }
      ]
    }
  ]
}
