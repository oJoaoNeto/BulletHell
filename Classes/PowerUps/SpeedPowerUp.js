// SpeedPowerUp.js
class SpeedPowerUp extends PowerUp {
    #speedMultiplier;
    #originalSpeed; // Guarda a velocidade original do player

    constructor(x, y) {
        // (x, y, effect, duration)
        // Duração de 5 segundos
        super(x, y, 'speed', 5000); 
        
        this.#speedMultiplier = 1.5; // Aumenta 50%
        this.#originalSpeed = 0;
    }

    /**
     * Sobrescreve 'apply'.
     */
    apply(player) {
        // Verifica se o player já tem um power-up de 'speed'
        const existing = player.getActivePowerUp(this.effect);
        
        if (existing) {
            // Se já tem, apenas reinicia o timer
            existing.resetTimer();
            this.die(); // O item novo desaparece
            return; // Não aplica este objeto
        }
        
        // Se não tem, aplica este
        this.#originalSpeed = player.speed; 
        player.speed = this.#originalSpeed * this.#speedMultiplier;

        // Chama o super.apply() para iniciar o timer
        // e adicionar à lista de ativos do player
        super.apply(player);
    }

    /**
     * Sobrescreve 'removeEffect' para reverter.
     */
    removeEffect(player) {
        // Restaura a velocidade original
        // Verifica se a velocidade atual é a que este power-up aplicou
        if (player.speed === this.#originalSpeed * this.#speedMultiplier) {
             player.speed = this.#originalSpeed;
        }
        
        // Chama super.removeEffect() para se marcar como inativo
        super.removeEffect(player);
    }
    
    // Desenho customizado (Seta amarela)
    draw() {
        if (!this.isAlive) return; 
        
        push();
        translate(this.position.x, this.position.y);
        noStroke();
        fill(255, 204, 0); // Amarelo
        ellipse(0, 0, this.radius * 2);
        
        fill(0); // Seta preta
        textAlign(CENTER, CENTER);
        textSize(this.radius * 1.8);
        text('»', 0, 1);
        pop();
    }
}