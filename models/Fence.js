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
            console.log(enemy.pathIndex, this.pathIndex);
            if (enemy.pathIndex != -1) {
                if (enemy.pathIndex == this.pathIndex - 1) {
                    if (enemy.stuck == false) {
                        enemy.stuck = true;
                        this.enemiesInRange.push(enemy);
                        console.log("fence enemies0", this.enemiesInRange.length);
                        console.log("enemy stuck", enemy);
                    }
                } else {
                    enemy.stuck = false;
                }
            }

        });
        console.log("fence enemies1", this.enemiesInRange);
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log("fence", this.health, "amount", amount);
        console.log("fence enemies", this.enemiesInRange.length);
        if (this.health <= 0) {
            for (let i = 0; i < this.enemiesInRange.length; i++) {
                this.enemiesInRange[i].stuck = false;
                console.log("enemy unstuck", this.enemiesInRange[i]);
            }
            //this.enemiesInRange = [];
            this.alive = false;
        }
    }

    upgrade() {
        // Augmente la portée et les dégâts, par exemple
        this.range += 1;
        this.damage += 15;
        console.log(`Tower ${this.id} upgraded to range ${this.range} and damage ${this.damage}.`);
    }
}
