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
var bulletFireTime = 1000;
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
var levelBarLength = 600;
var level = 1;
var oldLevel = 1;
var levelIncreaseGrain = 20;
var pointsPerLevel = 3;
var powerupoff = 0;
var showpowerups = true;
var img;
var onScreenContext;
var started = false;
var particleSpeed = 0.5;
var nozzleOff = 0;
var nozzleOffStart = 4;
var currentData;

window.onload = function () {
    img = document.getElementById("backgroundTile");
    onScreenContext = document.getElementById('screen').getContext('2d');
    
}

// Animation
var gameOverAnim = 0;
var gameOverAnimSpeed = 0.0005;

// Land Configuration
var map = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// Player Specific Constants
var autofire = false;
var playerId = "";
var points = 0;
var currentPlayer = {
    rot: 0,
    isAlive: true,
    velx: 0,
    vely: 0,
    x: 100,
    y: 0,
    health: 100
};

var socket = io({ transports: ["websocket"] });
var movement = {
    rot: 0,
    up: false,
    down: false,
    left: false,
    right: false
}

document.addEventListener('keydown', function (event) {
    hasMoved = true;
    if (!started) { return; }
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
    hasMoved = true;
    if(!started){return;}
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
        case 49: // 1
            if (points > 0 && currentPlayer.bulletDamage < 8){
                socket.emit("add to bulletDamage");
                points--;
                showpowerups = true;
            }
            break;
        case 50: // 2
            if (points > 0 && currentPlayer.bulletPenetration < 8) {
            socket.emit("add to bulletPenetration");
                points--;
                showpowerups = true;
            }
            break;
        case 51: // 3
            if (points > 0 && currentPlayer.bulletSpeed < 8) {
            socket.emit("add to bulletSpeed");
                points--;
                showpowerups = true;
            }
            break;
        case 52: // 4
            if (points > 0 && currentPlayer.reload < 8) {
            socket.emit("add to reload");
                points--;
                showpowerups = true;
            }
            break;
        case 53: // 5
            if (points > 0 && currentPlayer.movementSpeed < 8) {
            socket.emit("add to movementSpeed");
                points--;
                showpowerups = true;
            }
            break;
        case 81: // Q
            showpowerups = !showpowerups;
            break;
    }
});
document.addEventListener("mousemove", function (event) {
    hasMoved = true;
    var angle = Math.atan2(event.pageX - canvasWidth / 2, - (event.pageY - canvasHeight / 2));
    movement.rot = angle - 180 *Math.PI/180;
});
var lastClickTime = 0, nowTime;
document.addEventListener("click", function (event) {
    nowTime = new Date();
    var elaspedTime = nowTime.getTime() - lastClickTime;
    console.log(elaspedTime < bulletFireTime);
    if (elaspedTime > bulletFireTime - (currentPlayer.reload * (bulletFireTime / 2) / 8)) {
        console.log("good");
        if (!autofire) {
            FireCannon();
            lastClickTime = nowTime.getTime();
            console.log(nowTime.getTime());

        }
    }
});



function FireCannon() {
    nozzleOff = nozzleOffStart-1;
    if (!currentPlayer.isAlive) { return; }
    var bulletsToFire = [];
    if (Math.floor(currentPlayer.tankLevel) == 1) {
        bulletsToFire.push(movement.rot - 90 * Math.PI / 180);
    } else if (Math.floor(currentPlayer.tankLevel) == 2){
        bulletsToFire.push(movement.rot - 45 * Math.PI / 180);
        bulletsToFire.push(movement.rot- 135 * Math.PI / 180);
    } else if (Math.floor(currentPlayer.tankLevel) >= 3){
        bulletsToFire.push(movement.rot - (-33.33+90) * Math.PI / 180);
        bulletsToFire.push(movement.rot - (33.33+90) * Math.PI / 180);
        bulletsToFire.push(movement.rot - (33.333 * 1.5 + 180 + 45) * Math.PI / 180);
    } 
    for(var id in bulletsToFire){
        var rot = bulletsToFire[id];
        var changey = bulletMultiplier * Math.sin(rot);
        var changex = bulletMultiplier * Math.cos(rot);
        socket.emit('cannon', {
            changex: changex,
            changey: changey,
            x: currentPlayer.x + (changex / bulletMultiplier) * cannonLength,
            y: currentPlayer.y + (changey / bulletMultiplier) * cannonLength,
            life: cannonLife,
            playerId: playerId
        });
    }
}

