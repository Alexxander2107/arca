import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { soundService } from '../services/sound';

interface BarraExperienciaProps {
  nivel: number;
  xpActual: number;
  xpSiguienteNivel: number;
}

export const BarraExperiencia: React.FC<BarraExperienciaProps> = ({
  nivel,
  xpActual,
  xpSiguienteNivel,
}) => {
  // 🔊 Detecta cuando el nivel sube para reproducir el efecto de sonido
  useEffect(() => {
    if (nivel > 1) {
      soundService.playSound('level_up');
    }
  }, [nivel]);

  const porcentaje = Math.min(Math.max((xpActual / xpSiguienteNivel) * 100, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.nivelTexto}>Nivel {nivel}</Text>
        <Text style={styles.xpTexto}>
          {xpActual} / {xpSiguienteNivel} XP
        </Text>
      </View>
      <View style={styles.barraFondo}>
        <View style={[styles.barraProgreso, { width: `${porcentaje}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nivelTexto: {
    fontWeight: 'bold',
    color: '#55FF55',
    fontSize: 16,
  },
  xpTexto: {
    color: '#FFF',
    fontSize: 14,
  },
  barraFondo: {
    height: 14,
    backgroundColor: '#333',
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#555',
  },
  barraProgreso: {
    height: '100%',
    backgroundColor: '#55FF55',
  },
});
