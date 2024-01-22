import SoundState from './SoundState.js';
import MuteState from './MuteState.js';

export default class UnmuteState extends SoundState {
    playSound(soundManager, sound) {
        sound.play();
    }
    stopSound(soundManager) {
        soundManager.stopAllSounds();
    }
    toggleSound(soundManager) {
        soundManager.setState(new MuteState());
    }
}
