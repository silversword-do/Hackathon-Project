# App Icon Resizing Instructions

The app icons need to be resized to fit better within the Android app icon bounds. The `site-logo.png` should be sized with padding to fit properly.

## Required Sizes for Android Icons

- **mipmap-mdpi**: 48x48 pixels
- **mipmap-hdpi**: 72x72 pixels  
- **mipmap-xhdpi**: 96x96 pixels
- **mipmap-xxhdpi**: 144x144 pixels
- **mipmap-xxxhdpi**: 192x192 pixels

## Recommended Icon Size

For each density, the actual logo should be about **80-90%** of the icon size with padding around it:
- **mdpi**: Logo ~40x40px, canvas 48x48px
- **hdpi**: Logo ~60x60px, canvas 72x72px
- **xhdpi**: Logo ~80x80px, canvas 96x96px
- **xxhdpi**: Logo ~120x120px, canvas 144x144px
- **xxxhdpi**: Logo ~160x160px, canvas 192x192px

## Quick Options

### Option 1: Use ImageMagick (if installed)
```powershell
cd frontend
.\resize-icons.ps1
```

### Option 2: Use Online Tool
1. Go to https://icon.kitchen/ or similar icon generator
2. Upload `public/site-logo.png`
3. Generate Android icons with padding
4. Copy the generated icons to `android/app/src/main/res/mipmap-*/` folders

### Option 3: Manual Resize (Using GIMP/Photoshop)
1. Open `public/site-logo.png` in your image editor
2. For each density:
   - Resize logo to recommended size (see above)
   - Create new canvas at full icon size
   - Center the resized logo on canvas
   - Save as `ic_launcher.png`, `ic_launcher_foreground.png`, and `ic_launcher_round.png`
   - Copy to appropriate `mipmap-*` folder

## Files to Update
For each density folder (`mipmap-mdpi`, `mipmap-hdpi`, etc.), update:
- `ic_launcher.png`
- `ic_launcher_foreground.png`
- `ic_launcher_round.png`

