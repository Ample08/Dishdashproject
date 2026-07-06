# Catering hero video

Drop the Catering Home hero reel here as:

    catering-hero.mp4

Then enable it in one line — open:

    src/components/catering/heroVideoSource.ts

and replace the `null` export with:

    export const heroVideoSource = require('../../../assets/videos/catering-hero.mp4');

Until then, HeroVideo falls back to the `catering.png` poster image, so the app
builds and runs fine without the video present.

Recommended: muted, ~8–15s loop, 1080×~810 (4:3-ish) or taller, H.264 mp4, a few MB.
After adding the file, rebuild the native app (`react-native-video` is native):
- iOS:   `cd ios && pod install` then rebuild
- Android: rebuild (autolinked)
