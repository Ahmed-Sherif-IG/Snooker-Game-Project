// Cue.js
//aiming, shooting, dragging cue ball

var Cue = function(game, cueBall) {
    this.game = game;
    this.cueBall = cueBall;

    // mouse & keyboard state
    this.charging = false;
    this.mousePull = 0;
    this.isMouseDown = false;
    this.draggingCueBall = false;
    this.dragOffset = { x: 0, y: 0 };

    // keyboard aim
    this.keyboardAim = 0;
    this.kbPower = 30;

    // constants
    this.maxPull = 180;
    this.maxPower = 0.045;
    this.minShootDist = 6;

    this.cueFlash = 0;
};


// PER-FRAME UPDATE 

Cue.prototype.update = function() {
    if (this.cueFlash > 0) {
        this.cueFlash -= 4;
        if (this.cueFlash < 0) this.cueFlash = 0;
    }
};


// DRAW
Cue.prototype.draw = function(p) {
    if (!this.cueBall || this.cueBall.isPocketed) return;

    var cx = this.cueBall.body.position.x;
    var cy = this.cueBall.body.position.y;

    var mx = clamp(p.mouseX,
        (this.game.w / 2 - this.game.table.length / 2) + this.game.table.ballDiameter,
        (this.game.w / 2 + this.game.table.length / 2) - this.game.table.ballDiameter
    );

    var my = clamp(p.mouseY,
        (this.game.h / 2 - this.game.table.width / 2) + this.game.table.ballDiameter,
        (this.game.h / 2 + this.game.table.width / 2) - this.game.table.ballDiameter
    );

    if (this.game.mode === 3 && this.draggingCueBall) {
        p.stroke(255, 80);
        p.strokeWeight(2);
        p.line(cx, cy, mx, my);
        return;
    }

    var baseAngle = Math.atan2(my - cy, mx - cx);
    var finalAngle = baseAngle + this.keyboardAim;
    var ax = Math.cos(finalAngle);
    var ay = Math.sin(finalAngle);

    var pull = (this.isMouseDown && this.charging) ? this.mousePull : 0;

    // Draw the cue stick
    var stickLength = this.game.table.ballDiameter * 7;
    var tipX = cx - ax * (this.game.table.ballDiameter * 0.5 + 12 + pull);
    var tipY = cy - ay * (this.game.table.ballDiameter * 0.5 + 12 + pull);
    var buttX = tipX - ax * stickLength;
    var buttY = tipY - ay * stickLength;

    // guideline
    p.stroke(255, 200 - Math.min(pull, 150));
    p.strokeWeight(1);
    p.line(cx, cy, tipX + ax * 40, tipY + ay * 40);

    // cue wood
    p.push();
    p.strokeWeight(6);
    p.stroke(80, 40, 10);
    p.line(buttX, buttY, tipX, tipY);

    p.strokeWeight(10);
    p.stroke(190, 140, 80);
    p.point(buttX + ax * 12, buttY + ay * 12);
    p.pop();

    // charging indicator arc
    if (pull > 6) {
        var pct = pull / this.maxPull;
        var size = 24 + pct * 20;

        p.noFill();
        p.stroke(255, 80 + pct * 140);
        p.strokeWeight(3);
        p.arc(cx - ax * 30, cy - ay * 30, size, size,
            Math.atan2(-ay, -ax) - 0.9,
            Math.atan2(-ay, -ax) + 0.9
        );
    }

    // cue flash effect
    if (this.cueFlash > 0) {
        p.push();
        p.noFill();
        p.stroke(255, 220, 120, this.cueFlash * 2);
        p.strokeWeight(2 + this.cueFlash * 0.06);
        p.ellipse(cx, cy, this.game.table.ballDiameter * 2 + this.cueFlash * 1.6);
        p.pop();
    }
};


// INPUT HANDLERS

Cue.prototype.mousePressed = function(x, y) {
    this.isMouseDown = true;
    var cx = this.cueBall.body.position.x;
    var cy = this.cueBall.body.position.y;

    if (mag2(this.cueBall.body.velocity.x, this.cueBall.body.velocity.y) < 0.02) {
        // Drag cue ball (Mode 3)
        var d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        if (d < this.game.table.ballDiameter && this.game.mode === 3) {
            this.draggingCueBall = true;
            this.dragOffset.x = cx - x;
            this.dragOffset.y = cy - y;
            Matter.Body.setVelocity(this.cueBall.body, { x: 0, y: 0 });
            return;
        }

        // Start charging
        this.charging = true;
        this.mousePull = 0;
    }
};

