import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {fontSize, spacing} from '../utils/responsive';

const webContent = `
  <!DOCTYPE html>
  <html>
    <body style="font-family: sans-serif; padding: 24px; color: #111827;">
      <h2>WebView Ready</h2>
      <p>Embed web content, terms, or payment flows here.</p>
    </body>
  </html>
`;

export function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <WebView
        style={styles.webview}
        originWhitelist={['*']}
        source={{html: webContent}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#111827',
  },
  webview: {
    flex: 1,
    borderRadius: spacing.sm,
    overflow: 'hidden',
  },
});
