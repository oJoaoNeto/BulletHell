class PowerUp extends Entity {
    #effect;    // O nome do efeito (ex: 'speed', 'shield')
    #duration;  // Duração em milissegundos (0 para instantâneo)
    #startTime; // Quando o efeito começou (usando millis())
    #isApplied; // Se o efeito está ativo no jogador

    /**
     * @param {number} x Posição x
     * @param {number} y Posição y
     * @param {string} effect Nome do efeito (para checagem)
     * @param {number} duration Duração em milissegundos
     */

    constructor(x, y, effect, duration = 0) {
        // (x, y, radius, maxHealth, speed)
        // Power-ups são entidades estáticas (speed 0)
        super(x, y, 10, 1, 0); 
        
        this.#effect = effect;
        this.#duration = duration;
        this.#startTime = 0;
        this.#isApplied = false; // O efeito ainda não foi aplicado
    }

    // Chamado pelo GameManager quando o item é coletado.
    // Marca o item como "morto" para ser removido do jogo.
     
    die() {
        this.isAlive = false;
    }

    /**
     * @param {Player} player A instância do jogador
     */
    apply(player) {
        if (this.#isApplied) return; // Segurança

        this.#isApplied = true;
        this.#startTime = millis(); // Inicia o cronômetro (função p5.js)
        
        // Adiciona este *objeto* à lista de efeitos ativos do player.
        // Isso requer que a classe 'Player' tenha o método 'addActivePowerUp'.
        player.addActivePowerUp(this); 
        
        // O item físico desaparece do chão
        this.die();
    }

    /**
     * Chamado a cada frame pelo Player.update() (para efeitos ativos).
     * @param {number} deltaTime Tempo desde o último frame
     * @param {Player} player A instância do jogador
     */
    update(deltaTime, player) {
        // Se o efeito não foi aplicado ou é instantâneo, não faz nada
        if (!this.#isApplied || this.#duration === 0) return;

        // Se tem duração, verifica se o tempo acabou
        this.checkDuration(player);
    }
    
    /**
     * Verifica se a duração do efeito expirou.
     * @param {Player} player A instância do jogador
     */
    checkDuration(player) {
        if (millis() - this.#startTime > this.#duration) {
            this.removeEffect(player);
        }
    }

    /**
     * Reinicia o cronômetro do efeito (se o jogador pegar outro igual).
     */
    resetTimer() {
        this.#startTime = millis();
    }

    /**
     * Lógica para reverter o efeito.
     * Classes filhas DEVEM sobrescrever isso.
     * @param {Player} player A instância do jogador
     */
    removeEffect(player) {
        this.#isApplied = false; // Marca para ser removido da lista do player
    }

    /**
     * Desenha o item no chão.
     * Classes filhas podem (e devem) sobrescrever isso.
     */
    draw() {
        if (!this.isAlive) return; // Não desenha se já foi pego
        
        push();
        translate(this.position.x, this.position.y);
        noStroke();
        fill(255); // Cor genérica (branca)
        ellipse(0, 0, this.radius * 2);
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(this.radius * 1.5);
        text('?', 0, 1); // Placeholder
        pop();
    }
    
    // Getters
    get isApplied() { return this.#isApplied; }
    get effect() { return this.#effect; }
}