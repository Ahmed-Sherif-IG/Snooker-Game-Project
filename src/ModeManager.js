// ModeManager.js
//sets up balls for Mode 1, 2, and 3


var ModeManager = function(game, engine) {
    this.game = game;
    this.engine = engine;
};


// Create balls for a selected mode
ModeManager.prototype.createBallsForMode = function(mode) {
    var list = [];

    if (mode === 1) list = this.createMode1();
    else if (mode === 2) list = this.createMode2();
    else list = this.createMode3();

    this.preventOverlap(list);
    this.zeroVelocities(list);

    return list;
};


// MODE 1 — Official Formation

ModeManager.prototype.createMode1 = function() {
    var tbl = this.game.table;
    var cx = this.game.w / 2;
    var cy = this.game.h / 2;
    var balls = [];

    // Colour balls
    balls.push(this.makeBall(cx + tbl.length * 0.30, cy, "black"));
    balls.push(this.makeBall(cx + tbl.length * 0.10, cy, "pink"));
    balls.push(this.makeBall(cx, cy, "blue"));

    var leftX = cx - tbl.length / 2;
    var baulkX = leftX + tbl.length * 0.25;

    balls.push(this.makeBall(baulkX, cy, "brown"));
    balls.push(this.makeBall(baulkX, cy - tbl.dRadius, "green"));
    balls.push(this.makeBall(baulkX, cy + tbl.dRadius, "yellow"));

    // Triangle of reds
    var startX = cx + tbl.length * 0.16;
    var startY = cy;
    var rowGap = tbl.ballDiameter * 1.12;

    for (var r = 0; r < 5; r++) {
        for (var c = 0; c <= r; c++) {
            var x = startX + r * rowGap;
            var y = startY + (c - r / 2) * rowGap;
            balls.push(this.makeBall(x, y, "red"));
        }
    }

    return balls;
};


// MODE 2 — Random clusters of reds

ModeManager.prototype.createMode2 = function() {
    var tbl = this.game.table;
    var cx = this.game.w / 2;
    var cy = this.game.h / 2;
    var balls = [];

    // Colour balls
    balls.push(this.makeBall(cx + tbl.length * 0.30, cy, "black"));
    balls.push(this.makeBall(cx + tbl.length * 0.10, cy, "pink"));
    balls.push(this.makeBall(cx, cy, "blue"));

    var leftX = cx - tbl.length / 2;
    var baulkX = leftX + tbl.length * 0.25;
    balls.push(this.makeBall(baulkX, cy, "brown"));
    balls.push(this.makeBall(baulkX, cy - tbl.dRadius, "green"));
    balls.push(this.makeBall(baulkX, cy + tbl.dRadius, "yellow"));

    // Reds in random clusters
    var clusters = Math.floor(Math.random() * 2) + 2; // 2 to 3 clusters
    var clusterAreaX = cx + tbl.length * 0.05;

    for (var i = 0; i < clusters; i++) {
        var baseX = clusterAreaX + Math.random() * tbl.length * 0.30 - tbl.length * 0.12;
        var baseY = cy + (Math.random() * tbl.width * 0.50 - tbl.width * 0.25);

        var rows = Math.floor(Math.random() * 3) + 2;

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c <= r; c++) {
                var jx = (Math.random() - 0.5) * tbl.ballDiameter * 0.36;
                var jy = (Math.random() - 0.5) * tbl.ballDiameter * 0.36;
                var x = baseX + r * tbl.ballDiameter * 1.02 + jx;
                var y = baseY + (c - r / 2) * tbl.ballDiameter * 1.02 + jy;
                balls.push(this.makeBall(x, y, "red"));
            }
        }
    }

    return balls;
};


// MODE 3 — Practice cross pattern

ModeManager.prototype.createMode3 = function() {
    var tbl = this.game.table;
    var cx = this.game.w / 2;
    var cy = this.game.h / 2;
    var balls = [];

    // Colour balls
    balls.push(this.makeBall(cx + tbl.length * 0.30, cy, "black"));
    balls.push(this.makeBall(cx + tbl.length * 0.10, cy, "pink"));
    balls.push(this.makeBall(cx, cy, "blue"));

    var leftX = cx - tbl.length / 2;
    var baulkX = leftX + tbl.length * 0.25;

    balls.push(this.makeBall(baulkX, cy, "brown"));
    balls.push(this.makeBall(baulkX, cy - tbl.dRadius, "green"));
    balls.push(this.makeBall(baulkX, cy + tbl.dRadius, "yellow"));

    // Vertical line
    var startX = cx + tbl.length * 0.10;
    var startY = cy - tbl.ballDiameter * 3;

    for (var i = 0; i < 7; i++) {
        balls.push(this.makeBall(startX, startY + i * (tbl.ballDiameter * 1.05), "red"));
    }

    // Horizontal line
    var horStartY = cy;
    var horStartX = startX - tbl.ballDiameter * 3;

    for (var j = 0; j < 7; j++) {
        balls.push(this.makeBall(horStartX + j * (tbl.ballDiameter * 1.05), horStartY, "red"));
    }

    return balls;
};


// Ball factory
ModeManager.prototype.makeBall = function(x, y, colorName) {
    return new Ball(this.game, this.engine, x, y, this.game.table.ballDiameter / 2, colorName);
};


// Prevent overlapping spawn positions
ModeManager.prototype.preventOverlap = function(ballList) {
    var dMin = this.game.table.ballDiameter * 0.98;

    for (var i = 0; i < ballList.length; i++) {
        for (var j = i + 1; j < ballList.length; j++) {
            var a = ballList[i];
            var b = ballList[j];

            var dx = b.body.position.x - a.body.position.x;
            var dy = b.body.position.y - a.body.position.y;
            var dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < dMin && dist > 0) {
                var overlap = (dMin - dist) * 0.5;
                Matter.Body.translate(b.body, {
                    x: (dx / dist) * overlap,
                    y: (dy / dist) * overlap
                });
            }
            if (dist === 0) {
                Matter.Body.translate(b.body, {
                    x: Math.random() * 2 - 1,
                    y: Math.random() * 2 - 1
                });
            }
        }
    }
};


// Stop initial jitter

ModeManager.prototype.zeroVelocities = function(ballList) {
    for (var i = 0; i < ballList.length; i++) {
        try {
            Matter.Body.setVelocity(ballList[i].body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(ballList[i].body, 0);
        } catch (e) {}
    }
};


// Cue Ball placement inside the D

ModeManager.prototype.placeCueBallDefault = function() {
    var tbl = this.game.table;
    var cx = this.game.w / 2;
    var cy = this.game.h / 2;

    var leftX = cx - tbl.length / 2;
    var baulkX = leftX + tbl.length * 0.25;

    var px = baulkX + tbl.dRadius * 0.45;
    var py = cy;

    var BallClass = Ball;

    var cue = new BallClass(this.game, this.engine, px, py, tbl.ballDiameter / 2, "white");

    cue.body.frictionAir = 0.018;
    cue.body.restitution = 0.86;
    cue.body.friction = 0.06;
    cue.body.density = 0.0028;

    return cue;
};
