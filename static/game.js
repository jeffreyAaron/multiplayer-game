"use strict";

// Important Constants
var tileSize = 250;
var landWidth = tileSize * 17;
var landHeight = tileSize * 10;
var canvasWidth = 800;
var canvasHeight = 600;
var playerRadius = 20;
var cannonWidth = 20;
var cannonLength = 40;
var cannonLife = 500;
var bulletMultiplier = 5;
var bulletFireTime = 500;
var playerMoveSpeed = 0;
var playerInitVelocity = 0.5;
var friction = 0.9;
var healthBarOffset = 30;
var healthBarLength = 50;
var bulletHealthLoss = 5;
var playerHealthLoss = 0.05;
var particleSize = 30;
var particleHealthGain = 5;
var particlesCount = 200;
var leaderBoardCount = 10;
var img;
var onScreenContext
window.onload = function (){
    img = document.getElementById("backgroundTile");
    onScreenContext = document.getElementById('screen').getContext('2d');
    onScreenContext.imageSmoothingEnabled = false
}

// Animation
var gameOverAnim = 0;
var gameOverAnimSpeed = 0.0005;

// Land Configuration
var map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// Player Specific Constants
var autofire = false;
var playerId = "";
var currentPlayer = {
    rot: 0,
    isAlive: true,
    velx: 0,
    vely: 0,
    x: 100,
    y: 0,
    health: 100
};

var socket = io();
var movement = {
    rot: 0,
    up: false,
    down: false,
    left: false,
    right: false
}
document.addEventListener('keydown', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
    }
});
document.addEventListener('keyup', function (event) {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
        case 69: // E
            autofire = !autofire;
            break;
    }
});
document.addEventListener("mousemove", function (event) {
    var angle = Math.atan2(event.pageX - canvasWidth/2, - (event.pageY - canvasHeight/2));
    movement.rot = angle - 1.5708*2;
});
var lastClickTime = 0, nowTime;
document.addEventListener("click", function (event) {
    nowTime = new Date();
    var elaspedTime = nowTime.getTime() - lastClickTime;
    console.log(elaspedTime<bulletFireTime);
    if (elaspedTime>bulletFireTime){
        console.log("good");
        if(!autofire){
            FireCannon();
            lastClickTime = nowTime.getTime();
            console.log(nowTime.getTime());
            
        }
    }
});


function FireCannon() {
    if (!currentPlayer.isAlive) { return;}
    var rot = movement.rot - 1.5708;
    var changey = bulletMultiplier * Math.sin(rot);
    var changex = bulletMultiplier * Math.cos(rot);
    socket.emit('cannon', {
        changex: changex,
        changey: changey,
        x: currentPlayer.x,
        y: currentPlayer.y,
        life: cannonLife,
        playerId: playerId
    });
}

socket.emit('new player', "Cookie" + Math.round(Math.random()*100));
socket.on("get id from server", function (id) {
    playerId = id;
});
socket.emit('update');
setInterval(function () {
    if(currentPlayer.isAlive){
        socket.emit('movement', movement);
    }
    
    
}, 1000 / 60);

// Auto Fire
setInterval(function () {
    if (autofire) {
        FireCannon();
    }
}, bulletFireTime);

socket.on('pong', function (ms) {
    var latency = ms;
    socket.emit("late", latency);
});

// Dev
var startTime, endTime;

function start() {
    startTime = new Date();
};

function end() {
    endTime = new Date();
    var timeDiff = endTime - startTime; //in ms
    return timeDiff;
}


// Update Canvas
var canvas = document.createElement('canvas');
canvas.width = document.body.scrollWidth+'';
canvas.height = document.body.scrollHeight+'';
canvasWidth = document.body.scrollWidth;
canvasHeight = document.body.scrollHeight;

var realCanvas = document.getElementById('screen');
realCanvas.width = document.body.scrollWidth;
realCanvas.height = document.body.scrollHeight;
canvasWidth = document.body.scrollWidth;
canvasHeight = document.body.scrollHeight;

var context = canvas.getContext('2d');

