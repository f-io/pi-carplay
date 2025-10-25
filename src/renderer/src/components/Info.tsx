import { useEffect, useMemo, useState } from 'react'
import {
  Typography,
  Box,
  useTheme,
  FormLabel,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
} from '@mui/material'
import { useCarplayStore, useStatusStore } from '../store/store'
import FFTSpectrum from './FFT'

export default function Info() {
  const theme = useTheme()

  const isDongleConnected = useStatusStore((s) => s.isDongleConnected)

  const negotiatedWidth = useCarplayStore((s) => s.negotiatedWidth)
  const negotiatedHeight = useCarplayStore((s) => s.negotiatedHeight)
  const serial = useCarplayStore((s) => s.serial)
  const manufacturer = useCarplayStore((s) => s.manufacturer)
  const product = useCarplayStore((s) => s.product)
  const fwVersion = useCarplayStore((s) => s.fwVersion)

  const audioCodec = useCarplayStore((s) => s.audioCodec)
  const audioSampleRate = useCarplayStore((s) => s.audioSampleRate)
  const audioChannels = useCarplayStore((s) => s.audioChannels)
  const audioBitDepth = useCarplayStore((s) => s.audioBitDepth)

  const isStreaming = useStatusStore((s) => s.isStreaming)
  const pcmData = useCarplayStore((s) => s.audioPcmData) ?? new Float32Array(0)

  const [installedVersion, setInstalledVersion] = useState<string>('—')
  const [latestVersion, setLatestVersion] = useState<string>('—')
  const [latestUrl, setLatestUrl] = useState<string | undefined>(undefined)

  const [upDialogOpen, setUpDialogOpen] = useState(false)
  const [phase, setPhase] = useState<string>('start')
  const [percent, setPercent] = useState<number | null>(null)
  const [received, setReceived] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [error, setError] = useState<string>('')

  const highlight = (val: any) =>
    val != null ? theme.palette.primary.main : theme.palette.text.primary

  const Row = (label: string, value: any, color?: string) => (
    <Typography>
      <Box component="span" sx={{ color: theme.palette.text.secondary, mr: 0.5 }}>
        {label}:
      </Box>
      <Box component="span" sx={{ color: color ?? highlight(value), fontWeight: 400 }}>
        {value ?? '—'}
      </Box>
    </Typography>
  )

  const parseSemver = (v?: string): number[] | null => {
    if (!v) return null
    const m = v.trim().match(/^(\d+)\.(\d+)\.(\d+)$/)
    if (!m) return null
    return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)]
  }
  const cmpSemver = (a: number[], b: number[]) => {
    for (let i = 0; i < 3; i++) {
      if ((a[i] || 0) < (b[i] || 0)) return -1
      if ((a[i] || 0) > (b[i] || 0)) return 1
    }
    return 0
  }

  const installedSem = useMemo(() => parseSemver(installedVersion), [installedVersion])
  const latestSem = useMemo(() => parseSemver(latestVersion), [latestVersion])
  const hasLatest = !!latestUrl && !!latestSem
  const cmp = useMemo(
    () => (installedSem && latestSem ? cmpSemver(installedSem, latestSem) : null),
    [installedSem, latestSem]
  )

  const actionLabel =
    !hasLatest ? 'CHECK' : cmp! < 0 ? 'UPDATE' : cmp! > 0 ? 'DOWNGRADE' : 'UP TO DATE'
  const actionEnabled =
    !hasLatest ? true : cmp! !== null && cmp! !== 0 // enable only if different when we have latest

  const recheckLatest = async () => {
    try {
      const r = await (window as any)?.app?.getLatestRelease?.()
      if (r?.version) setLatestVersion(r.version)
      else setLatestVersion('—')
      setLatestUrl(r?.url)
    } catch {
      setLatestVersion('—')
      setLatestUrl(undefined)
    }
  }

  useEffect(() => {
    const w = window as any
    w?.app?.getVersion?.().then((v: string) => v && setInstalledVersion(v))
    recheckLatest()
  }, [])

  useEffect(() => {
    if (isDongleConnected) {
      window.carplay.usb.getDeviceInfo().then((info) => {
        if (info.device) {
          useCarplayStore.setState({
            serial: info.serialNumber,
            manufacturer: info.manufacturerName,
            product: info.productName,
            fwVersion: info.fwVersion,
          })
        }
      })
    } else {
      useCarplayStore.getState().resetInfo()
    }
  }, [isDongleConnected])

  useEffect(() => {
    const w = window as any
    const off1 = w?.app?.onUpdateEvent?.((e: any) => {
      if (e?.phase === 'error') setError(String(e?.message || 'Update failed'))
      setPhase(e?.phase || '')
    })
    const off2 = w?.app?.onUpdateProgress?.((p: any) => {
      setPhase(p?.phase || 'download')
      if (typeof p?.percent === 'number') setPercent(Math.max(0, Math.min(1, p.percent)))
      if (typeof p?.received === 'number') setReceived(p.received)
      if (typeof p?.total === 'number') setTotal(p.total)
    })
    return () => {
      off1 && off1()
      off2 && off2()
    }
  }, [])

  const triggerUpdate = () => {
    setError('')
    setPercent(null)
    setReceived(0)
    setTotal(0)
    setPhase('start')
    setUpDialogOpen(true)
    ;(window as any)?.app?.performUpdate?.(latestUrl)
  }

  const onPrimaryAction = () => {
    if (!hasLatest) {
      recheckLatest()
      return
    }
    if (cmp !== 0) triggerUpdate()
  }

  const pct = percent != null ? Math.round(percent * 100) : null
  const human = (n: number) =>
    n >= 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`

  const phaseText =
    phase === 'download'
      ? 'Downloading'
      : phase === 'installing'
      ? 'Installing'
      : phase === 'mounting'
      ? 'Mounting image'
      : phase === 'copying'
      ? 'Copying'
      : phase === 'unmounting'
      ? 'Finalizing'
      : phase === 'relaunching'
      ? 'Relaunching'
      : phase === 'start'
      ? 'Starting…'
      : phase === 'error'
      ? 'Error'
      : 'Working…'

  return (
    <Box
      className={theme.palette.mode === 'dark' ? 'App-header-dark' : 'App-header-light'}
      p={2}
      display="flex"
      flexDirection="column"
      height="100vh"
    >
      <Box sx={{ overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, pt: 2, pb: 1, px: 1.5 }}>
        <Box display="flex" flexWrap="wrap" columnGap={2} rowGap={2} sx={{ px: 1 }}>
          {/* Col 1: Hardware */}
          <Box sx={{ flex: '1 1 32%', minWidth: 220 }}>
            <FormLabel sx={{ mb: 1 }}>HARDWARE INFO</FormLabel>
            <Stack spacing={0.5} sx={{ pl: 1.5 }}>
              {Row('Serial', serial)}
              {Row('Manufacturer', manufacturer)}
              {Row('Product', product)}
              {Row('Firmware', fwVersion)}
            </Stack>
          </Box>

          {/* Col 2: Phone + Video */}
          <Box sx={{ flex: '1 1 32%', minWidth: 220 }}>
            <FormLabel sx={{ mb: 1 }}>PHONE</FormLabel>
            <Stack spacing={0.5} sx={{ pl: 1.5, mb: 2 }}>
              {Row('Connected', isStreaming ? 'Yes' : 'No', isStreaming ? theme.palette.success.main : undefined)}
            </Stack>

            <FormLabel sx={{ mb: 1 }}>VIDEO INFO</FormLabel>
            <Stack spacing={0.5} sx={{ pl: 1.5 }}>
              {Row(
                'Resolution',
                negotiatedWidth && negotiatedHeight ? `${negotiatedWidth}×${negotiatedHeight}` : '—'
              )}
            </Stack>
          </Box>

          {/* Col 3: Software */}
          <Box sx={{ flex: '1 1 22%', minWidth: 200 }}>
            <FormLabel sx={{ mb: 1 }}>SOFTWARE</FormLabel>
            <Stack spacing={1} sx={{ pl: 1.5 }}>
              {Row('Installed', installedVersion)}
              {Row('Available', latestVersion)}
              <Button
                size="small"
                variant="outlined"
                disabled={!actionEnabled}
                onClick={onPrimaryAction}
                sx={{ alignSelf: 'flex-start' }}
              >
                {actionLabel}
              </Button>
            </Stack>
          </Box>

          {/* Audio + FFT */}
          <Box sx={{ flex: '1 1 100%', display: 'flex', flexWrap: 'nowrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 40%', minWidth: 240, alignSelf: 'center' }}>
              <FormLabel sx={{ mb: 1 }}>AUDIO INFO</FormLabel>
              <Stack spacing={0.5} sx={{ pl: 1.5 }}>
                {Row('Codec', audioCodec)}
                {Row('Samplerate', audioSampleRate ? `${audioSampleRate} Hz` : '—')}
                {Row('Channels', audioChannels)}
                {Row('Bit depth', audioBitDepth ? `${audioBitDepth} bit` : '—')}
              </Stack>
            </Box>

            <Box
              sx={{
                flex: '1 1 60%',
                minWidth: 240,
                height: { xs: 150, sm: 200, md: 250 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FFTSpectrum data={pcmData} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Update progress dialog */}
      <Dialog open={upDialogOpen} onClose={() => false as any}>
        <DialogTitle>Software Update</DialogTitle>
        <DialogContent sx={{ width: 360 }}>
          <Typography sx={{ mb: 1 }}>{phaseText}</Typography>
          <LinearProgress
            variant={pct != null ? 'determinate' : 'indeterminate'}
            value={pct != null ? pct : undefined}
          />
          {pct != null && total > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
              {pct}% • {human(received)} / {human(total)}
            </Typography>
          )}
          {error && (
            <Typography variant="body2" sx={{ mt: 1 }} color="error">
              {error}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 1 }} color="text.secondary">
            The app will relaunch automatically when finished.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  )
}
