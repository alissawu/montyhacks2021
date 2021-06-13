var canvas = document.getElementById("canv");
var ctx = canvas.getContext("2d");

var gravity = 0.5;
var canJump = true;
var score = 0;

var randomQuestions = [];

//PLAYER
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 40;
    this.h = 60;
    this.ySpeed = 3;
    this.xSpeed = 0;
  }
  show() {
        if (lifesaver == true) {
          ctx.fillStyle = "blue";
        } else {
          ctx.fillStyle = "red";
        }
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
  update() {
    this.y += this.ySpeed;
    this.ySpeed += gravity;

    if (this.y >= 690 && this.y <= 691 && jetpack == false) {
      //750 is height - ground, 50 is player heights
      this.ySpeed = 0;
      canJump = true;
    } else if (this.y >= 600 && jetpack == true) {
      this.ySpeed = 1;
      canJump = false;
    } else if (this.y >= 691) {
      this.ySpeed = -1.5;
      canJump = true;
    } else {
      gravity = 0.5;
      canJump = false;
    }
  }   
}

//OBSTACLES
var obstacle = new Image();
obstacle.onload = function(){
  ctx.drawImage(obstacle, obstacles[i].x, obstacles[i].y, 50, 50);
};
obstacle.src = 'minecraftobstacle.jpeg';

var obstacles = [];
var obstacleX = 800;
class Obstacle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 50;
    this.h = 50;
  }
  show() {
    ctx.drawImage(obstacle, this.x, this.y, 50, 50);
  }
  update() {
    if (this.x < p.x + p.w && this.x + this.w > p.x && this.y < p.y + p.h && this.y + this.h > p.y) {
      isDead();
    }
  }
}

//HAND SANITIZER LIFESAVER
var sanitizer = new Image();
sanitizer.onload = function(){
  ctx.drawImage(sanitizer, sanitizers[i].x, sanitizers[i].y, 28, 42);
};
sanitizer.src = 'handsanitizer.png';

var sanitizers = [];
var sanitizerX = 1000;
var lifesaver = false;
class Sanitizer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 42;
  }
  show() {
    ctx.drawImage(sanitizer, this.x, this.y, 28, 42);
  }
  update() {
    //if p.y is somewhere within, and p.x is somewhere within
    if (this.x < p.x + p.w && this.x + this.w > p.x && this.y < p.y + p.h && this.y + this.h > p.y) {
      lifesaver = true;
    }
  }
}

//MASK JETPACK
var mask = new Image();
mask.onload = function(){
  ctx.drawImage(mask, masks[i].x, masks[i].y, 48, 27);
};
mask.src = 'mask.png';

var masks = [];
var maskX = 1000;
var jetpack = false;
class Mask {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 48;
    this.h = 27;
  }
  show() {
    ctx.drawImage(mask, this.x, this.y, 48, 27);
  }
  update() {
    //collision detection, brings the player up for like 10 seconds
    if (this.x < p.x + p.w && this.x + this.w > p.x && this.y < p.y + p.h && this.y + this.h > p.y) {
      p.y -= 100;
      var q = Math.floor(Math.random() * randomQuestions.length);
      var answer = prompt(
        `${randomQuestions[q].question} \n A. ${randomQuestions[q].optionA} \n B. ${randomQuestions[q].optionB} \n C. ${randomQuestions[q].optionC} \n D. ${randomQuestions[q].optionD}`
      );

      if (randomQuestions[q].answer.toLowerCase() == answer.toLowerCase()) {
        jetpack = true;
        p.ySpeed = -50; //do i need to remove gravity? just toss it up and it'll fall somewhere more lol
        lifesaver = true; //should account for if it falls on sth
        setTimeout(falseJetpack, 2000);
      } else {
        lifesaver = false;
        setTimeout(isDead,300);
      }
    }
  }
}

function falseJetpack() {
  jetpack = false;
}

window.onload = function () {
  start();
  setInterval(update, 10);
};

var p;
var block = document.getElementById("block");
async function start() {
  p = new Player(100, 400);

  for (let i = 0; i < 200; i++) {
    //200 obstacles so we don't run out of obstacles
    var o = new Obstacle(obstacleX, 700);
    obstacles.push(o);
    obstacleX += Math.random() * 400 + 500;
  }

  for (let j = 0; j < 200; j++) {
    //50 lifesavers, being nice just to test it out for now
    var s = new Sanitizer(sanitizerX, 550);
    sanitizers.push(s);
    sanitizerX += Math.random() * 1000 + 2500;
  }

  for (let k = 0; k < 200; k++) {
    var m = new Mask(maskX, 470);
    masks.push(m);
    maskX += Math.random() * 2000 + 4500;
  }

  p.xSpeed = 5;

  let response = await axios.get("http://ec2-3-82-250-175.compute-1.amazonaws.com:5001/");
  randomQuestions = response.data;
  console.log(randomQuestions);
}

function update() {
  console.log(lifesaver);
  canvas.width = canvas.width;
  //ground
  ctx.fillStyle = "green";
  ctx.fillRect(0, 750, 1200, 100);
  //player
  p.show();
  p.update();
  //obstacles
  for (let i = 0; i < obstacles.length; i++) {
    obstacles[i].show();
    obstacles[i].update();
    obstacles[i].x -= p.xSpeed;
  }
  //sanitizers
  for (let j = 0; j < sanitizers.length; j++) {
    sanitizers[j].show();
    sanitizers[j].update();
    sanitizers[j].x -= p.xSpeed;
  }
  //masks
  for (let k = 0; k < masks.length; k++) {
    masks[k].show();
    masks[k].update();
    masks[k].x -= p.xSpeed;
  }
}

function changeSpeed() {
  p.xSpeed += 0.02;
}

function increaseScore() {
  score++;
}

function restartGame() {
  score = 0; // puts score back to 0
  start(); // restarts the game
}

//CHECKS IF YOU SHOULD DIE OR NOT
function isDead() {
  if (lifesaver == false) {
    alert("You Died!\nYou got " + score + " points!");
    restartGame(); // after pressing okay on alert, restarts game back to original properties
    location.reload();
  }
  if (lifesaver == true) {
    setTimeout(lifesaverFalse, 170); //used up the lifesaver
  }
}

function lifesaverFalse() {
  lifesaver = false;
}

//DRAWS LABELS ONTO THE SCREEN, CURRENTLY BUGGY AF
function drawScore() {
  ctx.font = "26px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText(score, 40, 40); //figure out how to only redraw the numerical score and leave the "Score" constant later
}

//RUNS SOME FUNCTIONS
setInterval(changeSpeed, 500);
setInterval(increaseScore, 150);
setInterval(drawScore, 1);

//JUMP
function keyDown(e) {
  if (e.keyCode === 38 && canJump) {
    p.ySpeed = -15;
  }
}
document.onkeydown = keyDown;