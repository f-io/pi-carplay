import { ExtraConfig } from "../../../main/Globals"
import React, { useEffect, useState } from "react"
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
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { TransitionProps } from '@mui/material/transitions'
import { KeyBindings } from "./KeyBindings"
import { useCarplayStore } from "../store/store"

interface SettingsProps {
  settings: ExtraConfig;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Settings({ settings }: SettingsProps) {
  const [activeSettings, setActiveSettings] = useState<ExtraConfig>(settings);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [openBindings, setOpenBindings] = useState(false);
  const saveSettings = useCarplayStore(s => s.saveSettings);
  const theme = useTheme();

  const settingsChange = (key: keyof ExtraConfig, value: any) => {
    setActiveSettings(prev => ({ ...prev, [key]: value }));
  };

  const requiresRestartParams: (keyof ExtraConfig)[] = [
    'width', 'height', 'fps', 'dpi', 'format', 
    'mediaDelay', 'phoneWorkMode', 'wifiType', 'micType',
    'camera', 'microphone'
  ];
  
  const handleSave = async () => {
    const needsRestart = Object.keys(activeSettings).some(
      (key) =>
        requiresRestartParams.includes(key as keyof ExtraConfig) &&
        activeSettings[key] !== settings[key]
    );
  
    await saveSettings(activeSettings);
  
    if (!needsRestart) return;
  
    try {
      console.log('[Settings] Dongle wird hart zurückgesetzt…');
      const ok = await window.carplay.usb.forceReset()
      console.log(
        ok
          ? 'Dongle erfolgreich hardware‐zurückgesetzt'
          : 'Dongle‐Hardware‐Reset fehlgeschlagen'
      )
    } catch (error) {
      console.error('[Settings] USB-Reset Error:', error);
    }
  };
  
  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices?.()
      .then(devices => {
        setMicrophones(devices.filter(d => d.kind === 'audioinput'));
        setCameras(devices.filter(d => d.kind === 'videoinput'));
      }).catch(() => {
        setCameras([]);
        setMicrophones([]);
      });
  }, []);

  const renderField = (label: string, key: keyof ExtraConfig) => (
    <Grid size={{ xs: 3 }} key={String(key)}>
      <TextField
        label={label}
        type="number"
        fullWidth
        value={activeSettings[key] as number | string}
        onChange={e => settingsChange(key, e.target.value)}
        sx={{ mx: 1 }}
      />
    </Grid>
  );

  const renderCameras = () => (
    <Grid size={{ xs: 6 }}>
      <FormControl fullWidth>
        <FormLabel>Camera</FormLabel>
        <RadioGroup
          value={activeSettings.camera}
          onChange={e => settingsChange('camera', e.target.value)}
        >
          {cameras.map(cam => (
            <FormControlLabel
              key={cam.deviceId}
              value={cam.deviceId}
              control={<Radio />}
              label={cam.label || 'Camera'}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Grid>
  );

  const renderMicrophones = () => (
    <Grid size={{ xs: 6 }}>
      <FormControl fullWidth>
        <FormLabel>Microphone</FormLabel>
        <RadioGroup
          value={activeSettings.microphone}
          onChange={e => settingsChange('microphone', e.target.value)}
        >
          {microphones.map(mic => (
            <FormControlLabel
              key={mic.deviceId}
              value={mic.deviceId}
              control={<Radio />}
              label={mic.label || 'Microphone'}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Grid>
  );

  return (
    <>
      <Box className={theme.palette.mode === 'dark' ? 'App-header-dark' : 'App-header-light'} p={2}>
        <Grid container spacing={2}>
          {renderField('WIDTH', 'width')}
          {renderField('HEIGHT', 'height')}
          {renderField('FPS', 'fps')}
          {renderField('DPI', 'dpi')}
          {renderField('FORMAT', 'format')}
          {renderField('IBOX VERSION', 'iBoxVersion')}
          {renderField('MEDIA DELAY', 'mediaDelay')}
          {renderField('PHONE WORK MODE', 'phoneWorkMode')}

          <Grid size={{ xs: 3 }}>
            <Stack direction="column" spacing={1} sx={{ mx: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeSettings.kiosk}
                    onChange={e => settingsChange('kiosk', e.target.checked)}
                  />
                }
                label="KIOSK"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeSettings.nightMode}
                    onChange={e => settingsChange('nightMode', e.target.checked)}
                  />
                }
                label="DARK MODE"
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <FormControl component="fieldset" fullWidth sx={{ mx: 1 }}>
              <FormLabel component="legend">WIFI TYPE</FormLabel>
              <RadioGroup
                row
                value={activeSettings.wifiType}
                onChange={e => settingsChange('wifiType', e.target.value)}
              >
                <FormControlLabel value="2.4ghz" control={<Radio />} label="2.4G" />
                <FormControlLabel value="5ghz" control={<Radio />} label="5G" />
              </RadioGroup>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 3 }}>
            <FormControl component="fieldset" fullWidth sx={{ mx: 1 }}>
              <FormLabel component="legend">MIC TYPE</FormLabel>
              <RadioGroup
                row
                value={activeSettings.micType}
                onChange={e => settingsChange('micType', e.target.value)}
              >
                <FormControlLabel value="os" control={<Radio />} label="OS" />
                <FormControlLabel value="box" control={<Radio />} label="BOX" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {cameras.length > 0 && renderCameras()}
          {microphones.length > 0 && renderMicrophones()}

          <Grid size={{ xs: 12 }}>
            <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleSave}>
                SAVE
              </Button>
              <Button variant="outlined" onClick={() => setOpenBindings(true)} sx={{ ml: 2 }}>
                BINDINGS
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

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
    </>
  );
}