socket.on('done', function(){
    
    
    var time = end();
    if(time<16){
        setTimeout(() => {
            socket.emit("get state");
            onScreenContext.drawImage(canvas, 0, 0);
        }, 16-time);
    }else{
        socket.emit("get state");
        onScreenContext.drawImage(canvas, 0, 0);
    }
})
var leaderBoardTick = 0;
socket.on('state', function (data) {
    start();
    if(data.players[playerId] == undefined){return;}
    if(data.players[playerId].isAlive){
        //context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.save();

        // Use the identity matrix while clearing the canvas
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Restore the transform
        context.restore();
        context.fillStyle = '#dbdbdb';
        context.fillRect(0, 0, canvasWidth, canvasHeight);
        context.fillStyle = 'green';
        currentPlayer = data.players[playerId] || {x:0,y:0};
        DrawBackground(currentPlayer);
        for (var id in data.bullets) {
            var bullet = data.bullets[id];
            if (bullet.life<=0) { continue; }
            if (!inRange(bullet)){ continue; }
            DrawBullets(bullet, id);
        }
        for (var id in data.particles) {
            var particle = data.particles[id];
            if (!inRange(particle)) { continue; }
            DrawParticles(particle, id);
        }
        DrawAnimatedParticles(data.animate.animatedParticles);
        context.globalAlpha = 1;
        for (var id in data.players) {
            var player = data.players[id];
            if(!player.isAlive){continue;}
            UpdateScreen(player, id);
        }
        DrawAnimatedBullets(data.animate.animatedBullets);
        context.globalAlpha = 1;
        if (leaderBoardTick < 60) {
            leaderBoardTick++;
        }else{
            leaderBoardTick = 0;
            var leaders = data.leaderboard.slice(0, leaderBoardCount);
            DrawLeaderBoard(leaders);
        }
    }
    else {
        ShowGameOverScreenAnim();
    }
    socket.emit('update');
});

function UpdateScreen(player, id) {
    DrawWeapon(player, id);
    DrawPlayer(player, id);
}

function inRange(testEr) {
    var testOn = currentPlayer;
    
    var distx = Math.pow(Math.abs(testOn.x - testEr.x), 2);
    var disty = Math.pow(Math.abs(testOn.y - testEr.y), 2);
    var totalDist = Math.sqrt(distx + disty);
    if(totalDist>canvasWidth+tileSize){
        return false;
    }else{
        return true;
    }
}

function DrawLeaderBoard(leaders) {
    var leadersList = document.getElementById("leaders");
    var leadersText = "";
    
    for (var id in leaders) {
        var leader = leaders[id];    
        if(leader.id == playerId){
            leadersText += "<li class='you'>" + leader.name + "<span class = 'score'>" + leader.score +" </span></li>";
        }else{
            leadersText += "<li>" + leader.name + "<span class = 'score'>" + leader.score +" </span></li>";
        }
    }
    leadersList.innerHTML = leadersText;
}

function DrawBackground(player) {
    var ctx = context;
    for (let Yindex = 0; Yindex < landHeight / tileSize; Yindex++) {
        for (let Xindex = 0; Xindex < landWidth/tileSize; Xindex++) {
            if (map[Yindex][Xindex]==0){
                ctx.drawImage(img, canvasWidth/2 + player.x + Xindex*tileSize, canvasHeight/2 + player.y + Yindex*tileSize, tileSize, tileSize);
            }else{
                context.fillStyle = '#eb4034';
                ctx.fillRect(canvasWidth / 2 + player.x + Xindex * tileSize, canvasHeight / 2 + player.y + Yindex * tileSize, tileSize, tileSize)
            }
        }
    }
}
function DrawWeapon(player, id){
    context.fillStyle = '#333';
    var ctx = context;
    ctx.save();
    if(id == playerId){
        ctx.translate(canvasWidth/2, canvasHeight/2);
        ctx.rotate(player.rot);
        ctx.fillRect(-10, 0, cannonWidth, cannonLength);
    }else{
        ctx.translate(canvasWidth/2 + currentPlayer.x - player.x, canvasHeight/2 + currentPlayer.y - player.y);
        ctx.rotate(player.rot);
        ctx.fillRect(-10, 0, cannonWidth, cannonLength);
    }
    ctx.restore();
}
function DrawPlayer(player, id) {
    context.beginPath();
    var ctx = context;
    if (id == playerId) {
        context.fillStyle = '#4287f5';
        context.arc(canvasWidth/2, canvasHeight/2, playerRadius, 0, 2 * Math.PI);
    }else{
        context.fillStyle = '#eb4034';
        context.arc(canvasWidth/2+currentPlayer.x-player.x, canvasHeight/2+currentPlayer.y-player.y, playerRadius, 0, 2 * Math.PI);
    }
    context.fill();
    // Health Bar
    ctx.beginPath();
    context.strokeStyle = '#666';
    context.lineWidth = 6;
    ctx.moveTo(canvasWidth / 2 + currentPlayer.x - player.x - healthBarLength / 2, canvasHeight / 2 + currentPlayer.y - player.y + healthBarOffset);
    ctx.lineTo(canvasWidth / 2 + currentPlayer.x - player.x - healthBarLength / 2 + healthBarLength, canvasHeight / 2 + currentPlayer.y - player.y + healthBarOffset);
    ctx.stroke();
    ctx.beginPath();
    context.strokeStyle = '#111';
    context.lineWidth = 6;
    ctx.moveTo(canvasWidth / 2 + currentPlayer.x - player.x - healthBarLength/2, canvasHeight / 2 + currentPlayer.y - player.y + healthBarOffset);
    ctx.lineTo(canvasWidth / 2 + currentPlayer.x - player.x - healthBarLength / 2 + healthBarLength*(player.health/100), canvasHeight / 2 + currentPlayer.y - player.y + healthBarOffset);
    ctx.stroke();
}

