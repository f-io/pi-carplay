import { SettingsLayout } from '@renderer/components/layouts'
import { Typography } from '@mui/material'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { StackItem } from '../StackItem'
import { useCarplayStore } from '@store/store'
import { dialogsConfig } from '../../components/dialog/config'
import { useSettingsDialogs } from '../../hooks'
import { AudioSettingKey } from './types'
import { audioSettingsUIConfig } from './config'
import { useSmartSettings } from '../../hooks/useSmartSettings'
import { get } from 'lodash'
import { EMPTY_STRING } from '@renderer/constants'

export const Audio = () => {
  const settings = useCarplayStore((s) => s.settings)

  const initialState: Record<AudioSettingKey, number> = {
    mediaDelay: settings?.mediaDelay ?? 0,
    audioVolume: settings?.audioVolume ?? 0,
    navVolume: settings?.navVolume ?? 0,
    mediaSound: settings?.mediaSound ?? 0
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

  const stackItems = (Object.keys(audioSettingsUIConfig) as AudioSettingKey[])
    .filter((key) => key !== 'mediaSound')
    .map((key) => {
      const cfg = audioSettingsUIConfig[key]
      return (
        <StackItem key={key} onClick={() => cfg.dialog && onToggleDialog(cfg.dialog!, true)}>
          <Typography>{cfg.label}</Typography>
          <Typography
            sx={{
              justifyContent: 'flex-end'
            }}
          >
            {cfg.display ? cfg.display(settingsState) : get(settingsState[key], '', EMPTY_STRING)}
          </Typography>
        </StackItem>
      )
    })

  return (
    <SettingsLayout onSave={save}>
      {stackItems}
      <StackItem>
        <Typography>{audioSettingsUIConfig['mediaSound'].label}</Typography>

        <Select
          labelId="select-camera"
          id="select-camera"
          size="small"
          value={settingsState['mediaSound']}
          sx={{
            minWidth: '200px'
          }}
          onChange={(e) => handleFieldChange('mediaSound', e.target.value)}
        >
          <MenuItem value={0}>44.1 kHz</MenuItem>
          <MenuItem value={1}>48 kHz</MenuItem>
        </Select>
      </StackItem>
      {dialog && dialog()}
    </SettingsLayout>
  )
}
