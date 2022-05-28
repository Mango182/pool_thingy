//for some reason in order to get this to work you have to downoad the following extension: Live Server

//to do list:
//missing whether or not the ball is potted
//analysis of the situation: we aint done

//creates some crazy global variables
var ballList = createBalls();
var pocketList = createPockets();
var solids = [];
var stripes = [];
var turn = 'one';
var velocity;

//takes you to the game screen and sets the position of each ball
onEvent("playButton", "click", function(){
  setScreen("gameScreen");
  for (var ball in ballList){
    var ball = ballList[ball];
    setPosition(ball.name, ball.x - 10, ball.y - 10);
  }
  for (var pocket in pocketList){
    var pocket = pocketList[pocket];
    setPosition(pocket.name, pocket.x - 15, pocket.y - 15);
  }
});

//shows you the rules
onEvent("instructionsButton","click", function(){
  setScreen("rules");
});

//takes you back to the home screen
onEvent("goBackButton","click", function(){
  setScreen("home");
});

//when the mouse is moved rotate around the cueBsll
onEvent("gameScreen","mousemove",function(event){
  var x = mouse_position(event)[0];
  var y = mouse_position(event)[1];
  theta = angle(x,y);
  cue_position(x, y, theta);
});

//when the ball is fired, resolve collisions. once collisions are resolved, end loop, switch turns, and stop loop.
var shot = false;
var theta;

onEvent("test", 'click', function(event){
  var x = mouse_position(event)[0];
  var y = mouse_position(event)[1];
  theta = angle(x,y);
  cue(theta);
  setTimeout(function(){
    shot = true;
  },50);
  var idk = timedLoop(16, function(){
    if (velocity != 0){
      if(shot){
        hideElement("test");
      }
      updateScreen();
      var velocity = 0;
      for (var ball in ballList){
        var b = ballList[ball];
        outside(b);
        velocity += (b.x_v + b.y_v);
      }
    }
      if (Math.abs(velocity) <= 0.01 && shot){
        stopTimedLoop();
        setTimeout(function(){}, 200)
        switchTurn();
        shot = false;
      }
  });
});

//function that creates each ball and determains their starting position. 
function createBalls(){
  var listOfBalls = {};
  for (var i = 0; i < 16; i++) {
    listOfBalls['ball' + i] = {x:0, y:0, x_v:0, y_v:0, name: "ball"+i, type: '8 ball'};
    if (i < 8 && i != 0){
      listOfBalls['ball' + i].type = 'solid';
    }
    else if (i > 8){
      listOfBalls['ball' + i].type = 'stripe';
    }
  }
  listOfBalls['ball0'].x = 165;
  listOfBalls['ball0'].y = 380;
  var i=1;
    for (var j = 0; j < 5; j++){
      for (var k = 0; k < 5 - j; k++){
        listOfBalls['ball'+i].x = 120 + (10*j) + (20*k);
        listOfBalls['ball'+i].y = 100 + (20*j);
        i++;
      }
    }
  return listOfBalls;
}

//seperates the type of balls into solids and stripes
for (var ball in ballList){
  var ball = ballList[ball];
  if (ball.type == 'solid'){
    appendItem (solids, ball);
  }else if (ball.type == 'stripe'){
    appendItem(stripes, ball);
  }
}

//in all honesty this was just to see if i understood what i did with the creation of the balls
function createPockets(){
    var listOfPockets = {};
  for (var i = 1; i < 7; i++){
    listOfPockets['pocket'+ i] = {x:0, y:0 , name: "pocket" + i};
  }
  i = 1;
  for (var j = 0; j < 2; j++){
      for (var k = 0; k < 3; k++){
      if (i%2 == 1){
        listOfPockets['pocket' + i] = {x:10, y:10+(215*k), name: "pocket" + i};
      }else{
        listOfPockets['pocket' + i] = {x:310, y:10+(215*k) , name: "pocket" + i};
      }
      i++;
    }
  }
  return listOfPockets;
}

//function that updates the screen(is looped over until all collisions are resolved and all balls have stopped)
function updateScreen(){
  for (var i = 0; i < 16; i++){
    var b1 = ballList['ball' + i];
    setPosition(b1.name, b1.x - 10, b1.y - 10);
    drag(b1);
    for (var j = i + 1; j < 16; j++){
      var b2 = ballList['ball'+ j];
      collision(b1, b2);
    }
  }
}

//function for drag(slowing a ball down)(maybe find a way to make it for only an x and y condition)
function drag(ball){
  if (ball.x_v > 0){
    ball.x += ball.x_v;
    ball.x_v *= (0.95);
    if (ball.x_v < 0.05){
      ball.x_v = 0;
    }
  }else if (ball.x_v < 0){
    ball.x += ball.x_v;
    ball.x_v *= (0.95);
    if (ball.x_v > -0.05){
      ball.x_v = 0;
    }
  }if (ball.y_v > 0){
    ball.y += ball.y_v;
    ball.y_v *= (0.95);
    if (ball.y_v < 0.05){
      ball.y_v = 0;
    }
  }else if (ball.y_v < 0){
    ball.y += ball.y_v;
    ball.y_v *= (0.95);
    if (ball.y_v > -0.05){
      ball.y_v = 0;
    }
  }
}

