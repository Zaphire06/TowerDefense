import ViewInitializer from '../views/ViewInitializer.js';
import BaseView from '../views/BaseView.js';
import Animation from '../views/Animation.js';
import BoardView from '../views/BoardView.js';
import EnemyView from '../views/EnemyView.js';
import TowerView from '../views/TowerView.js';
import FenceView from '../views/FenceView.js';

export default class ViewController {
    constructor(board, gameModel) {
        this.view = new ViewInitializer(board, gameModel);

        this.baseView = new BaseView(this.view.scene, gameModel, board);
        this.boardView = new BoardView(this.view.scene, board);
        this.enemyView = new EnemyView(this.view.scene);
        this.fenceView = new FenceView(this.view.scene, this.view.camera, this.view.renderer, board);
        this.towerView = new TowerView(this.view.scene, this.view.camera, this.view.renderer, board);

        this.animation = new Animation(
            this.view,
            this.view.stats,
            gameModel,
            board,
            this.baseView,
            this.boardView,
            this.enemyView,
            this.fenceView,
            this.towerView
        );
    }

    getScene() {
        return this.view.scene;
    }

    getCamera() {
        return this.view.camera;
    }

    getRenderer() {
        return this.view.renderer;
    }

    clearScene() {
        while (this.view.scene.children.length > 0) {
            let child = this.view.scene.children[0];

            if (child.geometry) {
                child.geometry.dispose();
            }

            if (child.material) {
                if (child.material instanceof Array) {
                    // Pour les objets avec plusieurs matériaux
                    child.material.forEach(material => material.dispose());
                } else {
                    child.material.dispose();
                }
            }

            if (child.texture) {
                child.texture.dispose();
            }

            this.view.scene.remove(child);
        }
    }

    changeBoard(board) {
        this.view.board = board;

        this.baseView.board = board;
        this.boardView.board = board;
        this.fenceView.board = board;
        this.towerView.board = board;

        this.animation.board = board;
    }
}