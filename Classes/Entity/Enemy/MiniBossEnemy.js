class MiniBossEnemy extends Enemy {
  #movementPattern;
  #patternTimer;
  #patternPhase;
  #centerPoint;

  constructor(x, y, health, speed, radius, scoreValue, shootCooldown, damage) {
    super( 
      x, y, 
      health * 3, 
      speed * 0.7, 
      radius * 1.5, 
      'miniboss', 
      'still', 
      scoreValue * 5, 
      shootCooldown * 0.7, 
      damage * 1.5 
    );

    this.#movementPattern = 'circle'; 
    this.#patternTimer = 0;
    this.#patternPhase = 0;
    this.#centerPoint = createVector(width / 2, height / 4);
  }

  
  get movementPattern() { return this.#movementPattern; }
  set movementPattern(pattern) { this.#movementPattern = pattern; }

  
  update(deltaTime, target) {
    if (!this.isAlive) return null;

    this.#patternTimer += deltaTime / 1000;

    
    this.move(deltaTime, target);
    this.checkBound(width, height);

    // Mini-boss atira mais balas
    const bullets = [];
    const newBullet = this.attack(target);
    if (newBullet) {
      bullets.push(newBullet);

      // Atira em padrão de 3 balas (spread)
      const spreadAngle = 0.3;
      const angle = newBullet.angle;

      bullets.push(new Bullet(
        this.position.x, 
        this.position.y, 
        angle - spreadAngle, 
        newBullet.speed, 
        this.damage, 
        'enemy', 
        5
      ));

      bullets.push(new Bullet(
        this.position.x, 
        this.position.y, 
        angle + spreadAngle, 
        newBullet.speed, 
        this.damage, 
        'enemy', 
        5
      ));
    }

    return bullets.length > 1 ? bullets : newBullet;
  }

  // padrao de movimento diferente para o miniboss
  move(deltaTime, /*target*/) {
    switch (this.#movementPattern) {
      case 'circle':
        this.#moveCircle();
        break;
      case 'figure8':
        this.#moveFigure8();
        break;
      case 'zigzag':
        this.#moveZigzag();
        break;
      default:
        this.#moveCircle();
    }

    let movement = p5.Vector.mult(this.velocity, deltaTime / 1000);
    this.position.add(movement);
  }

  #moveCircle() {
    const radius = 150;
    const angularSpeed = 0.5;

    let targetX = this.#centerPoint.x + cos(this.#patternTimer * angularSpeed) * radius;
    let targetY = this.#centerPoint.y + sin(this.#patternTimer * angularSpeed) * radius;

    let target = createVector(targetX, targetY);
    let direction = p5.Vector.sub(target, this.position);

    this.velocity = direction.normalize().mult(this.speed);
  }

  #moveFigure8() {
    const radius = 150;
    const angularSpeed = 0.4;

    let t = this.#patternTimer * angularSpeed;
    let targetX = this.#centerPoint.x + sin(t) * radius;
    let targetY = this.#centerPoint.y + sin(t * 2) * radius * 0.5;

    let target = createVector(targetX, targetY);
    let direction = p5.Vector.sub(target, this.position);

    this.velocity = direction.normalize().mult(this.speed);
  }

  #moveZigzag() {
    // Muda fase a cada 2 segundos
    if (this.#patternTimer > this.#patternPhase * 2) {
      this.#patternPhase++;
    }

    let direction;
    if (this.#patternPhase % 2 === 0) {
      // Move para direita e baixo
      direction = createVector(1, 0.5);
    } else {
      // Move para esquerda e baixo
      direction = createVector(-1, 0.5);
    }

    // Mantém dentro da tela
    if (this.position.x < 100 || this.position.x > width - 100) {
      this.#patternPhase++;
    }

    this.velocity = direction.normalize().mult(this.speed);
  }

  
  attack(target) {
    if (!target || this.shootCooldown <= 0) return null;

    const now = millis();

    if (now - this.lastShotTime > this.shootCooldown) {
      this.lastShotTime = now;

      let direction = p5.Vector.sub(target.position, this.position);
      let angle = direction.heading();

      let bulletSpeed = this.speed * 1.8;
      let bulletRadius = 6; // Balas maiores

      return new Bullet(
        this.position.x, 
        this.position.y, 
        angle, 
        bulletSpeed, 
        this.damage, 
        'enemy', 
        bulletRadius
      );
    }
    return null;
  }

  draw() {
    if (!this.isAlive) return;

    push();
    translate(this.position.x, this.position.y);

    // Efeito de brilho
    for (let i = 3; i > 0; i--) {
      fill(255, 200, 0, 50 / i);
      noStroke();
      circle(0, 0, this.radius * 2 * (1 + i * 0.1));
    }

    // Corpo principal - Laranja/Amarelo
    fill(255, 180, 0, 220);
    stroke(255, 255, 0);
    strokeWeight(3);
    circle(0, 0, this.radius * 2);

    // Desenha padrão
    noFill();
    stroke(255, 100, 0);
    strokeWeight(2);
    let numPoints = 6;
    beginShape();
    for (let i = 0; i < numPoints; i++) {
      let angle = (TWO_PI / numPoints) * i + this.#patternTimer;
      let x = cos(angle) * this.radius * 0.5;
      let y = sin(angle) * this.radius * 0.5;
      vertex(x, y);
    }
    endShape(CLOSE);

    // Indicador de tipo
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(14);
    text('MB', 0, 0);

    
    this.drawHealthBar();

    pop();
  }

  drawHealthBar() {
    const barWidth = this.radius * 2.5;
    const barHeight = 8;
    const barX = -this.radius * 1.25;
    const barY = -this.radius - barHeight - 10;
    const healthPercent = this.health / this.maxHealth;

    // Borda
    stroke(255);
    strokeWeight(2);
    fill(50, 0, 0);
    rect(barX, barY, barWidth, barHeight);

    // Vida
    noStroke();
    fill(255, 180, 0);
    rect(barX + 2, barY + 2, (barWidth - 4) * healthPercent, barHeight - 4);
  }
}
