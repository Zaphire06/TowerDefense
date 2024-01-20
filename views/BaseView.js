export default class BaseView {
    constructor(scene, gameModel, board) {
        this.scene = scene;
        this.gameModel = gameModel;
        this.board = board;
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
            (endOfPath.x - this.board.width / 2) * 1.05 + 2.5,
            0.5,
            (endOfPath.y - this.board.height / 2) * 1
        );

        // Ajouter le groupe à la scène
        this.scene.add(baseGroup);
        this.gameModel.base.mesh = baseGroup; // Stocker une référence au groupe dans l'objet base
    }
}