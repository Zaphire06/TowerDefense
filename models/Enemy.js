export default class Enemy {
    constructor(health, speed, reward, board) {
        this.health = health;
        this.speed = speed;
        this.damage = 10;
        this.reward = reward;
        this.grid = board.grid;
        this.path = board.path;
        this.pathIndex = -1; // Position actuelle de l'ennemi sur le chemin
        this.position = this.path[this.pathIndex]; // Position initiale de l'ennemi sur le chemin
        this.alive = true;
        this.stuck = false;
    }

    move() {
        if (this.stuck == false) {
            // Déplacez l'ennemi le long du chemin
            this.pathIndex += 1;
        }

        if (this.pathIndex >= this.path.length) {
            // L'ennemi a atteint la fin du chemin
            // this.alive = false;
            this.pathIndex = this.path.length - 1;
            console.log("Enemy reached end of path");
            // Vous pouvez ici déclencher la perte d'une vie ou d'autres conséquences
        } else {
            // Mettre à jour la position de l'ennemi
            this.position = this.path[this.pathIndex];
        }
    }

    updateOnTick(currentTick) {
        // Supposons que 'speed' détermine le nombre de ticks nécessaires pour un déplacement
        if (currentTick % this.speed === 0) {
            this.move();
        }

        // Autres actions basées sur les ticks
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.alive = false;
        }
    }
}
