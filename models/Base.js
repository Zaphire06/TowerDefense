export default class Base {
    constructor(health) {
        this.health = health;
    }

    takeDamage(amount) {
        this.health -= amount;
        console.log("base", this.health, "amount", amount);
        if (this.health < 0) this.health = 0;
    }

    isDestroyed() {
        return this.health <= 0;
    }
}