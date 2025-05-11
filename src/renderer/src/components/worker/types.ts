import { DongleConfig, TouchAction, CarplayMessage, AudioData } from '@carplay/web'

export type AudioPlayerKey = string & { __brand: 'AudioPlayerKey' }

export type CarplayWorkerMessage =
  | { data: CarplayMessage }
  | { data: { type: 'requestBuffer'; message: AudioData } }

export type InitialisePayload = {
  videoPort: MessagePort
  microphonePort: MessagePort
}

export type AudioPlayerPayload = {
  sab: SharedArrayBuffer
  decodeType: number
  audioType: number
}

export type StartPayload = {
  config: Partial<DongleConfig>
}

export type ValidCommand =
  | 'left' | 'right' | 'next' | 'invalid' | 'pause' | 'play'
  | 'selectDown' | 'back' | 'down' | 'home' | 'prev' | 'up'
  | 'selectUp' | 'frame' | 'mic' | 'deviceFound'
  | 'startRecordAudio' | 'stopRecordAudio'
  | 'requestHostUI' | 'wifiPair'

export function isValidCommand(cmd: string): cmd is ValidCommand {
  return [
    'left', 'right', 'next', 'invalid', 'pause', 'play',
    'selectDown', 'back', 'down', 'home', 'prev', 'up',
    'selectUp', 'frame', 'mic', 'deviceFound',
    'startRecordAudio', 'stopRecordAudio',
    'requestHostUI', 'wifiPair'
  ].includes(cmd)
}

export type KeyCommand =
  | 'left'
  | 'right'
  | 'selectDown'
  | 'selectUp'
  | 'back'
  | 'down'
  | 'home'
  | 'play'
  | 'pause'
  | 'next'
  | 'prev'

export type Command =
  | { type: 'stop' }
  | { type: 'start'; payload: StartPayload }
  | { type: 'touch'; payload: { x: number; y: number; action: TouchAction } }
  | { type: 'initialise'; payload: InitialisePayload }
  | { type: 'audioPlayer'; payload: AudioPlayerPayload }  // neu: AudioPlayer unterstützen
  | { type: 'audioBuffer'; payload: AudioPlayerPayload }
  | { type: 'microphoneInput'; payload: Int16Array }
  | { type: 'frame' }
  | { type: 'keyCommand'; command: KeyCommand }

export interface CarPlayWorker
  extends Omit<Worker, 'postMessage' | 'onmessage'> {
  postMessage(message: Command, transfer?: Transferable[]): void
  onmessage: ((this: Worker, ev: CarplayWorkerMessage) => any) | null
}