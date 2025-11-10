class BossEnemy extends Enemy {
  #phase;
  #specialAttackCooldown;
  #lastSpecialAttack;
  #phaseHealthThresholds;
  #attackPattern;
  #movementPattern;
  #patternTimer;

  constructor(x, y, waveNumber) {
    
    const baseHealth = 1000 + (waveNumber * 500);
    const baseSpeed = 50;
    const radius = 40;
    const scoreValue = 500 + (waveNumber * 100);
    const shootCooldown = 500; 
    const damage = 15;

    super(
      x, y, 
      baseHealth,
      baseSpeed,
      radius,
      'boss',
      'still', // Controla movimento
      scoreValue,
      shootCooldown,
      damage
    );

    this.#phase = 1;
    this.#specialAttackCooldown = 5000; // 5 segundos
    this.#lastSpecialAttack = 0;
    this.#phaseHealthThresholds = [0.75, 0.5, 0.25]; // Fases em 75%, 50%, 25% de vida
    this.#attackPattern = 'spread'; // 'spread', 'spiral', 'ring'
    this.#movementPattern = 'horizontal'; // 'horizontal', 'vertical', 'circle'
    this.#patternTimer = 0;
  }

  // Getters
  get phase() { return this.#phase; }
  get specialAttackCooldown() { return this.#specialAttackCooldown; }
  get phaseHealthThresholds() { return this.#phaseHealthThresholds; }

  // Sobrescreve update
  update(deltaTime, target) {
    if (!this.isAlive) return null;

    this.#patternTimer += deltaTime / 1000;

    // Verifica mudança de fase
    this.checkPhaseChange();

    this.move(deltaTime, target);
    this.checkBound(width, height);

    const bullets = [];

    // Ataque normal
    const normalBullet = this.attack(target);
    if (normalBullet) {
      if (Array.isArray(normalBullet)) {
        bullets.push(...normalBullet);
      } else {
        bullets.push(normalBullet);
      }
    }

    // Ataque especial
    const specialBullets = this.specialAttack(target);
    if (specialBullets) {
      bullets.push(...specialBullets);
    }

    return bullets.length > 0 ? bullets : null;
  }

  // Verifica mudança de fase baseada na vida
  checkPhaseChange() {
    const healthPercent = this.health / this.maxHealth;
    let newPhase = 1;

    for (let i = 0; i < this.#phaseHealthThresholds.length; i++) {
      if (healthPercent <= this.#phaseHealthThresholds[i]) {
        newPhase = i + 2;
      }
    }

    if (newPhase !== this.#phase) {
      this.#phase = newPhase;
      this.#onPhaseChange();
    }
  }

  // Ações ao mudar de fase
  #onPhaseChange() {
    console.log(`Boss entrou na fase ${this.#phase}!`);

    switch (this.#phase) {
      case 2:
        this.#attackPattern = 'spiral';
        this.#movementPattern = 'vertical';
        this.speed *= 1.2;
        break;
      case 3:
        this.#attackPattern = 'ring';
        this.#movementPattern = 'circle';
        this.speed *= 1.3;
        this.#specialAttackCooldown = 3000; 
        break;
      case 4:
        this.#attackPattern = 'chaos';
        this.speed *= 1.5;
        this.#specialAttackCooldown = 2000;
        break;
    }
  }

  // Padrões de movimento do boss
  move(deltaTime, target) {
    switch (this.#movementPattern) {
      case 'horizontal':
        this.#moveHorizontal();
        break;
      case 'vertical':
        this.#moveVertical();
        break;
      case 'circle':
        this.#moveCircle();
        break;
    }

    let movement = p5.Vector.mult(this.velocity, deltaTime / 1000);
    this.position.add(movement);
  }

  #moveHorizontal() {
    const margin = 100;
    const targetY = height * 0.2;

    // Move horizontalmente
    if (this.position.x <= margin || this.position.x >= width - margin) {
      this.velocity.x *= -1;
    }

    // Mantém altura
    if (abs(this.position.y - targetY) > 10) {
      this.velocity.y = (targetY - this.position.y) * 0.1;
    }

    if (this.velocity.x === 0) {
      this.velocity.x = this.speed;
    }
  }

  #moveVertical() {
    const margin = 100;
    const targetX = width / 2;

    // Move verticalmente
    if (this.position.y <= margin || this.position.y >= height * 0.4) {
      this.velocity.y *= -1;
    }

    // Mantém posição horizontal
    if (abs(this.position.x - targetX) > 10) {
      this.velocity.x = (targetX - this.position.x) * 0.1;
    }

    if (this.velocity.y === 0) {
      this.velocity.y = this.speed;
    }
  }

  #moveCircle() {
    const centerX = width / 2;
    const centerY = height / 4;
    const radius = 150;
    const angularSpeed = 0.3;

    let targetX = centerX + cos(this.#patternTimer * angularSpeed) * radius;
    let targetY = centerY + sin(this.#patternTimer * angularSpeed) * radius;

    let target = createVector(targetX, targetY);
    let direction = p5.Vector.sub(target, this.position);

    this.velocity = direction.normalize().mult(this.speed);
  }

  // Ataque normal do boss
  attack(target) {
    if (!target || this.shootCooldown <= 0) return null;

    const now = millis();

    if (now - this.lastShotTime > this.shootCooldown) {
      this.lastShotTime = now;

      const bullets = [];
      let direction = p5.Vector.sub(target.position, this.position);
      let baseAngle = direction.heading();
      let bulletSpeed = this.speed * 2.5;
      let bulletRadius = 7;

      switch (this.#attackPattern) {
        case 'spread':
          // 5 balas em leque
          for (let i = -2; i <= 2; i++) {
            let angle = baseAngle + (i * 0.2);
            bullets.push(new Bullet(
              this.position.x, this.position.y, 
              angle, bulletSpeed, this.damage, 'enemy', bulletRadius
            ));
          }
          break;

        case 'spiral':
          // 3 balas em espiral
          for (let i = 0; i < 3; i++) {
            let angle = baseAngle + (this.#patternTimer * 2) + (i * TWO_PI / 3);
            bullets.push(new Bullet(
              this.position.x, this.position.y, 
              angle, bulletSpeed, this.damage, 'enemy', bulletRadius
            ));
          }
          break;

        case 'ring':
          // 8 balas em anel
          for (let i = 0; i < 8; i++) {
            let angle = (i * TWO_PI / 8) + (this.#patternTimer * 0.5);
            bullets.push(new Bullet(
              this.position.x, this.position.y, 
              angle, bulletSpeed * 0.8, this.damage, 'enemy', bulletRadius
            ));
          }
          break;

        case 'chaos':
          // combina tudo
          // Spread
          for (let i = -1; i <= 1; i++) {
            bullets.push(new Bullet(
              this.position.x, this.position.y, 
              baseAngle + (i * 0.3), bulletSpeed, this.damage, 'enemy', bulletRadius
            ));
          }
          // Ring parcial
          for (let i = 0; i < 4; i++) {
            let angle = (i * TWO_PI / 4) + this.#patternTimer;
            bullets.push(new Bullet(
              this.position.x, this.position.y, 
              angle, bulletSpeed * 0.7, this.damage, 'enemy', bulletRadius
            ));
          }
          break;
      }

      return bullets;
    }
    return null;
  }

  // Ataque especial
  specialAttack(target) {
    if (!target) return null;

    const now = millis();

    if (now - this.#lastSpecialAttack > this.#specialAttackCooldown) {
      this.#lastSpecialAttack = now;

      const bullets = [];
      const bulletSpeed = this.speed * 2;
      const bulletRadius = 10; 
      const specialDamage = this.damage * 2;

      const numBullets = 12 + (this.#phase * 4); 
      for (let i = 0; i < numBullets; i++) {
        let angle = (i * TWO_PI / numBullets);
        bullets.push(new Bullet(
          this.position.x, this.position.y, 
          angle, bulletSpeed, specialDamage, 'enemy', bulletRadius
        ));
      }

      return bullets;
    }
    return null;
  }

  // Sobrescreve checkBound para o boss não sair da tela
  checkBound(width, height) {
    const margin = this.radius;

    
    if (this.position.x - this.radius < margin) {
      this.position.x = margin + this.radius;
      this.velocity.x *= -1;
    }
    if (this.position.x + this.radius > width - margin) {
      this.position.x = width - margin - this.radius;
      this.velocity.x *= -1;
    }
    if (this.position.y - this.radius < margin) {
      this.position.y = margin + this.radius;
      this.velocity.y *= -1;
    }
    if (this.position.y + this.radius > height * 0.5) {
      this.position.y = height * 0.5 - this.radius;
      this.velocity.y *= -1;
    }
  }
 
  draw() {
    if (!this.isAlive) return;

    push();
    translate(this.position.x, this.position.y);

    // Aura piscando baseada na fase
    let pulseSize = 1 + sin(this.#patternTimer * 3) * 0.1;
    for (let i = 4; i > 0; i--) {
      let alpha = 30 / i;
      let phaseColor = this.#getPhaseColor();
      fill(phaseColor[0], phaseColor[1], phaseColor[2], alpha);
      noStroke();
      circle(0, 0, this.radius * 2 * (1 + i * 0.15) * pulseSize);
    }

    // Corpo principal
    let phaseColor = this.#getPhaseColor();
    fill(phaseColor[0], phaseColor[1], phaseColor[2], 230);
    stroke(255);
    strokeWeight(4);
    circle(0, 0, this.radius * 2);

    // Padrão interno 
    noFill();
    strokeWeight(3);
    let numRings = 3;
    for (let ring = 0; ring < numRings; ring++) {
      stroke(255, 255 - ring * 50, 0);
      let ringRadius = this.radius * (0.3 + ring * 0.2);
      let rotation = this.#patternTimer * (1 + ring) * (ring % 2 === 0 ? 1 : -1);

      beginShape();
      let points = 6 + ring * 2;
      for (let i = 0; i <= points; i++) {
        let angle = (TWO_PI / points) * i + rotation;
        let x = cos(angle) * ringRadius;
        let y = sin(angle) * ringRadius;
        vertex(x, y);
      }
      endShape(CLOSE);
    }

    // Indicador de fase
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(`F${this.#phase}`, 0, 0);

    
    this.drawHealthBar();

    pop();
  }

  #getPhaseColor() {
    switch (this.#phase) {
      case 1: return [100, 255, 100]; // Verde
      case 2: return [255, 255, 100]; // Amarelo
      case 3: return [255, 150, 50];  // Laranja
      case 4: return [255, 50, 50];   // Vermelho
      default: return [150, 150, 150];
    }
  }

  drawHealthBar() {
    const barWidth = this.radius * 3;
    const barHeight = 12;
    const barX = -this.radius * 1.5;
    const barY = -this.radius - barHeight - 15;
    const healthPercent = this.health / this.maxHealth;

    // Borda ornamentada
    stroke(255, 215, 0);
    strokeWeight(3);
    fill(30, 0, 0);
    rect(barX - 3, barY - 3, barWidth + 6, barHeight + 6);

    // Segmentos de fase
    noStroke();
    for (let i = 0; i < this.#phaseHealthThresholds.length + 1; i++) {
      let segmentStart = i === 0 ? 1 : this.#phaseHealthThresholds[i - 1];
      let segmentEnd = i < this.#phaseHealthThresholds.length ? 
        this.#phaseHealthThresholds[i] : 0;

      let segmentX = barX + (1 - segmentStart) * barWidth;
      let segmentWidth = (segmentStart - segmentEnd) * barWidth;

      // Divisor de segmento
      if (i > 0) {
        stroke(50);
        strokeWeight(2);
        line(segmentX, barY, segmentX, barY + barHeight);
      }
    }

    // Vida atual
    noStroke();
    let phaseColor = this.#getPhaseColor();
    fill(phaseColor[0], phaseColor[1], phaseColor[2]);
    rect(barX, barY, barWidth * healthPercent, barHeight);

    // Brilho
    fill(255, 255, 255, 100);
    rect(barX, barY, barWidth * healthPercent, barHeight * 0.3);

    // Texto de vida
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(`${Math.ceil(this.health)} / ${this.maxHealth}`, 0, barY + barHeight / 2);
  }

  
  takeDamage(amount) {
    const result = super.takeDamage(amount);

    return result;
  }
}
