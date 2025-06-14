# pi‑carplay

pi‑carplay brings Apple CarPlay functionality to the Raspberry Pi.
While it started as a fork of react-carplay, it has since evolved into a standalone implementation with a different focus.

🎯 Optimized for embedded Raspberry Pi setups and ultra-low-resolution displays

> **Requirements:** A Carlinkit **CPC200-CCPA** (wireless & wired) or **CPC200-CCPW** (wired only) adapter.

<p align="center">
  <!-- Release -->
  <img alt="Release" src="https://img.shields.io/github/v/release/f-io/pi-carplay?label=release"> &nbsp;
  <!-- MAIN -->
  <img alt="TS Main" src="https://img.shields.io/github/actions/workflow/status/f-io/pi-carplay/typecheck.yml?branch=main&label=TS%20main&style=flat">
  <img alt="Build Main" src="https://img.shields.io/github/actions/workflow/status/f-io/pi-carplay/build.yml?branch=main&label=build%20main&style=flat"> &nbsp;&nbsp; &nbsp;&nbsp;
  <!-- DEV -->
  <img alt="Dev" src="https://img.shields.io/github/package-json/v/f-io/pi-carplay?filename=package.json&branch=dev&label=dev%20version&color=blue&style=flat"> &nbsp;
  <!-- DEV -->
  <img alt="TS Dev" src="https://img.shields.io/github/actions/workflow/status/f-io/pi-carplay/typecheck.yml?branch=dev&label=TS%20dev&style=flat">
  <img alt="Build Dev" src="https://img.shields.io/github/actions/workflow/status/f-io/pi-carplay/build.yml?branch=dev&label=build%20dev&style=flat">
</p>


## Installation (Raspberry Pi OS)

```bash
git clone https://github.com/f-io/pi-carplay.git
cd pi-carplay
./setup-pi.sh
```

The `setup-pi.sh` script will:

1. Install required dependencies
2. Configure udev rules
3. Download the latest AppImage
4. Create an autostart entry

*Do not run this script on other Linux distributions.*

## Images
<p align="center">
  <img src="documentation/images/carplay.png"
       alt="CarPlay"
       width="45%" />
</p>

<p align="center">
  <img src="documentation/images/settings.png"
       alt="Settings"
       width="45%" />
  &emsp;&emsp;
  <img src="documentation/images/info.png"
       alt="Info"
       width="45%" />
</p>

## Build Environment

```bash
node -v
v22.16.0

npm -v
10.9.2
```

---

### System Requirements (build)

Make sure the following packages and tools are installed on your system before building:

- **Python 3.x** (for native module builds via `node-gyp`)
- **build-essential** (Linux: includes `gcc`, `g++`, `make`, etc.)
- **libusb-1.0-0-dev** (required for `node-usb`)
- **libudev-dev** (optional but recommended for USB detection on Linux)
- **fuse** (required to run AppImages)

---

### Clone & Build

```bash
git clone --branch main --single-branch https://github.com/f-io/pi-carplay.git \
  && cd pi-carplay \
  && npm install \
  && npm run build \
  && npm run build:armLinux
```

---

### Linux (x86_64)

This AppImage has been tested on Debian Trixie (13). No additional software is required — just download the x86_64.AppImage and make it executable.

```bash
chmod +x pi-carplay-*-x86_64.AppImage
```

This AppImage uses the libfuse3 runtime. On modern systems (e.g. Debian 12+, Ubuntu 22.04+), this is supported out of the box.  
If you experience issues running the AppImage, make sure `libfuse3` is installed:

```bash
sudo apt install libfuse3-3
```

---

### Mac (arm64)

This step is required for all non-Apple-signed apps.

```bash
xattr -cr /Applications/pi-carplay.app
```

For microphone support, please install Sound eXchange (SoX) via brew.
```bash
brew install sox
```


## Links

* **Repository & Issue Tracker:** [f-io/pi-carplay](https://github.com/f-io/pi-carplay)
* **Inspired by:** [react-carplay](https://github.com/rhysmorgan134/react-carplay)

## Disclaimer

** _Apple and CarPlay are trademarks of Apple Inc. This project is not affiliated with or endorsed by Apple in any way. All trademarks are the property of their respective owners._


## License

This project is licensed under the MIT License.

##

<p align="center">
  <strong>☕ Fuel this project</strong><br><br>
  <a href="https://www.buymeacoffee.com/f_io" target="_blank">
    <img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174">
  </a>
</p>


