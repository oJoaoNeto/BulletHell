// Lucas: Entity
// João Neto: GameManager
// Osman: Wave Manager

let gameManager;
let lastFrameTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  
  
  // Inicializa o tempo do frame
  lastFrameTime = millis();
  
  // Cria a instância principal do jogo
  gameManager = new GameManager();
}

function draw() {
  // Calcula o deltaTime (tempo desde o último frame) em milissegundos
  let currentmillis = millis();
  let deltaTime = currentmillis - lastFrameTime;
  lastFrameTime = currentmillis;

  
  gameManager.updateGame(deltaTime);
  gameManager.drawGame();
}


function keyPressed() {
  gameManager.handleInput(keyCode);
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}