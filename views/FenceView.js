import * as THREE from '../node_modules/three/build/three.module.js';

import Fence from '../models/Fence.js';
import Preview from './Preview.js';

export default class FenceView {
    constructor(scene, camera, renderer, board) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.board = board;
    }

    addFence(fence, isPreview) {
        const cellSize = 1; // Taille des cellules, cohérente avec drawBoard
        const cellSpacing = 0.1; // Espace entre les cellules, cohérent avec drawBoard
        const gridSize = cellSize + cellSpacing;

        // Groupe pour la barrière
        const fenceGroup = new THREE.Group();

        // Créer deux parties de la barrière pour former un "L"
        const geometryHorizontal = new THREE.BoxGeometry(0.9, 0.5, 0.1);
        const geometryVertical = new THREE.BoxGeometry(0.1, 0.5, 0.9);
        const material = new THREE.MeshPhongMaterial({ color: 0x9E9E9E, emissive: 0x5C5C5C });

        const fenceMeshHorizontal = new THREE.Mesh(geometryHorizontal, material);
        fenceMeshHorizontal.position.set(0, 0.25, -0.4); // Position légèrement surélevée et décalée

        const fenceMeshVertical = new THREE.Mesh(geometryVertical, material);
        fenceMeshVertical.position.set(0.4, 0.25, 0); // Position légèrement surélevée et décalée

        fenceGroup.add(fenceMeshHorizontal);
        fenceGroup.add(fenceMeshVertical);

        // Ajouter des arêtes colorées à chaque partie
        const edgesGeometryHorizontal = new THREE.EdgesGeometry(fenceMeshHorizontal.geometry);
        const edgesGeometryVertical = new THREE.EdgesGeometry(fenceMeshVertical.geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const edgesMeshHorizontal = new THREE.LineSegments(edgesGeometryHorizontal, edgesMaterial);
        const edgesMeshVertical = new THREE.LineSegments(edgesGeometryVertical, edgesMaterial);

        fenceMeshHorizontal.add(edgesMeshHorizontal);
        fenceMeshVertical.add(edgesMeshVertical);

        // Ajuster la position globale du groupe
        fenceGroup.position.set(
            (fence.position.x - this.board.width / 2) * gridSize,
            0, // Hauteur au-dessus du sol
            (fence.position.y - this.board.height / 2) * gridSize
        );

        // Ajouter le groupe de la barrière à la scène et stocker la référence
        this.scene.add(fenceGroup);
        fence.mesh = fenceGroup;

        // Si c'est un aperçu, ajouter une transparence
        if (isPreview) {
            fenceMeshHorizontal.material.opacity = 0.5;
            fenceMeshVertical.material.opacity = 0.5;
            fenceMeshHorizontal.material.transparent = true;
            fenceMeshVertical.material.transparent = true;
        }
    }

    showFencePreview() {
        // Créer une tour temporaire (sans la positionner sur la grille)
        let x = 0;
        let y = 0;
        this.fencePreview = Preview.addPreview("fence", { x, y });
        this.addFence(this.fencePreview, true);
        // Gérez le mouvement de la souris pour mettre à jour la position de l'aperçu
        document.addEventListener('mousemove', this.updatePreviewPosition);
    }

    removeFencePreview() {
        if (this.fencePreview) {
            this.scene.remove(this.fencePreview.mesh);
            this.fencePreview = null;
        }
        // Supprimez le gestionnaire d'événements pour le mouvement de la souris
        document.removeEventListener('mousemove', this.updatePreviewPosition);
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
                if (this.fencePreview) {
                    const gridSize = 1.1;
                    this.fencePreview.mesh.position.set(
                        (x - this.board.width / 2) * gridSize,
                        0, // Hauteur au-dessus du sol
                        (y - this.board.height / 2) * gridSize
                    );
                }
            }
        }
    }
}