let blue = "#20A4F3";

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var x = canvas.width/2;
var y = canvas.height-30;

var dx = 4;
var dy = -4;

var ballRadius = 10;

var paddleHeight = 8;
var paddleWidth = 75;
var paddleX = (canvas.width-paddleWidth)/2;

var rightPressed = false;
var leftPressed = false;

// 벽돌 오프셋
var brickRowCount = 4;
var brickColumnCount = 11;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

var bricks = [];
for(var c=0; c<brickColumnCount; c++) {
    bricks[c] = [];
    for(var r=0; r<brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

var score = 0;

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = blue;
    ctx.fillText("점수: "+score, 8, 20);
}

var lives = 3; //남은 생명 수

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = blue;
    ctx.fillText("목숨: "+lives, canvas.width-65, 20);
}

// 벽돌 그리기
function drawBricks() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            if(bricks[c][r].status == 1) {
                var brickX = (c*(brickWidth+brickPadding))+brickOffsetLeft;
                var brickY = (r*(brickHeight+brickPadding))+brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = blue;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

// 공 그리기
function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#48E039";
    ctx.fill();
    ctx.strokeStyle = "#081C07";
    ctx.arc(x, y, ballRadius+1, 0, Math.PI*2);    
    ctx.stroke();
    ctx.closePath();
}

// 패들 그리기
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = blue;
    ctx.fill();
    ctx.closePath();
    
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawBricks();
    collisionDetection();
    drawScore();
    drawLives();

    // 공과 벽 충돌
    // 좌우 벽
    if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
        dx = -dx;
    }
    // 윗벽
    if(y + dy < ballRadius) {
        dy = -dy;
    } 
    // 아랫벽
    else if(y + dy > canvas.height-ballRadius) {
        // 공과 패들 충돌
        if(x > paddleX && x < paddleX + paddleWidth) {
            dy = -dy;
        }
        // 게임오버
        else {            
            lives--;
            if(!lives) {
                alert("패배..");
                document.location.reload();
                clearInterval(interval); // Needed for Chrome to end game
            }
            else {
                x = canvas.width/2;
                y = canvas.height-30;
                dx = 4;
                dy = -4;
                paddleX = (canvas.width-paddleWidth)/2;
            }
        }
    }

    // 패들 이동
    if(rightPressed && paddleX < canvas.width-paddleWidth) {
        paddleX += 7;
    }
    else if(leftPressed && paddleX > 0) {
        paddleX -= 7;
    }
    
    x += dx;
    y += dy;
    
    requestAnimationFrame(draw);
}


// 키보드 입력 이벤트
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
// 마우스 입력 이벤트
document.addEventListener("mousemove", mouseMoveHandler, false);

// 눌렀을때
function keyDownHandler(e) {
    // 오른쪽
    if(e.keyCode == 39) {
        rightPressed = true;
    }
    // 왼쪽
    else if(e.keyCode == 37) {
        leftPressed = true;
    }
}

// 땠을때
function keyUpHandler(e) {
    // 오른쪽
    if(e.keyCode == 39) {
        rightPressed = false;
    }
    // 왼쪽
    else if(e.keyCode == 37) {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth/2;
    }
}


// 충돌 함수
function collisionDetection() {
    for(var c=0; c<brickColumnCount; c++) {
        for(var r=0; r<brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.status == 1) {
                if(x > b.x && x < b.x+brickWidth && y > b.y && y < b.y+brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    if(score == brickRowCount*brickColumnCount) {
                        alert("아니;; 이걸 다 깼어요?? 고생하셨습니다..");
                        document.location.reload();
                    }
                }
            }
        }
    }
}


draw();