// Update Canvas
var canvas = document.createElement('canvas');
canvas.width = document.body.scrollWidth + '';
canvas.height = document.body.scrollHeight + '';
canvasWidth = document.body.scrollWidth;
canvasHeight = document.body.scrollHeight;

var realCanvas = document.getElementById('screen');
realCanvas.width = document.body.scrollWidth;
realCanvas.height = document.body.scrollHeight;
canvasWidth = document.body.scrollWidth;
canvasHeight = document.body.scrollHeight;

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
}

var context = canvas.getContext('2d');

// Start Screen
var text = document.getElementById("nameBox");
var textDiv = document.getElementById("nameDiv");
var textBtn = document.getElementById("nameBtn");
var leaderboard = document.getElementById("leaderboard");
var cns = document.getElementById("screen");

leaderboard.style.display = "none";

function StartGame (){
    leaderboard.style.display = "block";
    document.getElementById("flyer").style.display = "none";
    cns.style.display = "block";
    
    socket.emit('new player', text.value == "" ? "Player" : text.value);
    textDiv.style.display = "none";
    
}

StartScreen();

var particles = [];
SetupParticles(200);
function CheckParticleParticleCollision(particle) {
    for (var id in particles) {
        var testonParticle = particles[id];
        var testOn = testonParticle;
        if (testonParticle == particle) { continue; }
        var testER = particle;
        var distx = Math.pow(Math.abs(testOn.x - testER.x), 2);
        var disty = Math.pow(Math.abs(testOn.y - testER.y), 2);
        var totalDist = Math.sqrt(distx + disty);
        if (totalDist < (playerRadius + playerRadius * 3)) {
            particle.velx = -particle.velx;
            particle.vely = -particle.vely;
        }

    }

}

function CheckParticlePos(particle) {
    if (particle.x > 0) {
        particle.x = 0;
        particle.velx = -particle.velx;
        particle.vely = -particle.vely;
    }
    if (particle.x < -landWidth) {
        particle.x = -landWidth;
        particle.velx = -particle.velx;
        particle.vely = -particle.vely;
    }
    if (particle.y > 0) {
        particle.y = 0;
        particle.velx = -particle.velx;
        particle.vely = -particle.vely;
    }
    if (particle.y < -landHeight) {
        particle.y = -landHeight;
        particle.velx = -particle.velx;
        particle.vely = -particle.vely;
    }
}

function UpdateParticleVelocity(particle) {
    particle.velx = particle.velx;
    particle.vely = particle.vely;
    particle.x += particle.velx;
    particle.y += particle.vely;

}

function SetupParticles(count) {
    var particlesData = [];
    for (let index = 0; index < count; index++) {
        var xpos, ypos;
        var foundGood = false;
        while (!foundGood) {

            xpos = -Math.random() * landWidth;
            ypos = -Math.random() * landHeight;
            foundGood = true;
            for (let Yindex = 0; Yindex < landHeight / tileSize; Yindex++) {
                for (let Xindex = 0; Xindex < landWidth / tileSize; Xindex++) {
                    if (map[Yindex][Xindex] == 1) {
                        var blockx = Xindex * tileSize;
                        var blocky = Yindex * tileSize;
                        var playerx = -xpos;
                        var playery = -ypos;

                        if (playerx >= blockx && playerx <= blockx + tileSize && playery >= blocky && playery <= blocky + tileSize) {
                            foundGood = false;

                        }
                    }
                }
            }
        }
        var particle = {
            x: xpos,
            y: ypos,
            vely: Math.random() > 0.5 ? Math.random() * particleSpeed : -Math.random() * particleSpeed,
            velx: Math.random() > 0.5 ? Math.random() * particleSpeed : -Math.random() * particleSpeed,
            type: Math.round(Math.random() * 2),
            opacity: 1
        };
        particles.push(particle);
    }


}


