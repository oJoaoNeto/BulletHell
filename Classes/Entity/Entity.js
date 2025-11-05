class Entity{
  // Atributos
  #position;
  #velocity;
  #health;
  #maxHealth;
  #speed;
  #angle;
  #radius;
  #isAlive;

  // Instância do p5 para criar vetores, desenhar, etc.
  #p;

  constructor(p, x, y, radius, maxHealth, speed){
    this.#p = p; // Armazena a instância do p5

    // p5.Vector para posição e velocidade
    this.#position = this.#p.createVector(x, y); // Começa em uma posição predefinida
    this.#velocity = this.#p.createVector(0, 0); // Começa parado

    this.#maxHealth = maxHealth; // Saúde máxima definida anteriormente
    this.#health = maxHealth; // Começa com a saúde cheia
    this.#speed = speed; // Velocidade definida anteriormente
    this.#angle = 0; // Ângulo inicial (rad)
    this.#radius = radius; // Raio definido anteriormente
    this.#isAlive = true; // Começa vivo
  }

  // Métodos públicos

  // O método principal que atualiza o estado da entidade.
  // O deltaTime (tempo desde o último frame) ajuda a manter 
  // a velocidade do jogo consistente em diferentes taxas de quadros.
  update(deltaTime = 1){
    this.move = deltaTime;
  }

  // Desenha a entidade. Esta é uma função "placeholder". 
  // Cada classe filha (Player, Enemy) deve sobrescrever (override)
  // este método com seu próprio visual.
  draw(){
    this.#p.push();
    this.#p.fill(255,0,0); // Vermelho
    this.#p.noStroke();
    this.#p.ellipse(this.#position.x, this.#position.y, this.#radius * 2);
    this.#p.pop();
  }

  // Move a entidade com base em sua velocidade e ângulo.
  move(deltaTime = 1){
    // Movimento baseado em ângulo -> bullet hell
    let direction = p5.Vector.fromAngle(this.#angle);
    this.#velocity = direction.mult(this.#speed)

    // Aplica o movimento
    // Multiplica por deltaTime para movimento independente de frame rate
    let movement = p5.Vector.mult(this.#velocity, deltaTime);
    this.#position.add(movement);
  }

  // Reduz a vida da entidade e verifica se ela "morreu".
  takeDamage(amount){
    this.#health -= amount;
    if(this.#health <= 0){
      this.#health = 0;
      this.#isAlive = false;
    }
  }

  // Verifica se a entidade está dentro dos limites da tela.
  // * Se sair, é marcada como "morta" (para ser removida).
  checkBound(width, height){
    if(this.#position.x + this.#radius < 0 || this.#position.x - this.#radius < width || 
       this.#position.y + this.#radius < 0 || this.#position.y - this.#radius > height){
         this.#isAlive = false;
      }
  }

  // Getters e Setters
  get p(){ return this.#p }

  get position() { return this.#position; }
  set position(posVec) { this.#position = posVec; }

  get velocity() { return this.#velocity; }
  set velocity(velVec) { this.#velocity = velVec; }

  get health() { return this.#health; }
  set health(value) { this.#health = value; }

  get maxHealth() { return this.#maxHealth; }
  
  get speed() { return this.#speed; }
  set speed(value) { this.#speed = value; }
  
  get angle() { return this.#angle; }
  set angle(rad) { this.#angle = rad; }

  get radius() { return this.#radius; }
  set radius(value) { this.#radius = value; }

  get isAlive() { return this.#isAlive; }
  set isAlive(value) { this.#isAlive = value; }
}