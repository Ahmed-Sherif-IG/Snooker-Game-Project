// Game.js  
//the central controller (game loop)

var Game = function(engine, canvasWidth, canvasHeight) {
    this.engine = engine;
    this.w = canvasWidth;
    this.h = canvasHeight;

    // components
    this.table = new SnookerTable(this, engine);
    this.modeManager = new ModeManager(this, engine);
    this.anim = new AnimationManager(this);

    // game objects
    this.cueBall = null;
    this.balls = [];
    this.cue = null;

    this.mode = 1; // default mode

    this.init();
};


// Initial setup

Game.prototype.init = function() {
    this.table.computeScale();
    this.table.createCushions();
    this.loadMode(1);
};


// LOAD MODE (1,2,3)

Game.prototype.loadMode = function(mode) {
    this.mode = mode;

    this.clearBalls();

    this.balls = this.modeManager.createBallsForMode(mode);
    this.cueBall = this.modeManager.placeCueBallDefault();

    this.cue = new Cue(this, this.cueBall);
};


// CLEAR ALL BALLS

Game.prototype.clearBalls = function() {
    var World = Matter.World;

    for (var i = 0; i < this.balls.length; i++) {
        try { World.remove(this.engine.world, this.balls[i].body); }
        catch (e) {}
    }
    this.balls = [];

    if (this.cueBall) {
        try { World.remove(this.engine.world, this.cueBall.body); }
        catch (e) {}
    }
    this.cueBall = null;
};


// UPDATE LOOP

Game.prototype.update = function() {
    Matter.Engine.update(this.engine);

    // update object balls
    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].update();
    }

    // update cue ball
    if (this.cueBall) this.cueBall.update();

    // update cue + animations
    if (this.cue) this.cue.update();
    this.anim.update();
};


// DRAW LOOP
Game.prototype.draw = function(p) {
    this.table.draw(p);

    // draw all object balls
    for (var i = 0; i < this.balls.length; i++) {
        this.balls[i].draw(p);
    }

    // draw cue ball
    if (this.cueBall) this.cueBall.draw(p);

    // draw pocket effects
    this.anim.draw(p);

    // draw cue (if cue ball is present)
    if (this.cue && this.cueBall && !this.cueBall.isPocketed) {
        this.cue.draw(p);
    }

    // UI
    this.drawUI(p);
};


// UI TEXT 

Game.prototype.drawUI = function(p) {
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(16);
    p.stroke(0, 180);
    p.strokeWeight(6);
    p.fill(255);
    p.text("Mode " + this.mode, 18, 18);

    p.noStroke();
    p.fill(230);
    p.textSize(12);

    p.text("Press 1 (Mode1)  2 (Mode2)  3 (Mode3). Drag cue ball in Mode 3.", 18, 44);
    p.text("Keyboard: LEFT/RIGHT rotate aim, UP/DOWN power, SPACE shoot.", 18, 60);
    

    if (this.cue) {
        p.text("KB Power: " + this.cue.kbPower, 18, 100);
    }
};


// Input buttons(controls)

Game.prototype.mousePressed = function(x, y) {
    if (this.cue) this.cue.mousePressed(x, y);
};

Game.prototype.mouseDragged = function(x, y) {
    if (this.cue) this.cue.mouseDragged(x, y);
};

Game.prototype.mouseReleased = function(x, y) {
    if (this.cue) this.cue.mouseReleased(x, y);
};

Game.prototype.keyPressed = function(key, keyCode) {
    if (key === "1") this.loadMode(1);
    if (key === "2") this.loadMode(2);
    if (key === "3") this.loadMode(3);

    if (this.cue) this.cue.keyPressed(key, keyCode);
};