function StartScreen() {
    if(started){return;}
    for (var id in particles) {
        
        var particle = particles[id];
        
        UpdateParticleVelocity(particle);
       
        CheckParticleParticleCollision(particle);
        CheckParticlePos(particle);
    }
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.fillStyle = "#fff"
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    for(var id in particles){
        var particle = particles[id];
        currentPlayer.x = -canvasWidth/2;
        currentPlayer.y = -canvasHeight/2;
        DrawParticles(particle)
    }
    setTimeout(StartScreen, 16);
}
// End of Start Screen

socket.on("get id from server", function (id) {
    playerId = id;
    started = true;
});


var hasMoved = false;
setInterval(function () {
    if (!started) { return; }
    if (currentPlayer.isAlive) {
        if (movement.left || movement.right || movement.up || movement.down || hasMoved){
            socket.emit('movement', movement);
        }

    }
}, 1000 / 60);

// Auto Fire
AutoFire();
function AutoFire() {
    
    if (autofire && started) {
        FireCannon();
    }
    setTimeout(AutoFire, bulletFireTime - (currentPlayer.reload * (bulletFireTime/2) / 8));
}
var latency = 0;
socket.on('pong', function (ms) {
    latency = ms;
    socket.emit("late", latency);
    console.log("late: " + ms);
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



function Render() {
    var data = currentData;
    if(isNaN(points)){
        points = 0;
    }
    if (started) {
    currentPlayer = data.players[playerId] || { x: 0, y: 0 };
    if (Math.floor(currentPlayer.tankLevel) != Math.floor(oldLevel)) {
        points += Math.round(Math.abs(currentPlayer.tankLevel - oldLevel) * pointsPerLevel);
        oldLevel = currentPlayer.tankLevel;
    }
    
    nozzleOff -= (nozzleOffStart - nozzleOff) / 10;
    if (nozzleOff < 0) {
        nozzleOff = 0;
    }
    if (!showpowerups) {
        var on = 400;

        powerupoff -= Math.abs(on - Math.abs(powerupoff)) / 10;

        if (powerupoff < -on) {
            powerupoff = -on;
        }

    } else {
        var on = 500;

        powerupoff += Math.abs(0 - Math.abs(powerupoff)) / 10;

        if (powerupoff > 0) {
            powerupoff = 0;
        }

    }
    //console.log(new Date() - new Date(data.time));
    start();
    if (data.players[playerId] == undefined) { return; }
    if (data.players[playerId].isAlive) {
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
        DrawBackground(currentPlayer);
        for (var id in data.bullets) {
            var bullet = data.bullets[id];
            if (bullet.life <= 0) { continue; }
            if (!inRange(bullet)) { continue; }
            DrawBullets(bullet, id);
        }
        for (var id in data.particles) {
            var particle = data.particles[id];
            if (!inRange(particle)) { continue; }
            DrawParticles(particle);
        }
        DrawAnimatedParticles(data.animate.animatedParticles);
        context.globalAlpha = 1;
        for (var id in data.players) {
            var player = data.players[id];
            if (!player.isAlive) { continue; }
            UpdateScreen(player, id);
        }
        DrawAnimatedBullets(data.animate.animatedBullets);
        context.globalAlpha = 1;
        if (leaderBoardTick < 60) {
            leaderBoardTick++;
        } else {
            leaderBoardTick = 0;
            var leaders = data.leaderboard.slice(0, leaderBoardCount);
            DrawLeaderBoard(leaders);
        }
        DrawLevel();
        DrawPowerups(currentPlayer.bulletDamage, currentPlayer.bulletPenetration, currentPlayer.bulletSpeed, currentPlayer.reload, currentPlayer.movementSpeed)
        DrawMap();
    }
    else {
        ShowGameOverScreenAnim();
    }
}
    if(onScreenContext != undefined){
    
        if(canvas!=undefined){
            onScreenContext.drawImage(canvas, 0, 0);
        }
    }
    
}

setInterval(() => {
    requestAnimationFrame(Render);
}, 1000/60);

var leaderBoardTick = 0;
var skippedFrames = 0;
socket.on('state', function (data) {
    currentData = data;
});

socket.on('playerState', function (data) {
    currentData.players = data;
});


function UpdateScreen(player, id) {
    DrawWeapon(player, id);
    DrawPlayer(player, id);
}

function DrawLevel(){
    var ctx = context;
    var playerLevel = currentPlayer.tankLevel;
    var offset = playerLevel-level;
    level += offset/levelIncreaseGrain;
    var levelCalc = (1 - (level - ~~level));

    var diff = Math.abs(offset);

    if (diff < 0.001) {
        level = playerLevel;
    }
    // Level Bar
    ctx.lineWidth = 10;
    ctx.beginPath();
    context.strokeStyle = '#666';
 
    ctx.moveTo(canvasWidth / 2 - levelBarLength / 2, 0);
    ctx.lineTo(canvasWidth / 2 + levelBarLength / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    context.strokeStyle = '#fccd56';
    
    ctx.moveTo(canvasWidth / 2 - levelBarLength / 2, 0);
    ctx.lineTo(canvasWidth / 2 + levelBarLength / 2 - levelBarLength * levelCalc, 0);
    ctx.stroke();

    ctx.font = "30px Segoe UI";
    context.fillStyle = "#333"
    ctx.fillText("Level: " + ~~level , 10, 30);
}

function DrawMap(){
    var ctx = context;
    ctx.save()
    ctx.translate(canvasWidth, canvasHeight)
    ctx.fillText("Levesl: ", 10, 30);

    ctx.restore();
}

function inRange(testEr) {
    var testOn = currentPlayer;

    var distx = Math.pow(Math.abs(testOn.x - testEr.x), 2);
    var disty = Math.pow(Math.abs(testOn.y - testEr.y), 2);
    var totalDist = Math.sqrt(distx + disty);
    if (totalDist > canvasWidth + tileSize) {
        return false;
    } else {
        return true;
    }
}

function DrawLeaderBoard(leaders) {
    var leadersList = document.getElementById("leaders");
    var leadersText = "";

    for (var id in leaders) {
        var leader = leaders[id];
        if (leader.id == playerId) {
            leadersText += "<li class='you'>" + leader.name + "<span class = 'score'>" + leader.score + " </span></li>";
        } else {
            leadersText += "<li>" + leader.name + "<span class = 'score'>" + leader.score + " </span></li>";
        }
    }
    leadersList.innerHTML = leadersText;
}

function DrawBackground(player) {
    var ctx = context;
    for (let Yindex = 0; Yindex < landHeight / tileSize; Yindex++) {
        for (let Xindex = 0; Xindex < landWidth / tileSize; Xindex++) {
            if (map[Yindex][Xindex] == 0) {
                context.fillStyle = 'white';
                //ctx.fillRect(canvasWidth / 2 + player.x + Xindex * tileSize, canvasHeight / 2 + player.y + Yindex * tileSize, tileSize, tileSize)
                ctx.drawImage(img, canvasWidth / 2 + player.x + Xindex * tileSize, canvasHeight / 2 + player.y + Yindex * tileSize, tileSize, tileSize);
            } else {
                context.fillStyle = '#eb4034';
                ctx.fillRect(canvasWidth / 2 + player.x + Xindex * tileSize, canvasHeight / 2 + player.y + Yindex * tileSize, tileSize, tileSize)
            }
        }
    }
}

function DrawPowerups(bulletDamage, bulletPenetration, bulletSpeed, reload, movementSpeed) {
    var x = 170;
    var y = 60;
    var yoff = 30;
    var dist = 4;
    var width = 8;
    var height = 8;
    context.fillStyle = "#333"
    context.font = "15px Segoe UI";
    context.fillText("Press [Q] to toggle powerups.", 10, y + yoff * 6+ (160+yoff*2.5) * ((powerupoff) / 500)+ 7.5);
    context.font = "20px Segoe UI";
    //context.fillText(points + " points", 10 + powerupoff, y+ yoff*5 + 7.5);
    context.fillText(points + " points", 10 , y  +yoff*5 + 160*((powerupoff)/500)+ 7.5);
    context.fillStyle = "white";
    //context.fillRect(5 + powerupoff, y-10, 260, yoff*4+25)
    Drawbars(8, bulletDamage, context, x+powerupoff, y + yoff * 0, dist, width, height);
    Drawbars(8, bulletPenetration, context, x + powerupoff, y + yoff * 1, dist, width, height);
    Drawbars(8, bulletSpeed, context, x + powerupoff, y + yoff * 2, dist, width, height);
    Drawbars(8, reload, context, x + powerupoff, y + yoff * 3, dist, width, height);
    Drawbars(8, movementSpeed, context, x + powerupoff, y + yoff * 4, dist, width, height);
    context.fillStyle = "#333"
    context.font = "15px Segoe UI";
    context.fillText("[1] Bullet Damage", 10 + powerupoff, y + yoff * 0+7.5);
    context.fillText("[2] Bullet Penetration", 10 + powerupoff, y + yoff * 1 + 7.5);
    context.fillText("[3] Bullet Speed", 10 + powerupoff, y + yoff * 2 + 7.5);
    context.fillText("[4] Reload", 10 + powerupoff, y + yoff * 3 + 7.5);
    context.fillText("[5] Movement Speed", 10 + powerupoff, y + yoff * 4 + 7.5);
}

function Drawbars(number, filled, ctx, x, y, dist, width, height) {
    for (let index = 0; index < number; index++) {
        if(index < filled){
            ctx.fillStyle = "#fccd56";
        }else{
            ctx.fillStyle = "#444";
        }
        ctx.roundRect(x + index * (dist + width), y, width, height, 4).fill();
    }
    
}

function DrawWeapon(player, id) {
    //console.log(player.tankLevel);
    context.fillStyle = '#333';
    var ctx = context;
    ctx.save();
    if (id == playerId) {
        if (Math.floor(player.tankLevel) == 1){
            ctx.translate(canvasWidth / 2, canvasHeight / 2);
            ctx.rotate(player.rot);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
        } else if (Math.floor(player.tankLevel) == 2){
            ctx.translate(canvasWidth / 2, canvasHeight / 2);
            ctx.rotate(player.rot + (-45) * Math.PI / 180);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
            ctx.rotate((90) * Math.PI / 180);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
        } else if (Math.floor(player.tankLevel) >= 3){
            ctx.translate(canvasWidth / 2, canvasHeight / 2);
            ctx.rotate(player.rot + (-33.333) * Math.PI / 180);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
            ctx.rotate((66.666) * Math.PI / 180);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
            ctx.rotate((33.333*1.5+90) * Math.PI / 180);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
        }
    } else {
        var newn = nozzleOff; // Nozzle Bug Fix
        nozzleOff = 0;
        if (Math.floor(player.tankLevel) == 1) {
            ctx.translate(canvasWidth / 2 + currentPlayer.x - player.x, canvasHeight / 2 + currentPlayer.y - player.y);
            ctx.rotate(player.rot);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
        } else if (Math.floor(player.tankLevel) == 2) {
            ctx.translate(canvasWidth / 2 + currentPlayer.x - player.x, canvasHeight / 2 + currentPlayer.y - player.y);
            ctx.rotate(player.rot - Math.PI + (-45) * 180 / Math.PI);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
            ctx.rotate((90) * 180 / Math.PI);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
        } else if (Math.floor(player.tankLevel) >= 3) {
            ctx.translate(canvasWidth / 2, canvasHeight / 2);
            ctx.rotate(player.rot + (-33.333) * Math.PI / 180);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
            ctx.rotate((66.666) * Math.PI / 180);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
            ctx.rotate((33.333 * 1.5 + 90) * Math.PI / 180);
            ctx.fillRect(-10, 0, cannonWidth, cannonLength - nozzleOff);
        }
        nozzleOff = newn;
    }
    ctx.restore();
}
function DrawPlayer(player, id) {
    context.beginPath();
    var ctx = context;
    if (id == playerId) {
        context.fillStyle = '#4287f5';
        context.arc(canvasWidth / 2, canvasHeight / 2, playerRadius, 0, 2 * Math.PI);
    } else {
        context.fillStyle = '#eb4034';
        context.arc(canvasWidth / 2 + currentPlayer.x - player.x, canvasHeight / 2 + currentPlayer.y - player.y, playerRadius, 0, 2 * Math.PI);
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
    context.strokeStyle = '#fccd56';
    context.lineWidth = 6;
    ctx.moveTo(canvasWidth / 2 + currentPlayer.x - player.x - healthBarLength / 2, canvasHeight / 2 + currentPlayer.y - player.y + healthBarOffset);
    ctx.lineTo(canvasWidth / 2 + currentPlayer.x - player.x - healthBarLength / 2 + healthBarLength * (player.health / 100), canvasHeight / 2 + currentPlayer.y - player.y + healthBarOffset);
    ctx.stroke();
}

function DrawBullets(bullet, id) {
    var x = canvasWidth / 2 + currentPlayer.x - bullet.x;
    var y = canvasHeight / 2 + currentPlayer.y - bullet.y
    if (x <= -20 || x >= canvasWidth + 20 || y >= 20 || y <= -canvasHeight - 20) {

        //return;
    
        context.beginPath();
        context.fillStyle = '#777';
        context.arc(x, y, cannonWidth / 2, 0, 2 * Math.PI);
        context.fill();
    }
}

function DrawAnimatedBullets(bullets) {
    for (var id in bullets) {
        var bullet = bullets[id];
        var x = canvasWidth / 2 + currentPlayer.x - bullet.x;
        var y = canvasHeight / 2 + currentPlayer.y - bullet.y
        if (x <= -20 || x >= canvasWidth + 20 || y >= 20 || y <= -canvasHeight - 20){
            
        
        context.globalAlpha = bullet.opacity;
        context.beginPath();
        context.fillStyle = '#777';
        context.arc(x, y, cannonWidth / 2, 0, 2 * Math.PI);
        context.fill();
        }
    }
}

function DrawAnimatedParticles(particlesList) {
    for (var id in particlesList) {
        var particles = particlesList[id];
        var x = canvasWidth / 2 + currentPlayer.x - particles.x;
        var y = canvasHeight / 2 + currentPlayer.y - particles.y - 10;
        if (x <= -20 || x >= canvasWidth + 20 || y >= 20 || y <= -canvasHeight - 20) {
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
                var Y = canvasHeight / 2 + currentPlayer.y - particles.y - 10;
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
}

function DrawParticles(particles) {


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
    } else if (particles.type == 1) {
        
        var X = canvasWidth / 2 + currentPlayer.x - particles.x;
        var Y = canvasHeight / 2 + currentPlayer.y - particles.y -10;
        context.fillStyle = '#fcba03';
        //context.shadowColor = "#fcba03";
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
        //context.shadowColor = "#8b6df7";
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

function ShowGameOverScreenAnim() {
    context.fillStyle = "black";
    if (gameOverAnim > 0.8) {
        gameOverAnim = 0.8;
    }
    context.globalAlpha = gameOverAnim;
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    gameOverAnim += gameOverAnimSpeed;
    setTimeout(() => {
        ShowGameOverScreenAnim();
    }, 1000 / 24);
}

