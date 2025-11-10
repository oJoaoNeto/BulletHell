class Weapon {
    #damage;
    #fireRate;
    #lastFiredTime;
    #owner;

    constructor(owner, damage, fireRate) {
        if (this.constructor === Weapon) {
            throw new Error("A classe 'Weapon' é abstrata e não pode ser instanciada diretamente.");
        }
        this.#owner = owner;
        this.#damage = damage;
        this.#fireRate = fireRate;
        this.#lastFiredTime = -this._getCooldown();
    }

    _getCooldown() {
        return 1000 / this.#fireRate;
    }
    
    _canFire() {
        const now = millis();
        if (now - this.#lastFiredTime >= this._getCooldown()) {
            this.#lastFiredTime = now;
            return true;
        }
        return false;
    }

    fire(angle) {
        if (this._canFire()) {
            this._performFire(angle);
        }
    }

    _performFire(angle) {
        throw new Error("O método '_performFire()' deve ser implementado pela subclasse.");
    }
    
    get owner() { return this.#owner; }
    get damage() { return this.#damage; }
}