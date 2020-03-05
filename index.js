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
var particleSpeed = 0.3;
var bulletAnimationSpeed = 0.08;
var particleAnimationSpeed = 0.08;
var latency = 0;
var levelUpAmount = 20;
var bulletVelocity = 1.01;
var bulletVelocityStop = 480;

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


// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();
var server = http.createServer(app);
var socketIO = require('socket.io')(server, { wsEngine: 'ws' });
var io = socketIO;
app.set('port', process.env.PORT || 5000);
// Routing
app.use('/static', express.static(__dirname + '/static'));
app.use('/textures', express.static(__dirname + '/textures'));
app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname, 'index.html'));
});


// Starts the server.
server.listen(process.env.PORT || 5000, function () {
    console.log('Starting server on port ' + (process.env.PORT || 5000));
    
});

// AI

let population = 200;

let { NEAT, activation, crossover, mutate } = require('neat_net-js');

let config = {
    model: [
        { nodeCount: 5, type: "input" },
        { nodeCount: 4, type: "output", activationfunc: activation.RELU }
    ],
    mutationRate: 0.05,
    crossoverMethod: crossover.RANDOM,
    mutationMethod: mutate.RANDOM,
    populationSize: population
};

function getNearestParticleDist(id) {
    var player = players[id];
    var lowest = 200000;
    var particled = {x: 0, y:0};
    particles.forEach(particle => {
        
        var a = player.x - particle.x;
        var b = player.y - particle.y;

        var c = Math.sqrt(a * a + b * b);
        if(c < lowest){
            lowest = c;
            particled = particle;
        }
    });

    return { xoff: particled.x - player.x, yoff: particled.y - player.y}
}

var neat;

neat = new NEAT(config);

function SetupAi (){
    
    
    for (let i = 0; i < population; i++){
        var aiId = i;
        CreateNewPlayer({ id: i}, "AI", true)
        ai[i] = aiId;
    }
    
    
    updateAi(true);
    
}

var finish = false;
var timeout = 4;

function updateAi(fast){
    for (var index in ai) {
        
        
        // AI Portion
        var id = ai[index];

        neat.setInputs([getNearestParticleDist(id).xoff, getNearestParticleDist(id).yoff, players[id].velx, players[id].vely, players[id].health], id);
        
    }

    neat.feedForward();

    let desicions = neat.getDesicions();

    //console.log(desicions);
    

    for (var index in ai) {

        var action = desicions[index];

        var id = ai[index];

        var playerAI = players[id];
        
        // Action
        
        var moves = {
            up: (action == 0) ? true : false,
            down: (action == 1) ? true : false,
            left: (action == 2) ? true : false,
            right: (action == 3) ? true : false,
            
        }
        
        movementAi(id, moves);
        
        var player = players[id] || { x: 0, y: 0, velx: 0, vely: 0 };
        var resetTo = {
            x: player.x,
            y: player.y,
            changex: player.velx,
            changey: player.vely
        };
        // Velocity
        
        UpdateVelocity({ id: id });
        CheckPlayerCollision(resetTo, { id: id });
        CheckWallCollision(resetTo, { id: id });
        CheckPos({ id: id });
        UpdatePlayerLevel({ id: id });
        
        if (playerAI.score >= timeout){
            timeout++;
            finish = true;
        }

        for (let i = 0; i < population; i++) {
            neat.setFitness(players[ai[i]].score, i);


        }
        
    }

    if (finish) {
        
        for (let i = 0; i < population; i++) {
            neat.setFitness(players[ai[i]].score , i);
            

        }
        finish = false;
        neat.doGen();
        console.log(players[ai[neat.bestCreature()]].score);
        SetupAi()
        return;
    }

    if (!fast){
        
        setTimeout(updateAi, 0);
    }else{
        setTimeout(updateAi, 0);
    }
        
    }
    
    function movementAi(id, data){
        
        UpdateMovement(data, {id: id});
    }
    
    
    // END AI
    
    
    // Game Logic
var players = {};
var bullets = [];
var particles = [];
var ai = [];

// Animation
var animatedBullets = [];
var animatedParticles = [];


