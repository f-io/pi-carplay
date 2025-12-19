import { SettingsNode } from '../types'
import { ExtraConfig } from '../../../../main/Globals'

export const appearanceSchema: SettingsNode<ExtraConfig> = {
  type: 'route',
  route: 'appearance',
  label: 'Appearance',
  path: '',
  children: [
    {
      type: 'color',
      label: 'Primary Color Dark',
      path: 'primaryColorDark'
    },
    {
      type: 'color',
      label: 'Primary Color Light',
      path: 'primaryColorLight'
    },
    {
      type: 'color',
      label: 'Highlight Editable Field Dark',
      path: 'highlightEditableFieldDark'
    },
    {
      type: 'color',
      label: 'Highlight Editable Field Light',
      path: 'highlightEditableFieldLight'
    }
  ]
}
