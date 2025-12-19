import { RouteObject } from 'react-router'
import { SettingsPage } from '../components/pages/newSettings/SettingsPage'
import { SettingsNode } from '../routes'
import { ExtraConfig } from '../../../main/Globals'

export const generateRoutes = (node: SettingsNode<ExtraConfig>): RouteObject | null => {
  if (node.type !== 'route') return null

  return {
    path: node.route,
    element: <SettingsPage />,
    children: node.children?.map(generateRoutes).filter((r): r is RouteObject => !!r)
  }
}
