class Enemy extends Entity{
  #type; 
  #pattern;
  #scoreValue;
  #shootCooldown; 
  #lastShotTime;
  #damage; 
  #hasEnteredScreen;
  #spawnTimestamp;
  
  
  #preferredDistance; // Distância  do player
  #aiState; // Estados: 'approach', 'maintain', 'retreat'

  constructor(x, y, health, speed, radius, type, pattern, scoreValue, shootCooldown, damage){
    super(x, y, radius, health, speed);

    this.#type = type;
    this.#pattern = pattern;
    this.#scoreValue = scoreValue;
    this.#shootCooldown = shootCooldown;
    this.#damage = damage;

    this.#lastShotTime = millis();

    this.#hasEnteredScreen = false;
    this.#spawnTimestamp = millis();
    
    // ADICIONAR ESTAS LINHAS:
    this.#configureByType(type);
    this.#aiState = 'approach';
  }


  #configureByType(type) {
    switch(type) {
      case 'shooter': // Fica longe e atira 
        this.#preferredDistance = 250;
        this.#shootCooldown = 800; // Atira rápido
        break;
        
      case 'chaser': // Vai direto pro player, atira pouco
        this.#preferredDistance = 30;
        this.#shootCooldown = 2500;
        break;
        
      case 'balanced': // Meio termo
        this.#preferredDistance = 150;
        this.#shootCooldown = 1500;
        break;
        
      case 'sniper': // Muito longe, tiros lentos mas preciso
        this.#preferredDistance = 350;
        this.#shootCooldown = 2000;
        break;
        
      case 'miniboss':
        this.#preferredDistance = 150;
        this.#shootCooldown = 1000;
        break;
        
      case 'boss':
        this.#preferredDistance = 200;
        this.#shootCooldown = 500;
        break;
        
      default:
        this.#preferredDistance = 150;
        this.#shootCooldown = 1500;
    }
  }

  // Getters e Setters
  get type() { return this.#type; }
  set type(type) { this.#type = type; }
  
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

  update(deltaTime, target){
    if(!this.isAlive) return null;
    
    const isOnScreen = (
      this.position.x + this.radius > 0 &&
      this.position.x - this.radius < width &&
      this.position.y + this.radius > 0 &&
      this.position.y - this.radius < height
    );
      
    if(isOnScreen) this.#hasEnteredScreen = true;

    if(!this.#hasEnteredScreen){
      const timeSinceSpawn = millis() - this.#spawnTimestamp;
      if(timeSinceSpawn > 1000){
        this.isAlive = false;
        return null;
      }
    }

    this.move(deltaTime, target);
    this.checkBound(width, height);

    const newBullet = this.attack(target);
    return newBullet;
  }


  move(deltaTime, target){
    if (!target) {
      this.velocity.set(0, this.speed);
    } else {
      // Usa o padrão como comportamento principal
      switch(this.#pattern){
        case 'chaser':
          this.#moveChaser(target);
          break;
          
        case 'orbiter':
          this.#moveOrbiter(target);
          break;
          
        case 'sine_wave':
          this.#moveSineWave(target);
          break;
          
        case 'smart': 
          this.#moveSmart(target);
          break;
          
        case 'down':
          this.velocity.set(0, this.speed);
          break;
          
        case 'still':
          this.velocity.set(0, 0);
          break;
          
        default:
          this.velocity.set(0, this.speed);
      }
    }

    // Normaliza e aplica velocidade
    if (this.velocity.mag() > 0) {
      this.velocity.normalize();
      this.velocity.mult(this.speed);
    }

    let movement = p5.Vector.mult(this.velocity, deltaTime / 1000);
    this.position.add(movement);
  }

  
  
  // Persegue  o player
  #moveChaser(target) {
    let toPlayer = p5.Vector.sub(target.position, this.position);
    this.velocity = toPlayer.copy();
  }

  // Orbita ao redor do player
  #moveOrbiter(target) {
    let toPlayer = p5.Vector.sub(target.position, this.position);
    let distance = toPlayer.mag();
    const orbitRadius = this.#preferredDistance;
    
    if (distance > orbitRadius + 50) {
      // Aproxima
      this.velocity = toPlayer.copy();
    } else if (distance < orbitRadius - 50) {
      // Afasta
      this.velocity = toPlayer.copy().mult(-1);
    } else {
      // Orbita (movimento perpendicular)
      let perpendicular = createVector(-toPlayer.y, toPlayer.x);
      
      // Adiciona  força centrípeta
      let centripetal = toPlayer.copy().normalize().mult(0.2);
      
      this.velocity = perpendicular.add(centripetal.mult(this.speed));
    }
  }

  // Onda senoidal em direção ao player
  #moveSineWave(target) {
    let toPlayer = p5.Vector.sub(target.position, this.position);
    let angle = toPlayer.heading();
    
    // Movimento em direção ao player
    let forward = p5.Vector.fromAngle(angle);
    
    // Oscilação perpendicular
    let perpendicular = p5.Vector.fromAngle(angle + HALF_PI);
    let oscillation = sin(millis() / 300 + this.position.x) * 0.6;
    perpendicular.mult(oscillation);
    
    this.velocity = forward.mult(0.7).add(perpendicular);
  }

  // Comportamento  baseado no tipo
  #moveSmart(target) {
    let toPlayer = p5.Vector.sub(target.position, this.position);
    let distance = toPlayer.mag();
    
    // Atualiza estado da IA
    if (distance > this.#preferredDistance + 80) {
      this.#aiState = 'approach';
    } else if (distance < this.#preferredDistance - 80) {
      this.#aiState = 'retreat';
    } else {
      this.#aiState = 'maintain';
    }
    
    switch(this.#aiState) {
      case 'approach':
        // Vai em direção ao player
        this.velocity = toPlayer.copy();
        break;
        
      case 'retreat':
        // Se afasta do player
        this.velocity = toPlayer.copy().mult(-1);
        break;
        
      case 'maintain':
        // Mantém distância, movendo-se perpendicularmente
        let tangent = createVector(-toPlayer.y, toPlayer.x);
        
        // Alterna direção baseado no tempo para não ficar previsível
        if (sin(millis() / 1000) > 0) {
          tangent.mult(-1);
        }
        
        this.velocity = tangent;
        break;
    }
  }

  checkBound(width, height){
    if(!this.#hasEnteredScreen) return;
    
    const margin = 50; 
        
    if(this.position.x + this.radius < 0 - margin ||
      this.position.x - this.radius > width + margin ||
      this.position.y + this.radius < 0 - margin ||
      this.position.y - this.radius > height + margin){
      this.isAlive = false;
    }
  }

  
  attack(target){
    // Não atira se não houver cooldown ou target
    if(this.shootCooldown <= 0 || !target) return null;
    
    // Só atira se tiver entrado na tela
    if(!this.#hasEnteredScreen) return null;

    // Verifica cooldown
    if(millis() - this.#lastShotTime > this.#shootCooldown) {
      this.#lastShotTime = millis();

      // Calcula direção do tiro
      let direction = p5.Vector.sub(target.position, this.position);
      let angle = direction.heading();
      
      //  Predição de movimento do player 
      if(this.#type === 'sniper') {
        // Adiciona predição baseada na velocidade do player
        let distance = direction.mag();
        let bulletSpeed = this.speed * 2;
        let timeToHit = distance / bulletSpeed;
        
        // Estima posição futura do player
        let predictedPos = p5.Vector.add(
          target.position, 
          p5.Vector.mult(target.velocity, timeToHit)
        );
        
        direction = p5.Vector.sub(predictedPos, this.position);
        angle = direction.heading();
      }
      
      let bulletSpeed = this.speed * 2;
      let bulletRadius = this.#type === 'sniper' ? 7 : 5;

      return new Bullet(
        this.position.x, 
        this.position.y, 
        angle, 
        bulletSpeed, 
        this.#damage, 
        'enemy', 
        bulletRadius
      );
    }
    return null;
  }

  takeDamage(amount){
    super.takeDamage(amount);
    if(!this.isAlive) return {died: true, score: this.#scoreValue};
    return {died: false, score: 0};
  }

  
  draw(){
    if(!this.isAlive) return;

    push();
    translate(this.position.x, this.position.y);

    // Cor baseada no tipo
    switch(this.#type){
      case 'shooter':
        fill(100, 100, 255, 200); // Azul
        break;
      case 'chaser':
        fill(255, 100, 100, 200); // Vermelho
        break;
      case 'sniper':
        fill(150, 100, 255, 200); // Roxo
        break;
      case 'balanced':
        fill(100, 255, 100, 200); // Verde
        break;
      case 'miniboss':
        fill(255, 180, 0, 200); // Laranja
        break;
      case 'boss':
        fill(255, 50, 50, 200); // Vermelho intenso
        break;
      default:
        fill(150, 200); // Cinza
    }

    noStroke();
    circle(0, 0, this.radius * 2);

    fill(255);
    textAlign(CENTER, CENTER);
    textSize(10);
    
    let symbol = '';
    switch(this.#type) {
      case 'shooter': symbol = 'S'; break;
      case 'chaser': symbol = 'R'; break;
      case 'sniper': symbol = 'X'; break;
      case 'balanced': symbol = 'B'; break;
      case 'miniboss': symbol = 'MB'; break;
      case 'boss': symbol = 'BOSS'; break;
    }
    text(symbol, 0, 0);

    this.drawHealthBar();
    pop();
  }

  drawHealthBar(){
    const barWidth = this.radius * 2;
    const barHeight = 5;
    const barX = -this.radius;
    const barY = -this.radius - barHeight - 5;
    const healthPercent = this.health / this.maxHealth;

    fill(50, 0, 0);
    rect(barX, barY, barWidth, barHeight);

    fill(0, 255, 0);
    rect(barX, barY, barWidth * healthPercent, barHeight);
  }
}
