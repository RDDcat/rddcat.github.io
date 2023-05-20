var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

let blue = "#20A4F3";

// 이미지 지정
var img주인공1 = new Image();
var img주인공2 = new Image();
var img장애물 = new Image();
img주인공1.src = '../photo/cat_walk_1.jpg';
img주인공2.src = '../photo/cat_walk_2.jpg';
img장애물.src = '../photo/cactus.jpg';

var dino = {
  x : 15,
  y : 200,
  width : 45,
  height : 45,
  size_x : 50,
  size_y : 50,
  img스위치 : 0,
  img타이머 : 0,

  draw(){
    ctx.fillStyle = 'green';
    // ctx.fillRect(this.x,this.y, this.width,this.height); // 히트박스
    if(this.img스위치 === 0){
      ctx.drawImage(img주인공1, this.x, this.y, this.size_x, this.size_y);
    } else {
      ctx.drawImage(img주인공2, this.x, this.y, this.size_x, this.size_y);
    }

    if(this.img타이머 % 12 === 0){
      if(this.img스위치 === 0){
        this.img스위치++;
      } else{
        this.img스위치 =0;
      }
    }
    if(this.img타이머 > 1000000){
      this.img타이머 = 0;
    }
    this.img타이머++;
  }
}



class Cactus {
  constructor(){
    this.x = 600;
    this.y = 200;
    this.width = 40;
    this.height =75;
    this.size_x = 50,
      this.size_y = 75
  }
  draw(){
    ctx.fillStyle = 'red';
    // ctx.fillRect(this.x,this.y, this.width,this.height); // 히트박스
    ctx.drawImage(img장애물, this.x, this.y, this.size_x, this.size_y);
  }
}


var timer =0;
var cactus여러개 = []; // 오브젝트 풀링으로 개선 가능할듯?
var 점프timer =0;
var animation;
var 점수 =0;

// 1초에 60번 (모니터 fps에 따라 다름)
function 프레임마다실행(){
  animation = requestAnimationFrame(프레임마다실행);
  timer++;

  ctx.clearRect(0,0, canvas.width, canvas.height); // 그려진거 지우기

  drawScore();

  if(timer % 200 === 0){ // 1초에 1번
    var cactus = new Cactus();
    cactus여러개.push(cactus);
  }

  cactus여러개.forEach((a, i, o)=>{
    // x 좌표가 0미만이면 제거
    if(a.x < 0){
      o.splice(i,1);
      점수++;
    }
    a.x-=3;

    충돌하냐(dino, a);

    a.draw();
  })
  if(점프중 == true){
    dino.y -= 3;
    점프timer++;
  }
  if(점프중 == false){
    if(dino.y < 200){
      dino.y += 2.75;
    }
  }
  if(점프timer > 40){
    점프중 = false;
    점프timer =0;
  }

  dino.draw();
}

프레임마다실행();

// 충돌확인
// 사방을 계산하는건 아님 (우측만)
function 충돌하냐(dino, cactus){
  var x축차이 = cactus.x - (dino.x + dino.width);
  var y축차이 = cactus.y - (dino.y + dino.height);
  if(x축차이 < 0 && y축차이 < 0){
    // 충돌함 (game over)
    ctx.clearRect(0,0, canvas.width, canvas.height); // 그려진거 지우기
    cancelAnimationFrame(animation);
    alert("게임 오버 : ", 점수);
    점수 =0;
  }
}


function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = blue;
  ctx.fillText("점수: "+ 점수, 8, 20);
}






var 점프중 = false;

document.addEventListener('keydown', function(e){
  if(e.code === 'Space'){
    점프중 = true;
  }
})
