class GameManager{
  #player; 
  #enemies; 
  #bullets;
  #powerups;


  #uiManager;
  #waveManager;
  #currentWave;

  #score;
  #highScore;
  #gameState;
  #isGameOver;

  constructor(){

    this.#enemies = [];
    this.#bullets = [];
    this.#powerups = [];

    //passa a instancia do GameManeger para o WaveManeger
    this.#waveManager = new WaveManager(this);

    this.#uiManager = new UIManager();

    this.#currentWave = 0;
    this.#score = 0;
    this.#highScore = parseInt(localStorage.getItem('HighScore')) || 0;
    this.#gameState = "MENU";
    this.#isGameOver = true;
  }
  //getters e setters
  get player() { return this.#player; }
  get enemies() { return this.#enemies; }
  get bullets() { return this.#bullets; }
  get powerups() {return this.#powerups; }

  get score() {return this.#score; }
  get highScore() {return this.#highScore; }

  get currentWave() { return this.#currentWave; }
  get gameState() { return this.#gameState; }
  get isGameOver() { return this.#isGameOver; }

  //inicia o jogo
  startGame(){
    this.#score = 0

    //define as condições iniciais para o jogo começar
    this.#isGameOver = false;
    this.#gameState = "PLAYING";
    this.#currentWave = 1;

    //resetar a posição das entidades
    this.#enemies = [];
    this.#powerups = [];
    this.#bullets = [];

    this.#player = new Player(width/2, height - 50, 15, 300, 100, 3);

    //iniciar a primeira wave
    this.#waveManager.startWave(this.#currentWave)
  }

  //verificar se o pleyer esta vivo e se pode ir para proxima wave
  updateGame(deltaTime){
    if(this.#gameState === "PLAYING"){
      if(!this.#player.isAlive){
        this.gameOver();
        return;
      }

      this.#player.update(deltaTime);
      this.#waveManager.update(deltaTime);

      // Atualiza inimigos e coleta projéteis
      for (let i = this.#enemies.length - 1; i >= 0; i--) {
        const enemy = this.#enemies[i];
        const newBullet = enemy.update(deltaTime, this.#player); // Passa o player como alvo
        if (newBullet) {
          this.addBullets(newBullet);
        }
      }
      // Atualiza projéteis
      this.#bullets.forEach(b => b.update(deltaTime, width, height));

      this.checkCollisions();
      this.removeDeadEntities();

      // Correção: Lógica de próxima wave
      if(this.#waveManager.isWaveClear()){
        this.nextWave();
      }
    }
  }


  //desenha o jogo como um todo usa o switch para definir o que acntece em cada gamestate
  drawGame(){
    background(0)

    switch (this.#gameState){
      case "PLAYING":
      case "PAUSED":

        //atualiza as entidades
        if(this.#player) this.#player.draw();
        this.#enemies.forEach(e => e.draw());
        this.#bullets.forEach(e => e.draw());
        this.#powerups.forEach(e => e.draw());

        //HUD
        this.#uiManager.drawHud(
          this.#player.health,
          this.player.maxHealth,
          this.#player.lives,
          this.#score,
          this.#currentWave,
        );

        if(this.#gameState === "PAUSED"){
          this.#uiManager.drawPauseScreen();
        }
        break;

      case "MENU":
        this.#uiManager.drawMenuScreen(this.#highScore);
        break;
      case "GAME_OVER":
        let isNewHighScore = this.#score > this.#highScore;
        this.#uiManager.drawGameOverScreen(this.#score, isNewHighScore);
        break;   
    }
  }

  handleInput(keyCode){
    switch (this.#gameState){
      case "PLAYING":

        if(keyCode === ESCAPE){ 
          this.pauseGame();
        }
        break;
      case "PAUSED":
        if(keyCode === ESCAPE){ 
          this.resumeGame();
        }
        break;
      case "MENU":
        if(keyCode === ENTER){
          this.startGame();
        }
        break;
      case "GAME_OVER": 
        if(keyCode === ENTER){
          this.#gameState = "MENU";
        }
        break;
    }
  }

  //Logica de colisoes
  static isColliding(entityA, entityB){
    const distance = entityA.position.dist(entityB.position);
    return distance < entityA.radius + entityB.radius;
  }


  checkCollisions(){
    if(!this.#player.isAlive) return;

    const playerBullets = this.#bullets.filter(b => b.owner === 'player' && b.isAlive);
    const enemyBullets = this.bullets.filter(b => b.owner === 'enemy' && b.isAlive);

    //metodos de colisao
    this.#checkPlayerBulletsVsEnemies(playerBullets);
    this.#checkEnemyBulletsVsPlayer(enemyBullets);
    this.#checkEnemyVsPlayer();
    this.#checkPlayerVsPowerUps();


  }

  #checkPlayerBulletsVsEnemies(playerBullets){
    for(let enemy of this.#enemies){
      if(!enemy.isAlive) continue;


      for(let bullet of playerBullets){ 
        if(!bullet.isAlive) continue;

        if(GameManager.isColliding(bullet, enemy)){

          const result = enemy.takeDamage(bullet.damage); 
          bullet.die(); 

          if(result.died){ 
            this.updateScore(result.score);
            this.spawnPowerUp(enemy.position, 'random');
          }            
        }
      }
    }
  }

  #checkEnemyBulletsVsPlayer(enemyBullets){

    for(let bullet of enemyBullets){
      if(!bullet.isAlive) continue;

      if(GameManager.isColliding(bullet, this.#player)){

        this.#player.takeDamage(bullet.damage);
        bullet.die();
      }
    }
  }

  #checkEnemyVsPlayer(){
    for(let enemy of this.#enemies){
      if(!enemy.isAlive) continue; 

      if(GameManager.isColliding(enemy, this.#player)){
        this.#player.takeDamage(10); // Dano de colisão
        enemy.takeDamage(1000); // Inimigo morre ao colidir
      }
    }
  }

   #checkPlayerVsPowerUps(){
      for(let powerup of this.#powerups){
          if(!powerup.isAlive) continue;

          if(GameManager.isColliding(powerup, this.#player)){
              powerup.apply(this.#player);
          }
      }
    }

  removeDeadEntities(){

    this.#enemies = this.#enemies.filter(enemy => enemy.isAlive);
    this.#bullets = this.#bullets.filter(bullets => bullets.isAlive);
    this.#powerups = this.#powerups.filter(powerups => powerups.isAlive);
  }

  addEnemy(enemy){
    this.#enemies.push(enemy);
  }

  addBullets(bullet){
    this.#bullets.push(bullet);
  }

  /** 
    @param {p5.vector} position
    */

  spawnPowerUp(position,type){
      const spawnChance = 0.15;

      if(random(1) > spawnChance) return;

      let powerupToSpawn;

      if(type === 'random'){

          const types = ['health', 'speed', 'shield', 'rapidFire'];

          type = random(types);
      }

      switch (type){
          case 'health':
              powerupToSpawn = new HealthPowerUp(position.x,position.y);
              break;
          case 'speed':
              powerupToSpawn = new SpeedPowerUp(position.x, position.y);
              break;
          case 'shield':
              powerupToSpawn = new ShieldPowerUp(position.x, position.y);
              break;
          case 'rapidFire':
              powerupToSpawn = new RapidFirePowerUp(position.x, position.y);
              break;
      }

      if(powerupToSpawn){
          this.#powerups.push(powerupToSpawn);
      }
  }

  updateScore(points){
    if(points > 0) this.#score += points;
  }

  gameOver(){
    this.#isGameOver = true;
    this.#gameState = "GAME_OVER";

    if(this.#score > this.#highScore){

      this.#highScore = this.#score;

      localStorage.setItem('HighScore', this.#highScore);
    }
  }

  pauseGame(){
    if(this.#gameState === "PLAYING") this.#gameState = "PAUSED";
  }

  resumeGame(){
    if(this.#gameState === "PAUSED") this.#gameState = "PLAYING";
  }

  nextWave(){
    this.#currentWave++;

    this.#waveManager.startWave(this.#currentWave);
  }
}
