// DoubleShotPowerUp.js
class DoubleShotPowerUp extends PowerUp {
    
    constructor(x, y) {
        // Duração de 10 segundos
        super(x, y, 'doubleShot', 10000); 
    }

    apply(player) {
        const existing = player.getActivePowerUp(this.effect);
        if (existing) {
            existing.resetTimer();
            this.die();
            return;
        }
        
        // Assumindo que Player tem um booleano 'hasDoubleShot'
        player.hasDoubleShot = true; 

        super.apply(player);
    }

    removeEffect(player) {
        // Restaura
        player.hasDoubleShot = false;
        super.removeEffect(player);
    }
    
    // Desenho customizado (Roxo)
    draw() {
        if (!this.isAlive) return; 
        
        push();
        translate(this.position.x, this.position.y);
        noStroke();
        fill(150, 0, 255); // Roxo
        ellipse(0, 0, this.radius * 2);
        
        fill(255); // Barras brancas
        rectMode(CENTER);
        rect(-this.radius * 0.3, 0, this.radius * 0.4, this.radius * 1.2);
        rect(this.radius * 0.3, 0, this.radius * 0.4, this.radius * 1.2);
        pop();
    }
}