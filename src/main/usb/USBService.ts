import type { Device } from 'usb'
import { ipcMain, BrowserWindow } from 'electron'
import { CarplayService } from '../carplay/CarplayService'
import { findDongle } from './helpers'
import NodeMicrophone from '../carplay/node/NodeMicrophone'

import * as usbModule from 'usb'
const { usb, getDeviceList } = usbModule

export class USBService {
  private lastDongleState: boolean = false
  private stopped = false

  public async stop(): Promise<void> {
    if (this.stopped) return
    this.stopped = true
    usb.removeAllListeners('attach')
    usb.removeAllListeners('detach')
    usb.unrefHotplugEvents()
    console.log('[USBService] Monitoring stopped')
  }

  constructor(private carplay: CarplayService) {
    this.registerIpcHandlers()
    this.listenToUsbEvents()
    usb.unrefHotplugEvents()

    const device = getDeviceList().find(this.isDongle)
    if (device) {
      console.log('[USBService] Dongle was already connected on startup', device)
      this.lastDongleState = true
      this.carplay.markDongleConnected(true)
      this.carplay.autoStartIfNeeded().catch(console.error)
      this.notifyDeviceChange(device, true)
    }
  }

  private listenToUsbEvents() {
    usb.on('attach', (device) => {
      this.broadcastGenericUsbEvent({ type: 'attach', device })
      if (this.isDongle(device) && !this.lastDongleState) {
        console.log('[USBService] Dongle connected:', device)
        this.lastDongleState = true
        this.carplay.markDongleConnected(true)
        this.carplay.autoStartIfNeeded().catch(console.error)
        this.notifyDeviceChange(device, true)
      }
    })

    usb.on('detach', (device) => {
      this.broadcastGenericUsbEvent({ type: 'detach', device })
      if (this.isDongle(device) && this.lastDongleState) {
        console.log('[USBService] Dongle disconnected:', device)
        this.lastDongleState = false
        this.carplay.markDongleConnected(false)
        this.notifyDeviceChange(device, false)
      }
    })
  }

  private notifyDeviceChange(device: Device, connected: boolean): void {
    const vendorId = device.deviceDescriptor.idVendor
    const productId = device.deviceDescriptor.idProduct
    const payload = {
      type: connected ? 'plugged' : 'unplugged',
      device: { vendorId, productId, deviceName: '' }
    }
    BrowserWindow.getAllWindows().forEach((win) => {
      win.webContents.send('usb-event', payload)
      win.webContents.send('carplay-event', payload)
    })
  }

  private broadcastGenericUsbEvent(event: { type: 'attach' | 'detach'; device: Device }) {
    const vendorId = event.device.deviceDescriptor.idVendor
    const productId = event.device.deviceDescriptor.idProduct
    const payload = {
      type: event.type,
      device: { vendorId, productId, deviceName: '' }
    }
    BrowserWindow.getAllWindows().forEach((win) => win.webContents.send('usb-event', payload))
  }

  private registerIpcHandlers() {
    ipcMain.handle('usb-detect-dongle', async () => {
      const devices = getDeviceList()
      return devices.some(this.isDongle)
    })

    ipcMain.handle('carplay:usbDevice', async () => {
      const devices = getDeviceList()
      const detectDev = devices.find(this.isDongle)
      if (!detectDev) {
        return {
          device: false,
          vendorId: null,
          productId: null,
          deviceName: '',
          serialNumber: '',
          manufacturerName: '',
          productName: '',
          fwVersion: 'Unknown'
        }
      }
      return await this.getDongleInfo(detectDev)
    })

    ipcMain.handle('usb-force-reset', async () => {
      if (process.platform === 'darwin') {
        console.log('[USBService] macOS detected – using graceful reset')
        return this.gracefulForceReset()
      } else {
        return this.forceReset()
      }
    })

    ipcMain.handle('usb-last-event', async () => {
      if (this.lastDongleState) {
        const devices = getDeviceList()
        const dev = devices.find(this.isDongle)
        if (dev) {
          return {
            type: 'plugged',
            device: {
              vendorId: dev.deviceDescriptor.idVendor,
              productId: dev.deviceDescriptor.idProduct,
              deviceName: ''
            }
          }
        }
      }
      return { type: 'unplugged', device: null }
    })

    ipcMain.handle('get-sysdefault-mic-label', () => NodeMicrophone.getSysdefaultPrettyName())
  }

