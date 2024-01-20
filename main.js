import GameController from './controllers/GameController.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le modèle, la vue, et le contrôleur
    const gameController = new GameController();

    gameController.setupTowerButton();
    gameController.setupFenceButton();

    // Lancer le jeu
    gameController.startGame();
});