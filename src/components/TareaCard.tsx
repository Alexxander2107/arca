import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { soundService } from '../services/sound';

interface TareaCardProps {
  titulo: string;
  descripcion?: string;
  xpRecompensa: number;
  completada: boolean;
  onCompletar?: () => void;
}

export const TareaCard: React.FC<TareaCardProps> = ({
  titulo,
  descripcion,
  xpRecompensa,
  completada,
  onCompletar,
}) => {
  const handlePress = () => {
    // 🔊 Si la tarea no estaba completada, reproduce el sonido de completado
    if (!completada) {
      soundService.playSound('task_complete');
    }

    if (onCompletar) {
      onCompletar();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.card, completada && styles.cardCompletada]}
    >
      <View style={styles.checkboxContainer}>
        <View style={[styles.checkbox, completada && styles.checkboxCompletado]} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.titulo, completada && styles.textoCompletado]}>
          {titulo}
        </Text>
        {descripcion && (
          <Text style={[styles.descripcion, completada && styles.textoCompletado]}>
            {descripcion}
          </Text>
        )}
      </View>
      <View style={styles.xpBadge}>
        <Text style={styles.xpTexto}>+{xpRecompensa} XP</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#444',
  },
  cardCompletada: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
    opacity: 0.7,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#55FF55',
  },
  checkboxCompletado: {
    backgroundColor: '#55FF55',
  },
  infoContainer: {
    flex: 1,
  },
  titulo: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descripcion: {
    color: '#AAA',
    fontSize: 12,
    marginTop: 2,
  },
  textoCompletado: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  xpBadge: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  xpTexto: {
    color: '#55FF55',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
