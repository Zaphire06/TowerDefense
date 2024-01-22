export default class UIController {
    constructor(gameModel) {
        this.gameModel = gameModel;
        // Initialisez ici les éléments d'UI (ex: score, vies, etc.)
    }

    updateUI(levelObs, creditsObs, baseHealthObs, livesObs) {
        const level = levelObs;
        const credits = creditsObs;
        const baseHealth = baseHealthObs; // Assurez-vous que la base a une propriété 'health'
        const lives = livesObs;

        document.getElementById('level-value').innerText = level;
        document.getElementById('credits-value').innerText = credits;
        document.getElementById('base-health-value').innerText = baseHealth + '%';
        document.getElementById('lives-value').innerText = "Vies : " + lives;
    }

    // Vous pouvez ajouter d'autres méthodes pour gérer des interactions spécifiques d'UI
}
