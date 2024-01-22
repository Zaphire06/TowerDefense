export default class Base {
    constructor(health) {
        this.health = health;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    isDestroyed() {
        return this.health <= 0;
    }
}