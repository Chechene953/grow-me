import React, { useRef, useState } from 'react';
import { View, StyleSheet, Platform, Modal, TouchableOpacity, Text, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Plant, PlantSize } from '../types';

interface ARViewerScreenProps {
  visible: boolean;
  plant: Plant;
  size: PlantSize;
  onClose: () => void;
}

function buildSceneViewerHTML(opts: { glbUrl: string; title: string; scale?: number }) {
  const base = 'https://arvr.google.com/scene-viewer/1.0';
  const params = new URLSearchParams();
  params.set('file', opts.glbUrl);
  params.set('mode', 'ar_only');
  if (opts.title) params.set('title', opts.title);
  if (opts.scale && Number.isFinite(opts.scale)) params.set('scale', String(opts.scale));
  const sceneViewerUrl = `${base}?${params.toString()}`;
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    #ar-container { width: 100%; height: 100vh; position: relative; }
    model-viewer { width: 100%; height: 100%; }
    .ar-button {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #2E7D32;
      color: white;
      padding: 12px 24px;
      border-radius: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div id="ar-container">
    <a href="${sceneViewerUrl}" class="ar-button">
      View in AR
    </a>
  </div>
  <script>
    // Auto-redirect to Scene Viewer on Android
    if (navigator.userAgent.includes('Android')) {
      window.location.href = '${sceneViewerUrl}';
    }
  </script>
</body>
</html>`;
}

function buildQuickLookHTML(opts: { usdzUrl: string; title: string }) {
  // For iOS, create a page that automatically opens AR Quick Look
  // The rel="ar" attribute triggers AR Quick Look directly without showing Safari
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      width: 100%; 
      height: 100vh; 
      overflow: hidden; 
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .ar-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }
    .ar-link {
      display: inline-block;
      width: 100%;
      height: 100%;
      text-decoration: none;
      cursor: pointer;
    }
    .loading {
      color: white;
      font-size: 18px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="ar-container">
    <a href="${opts.usdzUrl}" rel="ar" class="ar-link" id="arLink">
      <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
        <div style="text-align: center;">
          <div style="font-size: 64px; margin-bottom: 20px;">📱</div>
          <div class="loading">Opening AR Quick Look...</div>
        </div>
      </div>
    </a>
  </div>
  <script>
    // Auto-click the AR link immediately to open AR Quick Look
    // This will open AR Quick Look directly without showing Safari
    (function() {
      const arLink = document.getElementById('arLink');
      if (arLink) {
        // Try to open AR Quick Look immediately
        setTimeout(function() {
          // Create a click event to trigger AR Quick Look
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          arLink.dispatchEvent(clickEvent);
          
          // Also try direct click
          arLink.click();
        }, 100);
      }
    })();
  </script>
</body>
</html>`;
}

function sizeToScale(size: PlantSize): number {
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

export const ARViewerScreen: React.FC<ARViewerScreenProps> = ({
  visible,
  plant,
  size,
  onClose,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For iOS, open AR Quick Look directly via URL
  const handleIOSAR = async () => {
    if (!plant.modelUsdzUrl) {
      Alert.alert('Error', 'No AR model available for this plant');
      return;
    }

    try {
      await Linking.openURL(plant.modelUsdzUrl);
      // Close the modal after opening AR
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Error opening AR:', err);
      Alert.alert('Error', 'Failed to open AR viewer: ' + (err.message || 'Unknown error'));
    }
  };

  const getHTMLContent = () => {
    if (Platform.OS === 'android') {
      if (!plant.modelGlbUrl) {
        return `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#fff;"><p style="color:#333;">No GLB model available</p></body></html>`;
      }
      return buildSceneViewerHTML({
        glbUrl: plant.modelGlbUrl,
        title: plant.name,
        scale: sizeToScale(size),
      });
    } else {
      // iOS - Show a simple page with button to open AR
      if (!plant.modelUsdzUrl) {
        return `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;background:#fff;"><p style="color:#333;">No USDZ model available</p></body></html>`;
      }
      return buildQuickLookHTML({
        usdzUrl: plant.modelUsdzUrl,
        title: plant.name,
      });
    }
  };

  // iOS: Open AR Quick Look directly via URL
  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{plant.name}</Text>
              <Text style={styles.subtitle}>AR Preview</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.iOSContainer}>
            <View style={styles.iOSContent}>
              <MaterialCommunityIcons name="cube-outline" size={80} color="#2E7D32" />
              <Text style={styles.iOSTitle}>View in AR</Text>
              <Text style={styles.iOSDescription}>
                Tap the button below to place "{plant.name}" in your space using AR Quick Look
              </Text>
              {plant.modelUsdzUrl ? (
                <TouchableOpacity
                  style={styles.arButton}
                  onPress={handleIOSAR}
                >
                  <MaterialCommunityIcons name="cube" size={24} color="#fff" />
                  <Text style={styles.arButtonText}>Open AR Viewer</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.errorText}>No AR model available</Text>
              )}
              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // Android - Use WebView
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{plant.name}</Text>
            <Text style={styles.subtitle}>AR Preview</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading AR viewer...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ html: getHTMLContent() }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          onShouldStartLoadWithRequest={(request) => {
            // On iOS, allow navigation to USDZ files to trigger AR Quick Look
            if (Platform.OS === 'ios' && request.url.endsWith('.usdz')) {
              // This will open AR Quick Look directly
              return true;
            }
            return true;
          }}
          onLoadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onLoadEnd={() => {
            setLoading(false);
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
            setError('Failed to load AR viewer');
            setLoading(false);
          }}
          onHttpError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn('WebView HTTP error: ', nativeEvent);
            setError(`HTTP error: ${nativeEvent.statusCode}`);
            setLoading(false);
          }}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  iOSContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iOSContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  iOSTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  iOSDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  arButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
});