function DrawBullets(bullet, id) {
    context.beginPath();
    context.fillStyle = '#777';
    context.arc(canvasWidth / 2 + currentPlayer.x - bullet.x, canvasHeight / 2 + currentPlayer.y - bullet.y, cannonWidth/2, 0, 2 * Math.PI);
    context.fill();
}

function DrawAnimatedBullets(bullets) {
    for (var id in bullets) {
        var bullet = bullets[id];
        context.globalAlpha = bullet.opacity;
        context.beginPath();
        context.fillStyle = '#777';
        context.arc(canvasWidth / 2 + currentPlayer.x - bullet.x, canvasHeight / 2 + currentPlayer.y - bullet.y, cannonWidth / 2, 0, 2 * Math.PI);
        context.fill();
    }
}

function DrawAnimatedParticles(particlesList) {
    for (var id in particlesList) {
        var particles = particlesList[id];
        context.globalAlpha = particles.opacity;
        context.beginPath();
        if (particles.type == 0) {
            context.fillStyle = '#23c449';
        var numberOfSides = 4,
        size = particleSize / 2,
        Xcenter = canvasWidth / 2 + currentPlayer.x - particles.x,
            Ycenter = canvasHeight / 2 + currentPlayer.y - particles.y;
            
            context.beginPath();
            context.moveTo(Xcenter + size * Math.cos(0), Ycenter + size * Math.sin(0));
            
            for (var i = 1; i <= numberOfSides; i += 1) {
                context.lineTo(Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
            }
            
            context.fill();
            context.fill();
        } else if (particles.type == 1) {
            var X = canvasWidth / 2 + currentPlayer.x - particles.x;
            var Y = canvasHeight / 2 + currentPlayer.y - particles.y;
            context.fillStyle = '#fcba03';
            var height = particleSize * (Math.sqrt(3) / 2);
            context.beginPath();
            context.moveTo(X, Y);
            context.lineTo(X + particleSize / 2, Y + height);
            context.lineTo(X - particleSize / 2, Y + height);
            context.lineTo(X, Y);
            context.fill();
            context.closePath();
            
        } else {
            context.fillStyle = '#8b6df7';
            var numberOfSides = 6,
            size = particleSize / 2,
            Xcenter = canvasWidth / 2 + currentPlayer.x - particles.x,
            Ycenter = canvasHeight / 2 + currentPlayer.y - particles.y;
            
            context.beginPath();
            context.moveTo(Xcenter + size * Math.cos(0), Ycenter + size * Math.sin(0));
            
            for (var i = 1; i <= numberOfSides; i += 1) {
                context.lineTo(Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
            }
            
            context.fill();
        }
    }
}
    
    function DrawParticles (particles, id) {
        
        
    if (particles.type == 0) {
        context.fillStyle = '#23c449';
        //context.shadowColor = "#23c449";
        var numberOfSides = 4,
            size = particleSize / 2,
            Xcenter = canvasWidth / 2 + currentPlayer.x - particles.x,
            Ycenter = canvasHeight / 2 + currentPlayer.y - particles.y;

        context.beginPath();
        context.moveTo(Xcenter + size * Math.cos(0), Ycenter + size * Math.sin(0));

        for (var i = 1; i <= numberOfSides; i += 1) {
            context.lineTo(Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
        }

        context.fill();
        context.fill();
    }else if (particles.type == 1) {
        var X = canvasWidth / 2 + currentPlayer.x - particles.x;
        var Y = canvasHeight / 2 + currentPlayer.y - particles.y;
        context.fillStyle = '#fcba03';
        //context.shadowColor = "#fcba03";
        var height = particleSize * (Math.sqrt(3) / 2);
        context.beginPath();
        context.moveTo(X, Y);
        context.lineTo(X + particleSize/2, Y + height);
        context.lineTo(X - particleSize/2, Y + height);
        context.lineTo(X, Y);
        context.fill();
        context.closePath();
        
    }else{
        context.fillStyle = '#8b6df7';
        //context.shadowColor = "#8b6df7";
        var numberOfSides = 6,
            size = particleSize/2,
            Xcenter = canvasWidth / 2 + currentPlayer.x - particles.x,
            Ycenter = canvasHeight / 2 + currentPlayer.y - particles.y;

        context.beginPath();
        context.moveTo(Xcenter + size * Math.cos(0), Ycenter + size * Math.sin(0));

        for (var i = 1; i <= numberOfSides; i += 1) {
            context.lineTo(Xcenter + size * Math.cos(i * 2 * Math.PI / numberOfSides), Ycenter + size * Math.sin(i * 2 * Math.PI / numberOfSides));
        }

        context.fill();
    }

        
}

function ShowGameOverScreenAnim() {
    context.fillStyle = "black";
    if(gameOverAnim > 0.8){
        gameOverAnim = 0.8;
    }
    context.globalAlpha = gameOverAnim;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    gameOverAnim += gameOverAnimSpeed;
    setTimeout(() => {
        ShowGameOverScreenAnim();
    }, 1000/24);
}
