export default class Board {
    constructor(width, height) {
        this.width = width; // Largeur de la grille
        this.height = height; // Hauteur de la grille
        this.grid = this.createGrid(width, height); // Grille pour représenter le plateau de jeu
        this.path = this.createPath(); // Créer un chemin simple pour les ennemis
    }

    createGrid(width, height) {
        // Crée une grille 2D remplie de 0, où 0 représente un espace vide
        const grid = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                row.push(0);
            }
            grid.push(row);
        }
        return grid;
    }

    getCellType(x, y) {
        return this.grid[y][x];
    }

    createPath() {
        this.grid = this.createGrid(this.width, this.height);
    
        let x = 0;
        let y = Math.floor(Math.random() * (this.height - 12)) + 9;
        console.log("oui", y);
        let direction = Math.random() < 0.5 ? -1 : 1;
        let path = [{x, y}];
        this.grid[y][x] = 1;  // Marquez le point de départ.
    
        while (x < this.width - 1) {
            let options = [];
    
            // Vérifiez si on peut aller à droite.
            if (x + 1 < this.width && this.grid[y][x + 1] === 0) {
                options.push('right');
            }
    
            // Vérifiez si on peut aller en haut ou en bas sans coller au chemin existant.
            if (y + direction >= 0 && y + direction < this.height && this.grid[y + direction][x] === 0) {
                if (x === 0 || this.grid[y + direction][x - 1] === 0) {  // Assurez-vous que la gauche est vide.
                    if (x === this.width - 1 || this.grid[y + direction][x + 1] === 0) {  // Assurez-vous que la droite est vide.
                        options.push('vertical');
                    }
                }
            }
    
            // Pas de mouvement possible, terminer le chemin.
            if (options.length === 0) {
                break;
            }
    
            // Choisir une direction aléatoire parmi les options disponibles.
            let choice = options[Math.floor(Math.random() * options.length)];
    
            if (choice === 'right') {
                x++;
            } else if (choice === 'vertical') {
                y += direction;
                // Changer de direction pour le prochain mouvement vertical pour éviter les boucles.
                if (y <= path[0].y - 3 || y >= path[0].y + 5) {
                    direction = -direction;
                }
                //
            }
    
            // Marquez la nouvelle position dans le chemin.
            path.push({x, y});
            this.grid[y][x] = 1;
        }
    
        // Retourne le chemin créé.
        return path;
    }
    
    canPlaceTower(x, y) {
        // Vérifiez que la cellule est vide
        if (this.grid[y][x] !== 0) return false;
    
        return true; // L'emplacement est valide pour une tour
    }

    isPath(x, y) {
        // Vérifie si les coordonnées x, y font partie du chemin
        return this.grid[y][x] === 1;
    }

    getEnemyPath() {
        // Retourne le chemin que les ennemis vont suivre
        return this.path;
    }

    // Ajoutez des méthodes supplémentaires au besoin
}
