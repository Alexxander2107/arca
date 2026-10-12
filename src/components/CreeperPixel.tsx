import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { soundService } from '../services/sound';

interface CreeperPixelProps {
  onExplode?: () => void;
}

export const CreeperPixel: React.FC<CreeperPixelProps> = ({ onExplode }) => {
  const handlePress = () => {
    // 🔊 Reproduce el sonido característico del Creeper / daño
    soundService.playSound('creeper_damage');

    if (onExplode) {
      onExplode();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      {/* Representación píxel del Creeper */}
      <View style={styles.cabeza}>
        <View style={styles.ojoIzquierdo} />
        <View style={styles.ojoDerecho} />
        <View style={styles.boca} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  cabeza: {
    width: 60,
    height: 60,
    backgroundColor: '#00AA00',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ojoIzquierdo: {
    width: 12,
    height: 12,
    backgroundColor: '#000',
    position: 'absolute',
    top: 14,
    left: 10,
  },
  ojoDerecho: {
    width: 12,
    height: 12,
    backgroundColor: '#000',
    position: 'absolute',
    top: 14,
    right: 10,
  },
  boca: {
    width: 20,
    height: 24,
    backgroundColor: '#000',
    position: 'absolute',
    bottom: 8,
  },
});
