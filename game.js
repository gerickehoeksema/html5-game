var canvasBg = document.getElementById("canvasBg"),
    ctxBg = canvasBg.getContext("2d"), // 2 dimential context
    canvasEntities = document.getElementById("canvasEntities"),
    ctxEntities = canvasEntities.getContext("2d"), // 2 dimential context
    canvasWidth = canvasBg.width,
    canvasHeight = canvasBg.height,
    player1 = new Player(),
    enemies = [],
    numEnemies = 5,
    obstacles = [],
    isPlaying = false,
    requestAnimFrame =  window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.oRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function(callback) {
                            window.setTimeout(callback, 1000 / 60);
                        },
    imgSprite = new Image();

imgSprite.src = "images/sprite.png";
imgSprite.addEventListener("load", init, false);


function init() {
    document.addEventListener("keydown", function(e) {checkKey(e,true);}, false);
    document.addEventListener("keyup", function(e) {checkKey(e,false);}, false);
    defineObstacles();
    initEnemies();
    begin();
};

function begin() {
    ctxBg.drawImage(imgSprite, 0, 0, canvasWidth, canvasHeight, 0, 0, canvasWidth, canvasHeight);
    isPlaying = true;
    requestAnimFrame(loop);
};

function update() {
    clearCtx(ctxEntities);
    updateAllEnemies();
    player1.update();
};

function draw() {
    drawAllEnemies();
    player1.draw();
};

function loop() {
    if(isPlaying) {
        update();
        draw();
        requestAnimFrame(loop);
    }
};

function clearCtx(ctx) {
    ctx.clearRect(0,0, canvasWidth, canvasHeight);
};

function randomRange (min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
};

//#region Player
function Player() {
    this.srcX = 0;
    this.srcY = 600;
    this.width = 35;
    this.height= 54;
    this.drawX = 400;
    this.drawY = 300;
    this.centerX = this.drawX + (this.width / 2); 
    this.centerY = this.drawY + (this.height / 2);
    this.speed = 2;
    this.isUpKey = false;
    this.isRightKey = false;
    this.isDownKey = false;
    this.isLeftKey = false;
    this.isSpacebar = false;
    this.isShooting = false;

    var numBullets = 10;
    this.bullets =[];
    this.currentBullet = 0;
    for (var i = 0; i < numBullets; i++) {
        this.bullets[this.bullets.length] = new Bullet()
    }
};

Player.prototype.update = function() {
    this.centerX = this.drawX + (this.width / 2); 
    this.centerY = this.drawY + (this.height / 2);
    this.checkDirection();
    this.checkShooting();
    this.updateAllBullets();
};

Player.prototype.draw = function() {
    this.drawAllBullets();
    ctxEntities.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
};

Player.prototype.checkDirection = function() {
    var newDrawX = this.drawX,
        newDrawY = this.drawY,
        obstacleCollision = false;

    if(this.isUpKey) {
        newDrawY -= this.speed;
        this.srcX = 35; // Facing north image
    }
    if(this.isDownKey) {
        newDrawY += this.speed;
        this.srcX = 0; // Facing south image
    }
    if(this.isRightKey) {
        newDrawX += this.speed;
        this.srcX = 105; // Facing east image
    }
    if(this.isLeftKey) {
        newDrawX -= this.speed;
        this.srcX = 70; // Facing west image
    }

    obstacleCollision = this.checkObstacleCollide(newDrawX, newDrawY);

    if(!obstacleCollision && !outOfBounds(this, newDrawX, newDrawY)) {
        this.drawX = newDrawX;
        this.drawY = newDrawY;
    }
};

Player.prototype.checkObstacleCollide = function(newDrawX, newDrawY) {
    var obstacleCounter = 0,
        newCenterX = newDrawX + (this.width / 2),
        newCenterY = newDrawY + (this.height / 2);

    for (let index = 0; index < obstacles.length; index++) {
        var isSideCollision = obstacles[index].leftX < newCenterX && newCenterX < obstacles[index].rightX;
        var isTopOrBottomCollision = obstacles[index].topY - 20 < newCenterY && newCenterY < obstacles[index].bottomY - 20;
        if(isSideCollision && isTopOrBottomCollision) {
            obstacleCounter = 0;
        }
        else {
            obstacleCounter++;
        }
    }

    if(obstacleCounter === obstacles.length) {
        return false;
    } else {
        return true;
    }
    
};

