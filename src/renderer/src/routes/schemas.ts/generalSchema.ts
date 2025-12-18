import { About } from '../../components/pages/newSettings/pages/about'
import { KeyBindings } from '../../components/pages/newSettings/pages/keybindings'
import { SettingsNode } from '../types'

export const generalSchema: SettingsNode = {
  route: 'general',
  label: 'General',
  type: 'route',
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
      children: [
        {
          type: 'string',
          label: 'Car name',
          path: 'carName',
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
          children: [
            {
              type: 'number',
              label: 'Wi-Fi number',
              path: 'wifiType',
              page: {
                title: 'Wi-Fi number',
                description: 'Wi-Fi number'
              }
            },
            {
              type: 'number',
              label: 'Wi-Fi channel',
              path: 'wifiChannel',
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
      children: [
        {
          type: 'select',
          label: 'Camera',
          path: 'camera',
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
      route: 'main.dongle',
      children: [
        {
          type: 'number',
          label: 'iBox Version',
          path: 'iBoxVersion',
          page: {
            title: 'iBox Version',
            description: 'iBox Version'
          }
        },
        {
          type: 'number',
          label: 'Phone Work Mode',
          path: 'phoneWorkMode',
          page: {
            title: 'Phone Work Mode',
            description: 'Phone Work Mode'
          }
        },
        {
          type: 'number',
          label: 'Packet Max',
          path: 'packetMax',
          page: {
            title: 'Packet Max',
            description: 'Packet Max'
          }
        },
        {
          type: 'route',
          route: 'androidauto',
          label: 'Android Auto',
          children: [
            {
              type: 'number',
              label: 'DPI',
              path: 'dpi',
              page: {
                title: 'DPI',
                description: 'DPI'
              }
            },
            {
              type: 'number',
              label: 'Format',
              path: 'format',
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
      page: {
        title: 'Car specific Audio Delay',
        description: 'Car specific Audio Delay'
      }
    },
    {
      type: 'route',
      label: 'Keybindings',
      route: 'keybindings',
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
