/**
 * =============================================================
 * FashionStyle Mobile App — App.tsx
 * =============================================================
 *
 * Kiến trúc: React Native + WebView
 * Bọc toàn bộ giao diện web (Page Web Chinh) bên trong ứng dụng Native,
 * đảm bảo hiệu suất cao và đồng bộ dữ liệu với Backend API.
 *
 * Cấu hình URL: Chỉnh sửa trong file config.ts
 * =============================================================
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { WEB_URL } from './config';

const App = (): React.JSX.Element => {
  const webViewRef = useRef<InstanceType<typeof WebView>>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoaded, setHasInitialLoaded] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Xử lý nút Back cứng trên Android:
  // Thay vì thoát ứng dụng, điều hướng trở lại trang trước trong WebView
  const handleBackButton = useCallback(() => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true; // Chặn hành động thoát App mặc định
    }
    return false; // Nếu không còn trang trước, cho phép thoát bình thường
  }, [canGoBack]);

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => backHandler.remove();
  }, [handleBackButton]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#0a0a0a"
      />

      <WebView
        ref={webViewRef}
        source={{ uri: WEB_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled          // Cho phép localStorage — JWT token được lưu ở đây
        cacheEnabled
        allowsBackForwardNavigationGestures    // Vuốt trái/phải điều hướng (iOS)
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        onLoadStart={() => { 
          if (!hasInitialLoaded) setIsLoading(true); 
          setErrorMessage(null); 
        }}
        onLoadEnd={() => {
          setIsLoading(false);
          setHasInitialLoaded(true);
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setErrorMessage(`WebView Lỗi:\nMã: ${nativeEvent.code}\nMô tả: ${nativeEvent.description}`);
          setIsLoading(false);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setErrorMessage(`WebView Lỗi HTTP:\nMã Trạng Thái: ${nativeEvent.statusCode}\nURL: ${nativeEvent.url}`);
          setIsLoading(false);
        }}
        onNavigationStateChange={navState => setCanGoBack(navState.canGoBack)}
      />

      {/* Hiển thị lỗi thiết lập */}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Loading Spinner trong khi trang Web đang tải (Chỉ hiện ở lần khởi động đầu tiên) */}
      {isLoading && !hasInitialLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C9A96E" />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
