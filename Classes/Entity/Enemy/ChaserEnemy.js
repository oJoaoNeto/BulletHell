class ChaserEnemy extends Enemy {
  #aggroRange;
  #target;

  constructor(x,y,health,speed,radius,scoreValue,shootCooldown,damage){
    
    super(x, y, health, speed, radius, 'chaser', 'chaser', scoreValue, shootCooldown, damage);
    
    this.#aggroRange = 400;

    this.#target = null;
  }

  get aggroRange() { return this.#aggroRange; }
  set aggroRange(range) { this.#aggroRange = range; }

  get target() { return this.#target; }
  set target(target) { this.#target = target; }

  // Sobrescreve o update para adicionar lógica de agresividade(agro) antes de chamar a classe pai
  update(deltaTime, target){
    if(target){
      const distance = this.position.dist(target.position);
      if(distance <= this.#aggroRange) this.#target = target;
    }
    // Chama o update do Enemy, passando o alvo (se estiver no range) ou o target padrão
    return super.update(deltaTime, this.#target || target);
  }

  draw(){
    if(!this.isAlive) return;

    push();
    translate(this.position.x, this.position.y);

    fill(255, 100, 100, 200);
    stroke(255);
    strokeWeight(1);
    // Forma de triângulo para diferenciar
    triangle(-this.radius, this.radius, this.radius, this.radius, 0, -this.radius);
    this.drawHealthBar();

    if(this.target){
      noFill();
      stroke(255,0,0,50);
      strokeWeight(1);
      circle(0,0,this.#aggroRange * 2);
    }

    pop();
  }
}
