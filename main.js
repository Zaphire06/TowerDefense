import GameModel from './models/GameModel.js';
import GameView from './views/GameView.js';
import GameController from './controllers/GameController.js';
import Board from './models/Board.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le modèle, la vue, et le contrôleur
    const board = new Board(20, 20);
    const gameModel = new GameModel(board);
    const gameView = new GameView(board, gameModel);
    const gameController = new GameController(gameModel, gameView, board);

    gameController.setupTowerButton();
    
    // Lancer le jeu
    gameController.startGame();
});