//detects if two things are touching
function isTouching(ball_1,ball_2){
  var distance = Math.sqrt(Math.pow(ball_2.x-ball_1.x,2) + Math.pow(ball_2.y-ball_1.y,2));
  if (distance <= 19){
    return true;
  }else{
    return false;
  }
}

//resolves collisions
function collision(ball_1, ball_2){
  var distance = Math.sqrt(Math.pow(ball_2.x-ball_1.x,2) + Math.pow(ball_2.y-ball_1.y,2));
  if (isTouching(ball_1,ball_2)){
    var vCollision = {x: (ball_2.x - ball_1.x),y: (ball_2.y - ball_1.y)};
    var vCollisionNorm = {x: vCollision.x/distance ,y: vCollision.y/distance};
    var vRelativeVelocity = {x: ball_1.x_v - ball_2.x_v, y: ball_1.y_v - ball_2.y_v};
    var speed = (vRelativeVelocity.x * vCollisionNorm.x) + (vRelativeVelocity.y * vCollisionNorm.y);
    ball_1.x_v -= (speed * vCollisionNorm.x);
    ball_1.y_v -= (speed * vCollisionNorm.y);
    ball_2.x_v += (speed * vCollisionNorm.x);
    ball_2.y_v += (speed * vCollisionNorm.y);
    ball_1.x -= (vCollisionNorm.x);
    ball_1.y -= (vCollisionNorm.y);
    ball_2.x += (vCollisionNorm.x);
    ball_2.y += (vCollisionNorm.y);
  }
}

//adds bounds to the game(still a work in progress)
function outside(ball){
  if (ball.x < 26 || ball.x > 294){
    var temp = ball.x_v;
    ball.x_v = 0;
    ball.x_v = -temp;
  }if (ball.y < 26 || ball.y > 424){
    var temp2 = ball.y_v;
    ball.y_v = 0;
    ball.y_v = -temp2;
  }
}

//switches turns between players and brings the test back onto the screen
//thanks doug for having your code show me how to use images in the assets folder
function switchTurn(){
  if(turn == 'one'){
    turn = 'two';
    setProperty('ball0', 'image', ("./assets/cueBall2.jpg"));
  }else{
    turn = 'one';
    setProperty ('ball0', 'image', ("./assets/cueBall.jpg"));
  }
  showElement("test");
}

//gets the position of the mouse when an 'event' is triggered
function mouse_position(event){
  var coor = {x:event.clientX, y:event.clientY};
  return [coor.x, coor.y];
}

// fatima adds the actual gameplay(cue rotation)
function cueRotation(angle) {
  var rotateCueString = 'transform: rotate(' + (-angle) + 'rad)';
  setStyle('test', rotateCueString);
}

//calculates the angle based on where the mouse is on the screen
function angle(x, y){
  var cueBall = {x: ballList['ball0'].x - 15, y:ballList['ball0'].y - 15};
  dx = -(x - cueBall.x - 15);
  dy = (y - cueBall.y - 15);
  var angle = Math.atan2(dy, dx);
  return(angle);
}

//the position of the cue will rotate around the cueBall
function cue_position(x, y, angle){
  var cueBall = {x: ballList['ball0'].x - 50, y:ballList['ball0'].y - 5};
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  var nx = -(70* cos) + cueBall.x;
  var ny = cueBall.y + (70 * sin);
  setPosition('test', nx, ny);
  cueRotation(angle);
}

//function that applies a "force" to the ball
function cue(angle){
  var power = getNumber('slider1');
  ballList['ball0'].x_v += power * Math.cos(angle);
  ballList['ball0'].y_v -= power * Math.sin(angle);
}

//checks to see if a ball is in a pocket
function potted(ball, pocket){
  if (isTouching(ball, pocket)){
    hideElement(ball.name);
    if (ball.type == 'solid'){
      removeItem(solids, )//how can it determain what index it is
    }else if (ball.type == 'stripe'){
      removeItem(stripes, )
    }else(
      setScreen('results')//automatically to the results screen b/c 8ball was potted()find a way to make this the last ball in a list
    )
    console.log(ball.name + ' has been potted');
  }
}

// psuedocode idea thingys:

/*if a certain condition is met{
  setScreen(results);
}


if (8ball is potted before all stripes/ all solids){
  setText(resultText, '8 ball has been potted illegally.' + turn + 'wins the game' )
}

if (all stripe balls && 8 ball[at the end] has been potted){
  setScreen(turn + ' has won the match')
}

if (all solids && 8ball has been potted){
  setText(turn + ' has won the game')
}
*/

//when mouse is clicked on screen:
//lock the cue in place(by locking the angle)
//then you can drag the pool stick on the side



/*
this is where people's comments live for the time being(for organization purposes this has been moved all the way to the bottom)
ur mom
tiddies r life ;) - laura(juli's friend)  "i agree" - Naim
ur mom - Miguel
make ms.mares watch anime pls - juli >:3
yowaimo <3 - juli
*/