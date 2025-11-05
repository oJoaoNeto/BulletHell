class Player extends Entity {

    #lives;
    #weapon;

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

    constructor(x, y, radius, speed, health, lives, weapon){

       
        super(x, y, radius, speed, health);
        
        this.#lives = lives;
        this.#weapon = weapon;
        
        
        this.#dashcooldown = 1500;
        this.#dashDuration = 150;
        this.#dashSpeed = 900;
        this.#dashTimer = 0;
        this.#dashVector = createVector(0, 0);
        this.#lastDashTime = -this.#dashcooldown;

        this.#isInvencible = false;
        this.#invencibleDuration = 2500;
        this.#invencibleTimer = 0;
    }

   
    //atualiza o player na tela de acordo com o framerate
    update(deltaTime){

       if(this.isInvencible){
        this.isInvencibleTimer -= deltaTime;
        if(this.isInvencibleTimer === 0) this.isInvencible = false;
       }
       
       if(this.#isDashing){

        this.DASH
       }

       this.handleInput();

       this.move();

       this.checkBounds(innerWidth,height);

    }
    //inputs para movimento (wasd e setas)
    handleInput(){
        if(keyIsDown(87) || keyIsDown(UP_ARROW)) this.velocity.y = -1;
        if(keyIsDown(83) || keyIsDown(DOWN_ARROW)) this.velocity.y = 1;
        if(keyIsDown(65) || keyIsDown(LEFT_ARROW)) this.velocity.x =  -1;
        if(keyIsDown(68) || keyIsDown(RIGHT_ARROW)) this.velocity.x = 1;

        if(mouseIsPressed) this.shoot();
    
    }
    //logica de movimentação do player
   move(deltaTime){
    let finalVelocity;

    //verifica se o player esta usando um dash e atualiza a velocidade
    if(this.#isDashing) finalVelocity = this.#dashVector.copy.setMag(this.#dashSpeed);
    else {

        finalVelocity = this.velocity.copy();
        if(finalVelocity.mag() > 0) finalVelocity.setMag(this.speed);
    }

    let movement = p5.Vector.mult(finalVelocity, deltaTime/ 1000)
    this.position.add(movement);
}

    shoot(){

        if(this.#weapon){
            
            let targetAngle = antan2(mouseY - this.position.y, mouseX - this.position.x);
            let.#weapon.fire(this.position.x, this.position.y, targetAngle, this);
        }
    }

    //logica do dash
    dash(){

        const now = millis();

        if(now - this.#lastDashTime > this.#dashcooldown && !this.#isDashing){

            this.#isDashing = true;
            this.#lastDashTime = now;
            this.dashTimer = this.#dashDuration;

            this.isInvencible = true;

            this.#dashVector = this.velocity.copy();

          this.#dashVector.normalize();  
        }
    }
    //logica do player tomar dano
    takeDamege(amount){

        if(this.isInvencible) return;

        this.health -= amount;

        if(this.health <= 0){
            this.#lives--;

            if(this.#lives <= 0)this.isAlive = false;
            else{
                this.health = this.maxHealth;

                this.position = createVector(width / 2, height / 2);

                this.#isInvencible = true;
                this.isInvencibleTimer = this.#invencibleDuration;
            }
        }
    } 
    //metedo para cura(usar no powerup)
    addHealth(amount){
        this.health += amount;
    }

    //desenha o player na tela
     draw(){

        if(this.#isInvencible) 
            if(Math.floor(this.#invencibleTimer / 100) % 2 === 0) return;
        
        push();

        translate(this.position.x, this.position.y);

        let angle = antan2(mouseY - this.position.y, mouseX - this.position.x);
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

    get weapon() {return this.#weapon; }
    set weapon(weapon) { this.#weapon = weapon; }

    get dashCooldown() { return this.#dashcooldown; }
    set dashCooldown(value) { this.#dashcooldown = value; }

    get isDashing() { return this.#isDashing; }
    get isInvencible() { return this.#isInvencible; }
}