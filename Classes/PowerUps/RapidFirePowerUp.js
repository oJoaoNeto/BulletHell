// RapidFirePowerUp.js
class RapidFirePowerUp extends PowerUp {
    #fireRateMultiplier;
    #originalFireRate; 

    constructor(x, y) {
        // Duração de 7 segundos
        super(x, y, 'rapidFire', 7000); 
        
        // Assumindo que 'fireRate' é um *delay* (menor é melhor)
        this.#fireRateMultiplier = 0.5; // Reduz o delay pela metade
        this.#originalFireRate = 0;
    }

    apply(player) {
        const existing = player.getActivePowerUp(this.effect);
        if (existing) {
            existing.resetTimer();
            this.die();
            return;
        }
        
        // Assumindo que Player tem um getter/setter para 'fireRate'
        this.#originalFireRate = player.fireRate; 
        player.fireRate = this.#originalFireRate * this.#fireRateMultiplier;

        super.apply(player);
    }

    removeEffect(player) {
        if (player.fireRate === this.#originalFireRate * this.#fireRateMultiplier) {
             player.fireRate = this.#originalFireRate;
        }
        super.removeEffect(player);
    }
    
    // Desenho customizado (Laranja)
    draw() {
        if (!this.isAlive) return; 
        
        push();
        translate(this.position.x, this.position.y);
        noStroke();
        fill(255, 100, 0); // Laranja
        ellipse(0, 0, this.radius * 2);
        
        fill(255); // '>>'
        textAlign(CENTER, CENTER);
        textSize(this.radius * 1.5);
        text('»»', 0, 1);
        pop();
    }
}