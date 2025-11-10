class ShooterEnemy extends Enemy{

  constructor(x, y, health, speed, radius, scoreValue, shootCooldown, damage){

    super(x, y, health, speed, radius, 'shooter', 'smart', scoreValue, shootCooldown, damage);
  }

  draw() {
    if (!this.isAlive) return;

    push();
    translate(this.position.x, this.position.y);

    // Azul 
    fill(100, 100, 255, 200);
    noStroke();
    circle(0, 0, this.radius * 2);

    // Desenha a "mira"
    stroke(255);
    strokeWeight(2);
    line(-this.radius * 0.5, 0, this.radius * 0.5, 0);
    line(0, -this.radius * 0.5, 0, this.radius * 0.5);

    // Indicador de tipo
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(10);
    text('S', 0, 0);

    // Barra de vida
    this.drawHealthBar();

    pop();
  }
}
