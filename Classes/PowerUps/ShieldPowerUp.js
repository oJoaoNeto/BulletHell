// ShieldPowerUp.js
class ShieldPowerUp extends PowerUp {
    #shieldAmount;
    
    constructor(x, y) {
        // (x, y, effect, duration)
        // Duração de 10 segundos
        super(x, y, 'shield', 10000); 
        this.#shieldAmount = 100; // Dá 100 de "vida" de escudo
    }

    /**
     * Sobrescreve 'apply'.
     */
    apply(player) {
        // Assumindo que o Player tem addShield()
        // Este power-up é cumulativo e reinicia o timer
        const existing = player.getActivePowerUp(this.effect);
        if (existing) {
            existing.resetTimer(); // Reinicia o timer
        } else {
            // Se for o primeiro, inicia o timer
            super.apply(player);
        }
        
        // Adiciona o escudo (requer `player.addShield`)
        player.addShield(this.#shieldAmount);
        
        // O item no chão sempre desaparece
        this.die();
    }

    /**
     * Sobrescreve 'removeEffect' para reverter.
     */
    removeEffect(player) {
        // Remove *todo* o escudo quando o tempo acabar.
        // Assumindo que Player tem setShield()
        player.setShield(0); 
        
        super.removeEffect(player);
    }
    
    // Desenho customizado (Escudo azul)
    draw() {
        if (!this.isAlive) return; 
        
        push();
        translate(this.position.x, this.position.y);
        noStroke();
        fill(0, 150, 255); // Azul
        ellipse(0, 0, this.radius * 2);
        
        // Escudo branco
        fill(255); 
        beginShape();
        vertex(0, -this.radius * 0.7);
        vertex(this.radius * 0.6, -this.radius * 0.2);
        vertex(this.radius * 0.6, this.radius * 0.5);
        vertex(0, this.radius * 0.8);
        vertex(-this.radius * 0.6, this.radius * 0.5);
        vertex(-this.radius * 0.6, -this.radius * 0.2);
        endShape(CLOSE);
        pop();
    }
}