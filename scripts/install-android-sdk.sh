#!/bin/bash
sudo apt remove openjdk-21-jdk-headless openjdk-21-jdk -y

sudo apt install ca-certificates curl gpg iputils-ping usbutils -y
curl -fsSL https://packages.adoptium.net/artifactory/api/gpg/key/public | sudo gpg --dearmor -o /usr/share/keyrings/adoptium.gpg
cat <<EOF | sudo tee /etc/apt/sources.list.d/adoptium.sources
Types: deb
URIs: https://packages.adoptium.net/artifactory/deb
Suites: $(. /etc/os-release && echo "$VERSION_CODENAME")
Components: main
Architectures: $(dpkg --print-architecture)
Signed-By: /usr/share/keyrings/adoptium.gpg
EOF
sudo apt update
sudo apt install temurin-17-jdk -y
export JAVA_HOME=$(dirname $(dirname `readlink -f /etc/alternatives/java`))

sudo apt install android-sdk  android-sdk-helper -y
export ANDROID_HOME=/usr/lib/android-sdk

sudo chown -R "$USER:$USER" "$ANDROID_HOME"

curl https://dl.google.com/android/repository/commandlinetools-linux-14742923_latest.zip --output cli.zip
unzip cli.zip -d $ANDROID_HOME
rm cli.zip

mkdir -p $ANDROID_HOME/cmdline-tools/latest
cd $ANDROID_HOME/cmdline-tools
shopt -s extglob dotglob
mv !(latest) latest
shopt -u dotglob

cd $ANDROID_HOME

export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"

sudo chown -R "$USER:$USER" "$ANDROID_HOME"

yes | sdkmanager platform-tools "platforms;android-36" "build-tools;36.0.0"

sudo chown -R "$USER:$USER" "$ANDROID_HOME"


# Metro dependencies
sudo apt install -y libatk1.0-0 libatk-bridge2.0-0 libcups2 libxcomposite1 libxrandr2 libxdamage1 libpango-1.0-0 libnss3 libxshmfence1 libgbm-dev
sudo apt install libgtk-3-common -y