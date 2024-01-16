import * as THREE from '../node_modules/three/build/three.module.js';
import Tower from '../models/Tower.js';

export default class GameController {
    constructor(model, gameView, gameBoard) {
        this.gameModel = model;
        this.gameView = gameView;
        this.gameBoard = gameBoard;
    }

    setupControls() {
        // Configurez ici les écouteurs d'événements pour la vue, par exemple, pour les clics de souris
        
    }

    setupTowerButton() {
        document.getElementById('ui-container').addEventListener('click', () => {
            console.log("okok");
        });//this.handleMouseClick);
        const addTowerButton = document.getElementById('tower-button');
            addTowerButton.addEventListener('click', () => {
                this.enableTowerPlacementMode();
            });
    }
    

    enableTowerPlacementMode() {
        this.placementMode = true;
        this.gameView.showTowerPreview();
    }

    handleMouseClick = (event) => {
        console.log("placementMode5");
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
                if (this.placementMode) {
                    console.log("placementMode");
                    // Placez la tour et désactivez le mode de placement
                    this.placeTower({x, y});
                    this.placementMode = false;
                    this.gameView.removeTowerPreview();
                }
            }
        }

    };
    
    placeTower({x, y}) {
        // Convertir les coordonnées de la souris en coordonnées de la grille
        if (this.gameModel.board.canPlaceTower(x, y)) {
            const tower = new Tower({x, y});
            this.gameModel.towers.push(tower); // Ajouter la tour au modèle
            this.gameView.addTower(tower, false); // Ajouter la tour à la vue
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
            const gridX = Math.round(intersectPoint.x + this.gameBoard.width / 2);
            const gridY = Math.round(intersectPoint.z + this.gameBoard.height / 2);
    
            if (gridX >= 0 && gridX < this.gameBoard.width && gridY >= 0 && gridY < this.gameBoard.height) {
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
            this.gameModel.update(this.gameView);
            requestAnimationFrame(gameLoop);
        };
    
        gameLoop();
    }

    // Ajoutez d'autres méthodes pour gérer les actions du jeu, comme les mises à niveau et les attaques des tours
}