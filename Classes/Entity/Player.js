class Player extends Entity {

    #lives;
    #gameManager; 
    #shootCooldown; 
    #lastShotTime;

    #dashcooldown;
    #isDashing;
    #lastDashTime;

    #dashDuration;
    #dashSpeed;
    #dashTimer;
    #dashVector;
    
    #isInvencible;
    #invencibleTimer;
    #invencibleDuration;

    // --- NOVAS PROPRIEDADES PARA POWER-UPS ---
    #activePowerUps; // Lista de power-ups cronometrados ativos
    #shield;          // Pontos de escudo
    hasDoubleShot;  // Flag para o DoubleShotPowerUp
    // ------------------------------------------

    constructor(x, y, radius, speed, health, lives, weapon){
        
        super(x, y, radius, health, speed);
        
        this.#lives = lives;
        this.#gameManager = gameManager; // Assumindo que 'gameManager' é uma var global
        
        this.#shootCooldown = 250; // 250ms de delay
        this.#lastShotTime = 0;

        this.#dashcooldown = 1500;
        this.#dashDuration = 150;
        this.#dashSpeed = 900;
        this.#dashTimer = 0;
        this.#dashVector = createVector(0, 0);
        this.#lastDashTime = -this.#dashcooldown;

        this.#isInvencible = false;
        this.#invencibleDuration = 2500; // Duração da invencibilidade ao renascer
        this.#invencibleTimer = 0;

        // --- INICIALIZAÇÃO DOS POWER-UPS ---
        this.#activePowerUps = [];
        this.#shield = 0;
        this.hasDoubleShot = false; // Começa sem tiro duplo
        // -----------------------------------
    }
  #lives;
  //#weapon;

  #gameManager; 
  #shootCooldown; 
  #lastShotTime;

       if(this.#isInvencible){
            this.#invencibleTimer -= deltaTime;
            // Checava com '=== 0', o correto é '<= 0'
            if(this.#invencibleTimer <= 0) {
                this.#isInvencible = false; 
                this.#invencibleTimer = 0;
            }
       }
       
       if(this.#isDashing){
            this.#dashTimer -= deltaTime;
            if(this.#dashTimer <= 0) {
                this.#isDashing = false;
            }
       }

       // NOVO: Atualiza os power-ups ativos
       this.#updatePowerUps(deltaTime);

       this.handleInput();
       this.move(deltaTime);
       this.checkBounds(width,height);
    }

    // NOVO: Método para gerenciar power-ups ativos
    #updatePowerUps(deltaTime) {
        // Itera de trás para frente para poder remover itens
        for (let i = this.#activePowerUps.length - 1; i >= 0; i--) {
            const powerUp = this.#activePowerUps[i];
            
            // O update do power-up verifica a duração
            powerUp.update(deltaTime, this); 
            
            // Se o power-up se marcou como não aplicado (tempo acabou)
            if (!powerUp.isApplied) {
                this.#activePowerUps.splice(i, 1); // Remove da lista
            }
        }
    }

    //inputs para movimento (wasd e setas)
    handleInput(){
        this.velocity.set(0, 0);
  #dashcooldown;
  #isDashing;
  #lastDashTime;

  #dashDuration;
  #dashSpeed;
  #dashTimer;
  #dashVector;

  #isInvencible;
  #invencibleTimer;
  #invencibleDuration;

  constructor(x, y, radius, speed, health, lives, gameManager){


    super(x, y, radius, health, speed);

    this.#lives = lives;
    //this.#weapon = weapon;

    this.#gameManager = gameManager;

    this.#shootCooldown = 250;
    this.#lastShotTime = 0;

    this.#dashcooldown = 1500;
    this.#dashDuration = 150;
    this.#dashSpeed = 900;
    this.#dashTimer = 0;
    this.#dashVector = createVector(0, 0);
    this.#lastDashTime = -this.#dashcooldown;
    this.#isDashing = false;    

    this.#isInvencible = false;
    this.#invencibleDuration = 2500;
    this.#invencibleTimer = 0;
  }


  //atualiza o player na tela de acordo com o framerate
  update(deltaTime){

        if(keyIsDown(32)) this.dash();
    }

    //logica de movimentação do player
    move(deltaTime){
        let finalVelocity;
        
        if(this.#isDashing) finalVelocity = this.#dashVector.copy().setMag(this.#dashSpeed);
        else {
            finalVelocity = this.velocity.copy();
            if(finalVelocity.mag() > 0) finalVelocity.setMag(this.speed);
        }

        let movement = p5.Vector.mult(finalVelocity, deltaTime/ 1000)
        this.position.add(movement);
    }
    if(this.#isInvencible){
      this.#invencibleTimer -= deltaTime;
      if(this.#invencibleTimer <= 0) this.#isInvencible = false;
    }

    if(this.#isDashing){
      this.#dashTimer -= deltaTime;
      if(this.#dashTimer <= 0) {
        this.#isDashing = false;
      }
    }

    this.handleInput();

    this.move(deltaTime);

    this.checkBounds(width,height);

  }
  //inputs para movimento (wasd e setas)
  handleInput(){
    this.velocity.set(0, 0);

    if(keyIsDown(87) || keyIsDown(UP_ARROW)) this.velocity.y = -1;
    if(keyIsDown(83) || keyIsDown(DOWN_ARROW)) this.velocity.y = 1;
    if(keyIsDown(65) || keyIsDown(LEFT_ARROW)) this.velocity.x =  -1;
    if(keyIsDown(68) || keyIsDown(RIGHT_ARROW)) this.velocity.x = 1;

    if(mouseIsPressed) this.shoot();

    if(keyIsDown(32)) this.dash();

  }

  //logica de movimentação do player
  move(deltaTime){
    let finalVelocity;

    //verifica se o player esta usando um dash e atualiza a velocidade
    if(this.#isDashing) finalVelocity = this.#dashVector.copy().setMag(this.#dashSpeed);
      else {

        finalVelocity = this.velocity.copy();
        if(finalVelocity.mag() > 0) finalVelocity.setMag(this.speed);
      }

    let movement = p5.Vector.mult(finalVelocity, deltaTime/ 1000)
    this.position.add(movement);
  }

  checkBounds(p5Width, p5Height){
    this.position.x = constrain(this.position.x, this.radius, p5Width - this.radius);
    this.position.y = constrain(this.position.y, this.radius, p5Height - this.radius);
  }

  shoot(){

    // MODIFICADO: Lógica de tiro atualizada para power-ups
    shoot(){
        const now = millis();
        // MODIFICADO: usa o getter 'fireRate'
        if (now - this.#lastShotTime > this.fireRate) { 
            this.#lastShotTime = now;

            let targetAngle = atan2(mouseY - this.position.y, mouseX - this.position.x);
            
            // Stats do projétil
            let bulletSpeed = 500;
            let bulletDamage = 25;
            let bulletRadius = 5;

            // MODIFICADO: Checa se tem tiro duplo
            if (this.hasDoubleShot) {
                // Atira dois projéteis com um pequeno desvio
                const offsetAngle = 0.1; // Radianos
                
                let bullet1 = new Bullet(
                    this.position.x, this.position.y, 
                    targetAngle - offsetAngle, 
                    bulletSpeed, bulletDamage, 'player', bulletRadius
                );
                let bullet2 = new Bullet(
                    this.position.x, this.position.y, 
                    targetAngle + offsetAngle, 
                    bulletSpeed, bulletDamage, 'player', bulletRadius
                );
                
                this.#gameManager.addBullets(bullet1);
                this.#gameManager.addBullets(bullet2);
            } else {
                // Lógica de tiro normal
                let newBullet = new Bullet(
                    this.position.x, this.position.y, 
                    targetAngle, 
                    bulletSpeed, bulletDamage, 'player', bulletRadius
                );
                this.#gameManager.addBullets(newBullet);
            }
        }
    }

    //logica do dash
    dash(){
        const now = millis();
    /*if(this.#weapon){

            let targetAngle = antan2(mouseY - this.position.y, mouseX - this.position.x);
            let.#weapon.fire(this.position.x, this.position.y, targetAngle, this);
        }*/

    const now = millis();
    if (now - this.#lastShotTime > this.#shootCooldown) {
      this.#lastShotTime = now;

      let targetAngle = atan2(mouseY - this.position.y, mouseX - this.position.x);

      // Stats do projétil
      let bulletSpeed = 500;
      let bulletDamage = 25; // Dano do tiro
      let bulletRadius = 5;

      // (x, y, angle, speed, damage, owner, radius)
      let newBullet = new Bullet(
        this.position.x, 
        this.position.y, 
        targetAngle, 
        bulletSpeed, 
        bulletDamage, 
        'player', 
        bulletRadius
      );

      // Adiciona o projétil ao jogo
      this.#gameManager.addBullets(newBullet);
    }


  }

  //logica do dash
  dash(){

    const now = millis();

    if(now - this.#lastDashTime > this.#dashcooldown && !this.#isDashing){

            this.#isDashing = true;
            this.#lastDashTime = now;
            this.#dashTimer = this.#dashDuration;

            this.#isInvencible = true;
            this.#invencibleTimer = this.#dashDuration; // Invencível durante o dash
      this.#isDashing = true;
      this.#lastDashTime = now;
      this.dashTimer = this.#dashDuration;

      this.#isInvencible = true;
      this.#invencibleTimer = this.#dashDuration;

      this.#dashVector = this.velocity.copy();

            if (this.#dashVector.mag() === 0) { // Se parado, dá dash para frente
                 this.#dashVector.set(1, 0); // Ex: dash para a direita
            }
          
            this.#dashVector.normalize();  
        }
    }

    // MODIFICADO: Lógica de dano com escudo e correções
    takeDamage(amount){

        // Se o escudo existir, ele absorve o dano primeiro
        if (this.#shield > 0) {
            const damageToShield = Math.min(this.#shield, amount);
            this.#shield -= damageToShield;
            amount -= damageToShield;
            
            // Se o escudo absorveu tudo, saia
            if (amount === 0) return;
        }

        // Se o dano restante for > 0, checa a invencibilidade
        if(this.#isInvencible) return;

        // Aplica dano à vida (usando o método da classe base)
        super.takeDamage(amount); // Isso atualiza 'this.health'

        // Ativa a invencibilidade pós-dano
        this.#isInvencible = true; 
        this.#invencibleTimer = 1000; // 1 segundo de invencibilidade
        
        if(this.health <= 0){
            this.#lives--;

            if(this.#lives <= 0) {
                this.isAlive = false; // Fim de jogo
            } else {
                // Renasce
                this.health = this.maxHealth;
                this.position = createVector(width / 2, height - 50); // Posição inicial

                // Invencibilidade de renascimento
                this.#isInvencible = true;
                // CORREÇÃO: 'isInvencibleTimer' estava público
                this.#invencibleTimer = this.#invencibleDuration; 
            }
        }
    } 

    //metedo para cura (usar no powerup)
    addHealth(amount){
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
      this.#dashVector.normalize();  
    }
  } 
  //logica do player tomar dano
  takeDamage(amount){

    if(this.#isInvencible) return;

    this.health -= amount;
    this.#isInvencible = true; // Invencibilidade momentânea após ser atingido
    this.#invencibleTimer = 1000; // 1 segundo

    if(this.health <= 0){
      this.#lives--;

      if(this.#lives <= 0)this.isAlive = false;
        else{
          this.health = this.maxHealth;

          this.position = createVector(width / 2, height / 2);

          this.#isInvencible = true;
          this.#invencibleTimer = this.#invencibleDuration;
        }
    }
  } 
  //metedo para cura(usar no powerup)
  addHealth(amount){
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

    //desenha o player na tela
    draw(){
        // CORREÇÃO: Math.floor(timer / 100) % 2 === 0
        // Isso faz o jogador piscar corretamente
        if(this.#isInvencible && Math.floor(this.#invencibleTimer / 100) % 2 === 0) {
            return; // Pula o desenho (pisca)
        }
        
        push();
        translate(this.position.x, this.position.y);
  //desenha o player na tela
  draw(){

    if(this.#isInvencible) 
      if(Math.floor(this.#invencibleTimer / 100) % 2 === 0) return;

    push();

    translate(this.position.x, this.position.y);

        fill(255);
        // O triângulo "nariz"
        triangle(this.radius, 0, 0, -this.radius / 2, 0, this.radius / 2);
        pop();

        // NOVO: Desenha o escudo
        if (this.#shield > 0) {
            push();
            translate(this.position.x, this.position.y);
            noFill();
            stroke(0, 150, 255, 150); // Azul translúcido
            strokeWeight(4);
            // Círculo de escudo um pouco maior que o jogador
            ellipse(0, 0, this.radius * 2 + 10); 
            pop();
        }
    }

    // --- NOVOS MÉTODOS PÚBLICOS PARA POWER-UPS ---
    addActivePowerUp(powerUp) {
        this.#activePowerUps.push(powerUp);
    }
    
    getActivePowerUp(effectType) {
        return this.#activePowerUps.find(p => p.effect === effectType && p.isApplied);
    }
    
    // Métodos para o ShieldPowerUp
    addShield(amount) {
        this.#shield += amount;
    }
    
    setShield(amount) {
        this.#shield = amount;
    }

    // --- GETTERS E SETTERS ---
    
    get lives() { return this.#lives;}
    set lives(lives) { this.#lives = lives;}

    // NOVO: Getter/Setter para o RapidFirePowerUp
    get fireRate() { return this.#shootCooldown; }
    set fireRate(value) { this.#shootCooldown = value; }
    let angle = atan2(mouseY - this.position.y, mouseX - this.position.x);
    rotate(angle);

    fill(0,150,255);
    stroke(255);
    strokeWeight(2);
    ellipse(0,0,this.radius * 2, this.radius * 2);

    fill(255);
    rect(this.radius * 0.5, -5, -15, 10);
    pop();
  }
  //getters e setters
  get lives() { return this.#lives;}
  set lives(lives) { this.#lives = lives;}

  /*get weapon() {return this.#weapon; }
    set weapon(weapon) { this.#weapon = weapon; }
    */

  get dashCooldown() { return this.#dashcooldown; }
  set dashCooldown(value) { this.#dashcooldown = value; }

    get isDashing() { return this.#isDashing; }
    get isInvencible() { return this.#isInvencible; }
    
    // NOVO: Getter para o HUD
    get shield() { return this.#shield; }
}
  get isDashing() { return this.#isDashing; }
  get isInvencible() { return this.#isInvencible; }
}
