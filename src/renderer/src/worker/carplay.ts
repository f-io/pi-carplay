import CarplayWeb, {
  CarplayMessage,
  DongleConfig,
  SendAudio,
  SendCommand,
  SendTouch,
  findDevice,
} from '@carplay/web'

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

export type WorkerCommand =
  | StartCommand
  | TouchCommand
  | StopCommand
  | MicInputCommand
  | FrameCommand

let carplayWeb: CarplayWeb | null = null
let config: Partial<DongleConfig> = {}

function handleMessage(message: CarplayMessage) {
  const { type, message: payload } = message
  if (type === 'video') {
    postMessage(message, [payload.data.buffer])
  } else if (type === 'audio' && payload.data) {
    postMessage(message, [payload.data.buffer])
  } else {
    postMessage(message)
  }
}

self.onmessage = async (ev: MessageEvent<WorkerCommand>) => {
  const cmd = ev.data

  switch (cmd.type) {
    case 'start': {
      config = cmd.payload.config
      const device = await findDevice()
      if (!device) return

      carplayWeb = new CarplayWeb(config)
      carplayWeb.onmessage = handleMessage
      await carplayWeb.start(device)
      break
    }

    case 'touch': {
      if (!carplayWeb) return
      const { x, y, action } = cmd.payload
      carplayWeb.dongleDriver.send(new SendTouch(x, y, action))
      break
    }

    case 'stop': {
      if (!carplayWeb) return
      await carplayWeb.stop()
      carplayWeb = null
      break
    }

    case 'microphoneInput': {
      if (!carplayWeb) return
      carplayWeb.dongleDriver.send(new SendAudio(cmd.payload))
      break
    }

    case 'frame': {
      if (!carplayWeb) return
      carplayWeb.dongleDriver.send(new SendCommand('frame'))
      break
    }
  }
}

export {}