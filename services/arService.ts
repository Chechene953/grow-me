import { Linking, Platform } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import { Plant, PlantSize } from '../types';

function buildSceneViewerUrl(opts: { glbUrl: string; title: string; scale?: number }) {
  const base = 'https://arvr.google.com/scene-viewer/1.0';
  const params = new URLSearchParams();
  params.set('file', opts.glbUrl);
  params.set('mode', 'ar_only');
  if (opts.title) params.set('title', opts.title);
  if (opts.scale && Number.isFinite(opts.scale)) params.set('scale', String(opts.scale));
  // Optional: link back to app could be set with "link" param
  return `${base}?${params.toString()}`;
}

function buildQuickLookUrl(opts: { usdzUrl: string; allowsContentScaling?: boolean }) {
  // Quick Look accepts query/hash options, most common is allowsContentScaling
  const allow = opts.allowsContentScaling ? '1' : '1';
  const sep = opts.usdzUrl.includes('#') ? '&' : '#';
  return `${opts.usdzUrl}${sep}allowsContentScaling=${allow}`;
}

function sizeToScale(size: PlantSize): number {
  // Heuristic scale factor for Scene Viewer; real accuracy comes from model units
  switch (size) {
    case 'Small':
      return 0.7;
    case 'Medium':
      return 1.0;
    case 'Large':
      return 1.3;
    default:
      return 1.0;
  }
}

export const arService = {
  async openPlantAR(plant: Plant, size: PlantSize = 'Medium') {
    if (Platform.OS === 'android') {
      if (!plant.modelGlbUrl) throw new Error('No GLB model available for this plant');
      const url = buildSceneViewerUrl({ glbUrl: plant.modelGlbUrl, title: plant.name, scale: sizeToScale(size) });
      try {
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: url,
          flags: 0x10000000, // FLAG_ACTIVITY_NEW_TASK
          packageName: 'com.google.ar.core',
        });
      } catch {
        // Fallback: open in browser
        await Linking.openURL(url);
      }
      return;
    }

    // iOS
    if (!plant.modelUsdzUrl) throw new Error('No USDZ model available for this plant');
    const url = buildQuickLookUrl({ usdzUrl: plant.modelUsdzUrl, allowsContentScaling: true });
    await Linking.openURL(url);
  },
};


