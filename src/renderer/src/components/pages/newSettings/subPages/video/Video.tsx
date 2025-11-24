import { SettingsLayout } from '@renderer/components/layouts'
import { Typography } from '@mui/material'
import { StackItem } from '../StackItem'
import { useCarplayStore } from '@store/store'
import { dialogsConfig } from '../../components/dialog/config'
import { useSettingsDialogs } from '../../hooks'
import { VideoSettingKey } from './types'
import { videoSettingsUIConfig } from './config'
import { useSmartSettings } from '../../hooks/useSmartSettings'
import NumberSpinner from '../../components/numberSpinner/numberSpinner'

export const Video = () => {
  const settings = useCarplayStore((s) => s.settings)

  const initialState: Record<VideoSettingKey, number> = {
    width: settings?.width ?? 0,
    height: settings?.height ?? 0,
    fps: settings?.fps ?? 0
  }

  const {
    state: settingsState,
    handleFieldChange,
    resetState,
    save
  } = useSmartSettings(initialState, settings)

  const { dialog, onToggleDialog } = useSettingsDialogs({
    dialogsConfig,
    data: settingsState,
    onSave: save,
    onChange: handleFieldChange,
    onReset: resetState
  })

  const stackItems = (Object.keys(videoSettingsUIConfig) as VideoSettingKey[])
    .filter((key) => key !== 'height' && key !== 'fps')
    .map((key) => {
      const cfg = videoSettingsUIConfig[key]
      return (
        <StackItem key={key}>
          <Typography>{cfg.label}</Typography>
          <div
            style={{
              width: '100%',
              maxWidth: '300px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <NumberSpinner
              rootStyles={{
                top: '-0.5rem'
              }}
              id={key}
              size="small"
              value={settingsState[key]}
              onValueChange={(v) => handleFieldChange(key, v)}
            />
            <span> x </span>
            <NumberSpinner
              rootStyles={{
                top: '-0.5rem'
              }}
              id={key}
              size="small"
              value={settingsState['height']}
              onValueChange={(v) => handleFieldChange('height', v)}
            />
          </div>
          {/*<Typography*/}
          {/*  sx={{*/}
          {/*    justifyContent: 'flex-end'*/}
          {/*  }}*/}
          {/*>*/}
          {/*  {cfg.display ? cfg.display(settingsState) : get(settingsState[key], '', EMPTY_STRING)}*/}
          {/*</Typography>*/}
        </StackItem>
      )
    })

  return (
    <SettingsLayout onSave={save}>
      {stackItems}
      <StackItem>
        <Typography>{videoSettingsUIConfig['fps'].label}</Typography>
        <div style={{ width: '100%', maxWidth: '130px' }}>
          <NumberSpinner
            rootStyles={{
              top: '-0.5rem'
            }}
            id="fps"
            size="small"
            value={settingsState['fps']}
            onValueChange={(v) => handleFieldChange('fps', v)}
          />
        </div>
      </StackItem>
      {dialog && dialog()}
    </SettingsLayout>
  )
}
