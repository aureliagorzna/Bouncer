const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
// GAME DEFAULTS //
const zoom = 10;
const gameRefreshRate = 120;
const targetFps = 60;
const defaultBallsQuantity = 100;
let level = 1;
const ballSpeed = 2;
canvas.width = 1000;
canvas.height = 800;
ctx.scale(zoom, zoom);
class Ball {
    constructor(x, y, speedX, speedY) {
        this.pos = { x: x, y: y };
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = "white";
    }
}
const colors = [
    "",
    "cornflowerblue",
    "lightgray",
    "limegreen",
    "red"
];
const balls = [];
const createArena = (w, h) => {
    const arena = [];
    while (h--) {
        arena.push(new Array(w).fill(0));
    }
    return arena;
};
const arena = createArena(Math.floor(canvas.width / zoom), Math.floor(canvas.height / zoom) / 2);
const player = {
    pos: { x: 380, y: 750 },
    color: "white",
    width: 20,
    left: false,
    right: false
};
balls.push(new Ball(400, 600, 0, ballSpeed));
const drawPlatform = () => {
    for (let y = 0; y < 1; y++) {
        for (let x = 0; x < player.width; x++) {
            ctx.fillStyle = player.color;
            ctx.fillRect(player.pos.x / zoom + x, player.pos.y / zoom + y, 1, 1);
        }
    }
};
const drawBall = () => {
    balls.forEach((ball) => {
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc((ball.pos.x + 4.3) / zoom, (ball.pos.y + 5) / zoom, 0.5, 0, Math.PI * 2);
        // ctx.arc(ball.pos.x / zoom, ball.pos.y / zoom, 0.5, 0, Math.PI * 2)
        ctx.fill();
    });
};
const drawArena = () => {
    arena.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value === 0)
                return;
            ctx.fillStyle = colors[value];
            ctx.fillRect(x, y, 1, 1);
        });
    });
};
// filling arena with blocks
// Math.floor(canvas.width / zoom), Math.floor(canvas.height / zoom) / 2
const fillArena = (w, h) => {
    for (let y = 0; y < Math.floor(h / zoom); y++) {
        for (let x = 0; x < Math.floor(w / zoom); x++) {
            arena[y][x] = 1;
        }
    }
};
// generating structures
const gen = (x1, x2, y1, y2, value) => {
    for (let y = y1; y < y2; y++) {
        for (let x = x1; x < x2; x++) {
            arena[y][x] = value;
        }
    }
};
// calculating block position based on ball position
const calculatePos = (ballY, ballX) => {
    const posY = arena.indexOf(arena[Math.round((ballY) / zoom)]);
    const posX = Math.round((ballX) / zoom);
    return { y: posY, x: posX };
};
// ball - platform collision
const platformBounce = (ball) => {
    if (ball.pos.y === player.pos.y && ball.pos.x >= player.pos.x && ball.pos.x <= player.pos.x + player.width * zoom) {
        if (balls.length < defaultBallsQuantity)
            balls.push(new Ball(ball.pos.x, ball.pos.y, -ball.speedX, ball.speedY));
        ball.speedY = -ball.speedY;
        // assigning new X speed while bouncing from the platform
        for (let i = 0; i < player.width; i++) {
            if (ball.pos.x <= player.pos.x + zoom * (i + 1) && ball.pos.x > player.pos.x + zoom * i) {
                const newSpeed = (i + 1) / 10 - 1;
                ball.speedX += newSpeed;
            }
        }
    }
};
// checking if ball is on the edge of arena or if it fell down
const ballOnArenaEdgeCheck = (ball) => {
    if (ball.pos.y >= 800) {
        balls.splice(balls.indexOf(ball), 1);
        return;
    }
    if (ball.pos.y < 0) {
        ball.speedY = -ball.speedY;
        ball.pos.y = 0;
    }
    if (ball.pos.x <= 0)
        ball.speedX = -ball.speedX;
    if (ball.pos.x >= 995)
        ball.speedX = -ball.speedX;
};
// ball bouncing from block collision
const blockBounce = (ball) => {
    const arenaNumber = arena[Math.round(ball.pos.y / zoom)] && arena[Math.round(ball.pos.y / zoom)][Math.round(ball.pos.x / zoom)];
    if (arenaNumber !== 0 && arenaNumber != null) {
        // up and down
        const pos1 = calculatePos(ball.pos.y + ball.speedY, ball.pos.x + -ball.speedX);
        if (arena[pos1.y] && arena[pos1.y][pos1.x] != null && arena[pos1.y][pos1.x] !== 0) {
            ball.speedY = -ball.speedY;
            blockPop(pos1.y, pos1.x);
        }
        if (ball.speedX > 0) {
            // right
            const pos2 = calculatePos(ball.pos.y, ball.pos.x);
            if (arena[pos2.y] && arena[pos2.y][pos2.x + 1] != null && arena[pos2.y][pos2.x + 1] !== 0) {
                ball.speedX = -ball.speedX;
                blockPop(pos2.y, pos2.x);
            }
        }
        if (ball.speedX < 0) {
            // left
            const pos2 = calculatePos(ball.pos.y, ball.pos.x);
            if (arena[pos2.y] && arena[pos2.y][pos2.x - 1] != null && arena[pos2.y][pos2.x - 1] !== 0) {
                ball.speedX = -ball.speedX;
                blockPop(pos2.y, pos2.x);
            }
        }
    }
};
// red block
const boom = (y, x) => {
    if (arena[y] && arena[y][x] != null)
        arena[y][x] = 0;
    if (arena[y - 1] && arena[y - 1][x] != null)
        arena[y - 1][x] = 0;
    if (arena[y - 2] && arena[y - 2][x] != null)
        arena[y - 2][x] = 0;
    if (arena[y - 3] && arena[y - 3][x] != null)
        arena[y - 3][x] = 0;
    if (arena[y + 1] && arena[y + 1][x] != null)
        arena[y + 1][x] = 0;
    if (arena[y + 2] && arena[y + 2][x] != null)
        arena[y + 2][x] = 0;
    if (arena[y + 3] && arena[y + 3][x] != null)
        arena[y + 3][x] = 0;
    if (arena[y] && arena[y][x + 1] != null)
        arena[y][x + 1] = 0;
    if (arena[y] && arena[y][x + 2] != null)
        arena[y][x + 2] = 0;
    if (arena[y] && arena[y][x + 3] != null)
        arena[y][x + 3] = 0;
    if (arena[y] && arena[y][x - 1] != null)
        arena[y][x - 1] = 0;
    if (arena[y] && arena[y][x - 2] != null)
        arena[y][x - 2] = 0;
    if (arena[y] && arena[y][x - 3] != null)
        arena[y][x - 3] = 0;
    //up
    if (arena[y - 1] && arena[y - 1][x - 1] != null)
        arena[y - 1][x - 1] = 0;
    if (arena[y - 1] && arena[y - 1][x - 2] != null)
        arena[y - 1][x - 2] = 0;
    if (arena[y - 1] && arena[y - 1][x - 3] != null)
        arena[y - 1][x - 3] = 0;
    if (arena[y - 1] && arena[y - 1][x + 1] != null)
        arena[y - 1][x + 1] = 0;
    if (arena[y - 1] && arena[y - 1][x + 2] != null)
        arena[y - 1][x + 2] = 0;
    if (arena[y - 1] && arena[y - 1][x + 3] != null)
        arena[y - 1][x + 3] = 0;
    if (arena[y - 2] && arena[y - 2][x - 1] != null)
        arena[y - 2][x - 1] = 0;
    if (arena[y - 2] && arena[y - 2][x - 2] != null)
        arena[y - 2][x - 2] = 0;
    if (arena[y - 2] && arena[y - 2][x + 1] != null)
        arena[y - 2][x + 1] = 0;
    if (arena[y - 2] && arena[y - 2][x + 2] != null)
        arena[y - 2][x + 2] = 0;
    //down
    if (arena[y + 1] && arena[y + 1][x - 1] != null)
        arena[y + 1][x - 1] = 0;
    if (arena[y + 1] && arena[y + 1][x - 2] != null)
        arena[y + 1][x - 2] = 0;
    if (arena[y + 1] && arena[y + 1][x - 3] != null)
        arena[y + 1][x - 3] = 0;
    if (arena[y + 1] && arena[y + 1][x + 1] != null)
        arena[y + 1][x + 1] = 0;
    if (arena[y + 1] && arena[y + 1][x + 2] != null)
        arena[y + 1][x + 2] = 0;
    if (arena[y + 1] && arena[y + 1][x + 3] != null)
        arena[y + 1][x + 3] = 0;
    if (arena[y + 2] && arena[y + 2][x - 1] != null)
        arena[y + 2][x - 1] = 0;
    if (arena[y + 2] && arena[y + 2][x - 2] != null)
        arena[y + 2][x - 2] = 0;
    if (arena[y + 2] && arena[y + 2][x + 1] != null)
        arena[y + 2][x + 1] = 0;
    if (arena[y + 2] && arena[y + 2][x + 2] != null)
        arena[y + 2][x + 2] = 0;
};
// green block
const blockPop = (y, x) => {
    const value = arena[y][x];
    if (value !== 2)
        arena[y][x] = 0;
    if (value === 3) {
        balls.push(new Ball(player.pos.x + Math.floor((player.width * zoom) / 2) + 2, player.pos.y, 0, 2));
    }
    if (value === 4)
        boom(y, x);
};
// levels logic
let awaiting = false;
const levelCheck = () => {
    if (clearCheck() && !awaiting) {
        awaiting = true;
        setTimeout(() => {
            level++;
            nextLevel();
            awaiting = false;
        }, 3000);
    }
};
const nextLevel = () => {
    fillArena(canvas.width, canvas.height / 2);
    if (level === 1) {
        gen(0, 40, 20, 22, 2);
        gen(60, 100, 20, 22, 2);
        gen(58, 60, 8, 22, 2);
        gen(38, 40, 8, 22, 2);
        gen(0, 38, 18, 20, 4);
        gen(60, 100, 18, 20, 4);
    }
    if (level === 2) {
        gen(30, 60, 32, 34, 3);
        gen(30, 60, 34, 36, 3);
    }
};
nextLevel();
// check if all blocks are cleared
const clearCheck = () => {
    for (let y = 0; y < arena.length; y++) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] !== 0 && arena[y][x] !== 2)
                return false;
        }
    }
    return true;
};
// platform moving logic
const playerMove = () => {
    if (player.left) {
        if (player.pos.x <= 30)
            return;
        player.pos.x -= 5;
    }
    if (player.right) {
        if (player.pos.x >= 770)
            return;
        player.pos.x += 5;
    }
};
// handling all game stances
const physics = () => {
    balls.forEach((ball) => {
        platformBounce(ball);
        ballOnArenaEdgeCheck(ball);
        ball.pos.y += ball.speedY;
        ball.pos.x += ball.speedX;
        blockBounce(ball);
    });
    playerMove();
};
// platform moving logic
window.addEventListener("keydown", (e) => {
    if (e.key === "d")
        player.right = true;
    if (e.key === "a")
        player.left = true;
});
window.addEventListener("keyup", (e) => {
    if (e.key === "d")
        player.right = false;
    if (e.key === "a")
        player.left = false;
});
// counting fraps per second
let fpsCounter = 0;
let fps = 0;
const fpsCounterReset = () => {
    fps = fpsCounter;
    fpsCounter = 0;
};
// displaying text on the canvas
const text = () => {
    ctx.textAlign = "left";
    ctx.font = "4px Comic Sans MS";
    ctx.fillStyle = "purple";
    ctx.fillText("FPS: " + fps, 1, 4);
};
// handling all drawing functions
const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawArena();
    drawPlatform();
    drawBall();
    text();
    fpsCounter++;
};
draw();
// initializing game logic
const game = () => {
    physics();
    levelCheck();
};
game();
setInterval(fpsCounterReset, 1000);
setInterval(draw, 1000 / targetFps);
setInterval(game, 1000 / gameRefreshRate);
