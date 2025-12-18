import { useCarplayStore } from '@store/store'
import { SettingsLayout } from '../../layouts'
import { useSmartSettingsFromSchema } from './hooks/useSmartSettingsFromSchema'
import { settingsSchema } from '../../../routes/schemas.ts/schema'
import { useNavigate, useParams } from 'react-router-dom'
import { StackItem } from './components'
import { getNodeByPath, getValueByPath } from './utils'
import { Typography } from '@mui/material'
import { SettingsFieldPage } from './components/SettingsFieldPage'
import { SettingsFieldRow } from './components/SettingsFieldRow'
import { Key } from 'react'
import { SettingsNode } from 'renderer/src/routes'

export const SettingsPage = () => {
  const navigate = useNavigate()
  const { '*': splat } = useParams()

  const path = splat ? splat.split('/') : []

  const node = getNodeByPath(settingsSchema, path)
  const settings = useCarplayStore((s) => s.settings)

  const { state, isDirty, handleFieldChange, save } = useSmartSettingsFromSchema(
    settingsSchema,
    settings
  )

  if (!node) return null

  if ('path' in node && node.page) {
    return (
      <SettingsLayout onSave={save} isDirty={isDirty}>
        <SettingsFieldPage
          node={node}
          value={getValueByPath(state, node.path)}
          onChange={(v) => handleFieldChange(node.path, v)}
        />
      </SettingsLayout>
    )
  }

  const children = node.children ?? []

  return (
    <SettingsLayout onSave={save} isDirty={isDirty}>
      {children.map((child: SettingsNode, index: Key | null | undefined) => {
        if (child.type === 'route') {
          return (
            <StackItem key={index} withForwardIcon onClick={() => navigate(child.route)}>
              <Typography>{child.label}</Typography>
            </StackItem>
          )
        }

        if (child.type === 'custom') {
          return <child.component key={child.label} />
        }

        return (
          <SettingsFieldRow
            key={child.path}
            node={child}
            value={getValueByPath(state, child.path)}
            onChange={(v) => handleFieldChange(child.path, v)}
            onClick={child.page ? () => navigate(child.path) : undefined}
          />
        )
      })}
    </SettingsLayout>
  )
}
