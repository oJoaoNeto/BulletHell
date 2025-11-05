class Enemy extends Entity{
    //tipo do inimigo adicionar depois
    //#type;

    //padrao de como o inimigo se movimentar
    #pattern;

    #scoreValue;

    #shootCooldown; 
    #lastShotTime;
    #damage; 

    constructor(x,y,health,speed,radius,pattern,scoreValue,shootCooldown,damage){
       
        super(x,y,health,speed,radius);

       // this.#type = type;
        this.#pattern = pattern;
        this.#scoreValue = scoreValue;
        this.#shootCooldown = shootCooldown;
        this.#damage = damage;

        //valor da ulltima vez que ele atirou em millisegundos
        this.#lastShotTime = millis();
    }

    //Getters e Setters

    /*get type() { return this.#type; }
    set type(type) { this.#type = type; }*/

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

    //atualiza o estado do enemy de acordo com o framehate 
    update(deltaTime, target){

        //so atualiza enemies vivos
        if(!this.isAlive) return null;

        //se move de acordo com o alvo
        this.move(deltaTime, target);


       // const newBullet = this.attact(target);

      // return newBullet;
    }

    move(deltaTime){

        switch(this.#pattern){

            case 'down':
                this.velocity.set(0,this.speed);
                break;
            case 'sine_wave':
                let xVel = cos(millis() / 500) * this.speed * 0.75
                this.velocity.set(xVel,this.speed * 0.5);
                break;
            case 'still':
                this.velocity.set(0,0);
                break;
            default:
                this.velocity.set(0,this.speed);
        }

        super.move(deltaTime);
    }

    //logica de atk
    attack(target){
           
        //so ataca se o cooldown for menor que 0
        if(this.shootCooldown <= 0) return null;

        //verifica se pode atacar
        if(millis() - this.#lastShotTime > this.#shootCooldown) {
            this.#lastShotTime = millis;

            //Direção que o alvo esta
            let direction = p5.Vector.sub(target.position, this.position);

            direction.normalize();

            direction.mult(this.speed * 2.5);

            return new Bullet(this.position.x, this.position.y,direction,this.damage, 'enemy');
        }
        return null;
    }

    //logica para levar dano
    takeDamage(amount){

        const died = super.takeDamage(amount);

        if(died) return {died: true, score: this.#scoreValue};

        return {died: false, score: 0};

    }

    //desenha as entidades
    draw(){
        if(this.isAlive) return;

        push();
        translate(this.position.x,this.position.y);

        /*switch(this.type){
            case 'chaser':
                fill(255, 100, 100, 200); // Vermelho translúcido
                break;
            case 'shooter':
                fill(100, 100, 255, 200); // Azul translúcido
                break;
            default:
                fill(150, 200); // Cinza translúcido
        }*/

         fill(150, 200);

        noStroke();

        circle(0,0, this.radius * 2);

        this.#drawHelthBar();

        pop();
    }

    //barra de vida
    #drawHelthBar(){
        const barWidth = this.radius * 2;
        const barHeight = 5;

        const barX = -this.radius;
        const barY = -this.radius - barHeight - 5;

        const healthPercent = this.health / this.maxHealth;

        fill(50,0,0);
        rect(barX,barY,barWidth,barHeight);

        fill(0,255,0);
        rect(barX,barY,barWidth,barHeight);
    }
}