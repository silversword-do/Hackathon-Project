# Mobile App Setup Guide

This guide will walk you through setting up and building the Bus OK State app for iOS and Android.

## Prerequisites

### For iOS Development
- **macOS** (required for iOS development)
- **Xcode** (latest version from App Store)
- **CocoaPods** (usually installed with Xcode, or run `sudo gem install cocoapods`)

### For Android Development
- **Android Studio** (latest version)
- **Java Development Kit (JDK)** 11 or later
- **Android SDK** (installed via Android Studio)

## Initial Setup

### 1. Build the Web App

First, build your React app:
```bash
cd frontend
npm install
npm run build
```

### 2. Add Mobile Platforms

#### iOS (macOS only)
```bash
npm run cap:add:ios
```

This creates an `ios` folder with the Xcode project.

#### Android
```bash
npm run cap:add:android
```

This creates an `android` folder with the Android Studio project.

### 3. Sync Capacitor

After making changes, sync them with:
```bash
npm run cap:sync
```

This command:
- Copies the web app build to native projects
- Updates native dependencies
- Syncs plugin configuration

**Pro Tip:** Use `npm run cap:build` which combines `npm run build && npm run cap:sync`

## Development Workflow

### 1. Make Changes to Your App
Edit your React code in `src/` as usual.

### 2. Build and Sync
```bash
npm run cap:build
```

### 3. Open in Native IDE

#### iOS (Xcode)
```bash
npm run cap:open:ios
```

Then in Xcode:
- Select your device or simulator
- Click the Run button (▶️)
- App will install and launch

#### Android (Android Studio)
```bash
npm run cap:open:android
```

Then in Android Studio:
- Click the Run button (▶️)
- Select your device or emulator
- App will install and launch

## Running on Devices

### iOS Physical Device

1. Open Xcode project: `npm run cap:open:ios`
2. Connect your iPhone/iPad via USB
3. In Xcode:
   - Select your device from the device list
   - Go to Signing & Capabilities tab
   - Select your development team
   - Xcode will automatically create provisioning profiles
4. Click Run (▶️)

### Android Physical Device

1. Enable Developer Options on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings > Developer Options > USB Debugging
3. Connect device via USB
4. Open Android Studio: `npm run cap:open:android`
5. Click Run (▶️)
6. Select your connected device

## Building for Distribution

### iOS App Store

1. In Xcode:
   - Select "Any iOS Device" as target
   - Product > Archive
   - Follow App Store Connect wizard

### Android Play Store

1. In Android Studio:
   - Build > Generate Signed Bundle / APK
   - Select "Android App Bundle"
   - Create or use existing keystore
   - Follow Play Console upload instructions

## Configuration

### App Configuration

Edit `capacitor.config.json` to customize:
- App ID (e.g., `com.busokstate.app`)
- App Name
- Splash screen settings
- Status bar configuration

### Platform-Specific Configuration

- **iOS**: Edit `ios/App/App/Info.plist`
- **Android**: Edit `android/app/src/main/AndroidManifest.xml`

## Troubleshooting

### Common Issues

**"Platform not found"**
- Run `npm run cap:add:ios` or `npm run cap:add:android` first

**"Sync failed"**
- Make sure you've built the web app: `npm run build`
- Try deleting `node_modules` and reinstalling: `npm install`

**iOS Build Errors**
- Run `pod install` in the `ios/App` directory
- Clean build folder in Xcode: Product > Clean Build Folder

**Android Build Errors**
- In Android Studio: File > Invalidate Caches > Invalidate and Restart
- Make sure Android SDK is properly configured

**Maps not working on mobile**
- Leaflet maps work in Capacitor, but may need additional configuration
- Consider using native map plugins for better performance

## Testing

### Web Development
```bash
npm run dev
```
Test in browser first before building for mobile.

### Mobile Testing
Use simulators/emulators for quick testing:
- iOS Simulator (included with Xcode)
- Android Emulator (via Android Studio)

Always test on physical devices before releasing!

## Next Steps

1. Customize app icons and splash screens
2. Configure deep linking
3. Add native plugins as needed
4. Test on multiple devices
5. Submit to app stores

For more information, visit: https://capacitorjs.com/docs

