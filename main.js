import GameController from './controllers/GameController.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le modèle, la vue, et le contrôleur
    const gameController = GameController.getInstance();

    gameController.setupTowerButton();
    gameController.setupFenceButton();
    gameController.setupMuteButton();

    // Lancer le jeu
    gameController.startGame();
});