import { ExtraConfig } from '../../../main/Globals'
import { useEffect, useState } from 'react'
import Grid from '@mui/material/Grid'
import { Box, Button, Modal, Paper, styled, Typography } from '@mui/material'

interface KeyBindingsProps {
  settings: ExtraConfig
  updateKey: (key: keyof ExtraConfig, value: any) => void
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary
}))

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  justifyContent: 'center'
}

export function KeyBindings({ settings, updateKey }: KeyBindingsProps) {
  const [keyToBind, setKeyToBind] = useState<string>('')
  const [openWaiting, setOpenWaiting] = useState<boolean>(false)

  useEffect(() => {
    if (!openWaiting) {
      return
    }

    const handler = (e: KeyboardEvent) => setKey(e)
    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [openWaiting])

  const awaitKeyPress = (keyName: string) => {
    setKeyToBind(keyName)
    setOpenWaiting(true)
  }

  const setKey = (keyPressed: KeyboardEvent) => {
    const oldBindings = { ...settings.bindings }
    oldBindings[keyToBind] = keyPressed.code
    updateKey('bindings', oldBindings)
    setOpenWaiting(false)
    setKeyToBind('')
  }

  return (
    <>
      <Grid container spacing={2}>
        {Object.entries(settings.bindings).map(([action, code]) => (
          <Grid size={{ xs: 3 }} key={action}>
            <Item>
              <Typography variant="subtitle2">{action}</Typography>
              <Button variant="outlined" onClick={() => awaitKeyPress(action)}>
                {code}
              </Button>
            </Item>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={openWaiting}
        onClose={() => setOpenWaiting(false)}
        aria-labelledby="await-key-bind-title"
        aria-describedby="await-key-bind-description"
      >
        <Box sx={style}>
          <Typography id="await-key-bind-title" variant="h6">
            Press key for “{keyToBind}”
          </Typography>
        </Box>
      </Modal>
    </>
  )
}
