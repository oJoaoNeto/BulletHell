class Shotgun extends Weapon {
    #pelletCount;

    constructor(owner, damage, fireRate, pelletCount) {
        super(owner, damage, fireRate);
        this.#pelletCount = pelletCount;
    }

    _performFire(angle) {
        const spreadAngle = PI / 6;

        for (let i = 0; i < this.#pelletCount; i++) {
            const pelletAngle = angle + random(-spreadAngle / 2, spreadAngle / 2);
            
            const ownerPos = this.owner.position;
            const bulletSpeed = 10;
            const bulletRadius = 4;
            const ownerType = this.owner.type || 'player';
            
            const bullet = new Bullet(
                ownerPos.x, ownerPos.y, pelletAngle, bulletSpeed,
                this.damage, ownerType, bulletRadius
            );
            this.owner.gameManager.addBullets(bullet);
        }
    }
}