// Init
init();
function init() {
    SetupParticles(particlesCount);
    SetupAi(1);
}
io.on('connection', function (socket) {
    socket.on('late', function (ms) {
        latency = ms / (1000 / 60);
    });
    socket.on('new player', function (name) {
        CreateNewPlayer(socket, name, false);

        socket.emit("get id from server", socket.id);
    });
    socket.on('movement', function (data) {
        var player = players[socket.id] || { x: 0, y: 0, velx: 0, vely: 0 };
        var resetTo = {
            x: player.x,
            y: player.y,
            changex: player.velx,
            changey: player.vely
        };
        UpdateMovement(data, socket);

    });
    socket.on('update', function () {
        var player = players[socket.id] || { x: 0, y: 0, velx: 0, vely: 0 };
        var resetTo = {
            x: player.x,
            y: player.y,
            changex: player.velx,
            changey: player.vely
        };
        // Velocity

        UpdateVelocity(socket);
        CheckPlayerCollision(resetTo, socket);
        CheckWallCollision(resetTo, socket);
        CheckPos(socket);
        UpdatePlayerLevel(socket);



    });
    socket.on('cannon', function (data) {
        // CannonLaunch
        CannonLaunch(data, socket);

    });
    socket.on('get state', function (data) {
        var time = new Date();
        var leaders = [];
        for (let id in players) {
            if (players[id].isAlive == true) {
                var newLeader = players[id];
                newLeader.id = id;
                leaders.push(newLeader)
            }

        }
        leaders.sort((a, b) => b.score - a.score);
        // Returns State To Player
        io.sockets.compress(true).emit('state', {
            players: players,
            bullets: bullets,
            particles: particles,
            leaderboard: leaders,
            
            animate: {
                animatedBullets: animatedBullets,
                animatedParticles: animatedParticles
            },
            time: time
        });

    });
    socket.on('add to bulletDamage', function () {
        var player = players[socket.id] || {};
        player.bulletDamage += 1;
        if (player.bulletDamage > 8) {
            player.bulletDamage = 8;
        }

    });
    socket.on('add to bulletPenetration', function () {
        var player = players[socket.id] || {};
        player.bulletPenetration += 1;
        if (player.bulletPenetration > 8) {
            player.bulletPenetration = 8;
        }

    });
    socket.on('add to bulletSpeed', function () {
        var player = players[socket.id] || {};
        player.bulletSpeed += 1;
        if (player.bulletSpeed > 8) {
            player.bulletSpeed = 8;
        }

    });
    socket.on('add to reload', function () {
        var player = players[socket.id] || {};
        player.reload += 1;
        if (player.reload > 8) {
            player.reload = 8;
        }

    });
    socket.on('add to movementSpeed', function () {
        var player = players[socket.id] || {};
        //console.log(player.movementSpeed);
        player.movementSpeed += 1;
        if(player.movementSpeed > 8){
            player.movementSpeed = 8;
        }

    });
    socket.on('disconnect', function () {
        var player = players[socket.id] || {};
        player.isAlive = false;
        socket.disconnect();

    });
});

// Low Priority
setInterval(function () {
    // Update State
    
    SetupParticles(particlesCount - particles.length);
    for (var id in particles) {
        var particle = particles[id];
        var resetData = particle;
        UpdateParticleVelocity(particle);
        CheckParticleWallCollision(particle, resetData);
        CheckParticleParticleCollision(particle);
        CheckParticlePos(particle);
        CheckParticleBulletCollision(particle);
    }
    CheckBulletWallCollision();
    // Animation
    Animate();
}, 1000 / 30);

// High Priority
setInterval(function () {
    UpdateBullets();
    CheckBulletCollision();
    CheckParticleCollision();
}, 1000 / 60);


