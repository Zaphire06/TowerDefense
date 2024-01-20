import Enemy from "./Enemy.js";
import Base from "./Base.js";

export default class GameModel {
    constructor(board) {
        this.score = 0;
        this.lives = 20; // Supposons que le joueur commence avec 20 vies
        this.level = 1;
        this.towers = []; // Liste des tours placées
        this.fences = []; // Liste des tours placées
        this.enemies = []; // Liste des ennemis actuellement sur le plateau
        this.enemySpawnQueue = []; // Liste des ennemis à faire apparaître
        this.credits = 100; // Supposons que le joueur commence avec 100 crédits
        this.board = board; // Le plateau de jeu
        this.base = new Base(100); // La base du joueur

        this.tick = 0;
        this.tickDuration = 1000; // Durée d'un tick en millisecondes, ajustez selon vos besoins
        this.lastUpdateTime = Date.now();
    }

    startLevel() {
        // Logique pour démarrer le niveau, comme générer des ennemis
        this.generateEnemies(this.level);
        console.log("enemies");
    }

    generateEnemies(level) {
        // Planifiez la génération des ennemis sur plusieurs ticks
        this.enemySpawnQueue = Array.from({ length: level * 20 }, () => ({
            health: 100,
            speed: 1,
            reward: 25
        }));
    }

    addTower(tower) {
        if (this.credits >= tower.cost) {
            this.towers.push(tower);
            this.credits -= tower.cost;
        }
    }

    addFence(fence) {
        if (this.credits >= tower.cost) {
            this.towers.push(tower);
            this.credits -= tower.cost;
        }
    }

    removeTower(towerId) {
        const index = this.towers.findIndex(tower => tower.id === towerId);
        if (index !== -1) {
            this.credits += this.towers[index].refundValue; // Suppose the tower has a refund value
            this.towers.splice(index, 1);
        }
    }

    update(gameView, uiController) {
        // console.log("update");
        this.enemies = this.enemies.filter(enemy => enemy.alive);
        uiController.updateUI();
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime > this.tickDuration) {
            this.tick++;

            if (this.enemySpawnQueue && this.enemySpawnQueue.length > 0) {
                const enemyInfo = this.enemySpawnQueue.shift(); // Retirez le premier élément de la file d'attente
                const newEnemy = new Enemy(enemyInfo.health, enemyInfo.speed, enemyInfo.reward, this.board);
                this.enemies.push(newEnemy);
            }

            // Trouver et attaquer les ennemis pour chaque tour
            this.towers.forEach(tower => {
                tower.findEnemiesInRange(this.enemies);
                const attackInfo = tower.attack();
                if (attackInfo) {
                    console.log(attackInfo);
                    gameView.createProjectile(attackInfo);
                }
            });

            // Subir des dégats pour chaque ennemi bloqué par une barrière
            this.fences.forEach((fence, index) => {
                fence.findEnemiesInRange(this.enemies);
                for (let i = 0; i < fence.enemiesInRange.length; i++) {
                    if (fence.alive) {
                        fence.takeDamage(fence.enemiesInRange[i].damage);
                    }
                    if (!fence.alive) {
                        this.fences.splice(index, 1);
                        console.log("fence destroyed");
                    }
                }
            });

            //this.fences = this.fences.filter(fence => fence.alive);

            // Mettre à jour les ennemis en fonction du tick
            this.enemies.forEach(enemy => {
                if (enemy.alive) {
                    enemy.updateOnTick(this.tick);
                    if (enemy.pathIndex === enemy.path.length - 1) {
                        this.base.takeDamage(enemy.damage);
                    }
                } else {
                    this.credits += enemy.reward;
                    console.log('dead')
                }
            });

            this.lastUpdateTime = currentTime;
        }
    }

    updateScore(points) {
        this.score += points;
    }

    loseLife() {
        this.lives -= 1;
        if (this.lives <= 0) {
            this.endGame();
        }
    }

    endGame() {
        // Logique pour terminer le jeu, comme afficher un écran de game over
    }
}
