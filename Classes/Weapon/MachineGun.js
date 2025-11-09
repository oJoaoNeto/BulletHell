class MachineGun extends Weapon {
    #maxAmmo;
    #currentAmmo;
    #burstFireCount;

    constructor(owner, damage, fireRate, maxAmmo, burstFireCount) {
        super(owner, damage, fireRate);
        this.#maxAmmo = maxAmmo;
        this.#currentAmmo = maxAmmo;
        this.#burstFireCount = burstFireCount;
    }

    get currentAmmo() { return this.#currentAmmo; }
    get maxAmmo() { return this.#maxAmmo; }

    reload() {
        this.#currentAmmo = this.#maxAmmo;
        console.log("MachineGun reloaded!");
    }

    _performFire(angle) {
        if (this.#currentAmmo <= 0) {
            console.log("Click! Out of ammo.");
            return;
        }

        this.burstFire(angle);
    }
    
    burstFire(angle) {
        const burstDelay = 60;

        for (let i = 0; i < this.#burstFireCount; i++) {
            if (this.#currentAmmo <= 0) break;

            this.#currentAmmo--;

            setTimeout(() => {
                const ownerPos = this.owner.position;
                const bulletSpeed = 12;
                const bulletRadius = 5;
                const ownerType = this.owner.type || 'player';
                
                const finalAngle = angle + random(-0.05, 0.05);

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
            }, i * burstDelay);
        }
    }
}