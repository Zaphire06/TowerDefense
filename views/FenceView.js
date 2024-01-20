import Fence from '../models/Fence.js';

export default class FenceView {
    constructor(scene, board) {
        this.scene = scene;
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
        this.fencePreview = new Fence({ x, y }, null);
        this.addFence(this.fencePreview, true);
        console.log("showFencePreview", this.fencePreview)
        // Gérez le mouvement de la souris pour mettre à jour la position de l'aperçu
        document.addEventListener('mousemove', this.updatePreviewPosition);
    }

    removeFencePreview() {
        // Supprimez le gestionnaire d'événements pour le mouvement de la souris
        document.removeEventListener('mousemove', this.updatePreviewPosition);
    }
}