Player.prototype.checkShooting = function() {
    if(this.isSpacebar && !this.isShooting) {
        this.isShooting = true;
        this.bullets[this.currentBullet].fire(this.centerX, this.centerY);
        this.currentBullet++;
        if(this.currentBullet >= this.bullets.length) {
            this.currentBullet = 0;
        }
    }
    else if(!this.isSpacebar) {
        this.isShooting = false;
    }
};

Player.prototype.updateAllBullets = function() {
    for (let index = 0; index < this.bullets.length; index++) {
        if(this.bullets[index].isFlying) {
            this.bullets[index].update();
        }
    }
};

Player.prototype.drawAllBullets = function() {
    for (let index = 0; index < this.bullets.length; index++) {
        if(this.bullets[index].isFlying) {
            this.bullets[index].draw();
        }
    }
};
//#endregion

function Obstacle(x, y, w ,h) {
    this.drawX = x;
    this.drawY = y;
    this.width = w;
    this.height = h;
    this.leftX = this.drawX;
    this.rightX = this.drawX + this.width;
    this.topY = this.drawY;
    this.bottomY = this.drawY + this.height;
};

function defineObstacles() {
    var treeWidth = 65,
        treeHeight = 90,
        rockDimension = 30,
        bushHeight = 28;

    obstacles = [
        new Obstacle(78, 360, treeWidth, treeHeight),
        new Obstacle(390, 395, treeWidth, treeHeight),
        new Obstacle(415, 102, treeWidth, treeHeight),
        new Obstacle(619, 184, treeWidth, treeHeight),
        new Obstacle(97, 63, rockDimension, rockDimension),
        new Obstacle(296,379, rockDimension, rockDimension),
        new Obstacle(295, 25, 150, bushHeight),
        new Obstacle(570, 138, 150, bushHeight),
        new Obstacle(605, 492, 90, bushHeight)
    ];
};

function checkKey(e, value) {
    var kedID = e.keyCode || e.which; // if not supported
    // up arrow
    if(kedID === 38) {
        player1.isUpKey = value;
        e.preventDefault();
    }
    // right arrow
    if(kedID === 39) {
        player1.isRightKey = value;
        e.preventDefault();
    }
    // down arrow
    if(kedID === 40) {
        player1.isDownKey = value;
        e.preventDefault();
    }
    // left arrow
    if(kedID === 37) {
        player1.isLeftKey = value;
        e.preventDefault();
    }
    // sapcebar
    if(kedID === 32) {
        player1.isSpacebar = value;
        e.preventDefault();
    }
};

// Player object not going out of the borders 
function outOfBounds(a,x,y) { 
    // a=object,x=object x postition, y=object y position
    var newBottomY = y + a.height,
        newTopY = y,
        newRightX = x + a.width,
        newLeftX = x,
        treeLineTop = 5,
        treeLineBottom = 570,
        treeLineRight = 750,
        treeLineLeft = 65;
        
        return newBottomY > treeLineBottom ||
            newTopY < treeLineTop ||
            newRightX > treeLineRight ||
            newLeftX < treeLineLeft;
};

//#region Enemy
function Enemy() {
    this.srcX = 140;
    this.srcY = 600;
    this.width = 45;
    this.height = 54;
    this.drawX = randomRange(0, canvasWidth - this.width);
    this.drawY = randomRange(0, canvasHeight - this.height);
    this.centerX = this.drawX + (this.width / 2);
    this.centerY = this.drawY + (this.height / 2);
    this.targetX = this.centerX;
    this.targetY = this.centerY;
    this.randomMoveTime = randomRange(4000, 10000);
    this.speed = 1;
    this.isDead = false;

    var that = this;
    this.moveInterval = setInterval(function() {
        that.setTargetLocation();
    }, that.randomMoveTime)
};

Enemy.prototype.update = function() {
    this.centerX = this.drawX + (this.width / 2);
    this.centerY = this.drawY + (this.height / 2);
    this.checkDirection();
}