Cue.prototype.mouseDragged = function(x, y) {
    if (this.draggingCueBall) {
        var nx = x + this.dragOffset.x;
        var ny = y + this.dragOffset.y;

        // table bounds
        var left = (this.game.w / 2 - this.game.table.length / 2) + this.game.table.ballDiameter;
        var right = (this.game.w / 2 + this.game.table.length / 2) - this.game.table.ballDiameter;
        var top = (this.game.h / 2 - this.game.table.width / 2) + this.game.table.ballDiameter;
        var bottom = (this.game.h / 2 + this.game.table.width / 2) - this.game.table.ballDiameter;

        nx = clamp(nx, left, right);
        ny = clamp(ny, top, bottom);

        Matter.Body.setPosition(this.cueBall.body, { x: nx, y: ny });
        return;
    }

    if (this.charging) {
        var cx = this.cueBall.body.position.x;
        var cy = this.cueBall.body.position.y;

        var dist = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
        this.mousePull = dist;
    }
};

Cue.prototype.mouseReleased = function(x, y) {
    this.isMouseDown = false;

    if (this.draggingCueBall) {
        this.draggingCueBall = false;
        return;
    }

    if (this.charging) {
        this.shootWithMouse(x, y);
    }

    this.charging = false;
    this.mousePull = 0;
};


// MOUSE SHOT
Cue.prototype.shootWithMouse = function(x, y) {
    var cx = this.cueBall.body.position.x;
    var cy = this.cueBall.body.position.y;

    var aimX = x - cx;
    var aimY = y - cy;

    var aimDist = Math.sqrt(aimX * aimX + aimY * aimY);
    if (aimDist < this.minShootDist) return;

    var angle = Math.atan2(aimY, aimX) + this.keyboardAim;

    var pull = clamp(this.mousePull, 0, this.maxPull);
    var force = (pull / this.maxPull) * this.maxPower;

    Matter.Body.applyForce(this.cueBall.body, this.cueBall.body.position,
        { x: Math.cos(angle) * force, y: Math.sin(angle) * force }
    );

    this.triggerCueFlash();
    this.game.anim.triggerRestBoost();
};


// KEYBOARD HANDLING
                                            
Cue.prototype.keyPressed = function(key, keyCode) {
    if (!this.cueBall) return;

    // aim rotation
    if (keyCode === 37) this.keyboardAim -= 0.1;
    if (keyCode === 39) this.keyboardAim += 0.1;

    // power control
    if (keyCode === 38) this.kbPower = clamp(this.kbPower + 6, 0, this.maxPull);
    if (keyCode === 40) this.kbPower = clamp(this.kbPower - 6, 0, this.maxPull);

    // space = shoot
    if (key === " ") {
        var speed = mag2(this.cueBall.body.velocity.x, this.cueBall.body.velocity.y);
        if (speed < 0.02) this.shootKeyboard();
    }
};



// KEYBOARD SHOT
Cue.prototype.shootKeyboard = function() {
    var cx = this.cueBall.body.position.x;
    var cy = this.cueBall.body.position.y;

    // aim uses mouse direction + keyboard rotation
    var mx = clamp(mouseX,
        (this.game.w / 2 - this.game.table.length / 2) + this.game.table.ballDiameter,
        (this.game.w / 2 + this.game.table.length / 2) - this.game.table.ballDiameter
    );

    var my = clamp(mouseY,
        (this.game.h / 2 - this.game.table.width / 2) + this.game.table.ballDiameter,
        (this.game.h / 2 + this.game.table.width / 2) - this.game.table.ballDiameter
    );

    var baseAngle = Math.atan2(my - cy, mx - cx);
    var angle = baseAngle + this.keyboardAim;

    var force = (this.kbPower / this.maxPull) * this.maxPower;
    if (force < 0.004) force = 0.004;

    Matter.Body.applyForce(this.cueBall.body, this.cueBall.body.position,
        { x: Math.cos(angle) * force, y: Math.sin(angle) * force }
    );

    this.triggerCueFlash();
    this.game.anim.triggerRestBoost();
};


// FLASH EFFECT

Cue.prototype.triggerCueFlash = function() {
    this.cueFlash = 60;
};
