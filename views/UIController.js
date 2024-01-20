export default class UIController {
    constructor(gameModel) {
        this.gameModel = gameModel;
        // Initialisez ici les éléments d'UI (ex: score, vies, etc.)
    }

    updateUI() {
        const level = this.gameModel.level;
        const credits = this.gameModel.credits;
        const baseHealth = this.gameModel.base.health; // Assurez-vous que la base a une propriété 'health'

        document.getElementById('level-value').innerText = level;
        document.getElementById('credits-value').innerText = credits;
        document.getElementById('base-health-value').innerText = baseHealth + '%';
    }

    // Vous pouvez ajouter d'autres méthodes pour gérer des interactions spécifiques d'UI
}
