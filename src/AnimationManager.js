// AnimationManager.js
// pocket animations + restitution boost

var AnimationManager = function(game) {
    this.game = game;

    this.effects = [];
    this.restFrames = 0;
    this.restBoost = 0.10;
    this.restDuration = 36;
};

//POCKET EFFECT

AnimationManager.prototype.addPocketEffect = function(x, y, size) {
    this.effects.push({
        x: x,
        y: y,
        life: 60,
        size: size
    });
};


// RESTITUTION BOOST

AnimationManager.prototype.triggerRestBoost = function() {
    var balls = this.game.balls;

    if (this.game.cueBall) balls = balls.concat([this.game.cueBall]);

    for (var i = 0; i < balls.length; i++) {
        if (!balls[i] || !balls[i].body) continue;
        balls[i].origRest = balls[i].body.restitution;
        Matter.Body.set(balls[i].body, "restitution", balls[i].origRest + this.restBoost);
    }

    this.restFrames = this.restDuration;
};

AnimationManager.prototype.update = function() {
    if (this.restFrames > 0) {
        this.restFrames--;
        if (this.restFrames === 0) {
            this.restoreRestitution();
        }
    }

    // Update pocket effects
    for (var i = this.effects.length - 1; i >= 0; i--) {
        this.effects[i].life--;
        if (this.effects[i].life <= 0) this.effects.splice(i, 1);
    }
};

AnimationManager.prototype.restoreRestitution = function() {
    var balls = this.game.balls.concat([this.game.cueBall]);

    for (var i = 0; i < balls.length; i++) {
        var b = balls[i];
        if (b && b.body && b.origRest !== undefined) {
            Matter.Body.set(b.body, "restitution", b.origRest);
        }
    }
};


// DRAW EFFECTS

AnimationManager.prototype.draw = function(p) {
    for (var i = 0; i < this.effects.length; i++) {
        var e = this.effects[i];

        p.push();
        p.translate(e.x, e.y);

        p.noFill();
        p.stroke(255, 180, 100, p.map(e.life, 0, 60, 0, 200));
        p.strokeWeight(p.map(e.life, 0, 60, 1, e.size * 0.12));

        p.ellipse(0, 0, p.map(e.life, 0, 60, e.size * 0.2, e.size * 1.8));
        p.pop();
    }
};
