class WaveManager {
    #gameManager;
    #enemiesPerWave; 
    #waveNumber;
    #spawnTimer; 
    #timeSinceLastWave; 
    #enemiesToSpawn;
    #spawnInterval;
    #waveActive;

    constructor(gameManager) {
        this.#gameManager = gameManager;
        this.#enemiesPerWave = 10;
        this.#waveNumber = 0;
        this.#spawnTimer = 0;
        this.#timeSinceLastWave = 0;
        this.#enemiesToSpawn = 0;
        this.#spawnInterval = 1.0;
        this.#waveActive = false;
   }
   
   //inicia a wave
    startWave(waveNum) {
        this.#waveNumber = waveNum;
        this.#waveActive = true;
        this.#timeSinceLastWave = 0;
        
        // Reinicia o timer para o primeiro spawn
        this.#spawnTimer = 0; 

        this.spawnWave();
    }

   //configura a lógica da wave (quantos inimigos, etc.)
    spawnWave() {
        // Base de 5 inimigos + 3 por nível de wave
        this.#enemiesToSpawn = this.#enemiesPerWave + (this.#waveNumber * 3);
        }

    update(deltaTime) {
        //se a wave não está ativa, não faz nada
        if (!this.#waveActive) return;

        let deltaTimeSeconds = deltaTime / 1000;

        this.#timeSinceLastWave += deltaTimeSeconds;
        this.#spawnTimer += deltaTimeSeconds;

        //verifica se é hora de criar um inimigo e se ainda há inimigos para criar
        if (this.#spawnTimer >= this.#spawnInterval && this.#enemiesToSpawn > 0) {
            this.spawnEnemy();
            this.#enemiesToSpawn--;
            this.#spawnTimer = 0; // Reseta o timer para o *próximo* spawn
        }
    }

    //em qual borda o inimigo aparecerá
    spawnEnemy() {
        let x, y;
        const side = floor(random(4));
        const offset = 20;

        if (side === 0) { //topo
            x = random(width);
            y = -offset;
        } else if (side === 1) { //baixo
            x = random(width);
            y = height + offset;
        } else if (side === 2) { //esquerda
            x = -offset;
            y = random(height);
        } else { //direita
            x = width + offset;
            y = random(height);
        }
        const health = 100;
        const speed = 70 + (this.#waveNumber * 5); // Aumenta velocidade com a wave
        const radius = 15;
        const pattern = random(['down', 'sine_wave','chaser']); // Pega um padrão aleatório
        const scoreValue = 10;
        const shootCooldown = 3000; // 3 segundos
        const damage = 10;

        //classe inimiga para criar
        const newEnemy = new Enemy(x, y, health, speed, radius, pattern, scoreValue, shootCooldown, damage); 
        this.#gameManager.addEnemy(newEnemy);
    }

    //verifica se a wave terminou
    isWaveClear() {
        if (!this.#waveActive) {
            return false;
        }

        const activeEnemies = this.#gameManager.enemies.length;

        if (this.#enemiesToSpawn === 0 && activeEnemies === 0) {
            this.#waveActive = false; // Wave oficialmente terminada
            return true;
        }

        return false;
    }
}
