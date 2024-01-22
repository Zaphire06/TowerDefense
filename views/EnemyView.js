import * as THREE from '../node_modules/three/build/three.module.js';

export default class EnemyView {
    constructor(scene) {
        this.scene = scene;
    }

    addEnemy(enemy) {
        const geometry = new THREE.ConeGeometry(0.5, 1, 3); // Créer une forme de triangle (cône avec 3 faces)
        const material = new THREE.MeshBasicMaterial({ color: 0x800080 }); // Couleur violette
        const mesh = new THREE.Mesh(geometry, material);

        const cellSize = 1; // Taille des cellules, doit être cohérente avec drawBoard
        const cellSpacing = 0.1; // Espace entre les cellules, doit être cohérent avec drawBoard
        const gridSize = cellSize + cellSpacing;

        this.scene.add(mesh);
        enemy.mesh = mesh; // Stocker une référence au mesh dans l'objet ennemi
    }

    createHealthBar() {
        const healthBarGeometry = new THREE.BoxGeometry(1, 0.1, 0.1);
        const healthBarMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
        const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
        healthBar.position.set(0, 1.5, 0); // Position au-dessus de l'ennemi

        return healthBar;
    }

    updateEnemyHealthBar(enemy) {
        if (enemy.healthBar && enemy.mesh) {
            const healthScale = enemy.health / enemy.maxHealth;
            enemy.healthBar.scale.x = healthScale; // Réduire la largeur de la barre de vie
            enemy.healthBar.position.x = -0.5 * (1 - healthScale); // Centrer la barre de vie
        }
    }
}