class UIManager{
    #uiFont;
    #fontSize;
    #titleFontSize;
    #primaryColor;
    #dangerColor;
    #backgroundColor;

    constructor(){


        this.#uiFont = 'Ariel';
        this.#fontSize = 18;
        this.#titleFontSize = 64;

        this.#primaryColor = color(255);// Branco
        this.#dangerColor = color(255,0,0)// Vermelho
        this.#backgroundColor = color(0,0,0,150); // preto semi-transparente
    }

    get uiFont() { return this.#uiFont; }
    get fontSize() { return this.#fontSize; }
    get primaryColor() { return this.#primaryColor;}
    get dengerColor() { return this.#dangerColor };


    set uiFont(font) {  this.#uiFont = font; }
    set fontSize(fontSize) {  this.#fontSize = fontSize; }
    set primaryColor(primaryColor) {  this.#primaryColor = primaryColor; }
    set dengerColor(dengerColor) { this.#dangerColor = dengerColor; }



    drawHud(health, maxHealth, lives, score, wave){
        
        push();
        
        textFont(this.uiFont);

        textAlign(RIGHT, TOP);
        textSize(this.#fontSize);
        fill(this.#primaryColor);
        text(`Score: ${score}`, width - 20, 20);
        text(`Wave: ${wave}`, width - 20, 20 + this.#fontSize + 5);

        textAligh(LEFT, TOP);
        text(`Lives: ${lives}`, 20, 20);

        let barWidth = 200;
        let barHeight = 20;
        let barX = 20;
        let barY = 20 + this.#fontSize + 10;

        notStroke();
        fill(50,0,0);
        React(barX,barY, barWidth,barHeight);

        let currentHealthWidth = map(health, 0, maxHealth, 0, barWidth);

        currentHealthWidth = max(0, currentHealthWidth);

        let healthColor = lerpColor(this.#dangerColor, color(0, 255, 0), health/ maxHealth);
    
        fill(healthColor);

        rect(barX, barY, currentHealthWidth, barHeight);


        noFill();
        stroke(this.#primaryColor);
        strokeWeight(2);
        rect(barX,barY,barWidth,barHeight);

        pop(); 
    
    }


    drawMenuScreen(highScore){

        push();

        this.#drawFullScreenOverlay();

        fill(this.#primaryColor);
        textFont(this.#uiFont);
        textSize(this.#titleFontSize);
        textAligh(CENTER, CENTER);
        text("BULLET HELL", width / 2, height / 2 - 100);

        textSize(this.#fontSize);
        text("Pressione ENTER para começar", width/2, height/2 + 50);

        fill(200);
        text(`High Score:${highScore}`, width / 2, height - 50);

        pop();
    }


    drawGameOverScreen(finalScore, isNewHighScore){
        push();

        this.#drawFullScreenOverlay();

        fill(this.#dangerColor);
        textFont(this.#titleFontSize);
        textAligh(CENTER, CENTER);
        text("GAME OVER", width / 2, height / 2 - 100);


        fill(this.#primaryColor);
        textFont(this.#uiFont);
        textSize(this.#titleFontSize);
        textAlign(CENTER, CENTER);
        text("GAME OVER", width / 2, height / 2 - 100);

        fill(this.primaryColor);
        textSize(this.#fontSize * 1.5);
        text(`Final Score:${finalScore}`, width / 2, height / 2);

        if(isNewHighScore){

            fill(0,255, 0);
            textSize(this.#fontSize);
            text("Novo High Score!", width / 2, height / 2 + 50);
        }

        fill(this.#primaryColor);
            textSize(this.#fontSize);
            text("Pressione Enter para voltar ao Menu", width / 2, height - 50);

            pop();
    }


    drawPauseScreen(){
        push();

        this.#drawFullScreenOverlay();
        
        fill(this.primaryColor);
        textFont(this.#uiFont);
        textSize(this.#titleFontSize);
        textAligh(CENTER, CENTER);
        text("PAUSADO", width / 2, height / 2);

        textSize(this.#fontSize);
        text("Pressione P para continuar", width / 2, height / 2 + 60);

        pop();
    }

    #drawFullScreenOverlay(){
        push();
        netStroke();
        fill(this.#backgroundColor);
        rect(0, 0, width, height);
        pop();
    }
}