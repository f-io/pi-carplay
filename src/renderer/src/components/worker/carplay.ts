import CarplayWeb, {
  CarplayMessage,
  DongleConfig,
  SendAudio,
  SendCommand,
  SendTouch,
  findDevice,
} from '@carplay/web'
import { isValidCommand } from './types'

type StartCommand = {
  type: 'start'
  payload: { config: Partial<DongleConfig> }
}
type TouchCommand = {
  type: 'touch'
  payload: { x: number; y: number; action: number }
}
type StopCommand = { type: 'stop' }
type MicInputCommand = {
  type: 'microphoneInput'
  payload: Int16Array
}
type FrameCommand = { type: 'frame' }
type KeyCommand = {
  type: 'keyCommand'
  command: string
}

type WorkerCommand =
  | StartCommand
  | TouchCommand
  | StopCommand
  | MicInputCommand
  | FrameCommand
  | KeyCommand

let carplayWeb: CarplayWeb | null = null
let config: Partial<DongleConfig> = {}

const handleMessage = (message: CarplayMessage) => {
  const { type, message: payload } = message
  if (type === 'video') {
    postMessage(message, [payload.data.buffer])
  } else if (type === 'audio' && payload.data) {
    postMessage(message, [payload.data.buffer])
  } else {
    postMessage(message)
  }
}

onmessage = async (event: MessageEvent<WorkerCommand>) => {
  const cmd = event.data

  switch (cmd.type) {
    case 'start': {
      config = cmd.payload.config
      const device = await findDevice()
      if (device) {
        carplayWeb = new CarplayWeb(config)
        carplayWeb.onmessage = handleMessage
        await carplayWeb.start(device)
      }
      break
    }

    case 'touch': {
      if (carplayWeb) {
        const { x, y, action } = cmd.payload
        carplayWeb.dongleDriver.send(new SendTouch(x, y, action))
      }
      break
    }

    case 'stop': {
      if (carplayWeb) {
        await carplayWeb.stop()
        carplayWeb = null
      }
      break
    }

    case 'microphoneInput': {
      if (carplayWeb) {
        carplayWeb.dongleDriver.send(new SendAudio(cmd.payload))
      }
      break
    }

    case 'frame': {
      if (carplayWeb) {
        carplayWeb.dongleDriver.send(new SendCommand('frame'))
      }
      break
    }

    case 'keyCommand': {
      if (carplayWeb && isValidCommand(cmd.command)) {
        carplayWeb.dongleDriver.send(new SendCommand(cmd.command))
        }
      break
    }
  }
}

export {}