function Animate() {
    for (var id in animatedBullets) {
        var bullet = animatedBullets[id];
        bullet.opacity -= bulletAnimationSpeed;
        if (bullet.opacity < 0) {
            animatedBullets.splice(animatedBullets.indexOf(bullet), 1);
        }
    }
    for (var id in animatedParticles) {
        var particle = animatedParticles[id];
        particle.opacity -= particleAnimationSpeed;
        if (particle.opacity < 0) {
            animatedParticles.splice(animatedParticles.indexOf(particle), 1);
        }
    }
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
function CreateNewPlayer(socket, name, isAI) {
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

    

    players[socket.id] = {
        rot: 0,
        isAlive: true,
        velx: 0,
        vely: 0,
        x: xpos,
        y: ypos,
        health: 100,
        score: 0,
        name: name,
        tankLevel : 0.0,
        bulletDamage: 0, 
        bulletPenetration: 0,
        bulletSpeed:0,
        reload: 0,
        movementSpeed:0
        
    };
}

function CheckParticleCollision() {

    for (var id in particles) {
        var bullet = particles[id];
        for (var id in players) {
            var testOn = players[id];
            if (!testOn.isAlive) { continue; }
            var distx = Math.pow(Math.abs(testOn.x - bullet.x), 2);
            var disty = Math.pow(Math.abs(testOn.y - bullet.y), 2);
            var totalDist = Math.sqrt(distx + disty);
            if (totalDist < (playerRadius + cannonWidth) / 2) {
                players[id].health += particleHealthGain;
                players[id].score += 1;
                if (players[id].health >= 100) {
                    players[id].health = 100;
                }
                
                animatedParticles.push(bullet);
                particles.splice(particles.indexOf(bullet), 1);
            }
        }
    }
}

function CheckBulletCollision() {

    for (var id in bullets) {
        var bullet = bullets[id];
        for (var id in players) {
            var testOn = players[id];
            if (id == bullet.playerId) { continue; }
            if (!testOn.isAlive) { continue; }
            var distx = Math.pow(Math.abs(testOn.x - bullet.x), 2);
            var disty = Math.pow(Math.abs(testOn.y - bullet.y), 2);
            var totalDist = Math.sqrt(distx + disty);
            if (totalDist < (playerRadius + cannonWidth) / 2) {
                
                players[id].health -= bulletHealthLoss + ((players[bullet.playerId] || { bulletDamage: 1 }).bulletDamage)/8 * bulletHealthLoss;
                if (players[id].health <= 0) {
                    players[id].isAlive = false;
                    players[id].health = 0;
                }
                animatedBullets.push(bullet);
                bullets.splice(bullets.indexOf(bullet), 1);
            }
        }
    }
}

function CheckParticleBulletCollision(particle) {
    var deletelist = [];
    for (var id in bullets) {
        var bullet = bullets[id];

        var testOn = particle
        var distx = Math.pow(Math.abs(testOn.x - bullet.x), 2);
        var disty = Math.pow(Math.abs(testOn.y - bullet.y), 2);
        var totalDist = Math.sqrt(distx + disty);
        if (totalDist < (playerRadius + cannonWidth) / 2) {
            animatedBullets.push(bullet);
            animatedParticles.push(particle);
            particles.splice(particles.indexOf(particle), 1);
            bullets.splice(bullets.indexOf(bullet), 1);
            players[bullet.playerId].score ++;
        }

    }
}

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

function UpdatePlayerLevel (socket) {
    var player = players[socket.id] || {score : 0, tankLevel : 0};
    player.tankLevel = player.score * 1.0 / levelUpAmount + 1;
}

function CheckPlayerCollision(resetData, socket) {
    var deletelist = [];
    var id = socket.id;
    var testER = players[id];
    if (testER == undefined) { return; }
    if (!testER.isAlive) { return; }
    for (var idTest in players) {
        var testOn = players[idTest];
        if (idTest == id) { continue; }
        if (!testOn.isAlive) { continue; }
        var distx = Math.pow(Math.abs(testOn.x - testER.x), 2);
        var disty = Math.pow(Math.abs(testOn.y - testER.y), 2);
        var totalDist = Math.sqrt(distx + disty);
        if (totalDist < (playerRadius + playerRadius)) {
            players[id].health -= playerHealthLoss;
            players[idTest].health -= playerHealthLoss;
            if (players[id].health <= 0) {
                players[id].isAlive = false;
                players[id].health = 0;
            }
            if (players[idTest].health <= 0) {
                players[idTest].isAlive = false;
                players[idTest].health = 0;
            }
        }
        if (totalDist < (playerRadius + playerRadius) / 2) {
            players[id].health -= playerHealthLoss; players[id].x = resetData.x;
            players[id].y = resetData.y;
            players[id].velx = 0;
            players[id].vely = 0;

        }
    }

}

function CheckParticleWallCollision(particle, resetData) {

    for (let Yindex = 0; Yindex < landHeight / tileSize; Yindex++) {
        for (let Xindex = 0; Xindex < landWidth / tileSize; Xindex++) {
            if (map[Yindex][Xindex] == 1) {
                var blockx = Xindex * tileSize;
                var blocky = Yindex * tileSize;
                var playerx = -particle.x;
                var playery = -particle.y;
                //console.log("B " +blockx + "  " +blocky);
                //console.log(playerx + "  " + playery);
                if (playerx >= blockx && playerx <= blockx + tileSize && playery >= blocky && playery <= blocky + tileSize) {
                    particle.velx = -particle.velx;
                    particle.vely = -particle.vely;
                    particle.x = resetData.x;
                    particle.y = resetData.y;

                }
            }
        }
    }
}

function CheckWallCollision(resetData, socket) {
    var playerTestOn = players[socket.id] || { x: 0, y: 0, velx: 0, vely: 0 };
    for (let Yindex = 0; Yindex < landHeight / tileSize; Yindex++) {
        for (let Xindex = 0; Xindex < landWidth / tileSize; Xindex++) {
            if (map[Yindex][Xindex] == 1) {
                var blockx = Xindex * tileSize;
                var blocky = Yindex * tileSize;
                var playerx = -playerTestOn.x;
                var playery = -playerTestOn.y;
                //console.log("B " +blockx + "  " +blocky);
                //console.log(playerx + "  " + playery);
                if (playerx >= blockx && playerx <= blockx + tileSize && playery >= blocky && playery <= blocky + tileSize) {
                    players[socket.id].x = resetData.x;
                    players[socket.id].y = resetData.y;
                    players[socket.id].velx = 0;
                    players[socket.id].vely = 0;
                    

                }
            }
        }
    }
}

function CheckBulletWallCollision() {
    for (var id in bullets) {
        var bullet = bullets[id];
        for (let Yindex = 0; Yindex < landHeight / tileSize; Yindex++) {
            for (let Xindex = 0; Xindex < landWidth / tileSize; Xindex++) {
                if (map[Yindex][Xindex] == 1) {
                    var blockx = Xindex * tileSize;
                    var blocky = Yindex * tileSize;
                    var playerx = -bullet.x;
                    var playery = -bullet.y;
                    //console.log("B " +blockx + "  " +blocky);
                    //console.log(playerx + "  " + playery);
                    if (playerx >= blockx && playerx <= blockx + tileSize && playery >= blocky && playery <= blocky + tileSize) {
                        animatedBullets.push(bullet);
                        bullets.splice(bullets.indexOf(bullet), 1);

                    }
                }
            }
        }
    }
}

function CannonLaunch(data, socket) {
    var changey = data.changey * (((players[socket.id] || { bulletSpeed: 1 }).bulletSpeed) / 8 + 1);
    var changex = data.changex * (((players[socket.id] || { bulletSpeed: 1 }).bulletSpeed) / 8 + 1);
    data.changey = changey;
    data.changex = changex;
    //console.log((((players[socket.id] || { bulletSpeed: 1 }).bulletSpeed) / 3 + 1));
    data.opacity = 1;
    data.life = cannonLife + ((players[socket.id] || { bulletPenetration: 1 }).bulletPenetration /8) * cannonLife;
    (players[socket.id] || { velx: 1 }).velx -= changex / (bulletMultiplier + ((players[socket.id] || { bulletSpeed: 1 }).bulletSpeed)/8 * bulletMultiplier) / 2;
    (players[socket.id] || { vely: 1 }).vely -= changey / (bulletMultiplier + ((players[socket.id] || { bulletSpeed: 1 }).bulletSpeed) / 8 * bulletMultiplier) / 2;
    bullets.push(data);
}

function UpdateBullets() {

    var deletelist = [];
    for (var id in bullets) {
        var bullet = bullets[id];
        if (bullet.life > bulletVelocityStop) {
        bullet.changex *= bulletVelocity;
        bullet.changey *= bulletVelocity;
        }
       
        bullet.x += bullet.changex;
        bullet.y += bullet.changey;
        
        bullet.life--;
        if (bullet.life < 0) {
            bullet.life = 0;
            deletelist.push(bullet);
        }
    }
    animatedBullets.push(deletelist);
    for (var id in deletelist) {
        var deleted = bullets[id];
        bullets.splice(bullets.indexOf(deleted), 1);
    }
}

function CheckPos(socket) {
    var player = players[socket.id] || { x: 0, y: 0 };
    if (player.x > 0) {
        player.x = 0;
        
    }
    if (player.x < -landWidth) {
        player.x = -landWidth;
        
    }
    if (player.y > 0) {
        player.y = 0;
        
    }
    if (player.y < -landHeight) {
        player.y = -landHeight;
        
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

function UpdateVelocity(socket) {
    var player = players[socket.id] || {};
    player.velx = player.velx * friction;
    player.vely = player.vely * friction;
    player.x += player.velx;
    player.y += player.vely;
}

function UpdateParticleVelocity(particle) {
    particle.velx = particle.velx;
    particle.vely = particle.vely;
    particle.x += particle.velx;
    particle.y += particle.vely;

}

function UpdateMovement(data, socket) {
    var player = players[socket.id] || {};
    if (data.left) {
        player.x += playerMoveSpeed * latency + (player.movementSpeed * playerMoveSpeed * latency/8);
        player.velx += playerInitVelocity ;
    }
    if (data.up) {
        player.y += playerMoveSpeed * latency + (player.movementSpeed * playerMoveSpeed * latency / 8);
        player.vely += playerInitVelocity ;
    }
    if (data.right) {
        player.x -= playerMoveSpeed * latency + (player.movementSpeed * playerMoveSpeed * latency / 8);
        player.velx -= playerInitVelocity ;
    }
    if (data.down) {
        player.y -= playerMoveSpeed * latency + (player.movementSpeed * playerMoveSpeed * latency / 8);
        player.vely -= playerInitVelocity ;
    }
    player.rot = data.rot;
}