export default class Tower {
    static lastId = 0; // Variable statique pour suivre le dernier ID utilisé

    constructor(position) {
        this.id = Tower.lastId++; // Attribuer un nouvel ID et incrémenter le dernier ID
        this.cost = 0; // Coût fixe pour l'instant
        this.range = 2.5; // Portée de 5 cases de diamètre (2.5 de rayon)
        this.damage = 5; // Dégâts initiaux
        this.position = position; // Position {x, y} sur le plateau
        this.enemiesInRange = []; // Ennemis actuellement à portée
        this.target = null; // Cible actuelle de la tour
    }

    findEnemiesInRange(enemies) {
        // Mettre à jour la liste des ennemis à portée
        this.enemiesInRange = enemies.filter(enemy => {
            const distance = Math.sqrt(
                Math.pow(enemy.position.x - this.position.x, 2) + 
                Math.pow(enemy.position.y - this.position.y, 2)
            );
            return distance <= this.range;
        });

        // Choisissez un ennemi cible, pour cet exemple, prenons le premier de la liste
        this.target = this.enemiesInRange[0] || null;
    }

    attack() {
        if (this.target && this.target.alive) {
            console.log(`Tower ${this.id} attacks enemy at position ${this.target.position} for ${this.damage} damage.`);
            this.target.takeDamage(this.damage);
    
            if (!this.target.alive) {
                this.enemiesInRange = this.enemiesInRange.filter(enemy => enemy.alive);
                this.target = null;
            }
    
            // Retourne les informations sur l'attaque pour l'animation
            return { 
                position: this.position, 
                target: this.target 
            };
        }
        return null;
    }

    upgrade() {
        // Augmente la portée et les dégâts, par exemple
        this.range += 1;
        this.damage += 10;
        console.log(`Tower ${this.id} upgraded to range ${this.range} and damage ${this.damage}.`);
    }

    sell() {
        // Vous pouvez implémenter la logique de vente ici
        // Par exemple, retourner une certaine valeur de crédits au joueur
        return this.cost / 2; // Rembourse la moitié du coût original
    }
}
