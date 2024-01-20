import * as THREE from 'three';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';

export default class ViewInitializer {
    constructor(board, gameModel) {
        this.board = board; // Instance de Board ou données de chemin
        this.gameModel = gameModel; // Instance de GameModel
        this.highlightMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 }); // Couleur pour la surbrillance
        this.previousIntersected = null; // Pour stocker le dernier mesh survolé
        this.projectiles = []; // Initialiser le tableau des projectiles
        this.towerPreview;
        this.scene;
        this.camera;
        this.renderer;
        this.initFPSCounter();
        // Initialiser la scène, la lumière et le rendu
        this.initScene();
        // Créer un plan pour le raycasting
        this.initRaycastingPlane();

        // Dessiner le plateau de jeu
        this.drawBoard();

        // Ajouter la base
        this.addBase();

        // Lancer la boucle de rendu
        this.animate();
    }

    initScene() {
        // Créer la scène
        this.scene = new THREE.Scene();

        // Ajouter la caméra
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        this.camera.position.set(0, 13, 15); // Place la caméra au-dessus de la grille
        this.camera.lookAt(new THREE.Vector3(0, 0, 2)); // Fait regarder la caméra vers le centre de la grille

        // Ajouter la lumière
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Ajouter le rendu
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x8f9493); // Couleur de fond grise pour contraste
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Dessinez le plateau avant d'ajouter des éléments supplémentaires
        this.drawBoard();

        // Ajouter la ville
        this.addCityToScene(this.scene, this.board);

        // Lancer la boucle de rendu
        this.animate();
    }

    initFPSCounter() {
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    initRaycastingPlane() {
        const boardWidth = this.board.width;
        const boardHeight = this.board.height;
        const planeGeometry = new THREE.PlaneGeometry(boardWidth, boardHeight);
        this.raycastingPlane = new THREE.Mesh(
            planeGeometry,
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.raycastingPlane.rotation.x = -Math.PI / 2;
        this.scene.add(this.raycastingPlane);
    }
}