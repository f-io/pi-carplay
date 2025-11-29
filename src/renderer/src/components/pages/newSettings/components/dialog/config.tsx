import { ScreenResolution } from '../../pages/videoAudio/dialogs/ScreenResolution'
import { Fps } from '../../pages/videoAudio/dialogs/Fps'
import { MediaDelay } from '../../pages/videoAudio/dialogs/MediaDelay'
import { AudioVolume } from '../../pages/videoAudio/dialogs/AudioVolume'
import { NavVolume } from '../../pages/videoAudio/dialogs/NavVolume'
import { Dpi } from '../../pages/other/dialogs/Dpi'
import { Format } from '../../pages/other/dialogs/Format'
import { DialogsConfigProps, SETTINGS_DIALOGS } from '../../pages/types'
import { ScreenResolutionProps } from '../../pages/videoAudio/types'

export const dialogsConfig: DialogsConfigProps = {
  [SETTINGS_DIALOGS.SCREEN_RESOLUTION]: {
    title: 'Stream resolution',
    content: (props: ScreenResolutionProps) => <ScreenResolution {...props} />
  },
  [SETTINGS_DIALOGS.FPS]: {
    title: 'PS',
    content: (props) => <Fps {...props} />
  },
  [SETTINGS_DIALOGS.MEDIA_DELAY]: {
    title: 'Media Delay',
    content: (props) => <MediaDelay {...props} />
  },
  [SETTINGS_DIALOGS.AUDIO_VOLUME]: {
    title: 'Audio Volume',
    content: (props) => <AudioVolume {...props} />
  },
  [SETTINGS_DIALOGS.NAV_VOLUME]: {
    title: 'Navigation Volume',
    content: (props) => <NavVolume {...props} />
  },
  [SETTINGS_DIALOGS.DPI]: {
    title: 'DPI',
    content: (props) => <Dpi {...props} />
  },
  [SETTINGS_DIALOGS.FORMAT]: {
    title: 'Format',
    content: (props) => <Format {...props} />
  }
}
