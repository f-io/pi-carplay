import { ExtraConfig } from "../../../main/Globals"
import React, { useEffect, useMemo, useState } from "react"
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Checkbox,
  FormControl,
  FormLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
  Stack,
  Grid,
  Slider,
  CircularProgress,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { TransitionProps } from '@mui/material/transitions'
import { KeyBindings } from "./KeyBindings"
import { useCarplayStore, useStatusStore } from "../store/store"
import { updateCameras as detectCameras } from '../utils/cameraDetection'
import debounce from 'lodash.debounce'

interface SettingsProps {
  settings: ExtraConfig | null
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />
})

const Settings: React.FC<SettingsProps> = ({ settings }) => {
  if (!settings) return null

  const [activeSettings, setActiveSettings] = useState<ExtraConfig>({
    ...settings,
    audioVolume: settings.audioVolume ?? 1.0,
    navVolume: settings.navVolume ?? 1.0,
  })
  const [micLabel, setMicLabel] = useState('no device available')
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([])
  const [openBindings, setOpenBindings] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetMessage, setResetMessage] = useState("")
  const [closeCountdown, setCloseCountdown] = useState(0)
  const [hasChanges, setHasChanges] = useState(false)

  const saveSettings = useCarplayStore(s => s.saveSettings)
  const isDongleConnected = useStatusStore(s => s.isDongleConnected)
  const setCameraFound = useStatusStore(s => s.setCameraFound)
  const theme = useTheme()

  const debouncedSave = useMemo(() => debounce((newSettings: ExtraConfig) => saveSettings(newSettings), 300), [saveSettings])
  useEffect(() => () => debouncedSave.cancel(), [debouncedSave])

  const requiresRestartParams: (keyof ExtraConfig)[] = [
    'width', 'height', 'fps', 'dpi', 'format', 'mediaDelay', 'phoneWorkMode', 'wifiType', 'micType', 'audioTransferMode'
  ]

  const getValidWifiChannel = (wifiType: ExtraConfig['wifiType'], ch?: number): number => {
    if (wifiType === '5ghz') {
      return typeof ch === 'number' && ch >= 36 ? ch : 36
    }
    return typeof ch === 'number' && ch > 0 && ch < 36 ? ch : 6
  }

  const settingsChange = (key: keyof ExtraConfig, value: any) => {
    let updated: ExtraConfig = { ...activeSettings, [key]: value }

    if (key === 'wifiType') {
      updated = {
        ...updated,
        wifiChannel: getValidWifiChannel(value as ExtraConfig['wifiType'], updated.wifiChannel)
      }
    }

    setActiveSettings(updated)

    if (['audioVolume', 'navVolume'].includes(key)) {
      debouncedSave(updated)
    } else if (['kiosk', 'nightMode'].includes(key)) {
      saveSettings(updated)
    } else if (requiresRestartParams.includes(key)) {
      const pending = requiresRestartParams.some(p => updated[p] !== settings[p])
      setHasChanges(pending)
    } else {
      saveSettings(updated)
    }
  }

  const handleSave = async () => {
    setIsResetting(true)
    setCloseCountdown(3)

    let resetStatus = ""
    try {
      if (isDongleConnected) {
        setResetMessage("Dongle Reset...")
        const ok = await window.carplay.usb.forceReset()
        resetStatus = ok ? "Success" : "Failed"
      } else {
        resetStatus = "Settings saved (no dongle connected)"
      }
    } catch {
      resetStatus = "Dongle Reset Error."
    }

    await saveSettings(activeSettings)
    setHasChanges(false)
    setIsResetting(false)
    setResetMessage(resetStatus)
  }

  useEffect(() => {
    if (!resetMessage) return
    const timerId = setInterval(() => {
      setCloseCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerId)
          setResetMessage("")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerId)
  }, [resetMessage])

  useEffect(() => {
    const updateMic = async () => {
      try {
        const label = await window.carplay.usb.getSysdefaultPrettyName()
        const final = label && !['sysdefault', 'null'].includes(label) ? label : 'no device available'
        setMicLabel(final)
        if (!activeSettings.microphone && final !== 'no device available') {
          const upd = { ...activeSettings, microphone: 'sysdefault' }
          setActiveSettings(upd)
          debouncedSave(upd)
        }
      } catch {
        console.warn('[Settings] Mic label fetch failed')
      }
    }
    updateMic()
    const micUsbHandler = (_: any, data: { type: string }) => {
      if (['attach', 'plugged', 'detach', 'unplugged'].includes(data.type)) updateMic()
    }
    window.carplay.usb.listenForEvents(micUsbHandler)
  }, [])

  useEffect(() => {
    detectCameras(setCameraFound, saveSettings, activeSettings).then(setCameras)
    const usbHandler = (_: any, data: { type: string }) => {
      if (['attach', 'plugged', 'detach', 'unplugged'].includes(data.type)) {
        detectCameras(setCameraFound, saveSettings, activeSettings).then(setCameras)
      }
    }
    window.carplay.usb.listenForEvents(usbHandler)
  }, [])

  const renderField = (label: string, key: keyof ExtraConfig, min?: number, max?: number) => (
    <Grid size={{ xs: 3 }} key={String(key)}>
      <TextField
        label={label}
        type="number"
        fullWidth
        inputProps={{ ...(min != null && { min }), ...(max != null && { max }) }}
        value={activeSettings[key] as number | string}
        onChange={e => settingsChange(key, Number(e.target.value))}
        sx={{ mx: 2, maxWidth: 140 }}
      />
    </Grid>
  )

  const renderSliderField = (label: string, key: keyof ExtraConfig) => (
    <Grid size={{ xs: 6 }} key={String(key)}>
      <FormControl fullWidth sx={{ px: 2 }}>
        <FormLabel>{label}</FormLabel>
        <Slider
          value={Math.round((activeSettings[key] as number) * 100)}
          min={0} max={100} step={5} marks valueLabelDisplay="auto"
          onChange={(_, v) => typeof v === 'number' && settingsChange(key, v / 100)}
        />
      </FormControl>
    </Grid>
  )

  const renderCameras = () => (
    <Grid size={{ xs: 'auto' }} sx={{ minWidth: 0, maxWidth: '100%' }}>
      <FormControl fullWidth>
        <FormLabel>CAMERA</FormLabel>
        <RadioGroup
          value={activeSettings.camera}
          onChange={e => settingsChange('camera', e.target.value)}
        >
          <Stack direction="column" sx={{ maxHeight: 220, overflowY: 'auto' }}>
            {cameras.map(cam => (
              <FormControlLabel
                key={cam.deviceId}
                value={cam.deviceId}
                control={<Radio />}
                label={cam.label || 'Camera'}
              />
            ))}
          </Stack>
        </RadioGroup>
      </FormControl>
    </Grid>
  )

  const handleClosePopup = () => {
    setResetMessage("")
    setCloseCountdown(0)
  }

  return (
    <Box className={theme.palette.mode === 'dark' ? 'App-header-dark' : 'App-header-light'} p={2} display="flex" flexDirection="column" height="100vh">
      <Box sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, pt: 2, pb: 1, px: 1.5 }}>
        <Grid container spacing={2} sx={{ px: 1 }}>
          {renderField('WIDTH', 'width', 800)}
          {renderField('HEIGHT', 'height', 480)}
          {renderField('FPS', 'fps', 60)}
          {renderField('DPI', 'dpi')}
          {renderField('FORMAT', 'format')}
          {renderField('IBOX VERSION', 'iBoxVersion')}
          {renderField('MEDIA DELAY', 'mediaDelay')}
          {renderField('PHONE WORK MODE', 'phoneWorkMode')}
          {renderSliderField('AUDIO VOLUME', 'audioVolume')}
          {renderSliderField('NAV VOLUME', 'navVolume')}
        </Grid>

        {/* Panels row with equal, responsive gaps */}
        <Grid
          container
          wrap="nowrap"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{ px: 1, mt: 1, gap: 0 }}
        >
          <Grid size={{ xs: 'auto' }}>
            <FormControl>
              <FormLabel>OPTIONS</FormLabel>
              <Stack direction="column" spacing={0.5}>
                <FormControlLabel control={<Checkbox checked={activeSettings.kiosk} onChange={e => settingsChange('kiosk', e.target.checked)} />} label="KIOSK" />
                <FormControlLabel control={<Checkbox checked={activeSettings.nightMode} onChange={e => settingsChange('nightMode', e.target.checked)} />} label="DARK MODE" />
                <FormControlLabel control={<Checkbox checked={activeSettings.audioTransferMode} onChange={e => settingsChange('audioTransferMode', e.target.checked)} />} label="DISABLE AUDIO" />
              </Stack>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 'auto' }}>
            <FormControl>
              <FormLabel>WIFI</FormLabel>
              <RadioGroup
                value={activeSettings.wifiType}
                onChange={e => settingsChange('wifiType', e.target.value)}
              >
                <Stack direction="column">
                  <FormControlLabel value="2.4ghz" control={<Radio />} label="2.4G" />
                  <FormControlLabel value="5ghz" control={<Radio />} label="5G" />
                </Stack>
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 'auto' }} sx={{ minWidth: 0, maxWidth: '100%' }}>
            <FormControl fullWidth>
              <FormLabel>MICROPHONE</FormLabel>
              <RadioGroup
                value={activeSettings.micType}
                onChange={e => settingsChange('micType', e.target.value)}
              >
                <Stack direction="column">
                  <FormControlLabel value="os" control={<Radio />} label={<Typography noWrap>OS: {micLabel}</Typography>} />
                  <FormControlLabel value="box" control={<Radio />} label="BOX" />
                </Stack>
              </RadioGroup>
            </FormControl>
          </Grid>

          {cameras.length > 0 && renderCameras()}
        </Grid>
      </Box>

      <Box
        position="sticky"
        bottom={0}
        bgcolor="transparent"
        display="flex"
        justifyContent="center"
        sx={{ pt: 1, pb: 1 }}
      >
        <Box
          sx={{
            backgroundColor: theme.palette.background.default,
            px: 2,
            py: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            display: 'flex',
            gap: 2,
          }}
        >
          <Button variant="contained" color={hasChanges ? 'primary' : 'inherit'} onClick={hasChanges ? handleSave : undefined} disabled={!hasChanges || isResetting}>SAVE</Button>
          <Button variant="outlined" onClick={() => setOpenBindings(true)}>BINDINGS</Button>
        </Box>
      </Box>

      {isResetting && <Box display="flex" justifyContent="center" sx={{ mt: 2 }}><CircularProgress /></Box>}

      <Dialog open={!!resetMessage} onClose={handleClosePopup}>
        <DialogTitle>Reset Status</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>{resetMessage}</Typography>
          <Box display="flex" justifyContent="center">
            <Button variant="outlined" onClick={handleClosePopup}>
              Close{closeCountdown > 0 ? ` (${closeCountdown})` : ''}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openBindings}
        TransitionComponent={Transition}
        keepMounted
        PaperProps={{ sx: { minHeight: '80%', minWidth: '80%' } }}
        onClose={() => setOpenBindings(false)}
      >
        <DialogTitle>Key Bindings</DialogTitle>
        <DialogContent>
          <KeyBindings settings={activeSettings} updateKey={settingsChange} />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default Settings;
