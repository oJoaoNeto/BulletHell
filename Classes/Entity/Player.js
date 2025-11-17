class Player extends Entity {
  #lives;
  #gameManager;
  #weapon; // Agora usando a weapon
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
  // Power-ups
  #activePowerUps;
  #shield;
  hasDoubleShot;

  #dashTrail = []; //array para armazenar as posições do dashTrail
  #dashTrailMaxLength = 10;

  constructor(x, y, radius, speed, health, lives, gameManager, weapon = null) {
    super(x, y, radius, health, speed);
    this.#lives = lives;
    this.#gameManager = gameManager;
    this.#weapon = weapon || new Pistol(this,25,10,1.0);
    this.#dashcooldown = 1500;
    this.#dashDuration = 150;
    this.#dashSpeed = 900;
    this.#dashTimer = 0;
    this.#dashVector = createVector(0, 0);
    this.#lastDashTime = -this.#dashcooldown;
    this.#isInvencible = false;
    this.#invencibleDuration = 2500;
    this.#invencibleTimer = 0;
    // Power-ups
    this.#activePowerUps = [];
    this.#shield = 0;
    this.hasDoubleShot = false;
  }

  update(deltaTime) {
    if (this.#isInvencible) {
      this.#invencibleTimer -= deltaTime;
      if (this.#invencibleTimer <= 0) {
        this.#isInvencible = false;
        this.#invencibleTimer = 0;
      }
    }
    if (this.#isDashing) {
      this.#dashTimer -= deltaTime;
      if (this.#dashTimer <= 0) {
        this.#isDashing = false;
      }
    }
    this.#updatePowerUps(deltaTime);
    this.handleInput();
    this.move(deltaTime);
    this.checkBounds(width, height);
  }

  #updatePowerUps(deltaTime) {
    for (let i = this.#activePowerUps.length - 1; i >= 0; i--) {
      const powerUp = this.#activePowerUps[i];
      powerUp.update(deltaTime, this);
      if (!powerUp.isApplied) {
        this.#activePowerUps.splice(i, 1);
      }
    }
  }

  handleInput() {
    this.velocity.set(0, 0);
    if (keyIsDown(87) || keyIsDown(UP_ARROW)) this.velocity.y = -1;
    if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) this.velocity.y = 1;
    if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) this.velocity.x = -1;
    if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) this.velocity.x = 1;
    if (mouseIsPressed) this.shoot();
    if (keyIsDown(32)) this.dash();
  }

  move(deltaTime) {
    let finalVelocity;
    if (this.#isDashing){

      let dashSpeed = this.#dashSpeed;
      if (this.getActivePowerUp('speed')) dashSpeed *= 1.5;
      
      finalVelocity = this.#dashVector.copy().setMag(dashSpeed);
      
      this.#dashTrail.shift();
      this.#dashTrail.push(this.position.copy());
    } else {
      finalVelocity = this.velocity.copy();
      if (finalVelocity.mag() > 0) finalVelocity.setMag(this.speed);
    }

    let movement = p5.Vector.mult(finalVelocity, deltaTime / 1000);
    this.position.add(movement)
  }

  checkBounds(p5Width, p5Height) {
    this.position.x = constrain(this.position.x, this.radius, p5Width - this.radius);
    this.position.y = constrain(this.position.y, this.radius, p5Height - this.radius);
  }

  shoot() {
    let targetAngle = atan2(mouseY - this.position.y, mouseX - this.position.x);
    if (this.hasDoubleShot) {
      // Double shot: dois tiros com offset
      const offsetAngle = 0.1;
      this.#weapon.fire(targetAngle - offsetAngle);
      this.#weapon.fire(targetAngle + offsetAngle);
    } else {
      this.#weapon.fire(targetAngle);
    }
  }

  dash() {
    const now = millis();
    if (now - this.#lastDashTime > this.#dashcooldown && !this.#isDashing) {
      this.#isDashing = true;
      this.#lastDashTime = now;
      this.#dashTimer = this.#dashDuration;
      this.#isInvencible = true;
      this.#invencibleTimer = this.#dashDuration;

      let dashDirection = createVector(mouseX - this.position.x, mouseY - this.position.y);
      if(dashDirection.mag() === 0) dashDirection.set(1,0);
      
      dashDirection.normalize();
      this.#dashVector = dashDirection;
      
      this.#dashTrail = [];
      for(let i = 0; i < this.#dashTrailMaxLength; i++) this.#dashTrail.push(this.position.copy());
   }
  }

  takeDamage(amount) {
    if (this.#shield > 0) {
      const damageToShield = Math.min(this.#shield, amount);
      this.#shield -= damageToShield;
      amount -= damageToShield;
      if (amount === 0) return;
    }
    if (this.#isInvencible) return;
    super.takeDamage(amount);
    this.#isInvencible = true;
    this.#invencibleTimer = 1000;
    if (this.health <= 0) {
      this.#lives--;
      if (this.#lives <= 0) {
        this.isAlive = false;
      } else {
        this.health = this.maxHealth;
        this.position = createVector(width / 2, height - 50);
        this.#isInvencible = true;
        this.#invencibleTimer = this.#invencibleDuration;
      }
    }
  }

  addHealth(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) this.health = this.maxHealth;
  }

  draw() {
    
    if (this.#isDashing){
      for (let i = 0; i < this.#dashTrailMaxLength.length; i++){

        let trailPos = this.#dashTrail[i];
        let alpha = map(i, 0, this.#dashTrailMaxLength - 1, 50, 200) //Arquivos de Programas
    
        push();
        translate(trailPos.x, trailPos.y);
        rotate(atan2(mouseY - trailPos.y, mouseX - trailPos.x));
        fill(0,150,255,alpha);
        noStroke();
        ellipse(0,0,this.radius * 2 * (1 - i / this.#dashTrailMaxLength));
        pop();
      }
    }    
    if (this.#isInvencible && Math.floor(this.#invencibleTimer / 100) % 2 === 0) return;
    push();
    translate(this.position.x, this.position.y);
    rotate(atan2(mouseY - this.position.y, mouseX - this.position.x));
    fill(0, 150, 255);
    stroke(255);
    strokeWeight(2);
    ellipse(0, 0, this.radius * 2, this.radius * 2);
    fill(255);
    rect(this.radius * 0.5, -5, -15, 10);
    pop();
    // Desenhar escudo se houver
    if (this.#shield > 0) {
      push();
      translate(this.position.x, this.position.y);
      noFill();
      stroke(0, 150, 255, 150);
      strokeWeight(4);
      ellipse(0, 0, this.radius * 2 + 10);
      pop();
    }
  }

  // Métodos para power-ups
  addActivePowerUp(powerUp) {
    this.#activePowerUps.push(powerUp);
  }

  getActivePowerUp(effectType) {
    return this.#activePowerUps.find(p => p.effect === effectType && p.isApplied);
  }

  addShield(amount) {
    this.#shield += amount;
  }

  setShield(amount) {
    this.#shield = amount;
  }

  // Getters
  get lives() { return this.#lives; }
  set lives(lives) { this.#lives = lives; }
  get shield() { return this.#shield; }
  get gameManager() { return this.#gameManager; }
} 
