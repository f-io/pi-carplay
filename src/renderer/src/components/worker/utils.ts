import { decodeTypeMap } from '../../../../main/carplay/messages'
import { AudioPlayerKey } from './types'

export const createAudioPlayerKey = (decodeType: number, audioType: number) => {
  const format = decodeTypeMap[decodeType]
  const audioKey = [format.frequency, format.channel, audioType].join('_')
  return audioKey as AudioPlayerKey
}
