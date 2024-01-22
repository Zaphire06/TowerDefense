import * as THREE from '../node_modules/three/build/three.module.js';
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
        const loader = new THREE.TextureLoader();
        this.fond = loader.load('../assets/fond.gif');
        this.initFPSCounter();
        // Initialiser la scène, la lumière et le rendu
        this.initScene();
        // Créer un plan pour le raycasting
        this.initRaycastingPlane();
    }

    initScene() {
        // Créer la scène
        this.scene = new THREE.Scene();

        // Ajouter la caméra
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        this.camera.position.set(0, 9, 16); // Place la caméra au-dessus de la grille
        this.camera.lookAt(new THREE.Vector3(0, 0, -2)); // Fait regarder la caméra vers le centre de la grille

        // Ajouter la lumière
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Ajouter le rendu
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        //fond
        const planeGeometry = new THREE.PlaneGeometry(window.innerWidth + 1500, window.innerHeight + 900);
        const planeMaterial = new THREE.MeshBasicMaterial({ map: this.fond });
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        planeMesh.position.set(this.camera.position.x, this.camera.position.y - 200, -850);
        planeMesh.rotateX(-0.5);
        this.scene.add(planeMesh);

        document.getElementById('game-container').appendChild(this.renderer.domElement);
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

    updatePreviewPosition = (event) => {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.scene.children);

        for (let intersect of intersects) {
            if (intersect.object.userData.x !== undefined && intersect.object.userData.y !== undefined) {
                const { x, y } = intersect.object.userData;
                // Mettez à jour la position de l'aperçu de la tour et du cercle de portée
                if (this.towerPreview) {
                    const gridSize = 1.1;
                    this.towerPreview.mesh.position.set(
                        (x - this.board.width / 2) * gridSize,
                        0, // Hauteur au-dessus du sol
                        (y - this.board.height / 2) * gridSize
                    );

                    if (this.towerPreview.rangeMesh) {
                        this.towerPreview.rangeMesh.position.set(
                            (x - this.board.width / 2) * gridSize,
                            0.06, // Juste au-dessus du sol
                            (y - this.board.height / 2) * gridSize
                        );
                    }
                }
            }
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}