  private async getDongleInfo(device: Device) {
    const fwVersion = device.deviceDescriptor.bcdDevice
      ? `${device.deviceDescriptor.bcdDevice >> 8}.${(device.deviceDescriptor.bcdDevice & 0xff)
          .toString()
          .padStart(2, '0')}`
      : 'Unknown'

    let serialNumber = ''
    let manufacturerName = ''
    let productName = ''

    try {
      device.open()
      serialNumber = await this.tryGetStringDescriptor(
        device,
        device.deviceDescriptor.iSerialNumber
      )
      manufacturerName = await this.tryGetStringDescriptor(
        device,
        device.deviceDescriptor.iManufacturer
      )
      productName = await this.tryGetStringDescriptor(device, device.deviceDescriptor.iProduct)
      device.close()
    } catch (e) {
      try {
        device.close()
      } catch {}
    }

    return {
      device: true,
      vendorId: device.deviceDescriptor.idVendor,
      productId: device.deviceDescriptor.idProduct,
      serialNumber,
      manufacturerName,
      productName,
      fwVersion
    }
  }

  private tryGetStringDescriptor(device: Device, index: number | undefined): Promise<string> {
    return new Promise((resolve) => {
      if (!index) return resolve('')
      device.getStringDescriptor(index, (err, str) => {
        if (err) return resolve('')
        resolve(str || '')
      })
    })
  }

  private isDongle(
    device: Partial<Device> & { deviceDescriptor?: { idVendor: number; idProduct: number } }
  ) {
    return (
      device.deviceDescriptor?.idVendor === 0x1314 &&
      [0x1520, 0x1521].includes(device.deviceDescriptor?.idProduct ?? -1)
    )
  }

  private notifyReset(type: 'usb-reset-start' | 'usb-reset-done', ok: boolean) {
    BrowserWindow.getAllWindows().forEach((win) => win.webContents.send(type, ok))
  }

  private async forceReset(): Promise<boolean> {
    this.notifyReset('usb-reset-start', true)
    const dongle = findDongle()
    if (dongle) {
      this.lastDongleState = false
      this.broadcastGenericUsbEvent({ type: 'detach', device: dongle })
      this.notifyDeviceChange(dongle, false)
    }
    if (!dongle) {
      console.warn('[USB] Dongle not found')
      this.notifyReset('usb-reset-done', false)
      return false
    }
    return this.resetDongle(dongle)
  }

  private async gracefulForceReset(): Promise<boolean> {
    this.notifyReset('usb-reset-start', true)
    const dongle = findDongle()
    if (!dongle) {
      console.warn('[USB] Dongle not found')
      this.notifyReset('usb-reset-done', false)
      return false
    }
    try {
      console.log('[USB] Graceful reset: stopping CarPlay...')
      await this.carplay.stop()
      await new Promise((resolve) => setTimeout(resolve, 300))
      this.lastDongleState = false
      this.broadcastGenericUsbEvent({ type: 'detach', device: dongle })
      this.notifyDeviceChange(dongle, false)
      return await this.resetDongle(dongle)
    } catch (e) {
      console.error('[USB] Exception during graceful reset', e)
      this.notifyReset('usb-reset-done', false)
      return false
    }
  }

  private async resetDongle(dongle: Device): Promise<boolean> {
    let opened = false
    try {
      dongle.open()
      opened = true
    } catch (openErr) {
      console.warn('[USB] Could not open device for reset:', openErr)
      this.notifyReset('usb-reset-done', false)
      return false
    }

    try {
      await new Promise<void>((resolve, reject) => {
        dongle.reset((err) => {
          if (err) {
            const msg = String(err.message ?? err)
            if (
              msg.includes('LIBUSB_ERROR_NOT_FOUND') ||
              msg.includes('LIBUSB_ERROR_NO_DEVICE') ||
              msg.includes('LIBUSB_TRANSFER_NO_DEVICE')
            ) {
              console.warn('[USB] reset triggered disconnect – treating as success')
              this.notifyReset('usb-reset-done', true)
              resolve()
            } else {
              console.error('[USB] reset error', err)
              this.notifyReset('usb-reset-done', false)
              reject(new Error('Reset failed'))
            }
          } else {
            console.log('[USB] reset ok')
            this.notifyReset('usb-reset-done', true)
            resolve()
          }
        })
      })

      return true
    } catch (e) {
      console.error('[USB] Exception during resetDongle()', e)
      this.notifyReset('usb-reset-done', false)
      return false
    } finally {
      try {
        if (opened) dongle.close()
      } catch (e) {
        console.warn('[USB] Failed to close dongle after reset:', e)
      }
    }
  }
}
