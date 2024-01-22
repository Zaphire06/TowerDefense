export default class Fence {
    static lastId = 0; // Variable statique pour suivre le dernier ID utilisé

    constructor(position, pathIndex) {
        this.id = Fence.lastId++; // Attribuer un nouvel ID et incrémenter le dernier ID
        this.cost = 25; // Coût fixe pour l'instant
        this.position = position; // Position {x, y} sur le plateau
        this.pathIndex = pathIndex;
        this.enemiesInRange = [];
        this.health = 150;
        this.alive = true;
    }


    findEnemiesInRange(enemies) {
        // Mettre à jour la liste des ennemis à portée
        enemies.filter(enemy => {
            if (enemy.pathIndex != -1) {
                if (enemy.pathIndex == this.pathIndex - 1) {
                    if (enemy.stuck == false) {
                        enemy.stuck = true;
                        this.enemiesInRange.push(enemy);
                    }
                } else {
                    enemy.stuck = false;
                }
            }

        });
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            for (let i = 0; i < this.enemiesInRange.length; i++) {
                this.enemiesInRange[i].stuck = false;
            }
            //this.enemiesInRange = [];
            this.alive = false;
        }
    }

    upgrade() {
        // Augmente la portée et les dégâts, par exemple
        this.range += 1;
        this.damage += 15;
    }
}
