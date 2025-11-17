class HealthPowerUp extends PowerUp {
    #healAmount;

    constructor(x, y) {
        // (x, y, effect, duration)
        // Duração 0 = instantâneo
        super(x, y, 'health', 0); 
        this.#healAmount = 50; // Cura 50 de vida
    }

    /**
     * Sobrescreve 'apply' para ser instantâneo.
     * Não chama super.apply() pois não precisa de timer.
     */
    apply(player) {
        // Entity não tem um método heal(), então usamos os getters/setters
        const newHealth = Math.min(player.health + this.#healAmount, player.maxHealth);
        player.health = newHealth;
        
        this.die(); // O item desaparece
    }
    
    // Como é instantâneo, update e removeEffect não fazem nada
    update(deltaTime, player) { }
    removeEffect(player) { }
    
    // Desenho customizado (Cruz verde)
    draw() {
        if (!this.isAlive) return; 
        
        push();
        translate(this.position.x, this.position.y);
        noStroke();
        fill(40, 160, 70); // Verde
        ellipse(0, 0, this.radius * 2);
        
        fill(255); // Cruz branca
        rectMode(CENTER);
        rect(0, 0, this.radius * 1.2, this.radius * 0.4);
        rect(0, 0, this.radius * 0.4, this.radius * 1.2);
        pop();
    }
}