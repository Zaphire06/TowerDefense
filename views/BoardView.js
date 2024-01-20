export default class BoardView {
    constructor(scene, board) {
        this.scene = scene;
        this.board = board;
    }

    drawBoard() {
        const cellSize = 1; // Taille des cellules
        const cellSpacing = 0.1; // Espace entre les cellules pour le cadrillage
        const gridSize = cellSize + cellSpacing; // La taille totale d'une cellule plus l'espace de cadrillage

        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {

                const cellType = this.board.getCellType(x, y);
                const color = cellType === 1 ? 0x000000 : 0x00ff00; // Noir pour le chemin, vert futuriste pour les autres cellules
                const geometry = new THREE.BoxGeometry(cellSize, 0.1, cellSize); // Taille réduite pour la cellule
                // Utilisation d'un matériau Phong pour une meilleure réaction à la lumière
                const material = new THREE.MeshPhongMaterial({ color, emissive: 0x003300 });
                const cube = new THREE.Mesh(geometry, material);

                // Ajouter des arêtes lumineuses pour un effet rétro-futuriste
                const edgesGeometry = new THREE.EdgesGeometry(geometry);
                const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x5F5F5F, linewidth: 1 });
                const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
                cube.add(edgesMesh);
                // Position ajustée pour inclure le cadrillage
                cube.position.set((x - this.board.width / 2) * gridSize, 0, (y - this.board.height / 2) * gridSize);

                cube.userData = { x, y }; // Stockez les coordonnées de la grille dans userData
                this.scene.add(cube);
            }
        }
    }


    drawPath() {
        console.log(this.board)
        console.log(this.board)

        const path = this.board.path; // Obtenez les données de chemin
        path.forEach(point => {
            const geometry = new THREE.BoxGeometry(1, 0.1, 1); // Taille des carrés
            const material = new THREE.MeshLambertMaterial({ color: 0xCCCCCC }); // Couleur rouge pour le chemin
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(point.x, 0, point.y); // Ajustez en fonction de la configuration de votre scène
            this.scene.add(cube);
        });
    }

    createBuilding(x, y, height) {
        const buildingGroup = new THREE.Group();

        // Structure principale du bâtiment
        const geometry = new THREE.BoxGeometry(1, height, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const buildingMesh = new THREE.Mesh(geometry, material);
        buildingGroup.add(buildingMesh);

        // Éléments lumineux
        const lightGeometry = new THREE.BoxGeometry(1, 0.1, 0.1);
        const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, emissive: 0x00ff00 });
        const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
        lightMesh.position.set(0, height / 2, 0.45);
        buildingGroup.add(lightMesh);

        // Ajouter des arêtes gris clair
        const edgesGeometry = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xd3d3d3, linewidth: 2 });
        const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        buildingGroup.add(edgesMesh);

        // Positionner le groupe du bâtiment
        buildingGroup.position.set(x, height / 2, y);
        return buildingGroup;
    }

    addCityToScene(scene, board) {
        for (let y = 0; y < board.path[0].y - 2; y++) {
            for (let x = -1; x < board.width + 1; x++) {
                const height = Math.random() * 5 + 1; // Hauteur aléatoire entre 1 et 6
                const building = this.createBuilding(x - board.width / 2, y - 11, height);
                scene.add(building);
            }
        }
    }

}