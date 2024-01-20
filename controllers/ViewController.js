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
        this.fenceView = new FenceView(this.view.scene, board);
        this.towerView = new TowerView(this.view.scene, board);

        this.animation = new Animation(this.view.scene, gameModel, board);
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
}