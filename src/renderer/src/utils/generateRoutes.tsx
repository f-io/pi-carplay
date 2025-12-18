import { RouteObject } from 'react-router-dom'
import { SettingsPage } from '../components/pages/newSettings/SettingsPage'
import { SettingsNode } from '../routes'

export const generateRoutes = (node: SettingsNode): RouteObject | null => {
  if (node.type !== 'route') return null

  return {
    path: node.route,
    element: <SettingsPage />,
    children: node.children?.map(generateRoutes).filter((r): r is RouteObject => !!r)
  }
}
