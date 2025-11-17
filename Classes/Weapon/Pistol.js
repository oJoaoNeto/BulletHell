class Pistol extends Weapon {
    #accuracy;
    constructor(owner, damage, fireRate, accuracy = 1.0) {
        super(owner, damage, fireRate);
        this.#accuracy = constrain(accuracy, 0.0, 1.0); 
    }

    _performFire(angle) {
        const maxSpread = PI / 16;
        const spread = (1.0 - this.#accuracy) * maxSpread;

        const finalAngle = angle + random(-spread, spread);

        const ownerPos = this.owner.position;
        const bulletSpeed = 350;
        const bulletRadius = 5;
        const ownerType = this.owner.type || 'player';

        const bullet = new Bullet(
            ownerPos.x,
            ownerPos.y,
            finalAngle,
            bulletSpeed,
            this.damage,
            ownerType,
            bulletRadius
        );

        this.owner.gameManager.addBullets(bullet);
    }
}
