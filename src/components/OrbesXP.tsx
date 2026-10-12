import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { soundService } from '../services/sound';

interface OrbesXPProps {
  cantidad: number;
  onRecolectar?: () => void;
}

export const OrbesXP: React.FC<OrbesXPProps> = ({ cantidad, onRecolectar }) => {
  const handlePress = () => {
    // 🔊 Reproduce el efecto de sonido de XP
    soundService.playSound('xp_gain');

    if (onRecolectar) {
      onRecolectar();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <View style={styles.orbe}>
        <Text style={styles.texto}>+{cantidad} XP</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  orbe: {
    backgroundColor: '#55FF55',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  texto: {
    color: '#000',
    fontWeight: 'bold',
  },
});
