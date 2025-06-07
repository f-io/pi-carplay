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
import { useCarplayStore } from "../store/store"
import debounce from 'lodash.debounce'

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
  const [activeSettings, setActiveSettings] = useState<ExtraConfig>({
    ...settings,
    audioVolume: settings.audioVolume ?? 1.0,
    navVolume: settings.navVolume ?? 1.0,
  });

  const [micLabel, setMicLabel] = useState<string>('no device available');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [openBindings, setOpenBindings] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string>("");
  const [closeCountdown, setCloseCountdown] = useState<number>(0);
  const [hasChanges, setHasChanges] = useState(false);
  const saveSettings = useCarplayStore(s => s.saveSettings);
  
  
  const theme = useTheme();

  const debouncedSave = useMemo(
    () => debounce((newSettings: ExtraConfig) => saveSettings(newSettings), 300),
    [saveSettings]
  );

  useEffect(() => () => { debouncedSave.cancel(); }, [debouncedSave]);

  const requiresRestartParams: (keyof ExtraConfig)[] = [
    'width','height','fps','dpi','format',
    'mediaDelay','phoneWorkMode','wifiType','micType','camera'
  ];

  const settingsChange = (key: keyof ExtraConfig, value: any) => {
    const updated = { ...activeSettings, [key]: value };
    setActiveSettings(updated);
    if (['audioVolume','navVolume','kiosk','nightMode'].includes(key)) {
      debouncedSave(updated);
    } else if (requiresRestartParams.includes(key)) {
      const pending = requiresRestartParams.some(p => updated[p] !== settings[p]);
      setHasChanges(pending);
    } else {
      saveSettings(updated);
    }
  };

  const handleSave = async () => {
    
    setIsResetting(true);
    setResetMessage("Dongle Reset...");
    setCloseCountdown(3);

    try {
      const ok = await window.carplay.usb.forceReset();
      setResetMessage(ok ? "Dongle Reset - Success" : "Dongle Reset - Failed");
    } catch (error) {
      console.error('[Settings] Reset failed:', error);
      setResetMessage("Dongle Reset Error.");
    }

    await saveSettings(activeSettings);
    setHasChanges(false);
    setIsResetting(false);
  };

  useEffect(() => {
    if (!resetMessage) return;
    const timerId = setInterval(() => {
      setCloseCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          setResetMessage("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerId);
  }, [resetMessage]);

  useEffect(() => {
    const updateMic = async () => {
      try {
        const label = await window.carplay.usb.getSysdefaultPrettyName();
        const final = label && !['sysdefault','null'].includes(label) ? label : 'no device available';
        setMicLabel(final);
        if (!activeSettings.microphone && final !== 'no device available') {
          const upd = { ...activeSettings, microphone: 'sysdefault' };
          setActiveSettings(upd);
          debouncedSave(upd);
        }
      } catch { console.warn('[Settings] Mic label fetch failed'); }
    };
    updateMic();
    window.carplay.usb.listenForEvents(updateMic);
        return undefined;
  }, []);

  useEffect(() => {
    navigator.mediaDevices?.enumerateDevices()
      .then(devs => setCameras(devs.filter(d => d.kind === 'videoinput')))
      .catch(err => console.warn('[Settings] enumerateDevices failed', err));
  }, []);

  const renderField = (label: string, key: keyof ExtraConfig, min?: number, max?: number) => (
    <Grid size={{ xs: 3 }} key={String(key)}>
      <TextField
        label={label}
        type="number"
        fullWidth
        inputProps={{ ...(min!==undefined&&{min}), ...(max!==undefined&&{max}) }}
        value={activeSettings[key] as number|string}
        onChange={e => settingsChange(key, Number(e.target.value))}
        sx={{ mx:2, maxWidth:140 }}
      />
    </Grid>
  );

  const renderSliderField = (label: string, key: keyof ExtraConfig) => (
    <Grid size={{ xs: 6 }} key={String(key)}>
      <FormControl fullWidth sx={{ px:2 }}>
        <FormLabel>{label}</FormLabel>
        <Slider
          value={Math.round((activeSettings[key] as number)*100)}
          min={0} max={100} step={5} marks valueLabelDisplay="auto"
          onChange={(_,v) => typeof v==='number' && settingsChange(key,v/100)}
        />
      </FormControl>
    </Grid>
  );

  const renderCameras = () => (
    <Grid size={{ xs: 6 }}>
      <FormControl fullWidth>
        <FormLabel>Camera</FormLabel>
        <RadioGroup value={activeSettings.camera} onChange={e=>settingsChange('camera',e.target.value)}>
          {cameras.map(cam=>(
            <FormControlLabel key={cam.deviceId} value={cam.deviceId} control={<Radio />} label={cam.label||'Camera'} />
          ))}
        </RadioGroup>
      </FormControl>
    </Grid>
  );

  return (
    <>
      <Box className={theme.palette.mode==='dark'?'App-header-dark':'App-header-light'} p={2} display="flex" flexDirection="column" height="100vh">
        <Box sx={{overflowY:'auto', overflowX:'hidden', flexGrow:1, pt:2, pb:1, px:1.5}}>
          <Grid container spacing={2} sx={{ px:1 }}>
            {renderField('WIDTH','width')}
            {renderField('HEIGHT','height')}
            {renderField('FPS','fps')}
            {renderField('DPI','dpi')}
            {renderField('FORMAT','format')}
            {renderField('IBOX VERSION','iBoxVersion')}
            {renderField('MEDIA DELAY','mediaDelay')}
            {renderField('PHONE WORK MODE','phoneWorkMode')}
            {renderSliderField('AUDIO VOLUME','audioVolume')}
            {renderSliderField('NAV VOLUME','navVolume')}
            <Grid size={{xs:3}} sx={{minWidth:140,mx:2,display:'flex',justifyContent:'center'}}>
              <FormControl>
                <FormLabel>&nbsp;</FormLabel>
                <Stack direction="column" spacing={0.5}>
                  <FormControlLabel control={<Checkbox checked={activeSettings.kiosk} onChange={e=>settingsChange('kiosk',e.target.checked)}/>} label="KIOSK"/>
                  <FormControlLabel control={<Checkbox checked={activeSettings.nightMode} onChange={e=>settingsChange('nightMode',e.target.checked)}/>} label="DARK MODE"/>
                </Stack>
              </FormControl>
            </Grid>
            <Grid size={{xs:3}} sx={{minWidth:140,mx:2,display:'flex',justifyContent:'center'}}>
              <FormControl fullWidth>
                <FormLabel>WIFI TYPE</FormLabel>
                <RadioGroup value={activeSettings.wifiType} onChange={e=>settingsChange('wifiType',e.target.value)}>
                  <Stack direction="column">
                    <FormControlLabel value="2.4ghz" control={<Radio />} label="2.4G"/>
                    <FormControlLabel value="5ghz" control={<Radio />} label="5G"/>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid size={{xs:3}} sx={{minWidth:140,mx:2,display:'flex',justifyContent:'center'}}>
              <FormControl fullWidth>
                <FormLabel>MICROPHONE</FormLabel>
                <RadioGroup value={activeSettings.micType} onChange={e=>settingsChange('micType',e.target.value)}>
                  <Stack direction="column">
                    <FormControlLabel value="os" control={<Radio />} label={<Typography noWrap>OS: {micLabel}</Typography>}/>
                    <FormControlLabel value="box" control={<Radio />} label="BOX"/>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Grid>
            {cameras.length>0 && renderCameras()}
          </Grid>
        </Box>
        <Box position="sticky" bottom={0} bgcolor={theme.palette.background.default} display="flex" justifyContent="center" sx={{pt:1,pb:1,borderTop:'0px solid',borderColor:theme.palette.divider}}>
          <Button variant="contained" color={hasChanges?'primary':'inherit'} onClick={handleSave} disabled={isResetting}>SAVE</Button>
          <Button variant="outlined" onClick={()=>setOpenBindings(true)} sx={{ml:2}}>BINDINGS</Button>
        </Box>
        {isResetting && <Box display="flex" justifyContent="center" sx={{mt:2}}><CircularProgress/></Box>}
        <Dialog open={!!resetMessage} onClose={()=>setResetMessage("")}>
          <DialogTitle>Reset Status</DialogTitle>
          <DialogContent sx={{textAlign:'center'}}>
            <Typography variant="body1" sx={{mb:2}}>{resetMessage}</Typography>
            <Box display="flex" justifyContent="center">
              <Button variant="outlined" onClick={()=>setResetMessage("")}>Close{closeCountdown>0?` (${closeCountdown})`:''}</Button>
            </Box>
          </DialogContent>
        </Dialog>
        <Dialog open={openBindings} TransitionComponent={Transition} keepMounted PaperProps={{sx:{minHeight:'80%',minWidth:'80%'}}} onClose={()=>setOpenBindings(false)}>
          <DialogTitle>Key Bindings</DialogTitle>
          <DialogContent><KeyBindings settings={activeSettings} updateKey={settingsChange}/></DialogContent>
        </Dialog>
      </Box>
    </>
  );
}
