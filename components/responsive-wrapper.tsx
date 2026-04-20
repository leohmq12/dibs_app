import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useViewportDimensions } from '@/hooks/use-viewport-dimensions';

interface ResponsiveWrapperProps extends ViewProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export function ResponsiveWrapper({ 
  children, 
  maxWidth = 600, 
  style, 
  ...props 
}: ResponsiveWrapperProps) {
  const { isMobile } = useViewportDimensions();

  return (
    <View 
      style={[
        styles.container, 
        !isMobile && { maxWidth, alignSelf: 'center', width: '100%' },
        style
      ]} 
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
