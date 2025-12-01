import { SettingsLayout } from '@renderer/components/layouts/SettingsLayout'
import { useCarplayStore } from '@store/store'
import { useSmartSettings } from '../../hooks/useSmartSettings'
import { WiFiTypeSettingKey } from './types'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'

export const WifiType: React.FC = () => {
  // FIXME types
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const settings = useCarplayStore((s) => s.settings)

  const initialState: Record<WiFiTypeSettingKey, number | string | boolean> = {
    wifiType: settings?.wifiType
  }

  const { state: settingsState, handleFieldChange, save } = useSmartSettings(initialState, settings)

  return (
    <SettingsLayout onSave={save}>
      <ToggleButtonGroup
        value={settingsState.wifiType}
        exclusive
        onChange={(e, value) => handleFieldChange(key, value)}
        aria-label="text alignment"
      >
        {['2.4ghz', '5ghz'].map((variant, index) => {
          return (
            <ToggleButton
              size="small"
              value={variant}
              sx={{
                minWidth: '100px'
              }}
              aria-label={index === 0 ? 'left aligned' : 'justified'}
            >
              {variant}
            </ToggleButton>
          )
        })}
      </ToggleButtonGroup>
    </SettingsLayout>
  )
}