Enemy.prototype.draw = function() {
    ctxEntities.drawImage(imgSprite, this.srcX, this.srcY, this.width, this.height, this.drawX, this.drawY, this.width, this.height);
}

Enemy.prototype.setTargetLocation = function() {
    this.randomMoveTime = randomRange(4000, 10000);
    var minX = this.centerX - 50,
        maxX = this.centerX + 50,
        minY = this.centerY - 50,
        maxY = this.centerY + 50;

    if(minX < 0) {
        minX = 0;
    }

    if(maxX > canvasWidth) {
        maxX = canvasWidth;
    }

    if(minY < 0) {
        minY = 0;
    }

    if(maxY > canvasHeight) {
        maxY = canvasHeight;
    }

    this.targetX = randomRange(minX, maxX);
    this.targetY = randomRange(minY, maxY);
}

Enemy.prototype.checkDirection = function() {
    if(this.centerX < this.targetX) {
        this.drawX += this.speed;
    }
    else if(this.centerX > this.targetX) {
        this.drawX -= this.speed;
    }
    
    if(this.centerY < this.targetY) {
        this.drawY += this.speed;
    }
    else if(this.centerY > this.targetY) {
        this.drawY -= this.speed;
    }
}

Enemy.prototype.die = function() {
    var soundEffect = new Audio("audio/dying.wav");
    soundEffect.play();
    clearInterval(this.moveInterval);
    this.srcX = 185;
    this.isDead = true;
};

function initEnemies() {
    for (let index = 0; index < numEnemies; index++) {
        enemies[enemies.length] = new Enemy();
    }
};

function updateAllEnemies() {
    for (let index = 0; index < enemies.length; index++) {
        enemies[index].update()
    }
};

function drawAllEnemies() {
    for (let index = 0; index < enemies.length; index++) {
        enemies[index].draw()
    }
};
//#endregion

//#region Bullet
function Bullet() {
    this.radius = 2;
    this.width = this.radius * 2;
    this.height = this.radius * 2;
    this.drawX = 0;
    this.drawY = 0;
    this.isFlying = false;
    this.xVel = 0;
    this.yVel = 0;
    this.speed = 6;
};

Bullet.prototype.update = function () {
    this.drawX += this.xVel;
    this.drawY += this.yVel;
    this.checkHitEnemy();
    this.checkHitObstacle();
    this.checkOutOfBounds();
};

Bullet.prototype.draw = function() {
    ctxEntities.fillStyle = "white";
    ctxEntities.beginPath();
    ctxEntities.arc(this.drawX, this.drawY, this.radius, 0, Math.PI * 2, false);
    ctxEntities.closePath();
    ctxEntities.fill();
};

Bullet.prototype.fire = function (startX, startY) {
    var soundEffect = new Audio("audio/shooting.wav");
    soundEffect.play();

    this.drawX = startX;
    this.drawY = startY;

    if (player1.srcX === 0) { // Facing south
        this.xVel = 0;
        this.yVel = this.speed;
    } else if (player1.srcX === 35) { // Facing north
        this.xVel = 0;
        this.yVel = -this.speed;
    } else if (player1.srcX === 70) { // Facing west
        this.xVel = -this.speed;
        this.yVel = 0;
    } else if (player1.srcX === 105) { // Facing east
        this.xVel = this.speed;
        this.yVel = 0;
    }
    
    this.isFlying = true;
};

Bullet.prototype.recycle = function() {
    this.isFlying = false;
};

Bullet.prototype.checkHitEnemy = function() {
    for (let index = 0; index < enemies.length; index++) {
        if(collision(this, enemies[index]) && !enemies[index].isDead) {
            this.recycle();
            enemies[index].die();
        }
    }
};

Bullet.prototype.checkHitObstacle = function() {
    for (let index = 0; index < obstacles.length; index++) {
        if(collision(this, obstacles[index])) {
            this.recycle();
        }
    }
};

Bullet.prototype.checkOutOfBounds = function() {
    if(outOfBounds(this, this.drawX, this.drawY)) {
        this.recycle();
    }
};
//#endregion

function collision(a, b) {
    return a.drawX <= b.drawX + b.width && 
        a.drawX >= b.drawX && 
        a.drawY <= b.drawY + b.height && 
        a.drawY >= b.drawY;
};