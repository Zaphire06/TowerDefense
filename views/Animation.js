export default class Animation {
    constructor(scene, gameModel, board) {
        this.scene = scene;
        this.gameModel = gameModel;
        this.board = board;
        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);

        // Commencez à mesurer le temps pour cette frame
        this.stats.begin()

        const currentTime = Date.now();

        // Vérifier et ajouter des ennemis visuels si nécessaire
        this.gameModel.enemies.forEach(enemy => {
            if (!enemy.mesh && enemy.health != 0) {
                console.log("SPAWN 2")
                this.addEnemy(enemy);
            }
        });

        this.gameModel.fences.forEach((fence, index) => {
            if (!fence.alive) {
                // Si l'ennemi est mort, retirez-le de la scène et du tableau
                if (fence.mesh) this.scene.remove(fence.mesh);
                if (fence.healthBar) this.scene.remove(fence.healthBar);
                this.gameModel.enemies.splice(index, 1);
                return;
            }
        });

        // Mettre à jour la position de chaque ennemi
        this.gameModel.enemies.forEach((enemy, index) => {
            if (!enemy.alive) {
                // Si l'ennemi est mort, retirez-le de la scène et du tableau
                if (enemy.mesh) this.scene.remove(enemy.mesh);
                if (enemy.healthBar) this.scene.remove(enemy.healthBar);
                this.gameModel.enemies.splice(index, 1);
                return;
            }

            const tickDuration = this.gameModel.tickDuration; // Durée d'un tick en millisecondes
            const elapsedSinceLastTick = currentTime - this.gameModel.lastUpdateTime;
            const tickProgress = Math.min(elapsedSinceLastTick / tickDuration, 1); // Progrès dans le tick actuel, de 0 à 1

            const gridSize = 1.1;

            // Calculez la position de départ et de fin pour l'ennemi
            const startPosition = {
                x: (enemy.path[enemy.pathIndex].x - this.board.width / 2) * gridSize,
                y: (enemy.path[enemy.pathIndex].y - this.board.height / 2) * gridSize
            };

            let nextPositionIndex = enemy.pathIndex + enemy.speed;
            nextPositionIndex = Math.min(nextPositionIndex, enemy.path.length - 1); // Assurez-vous de ne pas dépasser la longueur du chemin

            let endPosition;
            if (!enemy.stuck) {
                endPosition = {
                    x: (enemy.path[nextPositionIndex].x - this.board.width / 2) * gridSize,
                    y: (enemy.path[nextPositionIndex].y - this.board.height / 2) * gridSize
                };
            } else {
                endPosition = {
                    x: (enemy.path[enemy.pathIndex].x - this.board.width / 2) * gridSize,
                    y: (enemy.path[enemy.pathIndex].y - this.board.height / 2) * gridSize
                };
            }

            // Interpolez la position en fonction de la progression du tick
            enemy.mesh.position.x = startPosition.x + (endPosition.x - startPosition.x) * tickProgress;
            enemy.mesh.position.z = startPosition.y + (endPosition.y - startPosition.y) * tickProgress;
            enemy.mesh.position.y = 0.5; // Hauteur constante

            // Mettre à jour la barre de santé
            if (enemy.healthBar) {
                const healthScale = enemy.health / enemy.maxHealth;
                enemy.healthBar.scale.x = healthScale; // Réduire la largeur de la barre de vie
                enemy.healthBar.position.x = -0.5 * (1 - healthScale); // Centrer la barre de vie
            }
        });


        // Animer les projectiles
        this.projectiles.forEach((projectileInfo, index) => {
            if (!projectileInfo.target.alive) {
                // Si la cible est morte, retirez le projectile
                this.scene.remove(projectileInfo.mesh);
                this.projectiles.splice(index, 1);
                return;
            }

            // Recalculer la position finale en fonction de la position actuelle de la cible
            projectileInfo.endPosition.set(
                (projectileInfo.target.position.x - this.board.width / 2) * 1.1,
                0.5, // hauteur de l'ennemi
                (projectileInfo.target.position.y - this.board.height / 2) * 1.1
            );

            // Mise à jour de la progression du projectile (augmentez cette valeur pour une vitesse plus rapide)
            projectileInfo.progress += 0.2; // Augmenter cette valeur pour un déplacement plus rapide

            // Interpolation linéaire de la position du projectile
            projectileInfo.mesh.position.lerpVectors(
                projectileInfo.startPosition,
                projectileInfo.endPosition,
                projectileInfo.progress
            );

            // Vérifier si le projectile a atteint sa cible
            if (projectileInfo.progress >= 1) {
                // Retirer le projectile de la scène et du tableau
                this.scene.remove(projectileInfo.mesh);
                this.projectiles.splice(index, 1);
            }
        });
        // Filtrer les projectiles qui ont atteint leur cible
        this.projectiles = this.projectiles.filter(projectile => projectile.progress < 1);

        // Rendre la scène
        this.renderer.render(this.scene, this.camera);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xaaaaaa); // Couleur de fond grise pour contraste

        this.stats.end();

    }
}