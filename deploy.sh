#!/bin/sh -el

WHITE="$(echo '\033[1;37m')"
WHITE_HIGHLIGHT="$(echo '\033[1;100;37m')"
NC="$(echo '\033[0m')" # No Color


read_details() {
    set -e

    read -p "${WHITE}>> Enter wifi ssid ($WIFI_SSID): ${NC}" WIFI_SSID_INPUT
    WIFI_SSID=${WIFI_SSID_INPUT:-$WIFI_SSID}
    [ -z "$WIFI_SSID" ] && { echo >&2 "${WHITE}WIFI ssid cannot be empty${NC}"; exit 1; }

    read -p "${WHITE}>> Enter wifi password: ${NC}" WIFI_PASSWORD
    [ -z "$WIFI_PASSWORD" ] && { echo >&2 "${WHITE}WIFI password cannot be empty${NC}"; exit 1; }

    persist_properties

    echo "${WHITE}>> Choose the serial port of the connected device: ${NC}"
    SERIAL_PORT=$(ls /dev/cu* | grep -v Bluetooth | fzf --height=3 -1 -0 || { echo >&2 "${WHITE}No devices detected.${NC}"; exit 1; })
    echo "${WHITE}  $SERIAL_PORT${NC}"
}

persist_properties() {
    set -e
    echo "" > ./properties.sh
    echo "WIFI_SSID='$WIFI_SSID'" >> ./properties.sh
}

fzf --version &>/dev/null || { echo "Installing fzf for better experience"; brew install fzf; }
if [ -f ./properties.sh ]; then
    . ./properties.sh
    echo "${WHITE}Previous configuration present:${NC}"
    echo "WIFI_SSID='$WIFI_SSID'"

    echo "${WHITE} Just press [Enter] below to reuse existing configs.${NC}"
fi

read_details


echo "${WHITE}>> Installing mongoose client${NC}"
~/.mos/bin/mos --version 2>/dev/null || curl -fsSL https://mongoose-os.com/downloads/mos/install.sh | /bin/bash

echo "${WHITE}>> Flashing mongoose OS into attached esp8266 module${NC}"
~/.mos/bin/mos flash esp32 --port "$SERIAL_PORT"

echo "${WHITE}>> Baking wifi credentials into device${NC}"
~/.mos/bin/mos wifi "$WIFI_SSID" "$WIFI_PASSWORD" --port "$SERIAL_PORT"

echo "${WHITE}>> transfering firmware to device${NC}"
~/.mos/bin/mos put fs/init.js --port "$SERIAL_PORT"

echo "${WHITE}>> All done. Restarting device...${NC}"
~/.mos/bin/mos call Sys.Reboot --port "$SERIAL_PORT"

echo "${WHITE}>> Connecting mos console. Press ${WHITE_HIGHLIGHT}control+C${WHITE} to exit${NC}"
~/.mos/bin/mos console --port "$SERIAL_PORT"
