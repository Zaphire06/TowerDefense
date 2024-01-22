import SoundState from './SoundState.js';
import UnmuteState from './UnmuteState.js';

export default class MuteState extends SoundState {
    playSound(soundManager) {
        // Ne rien faire car le son est en sourdine
    }
    stopSound(soundManager) {
        // Vous pouvez arrêter les sons même en mode sourdine
        soundManager.stopAllSounds();
    }
    toggleSound(soundManager) {
        soundManager.setState(new UnmuteState());
    }
}
