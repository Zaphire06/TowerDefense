import * as THREE from '../node_modules/three/build/three.module.js';
import Tower from '../models/Tower.js';
import Preview from './Preview.js';

export default class TowerView {
    constructor(scene, camera, renderer, board) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.board = board;
        this.projectiles = []; // Initialiser le tableau des projectiles
    }

    addTower(tower, isPreview) {
        const cellSize = 1; // Taille des cellules, cohérente avec drawBoard
        const cellSpacing = 0.1; // Espace entre les cellules, cohérent avec drawBoard
        const gridSize = cellSize + cellSpacing;

        // Groupe pour la tour
        const towerGroup = new THREE.Group();

        // Géométrie et matériel du socle
        const baseGeometry = new THREE.CylinderGeometry(0.6, 0.6, 0.2, 32);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x333366, emissive: 0x222244 });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        baseMesh.position.set(0, 0.1, 0); // Position légèrement surélevée
        towerGroup.add(baseMesh);

        // Géométrie et matériel de la tour principale
        const geometry = new THREE.CylinderGeometry(0.5, 0.5, 1.5, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x000000, emissive: 0x000000 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 1, 0); // Position au-dessus du socle
        towerGroup.add(mesh);

        // Ajouter une antenne
        const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x00ff00 });
        const antennaMesh = new THREE.Mesh(antennaGeometry, antennaMaterial);
        antennaMesh.position.set(0, 2, 0); // Position au sommet de la tour
        towerGroup.add(antennaMesh);

        // Ajuster la position globale du groupe
        towerGroup.position.set(
            (tower.position.x - this.board.width / 2) * gridSize,
            0, // Hauteur au-dessus du sol
            (tower.position.y - this.board.height / 2) * gridSize
        );

        // Ajouter des arêtes colorées
        const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
        const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        mesh.add(edgesMesh);

        // Créer un cercle pour le rayon de tir
        if (isPreview) {
            const rangeGeometry = new THREE.CircleGeometry(tower.range, 32);
            const rangeMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.5
            });
            const rangeMesh = new THREE.Mesh(rangeGeometry, rangeMaterial);
            rangeMesh.rotation.x = -Math.PI / 2; // Orienter le cercle horizontalement
            rangeMesh.position.set(
                (tower.position.x - this.board.width / 2) * gridSize,
                0.01, // Juste au-dessus du sol
                (tower.position.y - this.board.height / 2) * gridSize
            );

            // Ajouter le cercle de portée à la scène
            this.scene.add(rangeMesh);
            tower.rangeMesh = rangeMesh; // Stocker une référence au mesh dans l'objet tower
        }

        // Ajouter le groupe de la tour à la scène et stocker la référence
        this.scene.add(towerGroup);
        tower.mesh = towerGroup;
    }

    showTowerPreview() {
        // Créer une tour temporaire (sans la positionner sur la grille)
        let x = 0;
        let y = 0;
        this.towerPreview = Preview.addPreview("tower", { x, y });
        this.addTower(this.towerPreview, true);
        // Gérez le mouvement de la souris pour mettre à jour la position de l'aperçu
        document.addEventListener('mousemove', this.updatePreviewPosition);
    }

    removeTowerPreview() {
        // Supprimez l'aperçu de la tour de la scène
        if (this.towerPreview) {
            this.scene.remove(this.towerPreview.mesh);
            this.towerPreview.rangeMesh.visible = false;
            this.towerPreview = null;
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

    createProjectile(attackInfo) {
        if (!attackInfo || !attackInfo.target || !attackInfo.position || !attackInfo.target.position) return;

        // Créer un projectile
        const projectileGeometry = new THREE.SphereGeometry(0.2, 8, 8); // Taille réduite
        const projectileMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

        // Position initiale du projectile à la tour
        projectile.position.set(
            (attackInfo.position.x - this.board.width / 2) * 1.1,
            1, // hauteur
            (attackInfo.position.y - this.board.height / 2) * 1.1
        );

        // Ajouter le projectile à la scène
        this.scene.add(projectile);

        // Calculer la position finale initiale du projectile
        const endPosition = new THREE.Vector3(
            (attackInfo.target.position.x + 1 - this.board.width / 2) * 1.1,
            0.5, // hauteur de l'ennemi
            (attackInfo.target.position.y - this.board.height / 2) * 1.1
        );


        this.projectiles.push({
            mesh: projectile,
            target: attackInfo.target,
            startPosition: projectile.position.clone(),
            endPosition: endPosition,
            progress: 0
        });
    }
}