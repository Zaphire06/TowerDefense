import UnmuteState from "./UnmuteState.js";

export default class SoundManager {
    constructor() {
        this.state = new UnmuteState(); // État initial
        this.sounds = {
            'backgroundMusic': new Audio('../assets/Theme.mp3'),
            'shotSound': new Audio('../assets/shot.mp3')
        };
        this.isMuted = false;

        // Paramètres par défaut pour le son d'arrière-plan
        this.sounds['backgroundMusic'].volume = 0.1;
        this.sounds['backgroundMusic'].loop = true;

        // Paramètres par défaut pour le son de tir
        this.sounds['shotSound'].volume = 0.2;
    }

    setState(state) {
        this.state = state;
    }

    playSound(soundName) {
        if (this.sounds[soundName] && !this.isMuted) {
            this.sounds[soundName].play();
        }
    }

    stopSound(soundName) {
        this.state.stopSound(this);
    }

    toggleSound() {
        this.state.toggleSound(this);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        for (let key in this.sounds) {
            this.sounds[key].muted = this.isMuted;
        }
    }
}
