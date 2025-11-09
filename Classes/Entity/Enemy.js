class Enemy extends Entity{
  //tipo do inimigo adicionar depois
  //#type;

  //padrao de como o inimigo se movimentar
  #pattern;

  #scoreValue;

  #shootCooldown; 
  #lastShotTime;
  #damage; 

  #hasEnteredScreen;
  #spawnTimestamp;


  constructor(x,y,health,speed,radius,pattern,scoreValue,shootCooldown,damage){

    super(x, y, radius, health, speed);

    // this.#type = type;
    this.#pattern = pattern;
    this.#scoreValue = scoreValue;
    this.#shootCooldown = shootCooldown;
    this.#damage = damage;

    //valor da ulltima vez que ele atirou em millisegundos
    this.#lastShotTime = millis();

    //verificações para matar o inimigo
    this.#hasEnteredScreen = false;
    this.#spawnTimestamp = millis();
  }

  //Getters e Setters

  /*get type() { return this.#type; }
    set type(type) { this.#type = type; }*/

  get pattern() { return this.#pattern; }
  set pattern(pattern) { this.#pattern = pattern; }

  get scoreValue() { return this.#scoreValue; }
  set scoreValue(scoreValue) {this.#scoreValue = scoreValue; }

  get shootCooldown() { return this.#shootCooldown; }
  set shootCooldown(shootCooldown) { this.#shootCooldown = shootCooldown; }

  get damage() { return this.#damage; }
  set damage(damage) {this.#damage = damage; }

  get lastShotTime() { return this.#lastShotTime; }
  set lastShotTime(lastShotTime) {this.#lastShotTime = lastShotTime; }

  //atualiza o estado do enemy de acordo com o framehate 
  update(deltaTime, target){

    //so atualiza enemies vivos
    if(!this.isAlive) return null;
    
    //se armazena a posição do inimigo se ele entrou na tela
    const isOnScreen = (
      this.position.x + this.radius > 0 &&
        this.position.x - this.radius < width &&
        this.position.y + this.radius > 0 &&
        this.position.y - this.radius < height
    );
      
      
    if(isOnScreen) this.#hasEnteredScreen = true;

    //caso o inimigo nao tenha entrado na tela em 10 segundos ele morre
    if(!this.#hasEnteredScreen){
      const timeSinceSpawn = millis() - this.#spawnTimestamp;
      
      if(timeSinceSpawn > 1000){
        this.isAlive = false;
        return null;
      }
    }

    //se move de acordo com o alvo
    this.move(deltaTime,target);

    this.checkBound(width, height);


    const newBullet = this.attack(target);

    return newBullet;
  }

  move(deltaTime){

    switch(this.#pattern){

      case 'down':
        this.velocity.set(0,this.speed);
        break;
      case 'sine_wave':
        let xVel = cos(millis() / 500) * this.speed * 0.75
        this.velocity.set(xVel,this.speed * 0.5);
        break;
      case 'still':
        this.velocity.set(0,0);
        break;
      default:
        this.velocity.set(0,this.speed);
    }

    this.velocity.normalize();
    this.velocity.mult(this.speed);

    let movement = p5.Vector.mult(this.velocity, deltaTime/1000);
    this.position.add(movement);
  }
  checkBound(width, height){

    if(!this.#hasEnteredScreen) return;
    
    const margin = 50; 
        
    if(this.position.x + this.radius < 0 - margin || // Saiu pela esquerda
      this.position.x - this.radius > width + margin || // Saiu pela direita
      this.position.y + this.radius < 0 - margin || // Saiu por cima
      this.position.y - this.radius > height + margin){ // Saiu por baixo
             
      this.isAlive = false;
    }
  }
  //logica de atk
  attack(target){

    //so ataca se o cooldown for menor que 0
    if(this.shootCooldown <= 0 || !target) return null;

    //verifica se pode atacar
    if(millis() - this.#lastShotTime > this.#shootCooldown) {
      this.#lastShotTime = millis();

      //Direção que o alvo esta
      let direction = p5.Vector.sub(target.position, this.position);
      let angle = direction.heading();
      let bulletSpeed = this.speed * 1.5;
      let bulletRadius = 5;


      return new Bullet(this.position.x, this.position.y, angle, bulletSpeed, this.#damage, 'enemy', bulletRadius);
    }
    return null;
  }

  //logica para levar dano
  takeDamage(amount){

    super.takeDamage(amount);

    if(!this.isAlive) return {died: true, score: this.#scoreValue};

    return {died: false, score: 0};

  }

  //desenha as entidades
  draw(){
    if(!this.isAlive) return;

    push();
    translate(this.position.x,this.position.y);

    /*switch(this.type){
            case 'chaser':
                fill(255, 100, 100, 200); // Vermelho translúcido
                break;
            case 'shooter':
                fill(100, 100, 255, 200); // Azul translúcido
                break;
            default:
                fill(150, 200); // Cinza translúcido
        }*/

    fill(150, 200);

    noStroke();

    circle(0,0, this.radius * 2);

    this.#drawHelthBar();

    pop();
  }

  //barra de vida
  #drawHelthBar(){
    const barWidth = this.radius * 2;
    const barHeight = 5;
    const barX = -this.radius;
    const barY = -this.radius - barHeight - 5;
    const healthPercent = this.health / this.maxHealth;

    fill(50,0,0);
    rect(barX,barY,barWidth,barHeight);

    fill(0,255,0);
    rect(barX,barY, barWidth * healthPercent, barHeight);
  }
}
