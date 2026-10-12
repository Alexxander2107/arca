import { Audio } from 'expo-av';

// Tipos de efectos de sonido disponibles
export type SoundEffect = 'xp_gain' | 'level_up' | 'task_complete' | 'creeper_damage';

// Mapeo de archivos de audio
const SOUND_FILES: Record<SoundEffect, any> = {
  xp_gain: require('../../assets/sounds/xp.mp3'),
  level_up: require('../../assets/sounds/levelup.mp3'),
  task_complete: require('../../assets/sounds/complete.mp3'),
  creeper_damage: require('../../assets/sounds/creeper.mp3'),
};

class SoundService {
  private sounds: Partial<Record<SoundEffect, Audio.Sound>> = {};

  /**
   * Reproduce un efecto de sonido especifico.
   */
  async playSound(effect: SoundEffect): Promise<void> {
    try {
      // Si el sonido ya fue cargado previamente, lo descargamos para reiniciarlo
      if (this.sounds[effect]) {
        await this.sounds[effect]?.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(SOUND_FILES[effect]);
      this.sounds[effect] = sound;

      await sound.playAsync();
    } catch (error) {
      console.warn(`[SoundService] No se pudo reproducir el sonido: ${effect}`, error);
    }
  }

  /**
   * Limpia los recursos de audio alojados en memoria.
   */
  async unloadAll(): Promise<void> {
    for (const key of Object.keys(this.sounds) as SoundEffect[]) {
      if (this.sounds[key]) {
        await this.sounds[key]?.unloadAsync();
        delete this.sounds[key];
      }
    }
  }
}

export const soundService = new SoundService();
