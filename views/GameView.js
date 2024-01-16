import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
import Tower from '../models/Tower.js';


export default class GameView {
    constructor(board, gameModel) {
        this.board = board; // Instance de Board ou données de chemin
        this.gameModel = gameModel; // Instance de GameModel
        this.highlightMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 }); // Couleur pour la surbrillance
        this.previousIntersected = null; // Pour stocker le dernier mesh survolé
        this.projectiles = []; // Initialiser le tableau des projectiles
        this.towerPreview;
       
        this.initFPSCounter();
        // Initialiser la scène, la lumière et le rendu
        this.initScene();
        // Dessiner le plateau de jeu
        this.drawBoard();

        // Ajouter la base
        this.addBase();

        // Créer un plan pour le raycasting
        this.initRaycastingPlane();

        // Lancer la boucle de rendu
        this.animate();
    }

    initScene() {
        // Créer la scène
        this.scene = new THREE.Scene();

        // Ajouter la caméra
        const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
        this.camera.position.set(0, 13, 15); // Place la caméra au-dessus de la grille
        this.camera.lookAt(new THREE.Vector3(0, 0, 2)); // Fait regarder la caméra vers le centre de la grille
        
        // Ajouter la lumière
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Ajouter le rendu
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xaaaaaa); // Couleur de fond grise pour contraste
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Dessinez le plateau avant d'ajouter des éléments supplémentaires
        this.drawBoard();

        // Ajouter la ville
        this.addCityToScene(this.scene, this.board);

        // Lancer la boucle de rendu
        this.animate();
    }

    initFPSCounter() {
        this.stats = new Stats();
        document.body.appendChild(this.stats.dom);
    }

    initRaycastingPlane() {
        const boardWidth = this.board.width;
        const boardHeight = this.board.height;
        const planeGeometry = new THREE.PlaneGeometry(boardWidth, boardHeight);
        this.raycastingPlane = new THREE.Mesh(
            planeGeometry,
            new THREE.MeshBasicMaterial({ visible: false })
        );
        this.raycastingPlane.rotation.x = -Math.PI / 2;
        this.scene.add(this.raycastingPlane);
    }

    drawBoard() {
        const cellSize = 1; // Taille des cellules
        const cellSpacing = 0.1; // Espace entre les cellules pour le cadrillage
        const gridSize = cellSize + cellSpacing; // La taille totale d'une cellule plus l'espace de cadrillage
    
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                const cellType = this.board.getCellType(x, y);
                const color = cellType === 1 ? 0x000000 : 0xff0000; // Noir pour le chemin, rouge autrement
                const geometry = new THREE.BoxGeometry(cellSize, 0.1, cellSize); // Taille réduite pour la cellule
                const material = new THREE.MeshBasicMaterial({ color });
                const cube = new THREE.Mesh(geometry, material);
    
                // Position ajustée pour inclure le cadrillage
                cube.position.set((x - this.board.width / 2) * gridSize, 0, (y - this.board.height / 2) * gridSize);
                
                cube.userData = { x, y }; // Stockez les coordonnées de la grille dans userData
                this.scene.add(cube);
            }
        }
    
        // // Dessinez les lignes grises du cadrillage
        // const gridGeometry = new THREE.BoxGeometry(this.board.width * gridSize, 0.05, cellSpacing); // Horizontal
        // const gridMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 }); // Gris
    
        // for (let y = 0; y <= this.board.height; y++) { // Utilisez <= pour obtenir une ligne à la fin de la grille
        //     const line = new THREE.Mesh(gridGeometry, gridMaterial);
        //     line.position.set(0, 0, (y - this.board.height / 2) * gridSize - cellSize / 2);
        //     this.scene.add(line);
        // }
    
        // const verticalGridGeometry = new THREE.BoxGeometry(cellSpacing, 0.05, this.board.height * gridSize); // Vertical
        // for (let x = 0; x <= this.board.width; x++) { // Utilisez <= pour obtenir une ligne à la fin de la grille
        //     const line = new THREE.Mesh(verticalGridGeometry, gridMaterial);
        //     line.position.set((x - this.board.width / 2) * gridSize - cellSize / 2, 0, 0);
        //     this.scene.add(line);
        // }
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

    addBase() {
        const baseGroup = new THREE.Group(); // Groupe pour contenir tous les éléments de la base
    
        // Créer la structure principale
        const mainGeometry = new THREE.BoxGeometry(3, 1, 4);
        const mainMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
        const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial);
        baseGroup.add(mainMesh);
    
        // Ajouter des détails complexes
        const detailGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
        const detailMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
        for (let i = 0; i < 4; i++) {
            const detailMesh = new THREE.Mesh(detailGeometry, detailMaterial);
            detailMesh.position.set(i - 1.5, 1, 0);
            baseGroup.add(detailMesh);
        }
    
        // Panneaux lumineux
        for (let i = 0; i < 2; i++) {
            const lightGeometry = new THREE.PlaneGeometry(3, 0.2);
            const lightMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, emissive: 0x00ff00 });
            const lightMesh = new THREE.Mesh(lightGeometry, lightMaterial);
            lightMesh.position.set(0, 1.1, i === 0 ? 2 : -2);
            lightMesh.rotation.x = Math.PI / 2;
            baseGroup.add(lightMesh);
        }
    
        // Antennes ou tours
        const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3, 32);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
        for (let i = 0; i < 4; i++) {
            const antennaMesh = new THREE.Mesh(antennaGeometry, antennaMaterial);
            antennaMesh.position.set(i - 1.5, 2.5, 0);
            baseGroup.add(antennaMesh);
        }
        // Ajouter des éléments décoratifs supplémentaires
        const decorGeometry = new THREE.TorusGeometry(0.4, 0.1, 16, 100);
        const decorMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 });
        const decorMesh = new THREE.Mesh(decorGeometry, decorMaterial);
        decorMesh.position.set(0, 1.5, 2);
        decorMesh.rotation.x = Math.PI / 2;
        baseGroup.add(decorMesh);

        // Positionner le groupe de la base
        const endOfPath = this.board.path[this.board.path.length - 1];
        baseGroup.position.set(
            (endOfPath.x - this.board.width / 2) * 1.05 + 2,
            0.5,
            (endOfPath.y - this.board.height / 2) * 1
        );
        
        // Ajouter le groupe à la scène
        this.scene.add(baseGroup);
        this.gameModel.base.mesh = baseGroup; // Stocker une référence au groupe dans l'objet base
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
        const material = new THREE.MeshPhongMaterial({ color: 0x336699, emissive: 0x224466 });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 1, 0); // Position au-dessus du socle
        towerGroup.add(mesh);
    
        // Ajouter une antenne
        const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
        const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x66ccff, emissive: 0x4488aa });
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
        this.towerPreview = new Tower({x, y});
        this.addTower(this.towerPreview, true);
        console.log("showTowerPreview", )
        // Gérez le mouvement de la souris pour mettre à jour la position de l'aperçu
        document.addEventListener('mousemove', this.updateTowerPreviewPosition);
    }

    removeTowerPreview() {
        // Supprimez l'aperçu de la tour de la scène
        if (this.towerPreview) {
            this.scene.remove(this.towerPreview.mesh);
            this.towerPreview = null;
        }
    
        // Supprimez le gestionnaire d'événements pour le mouvement de la souris
        document.removeEventListener('mousemove', this.updateTowerPreviewPosition);
    }

    updateTowerPreviewPosition = (event) => {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        console.log("mouse")
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        const intersects = raycaster.intersectObject(this.raycastingPlane);
        
        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            const gridX = Math.round(intersectPoint.x + this.board.width / 2);
            const gridY = Math.round(intersectPoint.z + this.board.height / 2);
            // Mettez à jour la position de l'aperçu de la tour et du cercle de portée
            if (this.towerPreview) {
                const gridSize = 1 + 0.1; // Taille des cellules + espace entre elles
                this.towerPreview.mesh.position.set(
                    (gridX - this.board.width / 2) * gridSize,
                    0, // Hauteur au-dessus du sol
                    (gridY - this.board.height / 2) * gridSize
                );

                if (this.towerPreview.rangeMesh) {
                    this.towerPreview.rangeMesh.position.set(
                        (gridX - this.board.width / 2) * gridSize,
                        0.06, // Juste au-dessus du sol
                        (gridY - this.board.height / 2) * gridSize
                    );
                }
            }
        }
    }

    addEnemy(enemy) {
        const geometry = new THREE.ConeGeometry(0.5, 1, 3); // Créer une forme de triangle (cône avec 3 faces)
        const material = new THREE.MeshBasicMaterial({ color: 0x800080 }); // Couleur violette
        const mesh = new THREE.Mesh(geometry, material);

        const cellSize = 1; // Taille des cellules, doit être cohérente avec drawBoard
        const cellSpacing = 0.1; // Espace entre les cellules, doit être cohérent avec drawBoard
        const gridSize = cellSize + cellSpacing;
        console.log(enemy.path, enemy.pathIndex, enemy.path[enemy.pathIndex], enemy.position)
        // enemy.mesh.position.set(
        //     (enemy.position.x - this.board.width / 2) * gridSize,
        //     1, // Hauteur au-dessus du sol
        //     (enemy.position.y - this.board.height / 2) * gridSize
        // );

        this.scene.add(mesh);
        enemy.mesh = mesh; // Stocker une référence au mesh dans l'objet ennemi
    }

    createProjectile(attackInfo) {
        if (!attackInfo || !attackInfo.target) return;
    
        const projectileGeometry = new THREE.SphereGeometry(0.5, 8, 8);
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
        console.log(projectile)
    
        // Animer le projectile vers l'ennemi
        const startPosition = projectile.position.clone();
        const endPosition = new THREE.Vector3(
            (attackInfo.target.position.x - this.board.width / 2) * 1.1,
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
    
    addEnemy(enemy) {
        const geometry = new THREE.ConeGeometry(0.5, 1, 3); // Forme de triangle (cône avec 3 faces)
        const material = new THREE.MeshBasicMaterial({ color: 0x800080 }); // Couleur violette
        const mesh = new THREE.Mesh(geometry, material);
    
        const cellSize = 1; // Taille des cellules
        const cellSpacing = 0.1; // Espace entre les cellules
        const gridSize = cellSize + cellSpacing;
    
        // Position initiale de l'ennemi
        mesh.position.set(
            (enemy.position.x - this.board.width / 2) * gridSize,
            1, // Hauteur au-dessus du sol
            (enemy.position.y - this.board.height / 2) * gridSize
        );
    
        this.scene.add(mesh);
        enemy.mesh = mesh; // Stocker une référence au mesh dans l'objet ennemi
    
        // Créer et ajouter une barre de vie
        enemy.healthBar = this.createHealthBar();
        enemy.mesh.add(enemy.healthBar);
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

        // Mettre à jour la position de chaque ennemi
        this.gameModel.enemies.forEach(enemy => {
            const tickDuration = this.gameModel.tickDuration ; // Durée d'un tick en millisecondes
            const elapsedSinceLastTick = currentTime - this.gameModel.lastUpdateTime;
            const tickProgress = Math.min(elapsedSinceLastTick / tickDuration, 1); // Progrès dans le tick actuel, de 0 à 1
            if (enemy.alive && enemy.mesh) {
                const gridSize = 1.1;
    
                // Calculez la position de départ et de fin pour l'ennemi
                const startPosition = {
                    x: (enemy.path[enemy.pathIndex].x - this.board.width / 2) * gridSize,
                    y: (enemy.path[enemy.pathIndex].y - this.board.height / 2) * gridSize
                };

                let nextPositionIndex = enemy.pathIndex + enemy.speed;
                nextPositionIndex = Math.min(nextPositionIndex, enemy.path.length - 1); // Assurez-vous de ne pas dépasser la longueur du chemin

                const endPosition = {
            x: (enemy.path[nextPositionIndex].x - this.board.width / 2) * gridSize,
            y: (enemy.path[nextPositionIndex].y - this.board.height / 2) * gridSize
        };

        // Interpolez la position en fonction de la progression du tick
        enemy.mesh.position.x = startPosition.x + (endPosition.x - startPosition.x) * tickProgress;
        enemy.mesh.position.z = startPosition.y + (endPosition.y - startPosition.y) * tickProgress;
        enemy.mesh.position.y = 0.5; // Hauteur constante
            }
            if (enemy.healthBar && enemy.mesh) {
                const healthScale = enemy.health / enemy.maxHealth;
                enemy.healthBar.scale.x = healthScale; // Réduire la largeur de la barre de vie
                enemy.healthBar.position.x = -0.5 * (1 - healthScale); // Centrer la barre de vie
            }
        });

        

        // Animer les projectiles
    this.projectiles.forEach(projectile => {
        if (projectile.progress < 1.1) {
            projectile.progress += 0.01; // Ajustez la vitesse si nécessaire

            projectile.mesh.position.lerpVectors(
                projectile.startPosition, 
                projectile.endPosition, 
                projectile.progress
            );

            if (projectile.progress >= 1) {
                this.scene.remove(projectile.mesh); // Retirer le projectile de la scène
            }
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

    // onMouseMove = (event) => {
    //     // Convertir les coordonnées de la souris en coordonnées normalisées pour le raycasting
    //     const rect = this.renderer.domElement.getBoundingClientRect();
    //     const mouse = new THREE.Vector2(
    //         ((event.clientX - rect.left) / rect.width) * 2 - 1,
    //         -((event.clientY - rect.top) / rect.height) * 2 + 1
    //     );
    
    //     // Créer un raycaster
    //     const raycaster = new THREE.Raycaster();
    //     raycaster.setFromCamera(mouse, this.camera);
    
    //     // Obtenir les intersections avec les meshes de la grille
    //     const intersects = raycaster.intersectObjects(this.gridMeshes);
    
    //     // Réinitialiser la couleur de tous les cubes
    //     this.gridMeshes.forEach(mesh => {
    //         mesh.material.color.set(mesh.originalColor);
    //     });
    
    //     // Changer la couleur du cube survolé
    //     if (intersects.length > 0) {
    //         const intersectedMesh = intersects[0].object;
    //         intersectedMesh.material.color.set(0x666666); // Couleur plus foncée pour la surbrillance
    //     }
    // }
}
