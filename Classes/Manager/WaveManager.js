class WaveManager {
  #gameManager;
  #enemiesPerWave; 
  #waveNumber;
  #spawnTimer; 
  #timeSinceLastWave; 
  #enemiesToSpawn;
  #spawnInterval;
  #waveActive;
  #isBossWave;
  #bossSpawned;

  constructor(gameManager) {
    this.#gameManager = gameManager;
    this.#enemiesPerWave = 10;
    this.#waveNumber = 0;
    this.#spawnTimer = 0;
    this.#timeSinceLastWave = 0;
    this.#enemiesToSpawn = 0;
    this.#spawnInterval = 0.8;
    this.#waveActive = false;
    this.#isBossWave = false;
    this.#bossSpawned = false;
  }

  startWave(waveNum) {
    this.#waveNumber = waveNum;
    this.#waveActive = true;
    this.#timeSinceLastWave = 0;
    this.#spawnTimer = 0;
    this.#bossSpawned = false;

    // Boss wave a cada 5 waves
    this.#isBossWave = (waveNum % 5 === 0);

    // Mini-boss a cada 3 waves (que não seja boss wave)
    const isMiniBossWave = (waveNum % 3 === 0) && !this.#isBossWave;

    if (this.#isBossWave) {
      console.log(`BOSS WAVE ${waveNum}!`);
    } else if (isMiniBossWave) {
      console.log(`Mini-Boss Wave ${waveNum}!`);
    }

    this.spawnWave(isMiniBossWave);
  }

  spawnWave(isMiniBossWave = false) {
    if (this.#isBossWave) {
      // Boss wave: apenas alguns inimigos + boss
      this.#enemiesToSpawn = 5;
    } else if (isMiniBossWave) {
      // Mini-boss wave: inimigos normais + mini-boss
      this.#enemiesToSpawn = this.#enemiesPerWave + (this.#waveNumber * 2);
    } else {
      // Wave normal
      this.#enemiesToSpawn = this.#enemiesPerWave + (this.#waveNumber * 3);
    }
  }

  update(deltaTime) {
    if (!this.#waveActive) return;

    let deltaTimeSeconds = deltaTime / 1000;

    this.#timeSinceLastWave += deltaTimeSeconds;
    this.#spawnTimer += deltaTimeSeconds;

    // Spawn do boss após 3 segundos
    if (this.#isBossWave && !this.#bossSpawned && this.#timeSinceLastWave > 3) {
      this.spawnBoss();
      this.#bossSpawned = true;
    }

    // Spawn de mini-boss após metade dos inimigos
    const isMiniBossWave = (this.#waveNumber % 3 === 0) && !this.#isBossWave;
    if (isMiniBossWave && !this.#bossSpawned && 
      this.#enemiesToSpawn < (this.#enemiesPerWave + (this.#waveNumber * 2)) / 2) {
      this.spawnMiniBoss();
      this.#bossSpawned = true;
    }

    if (this.#spawnTimer >= this.#spawnInterval && this.#enemiesToSpawn > 0) {
      this.spawnEnemy();
      this.#enemiesToSpawn--;
      this.#spawnTimer = 0;
    }
  }

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

    // Define tipo do inimigo com distribuição
    let enemy;
    const typeRoll = random(100);

    const health = 100;
    const speed = 70 + (this.#waveNumber * 5);
    const radius = 15;
    const damage = 10;

    if (typeRoll < 40) { // 40% - Shooter
      const scoreValue = 15;
      const shootCooldown = 800;
      const weapon = new Pistol(this, damage, shootCooldown, 0.8)
      enemy = new ShooterEnemy(x, y, health, speed, radius, scoreValue, shootCooldown, damage,weapon);
    } else if (typeRoll < 70) { // 30% - Chaser
      const scoreValue = 10;
      const shootCooldown = 2500;
      enemy = new ChaserEnemy(x, y, health, speed * 1.2, radius, scoreValue, shootCooldown, damage);
    } else { // 30% - Balanced (usa Enemy base com pattern)
      const scoreValue = 12;
      const shootCooldown = 1500;
      enemy = new Enemy(
        x, y, health, speed, radius,
        'balanced', 'orbiter', scoreValue, shootCooldown, damage
      );
    }

    this.#gameManager.addEnemy(enemy);
  }

  spawnMiniBoss() {
    const x = width / 2;
    const y = -50;
    const health = 300 + (this.#waveNumber * 100);
    const speed = 80;
    const radius = 25;
    const scoreValue = 100 + (this.#waveNumber * 20);
    const shootCooldown = 1000;
    const damage = 15;

    const miniBoss = new MiniBossEnemy(x, y, health, speed, radius, scoreValue, shootCooldown, damage);
    this.#gameManager.addEnemy(miniBoss);

    console.log('Mini-Boss spawned!');
  }

  spawnBoss() {
    const x = width / 2;
    const y = -100;

    const boss = new BossEnemy(x, y, this.#waveNumber);
    this.#gameManager.addEnemy(boss);

    console.log('BOSS spawned!');
  }

  isWaveClear() {
    if (!this.#waveActive) {
      return false;
    }

    const activeEnemies = this.#gameManager.enemies.length;

    if (this.#enemiesToSpawn === 0 && activeEnemies === 0) {
      this.#waveActive = false;
      return true;
    }

    return false;
  }
}
