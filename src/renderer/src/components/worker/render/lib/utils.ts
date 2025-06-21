import { Bitstream, NALUStream, SPS, StreamType } from './h264-utils'

export enum NaluTypes {
  NDR = 1,
  IDR = 5,
  SEI = 6,
  SPS = 7,
  PPS = 8,
  AUD = 9,
}

export interface GetNaluResult {
  nalu: Uint8Array
  rawNalu: Uint8Array
  type: NaluTypes
}

export function getNaluFromStream(
  buffer: Uint8Array,
  type: NaluTypes,
  streamType: StreamType = 'annexB'
): GetNaluResult | null {
  const stream = new NALUStream(buffer, { type: streamType })
  for (const nalu of stream.nalus()) {
    if (!nalu?.nalu || nalu.nalu.length < 4) continue
    const bitstream = new Bitstream(nalu.nalu)
    bitstream.seek(3)
    const nalUnitType = bitstream.u(5)
    if (nalUnitType === type) {
      return { nalu: nalu.nalu, rawNalu: nalu.rawNalu!, type: nalUnitType }
    }
  }
  return null
}

export function isKeyFrame(data: Uint8Array): boolean {
  return !!getNaluFromStream(data, NaluTypes.IDR)
}

export interface DecoderOptions {
  preferHardware?: boolean
}

export function getDecoderConfig(
  data: Uint8Array,
  options: DecoderOptions = {}
): VideoDecoderConfig | null {
  for (const st of ['annexB', 'packet'] as StreamType[]) {
    try {
      const result = getNaluFromStream(data, NaluTypes.SPS, st)
      if (result) {
        const sps = new SPS(result.nalu)
        return {
          codec: sps.MIME,
          codedWidth: sps.picWidth,
          codedHeight: sps.picHeight
        }
      }
    } catch (e) {
      console.warn(`[lib/utils] getDecoderConfig failed for ${st} stream:`, e)
    }
  }
  return null
}

export async function configureDecoder(
  decoder: VideoDecoder,
  config: VideoDecoderConfig,
  preferHardware = false
): Promise<VideoDecoderConfig> {
  let finalConfig: VideoDecoderConfig = { ...config, hardwareAcceleration: 'prefer-software' }

  if (preferHardware) {
    try {
      const hwConfig: VideoDecoderConfig = { ...config, hardwareAcceleration: 'prefer-hardware' }
      const support = await VideoDecoder.isConfigSupported(hwConfig)
      if (support.supported && support.config) {
        finalConfig = support.config
      }
    } catch {
    }
  }

  decoder.configure(finalConfig)
  return finalConfig
}