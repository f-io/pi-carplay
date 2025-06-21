import { getDecoderConfig, configureDecoder, DecoderOptions, isKeyFrame } from './lib/utils'
import { InitEvent, WorkerEvent } from './RenderEvents'
import { WebGL2Renderer } from './WebGL2Renderer'
import { WebGLRenderer } from './WebGLRenderer'
import { WebGPURenderer } from './WebGPURenderer'

export interface ExtendedInitEvent extends InitEvent {
  useHardwareDecoder?: boolean
}

export interface FrameRenderer {
  draw(data: VideoFrame): void
}

// eslint-disable-next-line no-restricted-globals
const scope = self as unknown as Worker

export class RendererWorker {
  private renderer: FrameRenderer | null = null
  private videoPort: MessagePort | null = null
  private pendingFrame: VideoFrame | null = null
  private startTime: number | null = null
  private frameCount = 0
  private timestamp = 0
  private fps = 0
  private decoder: VideoDecoder
  private currentConfig: VideoDecoderConfig | null = null
  private useHardware = false

  constructor() {
    this.decoder = new VideoDecoder({
      output: this.onVideoDecoderOutput,
      error: this.onVideoDecoderOutputError,
    })
  }

  init = (event: ExtendedInitEvent) => {
    this.useHardware = event.useHardwareDecoder ?? false

    switch (event.renderer) {
      case 'webgl':
        this.renderer = new WebGLRenderer(event.canvas)
        break
      case 'webgl2':
        this.renderer = new WebGL2Renderer(event.canvas)
        break
      case 'webgpu':
        this.renderer = new WebGPURenderer(event.canvas)
        break
    }

    this.videoPort = event.videoPort
    this.videoPort.onmessage = (ev: MessageEvent<ArrayBuffer>) => {
      this.onRawFrame(ev.data)
    }
    this.videoPort.start()
    self.postMessage({ type: 'render-ready' })
    console.debug('[RENDER.WORKER] render-ready')

    if (event.reportFps) {
      setInterval(() => {
        if (this.decoder.state === 'configured') {
          console.debug(`[RENDER.WORKER] FPS: ${this.fps.toFixed(2)}`)
        }
      }, 5000)
    }
  }

  private onVideoDecoderOutput = (frame: VideoFrame) => {
    if (this.startTime == null) {
      this.startTime = performance.now()
    } else {
      const elapsed = (performance.now() - this.startTime) / 1000
      this.fps = ++this.frameCount / elapsed
    }
    this.renderFrame(frame)
  }

  private renderFrame = (frame: VideoFrame) => {
    if (!this.pendingFrame) {
      requestAnimationFrame(this.renderAnimationFrame)
    } else {
      this.pendingFrame.close()
    }
    this.pendingFrame = frame
  }

  private renderAnimationFrame = () => {
    if (this.pendingFrame) {
      this.renderer?.draw(this.pendingFrame)
      this.pendingFrame = null
    }
  }

  private onVideoDecoderOutputError = (err: Error) => {
    console.error(`[RENDER.WORKER] Decoder error`, err)
    if (this.currentConfig?.hardwareAcceleration === 'prefer-hardware') {
      console.info('[RENDER.WORKER] Falling back to software decoding')
      this.decoder.close()
      this.currentConfig.hardwareAcceleration = 'prefer-software'
      this.decoder = new VideoDecoder({
        output: this.onVideoDecoderOutput,
        error: this.onVideoDecoderOutputError,
      })
      this.decoder.configure(this.currentConfig)
    }
  }

  private onRawFrame = async (buffer: ArrayBuffer) => {
    if (!buffer || buffer.byteLength === 0) {
      console.warn('[RENDER.WORKER] Empty buffer received.')
      return
    }

    const frameData = new Uint8Array(buffer)

    if (this.decoder.state === 'unconfigured') {
      const options: DecoderOptions = { preferHardware: this.useHardware }
      const cfgRequest = getDecoderConfig(frameData, options)
      console.debug('[RENDER.WORKER] Requested config:', cfgRequest)

      if (!cfgRequest) {
        console.warn('[RENDER.WORKER] Failed to configure decoder (missing SPS?)')
        return
      }

      const usedConfig = await configureDecoder(this.decoder, cfgRequest, this.useHardware)
      this.currentConfig = usedConfig
      console.info(`[RENDER.WORKER] Using hardwareAcceleration=${usedConfig.hardwareAcceleration}`)
      
      self.postMessage({
        type: 'resolution',
        payload: { width: usedConfig.codedWidth, height: usedConfig.codedHeight },
      })
    }

    if (this.decoder.state === 'configured') {
      try {
        const chunk = new EncodedVideoChunk({ type: isKeyFrame(frameData) ? 'key' : 'delta', data: frameData, timestamp: this.timestamp++ })
        this.decoder.decode(chunk)
      } catch (e) {
        console.error('[RENDER.WORKER] Decode error:', e)
      }
    }
  }
}

const worker = new RendererWorker()
scope.addEventListener('message', (event: MessageEvent<WorkerEvent>) => {
  if (event.data.type === 'init') {
    worker.init(event.data as ExtendedInitEvent)
  }
})

export {}