import * as THREE from '../node_modules/three/build/three.module.js';
import Board from '../models/Board.js';
import GameModel from '../models/GameModel.js';
import GameView from '../views/GameView.js';
import UIController from '../views/UIController.js';
import Tower from '../models/Tower.js';
import Fence from '../models/Fence.js';

export default class GameController {
    constructor() {
        this.board = new Board(20, 20);
        this.gameModel = new GameModel(this.board);
        this.gameView = new GameView(this.board, this.gameModel);
        this.uiController = new UIController(this.gameModel);

        document.addEventListener('click', this.handleMouseClick);
    }

    setupFenceButton() {
        const addFenceButton = document.getElementById('fence-button');
        addFenceButton.addEventListener('click', () => {
            console.log("placementFenceMode0");
            this.enableFencePlacementMode();
        });
    }
    setupTowerButton() {
        const addTowerButton = document.getElementById('tower-button');
        addTowerButton.addEventListener('click', () => {
            console.log("placementTowerMode0");
            this.enableTowerPlacementMode();
        });
    }


    enableTowerPlacementMode() {
        this.placementFenceMode = false;
        this.placementTowerMode = true;
        console.log("placementTowerMode1");
        this.gameView.showTowerPreview();

    }

    enableFencePlacementMode() {
        this.placementTowerMode = false;
        this.placementFenceMode = true;
        console.log("placementFenceMode1");
        this.gameView.showFencePreview();
    }

    handleMouseClick = (event) => {
        console.log("placementMode5", event);
        const rect = this.gameView.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.gameView.camera);

        const intersects = raycaster.intersectObjects(this.gameView.scene.children);
        console.log("placementMode0");
        for (let intersect of intersects) {
            if (intersect.object.userData.x !== undefined && intersect.object.userData.y !== undefined) {
                const { x, y } = intersect.object.userData;
                if (this.placementTowerMode) {
                    console.log("placementTowerMode");
                    // Placez la tour et désactivez le mode de placement
                    this.placeTower({ x, y }, false);
                    this.placementTowerMode = false;
                    this.gameView.removeTowerPreview();
                }
                if (this.placementFenceMode) {
                    console.log("placementFenceMode");
                    // Placez la tour et désactivez le mode de placement
                    this.placeFence({ x, y }, false);
                    this.placementFenceMode = false;
                    this.gameView.removeFencePreview();
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
                this.gameView.addTower(tower, false); // Ajouter la tour à la vue
                this.gameModel.credits -= tower.cost; // Déduire le coût de la tour des crédits du joueur
            } else {
                console.log("Not enough credits");
            }
        }
    };

    placeFence({ x, y }) {
        let pathIndex = 0;
        pathIndex = this.board.path.findIndex(pathPoint => {
            return pathPoint.x === x && pathPoint.y === y;
        });
        console.log("pathIndex", pathIndex);
        // Convertir les coordonnées de la souris en coordonnées de la grille
        if (this.gameModel.board.canPlaceFence(x, y)) {
            const fence = new Fence({ x, y }, pathIndex);
            console.log("fence", fence);
            if (this.gameModel.credits >= fence.cost) {
                this.gameModel.fences.push(fence); // Ajouter la tour au modèle
                this.gameView.addFence(fence, false); // Ajouter la tour à la vue
                this.gameModel.credits -= fence.cost; // Déduire le coût de la tour des crédits du joueur
            } else {
                console.log("Not enough credits");
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
        raycaster.setFromCamera(mouseVector, this.gameView.camera);

        // Utilisez le plan de raycasting existant dans GameView
        const intersects = raycaster.intersectObject(this.gameView.raycastingPlane);

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
        this.gameModel.startLevel();
        this.startGameLoop();
        //this.gameView.initScene(); // Assurez-vous que la vue est initialisée
    }

    startGameLoop() {
        console.log("startGameLoop");
        const gameLoop = () => {
            this.gameModel.update(this.gameView, this.uiController);
            requestAnimationFrame(gameLoop);
        };

        gameLoop();
    }

    // Ajoutez d'autres méthodes pour gérer les actions du jeu, comme les mises à niveau et les attaques des tours
}