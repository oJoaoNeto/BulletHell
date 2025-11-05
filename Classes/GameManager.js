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

        //entidades
        this.#player = new Player();
        this.#enemies = [];
        this.#bullets = [];
        this.#powerups = [];

        //passa a instancia do GameManeger para o WaveManeger
        this.#waveManager = new this.#waveManager(this);

        this.#uiManager = new UIManager();

        this.#currentWave = 0;
        this.#score = 0;
        this.#highScore = localStorage.getItem('HighScore')
        this.#gameState = "MENU";
        this.#isGameOver = true;
    }

    get player() { return this.#player; }
    get enemies() { return this.#enemies; }
    get bullets() { return this.#bullets; }
    get powerups() {return this.#powerups; }

    get score() {return this.#score; }
    get highScore() {return this.#highScore; }

    get currentWave() { return this.#currentWave; }
    get gameState() { return this.#gameState; }
    get isGameOver() { return this.#isGameOver; }


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

        this.player = new Player(width/2, height - 50);

        //iniciar a primeira wave
        this.#waveManager.startWave(this.#currentWave)
    }

    updateGame(deltaTime){
        if(this.#gameState === "PLAYING"){
            if(!this.#player.isAlive){
                this.gameOver();
                return;
            }
            this.#player.update(deltaTime);
            this.#waveManager.update(deltaTime);

            this.checkCollisions();
            this.removeDeadEntities();
            
            if(this.#waveManager.isWaveClear() || this.#enemies.length === 0){
                this.nextWave();
            }
        }
        
    }

    
    
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
            case "Game_Over":
                let isNewHighScore = this.#score > this.#highScore;
                this.#uiManager.drawGameOverScreen(this.#score, isNewHighScore);
                break;   
        }
    }

    handleInput(keyCode){
        switch (this.#gameState){
            case "PLAYING":
                if(this.#player){
                    this.#player.handleInput(keyCode);
                }
                if(keyCode === ESC){
                    this.pauseGame();
                }
                break;
            case "PAUSED":
                if(keyCode === ESC){
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

    #isColliding(entityA, entityB){
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
            for(let bullets of playerBullets){
                if(!bullets.isAlive) continue;

                if(this.#isColliding(bullet, enemy)){

                    const enemyDied = enemy.takeDamage(bullet.damage);
                    this.bullets.die(); 
                
            
                    if(enemyDied){
                        this.updateScore(enemy.scoreValue);
                        this.spawnPowerUp(enemy.position, 'random');
                    }            
                }
            }
        }
    }

    #checkEnemyBulletsVsPlayer(enemyBullets){

        for(let bullet of enemyBullets){
            if(!bullet.isAlive) continue;
            
            if(this.#isColliding(bullet, this.#player)){

                this.#player.takeDamage(bullet.damage);
                bullet.die();
            }
        }
    }

    #checkEnemyVsPlayer(){

        for(let enemy of this.#enemies){

            if(!enemy.isAlive) continue; 

            if(this.#isColliding(enemy, this.#player)){
                this.#player.takeDamage(10);

                enemy.die();
            }
        }
    }

    #checkPlayerVsPowerUps(){
        
        for(let powerup of this.#powerups){

            if(!powerup.isAlive) continue;

            if(this.#isColliding(powerup, this.#player)){
                powerup.apply(this.#player);
                powerup.die();
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

            this.#highScore = this.score;

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