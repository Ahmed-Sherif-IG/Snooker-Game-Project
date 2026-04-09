// Ball.js
//ball physics + drawing + trail + pocket detection


var Ball = function(game, engine, x, y, radius, colorName) {
    this.game = game;
    this.engine = engine;

    this.colorName = colorName;
    this.radius = radius;
    this.trail = [];
    this.isPocketed = false;
    this.visualScale = 1.0;

    var Bodies = Matter.Bodies;
    var World = Matter.World;

    this.body = Bodies.circle(x, y, radius, {
        restitution: 0.90,
        friction: 0.02,
        frictionAir: 0.008,
        density: 0.0016,
        inertia: Infinity
    });

    World.add(engine.world, this.body);

    this.origRest = this.body.restitution;
};

Ball.prototype.update = function() {
    if (this.isPocketed) return;

    var v = this.body.velocity;
    var speed = mag2(v.x, v.y);

    if (speed > 0.0002) {
        this.trail.push({ x: this.body.position.x, y: this.body.position.y, alpha: 180 });
    }
    if (this.trail.length > 18) this.trail.shift();

    this.checkPocket();
};

Ball.prototype.draw = function(p) {
    if (this.isPocketed) return;

    // Trail
    p.noStroke();
    for (var i = 0; i < this.trail.length; i++) {
        var t = this.trail[i];
        p.fill(255, t.alpha * 0.6);
        p.ellipse(t.x, t.y, this.radius * 0.9);
        t.alpha -= 6;
    }

    // Ball
    var c = this.getColor();
    p.noStroke();
    p.fill(c.r, c.g, c.b);

    p.push();
    p.translate(this.body.position.x, this.body.position.y);
    p.scale(this.visualScale);
    p.ellipse(0, 0, this.radius * 2);
    p.pop();
};

Ball.prototype.getColor = function() {
    if (this.colorName === "red") return { r:220, g:20, b:20 };
    if (this.colorName === "yellow") return { r:255, g:230, b:120 };
    if (this.colorName === "green") return { r:50,  g:200, b:80 };
    if (this.colorName === "brown") return { r:140, g:80,  b:30 };
    if (this.colorName === "blue")  return { r:40,  g:90,  b:230 };
    if (this.colorName === "pink")  return { r:255, g:120, b:170 };
    if (this.colorName === "black") return { r:10,  g:10,  b:10 };
    if (this.colorName === "white") return { r:245, g:245, b:245 };
    return { r:255, g:255, b:255 };
};

Ball.prototype.checkPocket = function() {
    var pockets = this.game.table.pockets;
    var pd = this.game.table.pocketDiameter;

    for (var i = 0; i < pockets.length; i++) {
        var pk = pockets[i];
        var d = dist2(this.body.position.x, this.body.position.y, pk.x, pk.y);

        if (d < pd * 0.95) {

            if (this.isPocketed) return;
            this.isPocketed = true;

            this.beginPocketAnimation();

            return;
        }
    }
};

Ball.prototype.beginPocketAnimation = function() {
    var self = this;
    var World = Matter.World;

    var steps = 6;
    var step = 0;

    var shrink = setInterval(function() {
        step++;
        self.visualScale = Math.max(0.05, 1.0 - step / (steps + 1));

        if (step >= steps) {
            clearInterval(shrink);

            try { World.remove(self.engine.world, self.body); } catch(e){}

            if (self.colorName === "white") {
                self.game.cueBall = null;
                setTimeout(function() {
                    self.game.cueBall = self.game.modeManager.placeCueBallDefault();
                    self.game.cue = new Cue(self.game, self.game.cueBall);
                }, 1000);
            }
        }
    }, 18);

    this.game.anim.addPocketEffect(
        this.body.position.x,
        this.body.position.y,
        this.game.table.pocketDiameter
    );
};
