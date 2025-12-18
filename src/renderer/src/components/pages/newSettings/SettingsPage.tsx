import { useCarplayStore } from '@store/store'
import { SettingsLayout } from '../../layouts'
import { SettingsNodeRenderer } from './SettingsNodeRenderer'
import { useSmartSettingsFromSchema } from './hooks/useSmartSettingsFromSchema'
import { settingsSchema } from '../../../routes/schemas.ts/schema'
import { useNavigate, useParams } from 'react-router-dom'
import { StackItem } from './components'
import { getNodeByPath, getValueByPath } from './utils'
import { Typography } from '@mui/material'
import { FieldPage } from './components/FieldPage'

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
        <FieldPage
          node={node}
          value={getValueByPath(state, node.path)}
          onChange={(path, v) => handleFieldChange(path, v)}
        />
      </SettingsLayout>
    )
  }

  const children = node.children ?? []

  return (
    <SettingsLayout onSave={save} isDirty={isDirty}>
      {children.map((child, index) => {
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
          <SettingsNodeRenderer
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
