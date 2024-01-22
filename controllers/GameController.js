import * as THREE from '../node_modules/three/build/three.module.js';
import Board from '../models/Board.js';
import GameModel from '../models/GameModel.js';
import UIController from '../views/UIController.js';
import Tower from '../models/Tower.js';
import Fence from '../models/Fence.js';
import ViewController from './ViewController.js';
import SoundManager from '../models/SoundManager.js';

export default class GameController {
    static instance = null;

    constructor() {
        if (GameController.instance) {
            return GameController.instance;
        }
        GameController.instance = this;

        this.board = new Board(20, 20);
        this.gameModel = new GameModel(this.board, [], 1, 3);
        this.viewController;
        this.uiController = new UIController(this.gameModel);
        this.actualLevel = 1;
        this.firstClick = false;
        this.retry = false;
        this.soundManager = new SoundManager();

        document.addEventListener('click', this.handleMouseClick);

        this.gameModel.subscribe(this.uiController);
    }

    static getInstance() {
        if (!GameController.instance) {
            GameController.instance = new GameController();
        }
        return GameController.instance;
    }

    setupFenceButton() {
        const addFenceButton = document.getElementById('fence-button');
        addFenceButton.addEventListener('click', () => {
            this.enableFencePlacementMode();
        });
    }
    setupTowerButton() {
        const addTowerButton = document.getElementById('tower-button');
        addTowerButton.addEventListener('click', () => {
            this.enableTowerPlacementMode();
        });
    }

    setupMuteButton() {
        const muteButton = document.getElementById('mute-button');
        muteButton.addEventListener('click', () => {
            this.soundManager.toggleSound();
            this.soundManager.toggleMute();
        });

        document.getElementById('retry-button').addEventListener('click', () => {
            this.retry = true;
        });
    }

    enableTowerPlacementMode() {
        this.viewController.towerView.removeTowerPreview();
        this.placementFenceMode = false;
        this.viewController.fenceView.removeFencePreview();
        this.placementTowerMode = true;
        this.viewController.towerView.showTowerPreview();

    }

    enableFencePlacementMode() {
        this.viewController.fenceView.removeFencePreview();
        this.placementTowerMode = false;
        this.viewController.towerView.removeTowerPreview();
        this.placementFenceMode = true;
        this.viewController.fenceView.showFencePreview();
    }

    handleMouseClick = (event) => {
        if (!this.firstClick) {
            this.soundManager.playSound('backgroundMusic');
            this.firstClick = false;
        }
        const rect = this.viewController.getRenderer().domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.viewController.getCamera());

