class Bullet extends Entity{

  #damage;
  #owner;


  constructor(x,y, angle, speed, damage, owner, radius){

    super(x,y,radius,1,speed);


    this.#damage = damage;
    this.#owner = owner;

    this.angle = angle;

    this.health = 1;

    this.velocity = createVector(cos(angle), sin(angle)).mult(speed);
  }


  get damage() { return this.#damage; }

  set damage(damage) { this.#damage = damage; }

  get owner() { return this.#owner;}

  set owner(owner) { this.#owner = owner; }


  update(deltaTime, p5Width, p5Height){

    super.update(deltaTime);

    this.checkBound(p5Width,p5Height);
  }


  die(){

    this.isAlive = false;
  }

  draw(){
    push();
    fill(255,255,0);
    noStroke();

    circle(this.position.x,this.position.y,this.radius * 2);
    pop();
  }
}
