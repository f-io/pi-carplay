#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------
# pi-carplay Installer & Shortcut Creator
# ----------------------------------------

# 0) Variables
USER_HOME="$HOME"
APPIMAGE_PATH="$USER_HOME/pi-carplay/pi-carplay.AppImage"
APPIMAGE_DIR="$(dirname "$APPIMAGE_PATH")"

echo "→ Creating target directory: $APPIMAGE_DIR"
mkdir -p "$APPIMAGE_DIR"

# 1) Ensure required tools are installed
echo "→ Checking for required tools: curl, xdg-user-dir"
for tool in curl xdg-user-dir; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "   $tool not found, installing…"
    sudo apt-get update
    sudo apt-get --yes install "$tool"
  else
    echo "   $tool found"
  fi
done

# 2) Create udev rule for Carlinkit dongle
echo "→ Writing udev rule"
UDEV_FILE="/etc/udev/rules.d/52-carplay.rules"
sudo tee "$UDEV_FILE" > /dev/null <<EOF
SUBSYSTEM=="usb", ATTR{idVendor}=="1314", ATTR{idProduct}=="152*", MODE="0660", GROUP="plugdev"
EOF
echo "   Reloading udev rules"
sudo udevadm control --reload-rules
sudo udevadm trigger

# 3) Install runtime dependencies for node-usb + FUSE
echo "→ Installing runtime dependencies"
sudo apt-get update
pkgs=(libusb-1.0-0 libudev1)
for pkg in "${pkgs[@]}"; do
  printf "   %-15s " "$pkg"
  if dpkg-query -W --showformat='${Status}\n' "$pkg" 2>/dev/null | grep -q "install ok installed"; then
    echo "found"
  else
    echo "missing → installing"
    sudo apt-get --yes install "$pkg"
  fi
done
echo "   All runtime dependencies are ready."

# ICON INSTALLATION
ICON_SRC="./assets/icons/linux/pi-caraplay.png"
ICON_DEST="$USER_HOME/.local/share/icons/pi-carplay.png"

if [ -d "$USER_HOME/.local/share" ]; then
  echo "→ Installing icon to $ICON_DEST"
  mkdir -p "$(dirname "$ICON_DEST")"
  if [ -f "$ICON_SRC" ]; then
    cp "$ICON_SRC" "$ICON_DEST"
    echo "   App Icon copied."
  else
    echo "   Icon source $ICON_SRC not found! Skipping icon install."
  fi
else
  echo "   No ~/.local/share directory, skipping icon installation."
fi

# 4) Fetch latest ARM64 AppImage from GitHub
echo "→ Fetching latest pi-carplay release"
latest_url=$(curl -s https://api.github.com/repos/f-io/pi-carplay/releases/latest \
  | grep "browser_download_url" \
  | grep "arm64.AppImage" \
  | cut -d '"' -f 4)

if [ -z "$latest_url" ]; then
  echo "Error: Could not find ARM64 AppImage URL" >&2
  exit 1
fi

echo "   Download URL: $latest_url"
if ! curl -L "$latest_url" --output "$APPIMAGE_PATH"; then
  echo "Error: Download failed" >&2
  exit 1
fi
echo "   Download complete: $APPIMAGE_PATH"

# 5) Mark AppImage as executable
echo "→ Setting executable flag"
chmod +x "$APPIMAGE_PATH"

# 6) Create per-user autostart entry
echo "→ Creating autostart entry"
AUTOSTART_DIR="$USER_HOME/.config/autostart"
mkdir -p "$AUTOSTART_DIR"
cat > "$AUTOSTART_DIR/pi-carplay.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=pi-carplay
Exec=$APPIMAGE_PATH
Icon=pi-carplay
X-GNOME-Autostart-enabled=true
Categories=AudioVideo;
EOF
echo "Autostart entry at $AUTOSTART_DIR/pi-carplay.desktop"

# 7) Create Desktop shortcut
echo "→ Creating desktop shortcut"
if command -v xdg-user-dir >/dev/null 2>&1; then
  DESKTOP_DIR=$(xdg-user-dir DESKTOP)
else
  DESKTOP_DIR="$USER_HOME/Desktop"
fi

mkdir -p "$DESKTOP_DIR"
cat > "$DESKTOP_DIR/pi-carplay.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=pi-carplay
Comment=Launch pi-carplay AppImage
Exec=$APPIMAGE_PATH
Icon=pi-carplay
Terminal=false
Categories=Utility;
StartupNotify=false
EOF
chmod +x "$DESKTOP_DIR/pi-carplay.desktop"
echo "Desktop shortcut at $DESKTOP_DIR/pi-carplay.desktop"

echo "✅ Installation complete!"