        const intersects = raycaster.intersectObjects(this.viewController.getScene().children);
        for (let intersect of intersects) {
            if (intersect.object.userData.x !== undefined && intersect.object.userData.y !== undefined) {
                const { x, y } = intersect.object.userData;
                if (this.placementTowerMode) {
                    // Placez la tour et désactivez le mode de placement
                    this.placeTower({ x, y }, false);
                    this.placementTowerMode = false;
                    this.viewController.towerView.removeTowerPreview();
                }
                if (this.placementFenceMode) {
                    // Placez la tour et désactivez le mode de placement
                    this.placeFence({ x, y }, false);
                    this.placementFenceMode = false;
                    this.viewController.fenceView.removeFencePreview();
                }
            }
        }

    };

    placeTower({ x, y }) {
        // Convertir les coordonnées de la souris en coordonnées de la grille
        if (this.gameModel.board.canPlaceTower(x, y)) {
            const tower = new Tower({ x, y });
            if (this.gameModel.credits >= tower.cost) {
                this.gameModel.towers.push(tower); // Ajouter la tour au modèle
                this.viewController.towerView.addTower(tower, false); // Ajouter la tour à la vue
                this.gameModel.credits -= tower.cost; // Déduire le coût de la tour des crédits du joueur
            }
        }
    };

    placeFence({ x, y }) {
        let pathIndex = 0;
        pathIndex = this.board.path.findIndex(pathPoint => {
            return pathPoint.x === x && pathPoint.y === y;
        });
        // Convertir les coordonnées de la souris en coordonnées de la grille
        if (this.gameModel.board.canPlaceFence(x, y)) {
            const fence = new Fence({ x, y }, pathIndex);
            if (this.gameModel.credits >= fence.cost) {
                this.gameModel.fences.push(fence); // Ajouter la tour au modèle
                this.viewController.fenceView.addFence(fence, false); // Ajouter la tour à la vue
                this.gameModel.credits -= fence.cost; // Déduire le coût de la tour des crédits du joueur
            }
        }
    };

    getGridPosition(mouse) {
        const raycaster = new THREE.Raycaster();
        const mouseVector = new THREE.Vector2(
            (mouse.x / window.innerWidth) * 2 - 1,
            -(mouse.y / window.innerHeight) * 2 + 1
        );

        // Convertir les coordonnées de la souris en coordonnées normalisées pour le raycaster
        raycaster.setFromCamera(mouseVector, this.viewController.getCamera());

        // Utilisez le plan de raycasting existant dans viewController
        const intersects = raycaster.intersectObject(this.viewController.getScene().raycastingPlane);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            // Ajuster en fonction de l'origine de votre grille
            const gridX = Math.round(intersectPoint.x + this.board.width / 2);
            const gridY = Math.round(intersectPoint.z + this.board.height / 2);

            if (gridX >= 0 && gridX < this.board.width && gridY >= 0 && gridY < this.board.height) {
                return { x: gridX, y: gridY };
            }
        }
        return null; // Retourne null si la position n'est pas valide ou hors du plan
    }

    startGame() {
        // Commencez le jeu, par exemple en lançant la première vague d'ennemis
        this.board = new Board(20, 20);
        this.viewController = new ViewController(this.board, this.gameModel)
        this.gameModel.startLevel(this.board);
        this.startGameLoop();
        //this.gameView.initScene(); // Assurez-vous que la vue est initialisée
    }

    restartLevel(board, level, lives) {
        document.getElementById('retry').style.display = 'initial';

        this.gameModel.enemySpawnQueue = [];
        const waitForRetryClick = () => {
            return new Promise(resolve => {

                document.getElementById('retry-button').addEventListener('click', () => {
                    resolve();
                }, { once: true });
            });
        };

        waitForRetryClick().then(() => {
            this.board = board;
            document.getElementById('retry').style.display = 'none';
            this.retry = false;
            const obs = this.gameModel.observers;
            this.gameModel = new GameModel(board, obs, level, lives);
            this.viewController.clearScene();
            this.viewController = null;
            const oldCanvas = document.querySelector('canvas');
            if (oldCanvas) {
                oldCanvas.remove();
            }
            this.viewController = new ViewController(this.board, this.gameModel);
            this.gameModel.startLevel(this.board);
        });
    }

    nextLevel(board, level, lives) {
        document.getElementById('next-lvl').style.display = 'initial';

        this.gameModel.enemySpawnQueue = [];
        const waitForRetryClick = () => {
            return new Promise(resolve => {

                document.getElementById('next-lvl-button').addEventListener('click', () => {
                    resolve();
                }, { once: true });
            });
        };

        waitForRetryClick().then(() => {
            this.board = board;
            document.getElementById('next-lvl').style.display = 'none';
            this.retry = false;
            const obs = this.gameModel.observers;
            this.gameModel = new GameModel(board, obs, level, lives);
            this.viewController.clearScene();
            this.viewController = null;
            const oldCanvas = document.querySelector('canvas');
            if (oldCanvas) {
                oldCanvas.remove();
            }
            this.viewController = new ViewController(this.board, this.gameModel);
            this.gameModel.startLevel(this.board);
        });
    }

    gameOver() {
        document.getElementById('game-over').style.display = 'initial';

        this.gameModel.enemySpawnQueue = [];
        const waitForRetryClick = () => {
            return new Promise(resolve => {

                document.getElementById('game-over-button').addEventListener('click', () => {
                    resolve();
                }, { once: true });
            });
        };

        waitForRetryClick().then(() => {
            this.board = new Board(20, 20);
            document.getElementById('game-over').style.display = 'none';
            this.retry = false;
            const obs = this.gameModel.observers;
            this.gameModel = new GameModel(this.board, obs, 1, 3);
            this.viewController.clearScene();
            this.viewController = null;
            const oldCanvas = document.querySelector('canvas');
            if (oldCanvas) {
                oldCanvas.remove();
            }
            this.viewController = new ViewController(this.board, this.gameModel);
            this.gameModel.startLevel(this.board);
        });
    }

    startGameLoop() {
        const gameLoop = () => {
            this.gameModel.update(this.viewController);
            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }

    // Ajoutez d'autres méthodes pour gérer les actions du jeu, comme les mises à niveau et les attaques des tours
}