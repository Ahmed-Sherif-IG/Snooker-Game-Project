// SnookerTable.js
//builds and draws the table + cushions + pockets

var SnookerTable = function(game, engine) {
    this.game = game;
    this.engine = engine;

    this.length = 0;
    this.width = 0;
    this.ballDiameter = 0;
    this.pocketDiameter = 0;
    this.dRadius = 0;

    this.cushions = [];
    this.pockets = [];
};

SnookerTable.prototype.computeScale = function() {
    this.length = this.game.w * 0.94;
    this.width = this.length * 0.5;

    this.ballDiameter = this.width / 36;
    this.pocketDiameter = this.ballDiameter * 1.5;
    this.dRadius = this.width * 0.18;
};

SnookerTable.prototype.createCushions = function() {
    var cx = this.game.w / 2;
    var cy = this.game.h / 2;
    var halfL = this.length / 2;
    var halfW = this.width / 2;

    var cushionThickness = this.ballDiameter * 2.2;
    var gap = this.pocketDiameter * 1.6;
    var innerSegment = (this.length / 2 - gap / 2);

    var Bodies = Matter.Bodies;
    var World = Matter.World;

    this.cushions = [];

    // Top cushions
    this.cushions.push(
        Bodies.rectangle(
            cx - innerSegment / 2,
            cy - halfW - cushionThickness / 2,
            innerSegment,
            cushionThickness,
            { isStatic: true, restitution: 0.78 }
        )
    );
    this.cushions.push(
        Bodies.rectangle(
            cx + innerSegment / 2,
            cy - halfW - cushionThickness / 2,
            innerSegment,
            cushionThickness,
            { isStatic: true, restitution: 0.78 }
        )
    );

    // Bottom cushions
    this.cushions.push(
        Bodies.rectangle(
            cx - innerSegment / 2,
            cy + halfW + cushionThickness / 2,
            innerSegment,
            cushionThickness,
            { isStatic: true, restitution: 0.78 }
        )
    );
    this.cushions.push(
        Bodies.rectangle(
            cx + innerSegment / 2,
            cy + halfW + cushionThickness / 2,
            innerSegment,
            cushionThickness,
            { isStatic: true, restitution: 0.78 }
        )
    );

    // Vertical cushions 
    var vertH = this.width - this.pocketDiameter * 2.0;

    this.cushions.push(
        Bodies.rectangle(
            cx - halfL - cushionThickness / 2,
            cy,
            cushionThickness,
            vertH,
            { isStatic: true, restitution: 0.78 }
        )
    );
    this.cushions.push(
        Bodies.rectangle(
            cx + halfL + cushionThickness / 2,
            cy,
            cushionThickness,
            vertH,
            { isStatic: true, restitution: 0.78 }
        )
    );

    World.add(this.engine.world, this.cushions);

    // Pocket coordinates
    this.pockets = [
        { x: cx - halfL, y: cy - halfW },
        { x: cx,         y: cy - halfW },
        { x: cx + halfL, y: cy - halfW },
        { x: cx - halfL, y: cy + halfW },
        { x: cx,         y: cy + halfW },
        { x: cx + halfL, y: cy + halfW }
    ];
};

SnookerTable.prototype.draw = function(p) {
    var cx = this.game.w / 2;
    var cy = this.game.h / 2;
    var halfL = this.length / 2;
    var halfW = this.width / 2;

    // Table frame
    p.noStroke();
    p.rectMode(p.CENTER);

    p.fill(60, 30, 12);
    p.rect(cx, cy, this.length + 140, this.width + 140, 12);

    p.fill(95, 48, 16);
    p.rect(cx, cy, this.length + 100, this.width + 100, 10);

    p.fill(120, 64, 20);
    p.rect(cx, cy, this.length + 60, this.width + 60, 8);

    p.fill(24, 115, 64);
    p.rect(cx, cy, this.length, this.width);

    // Pockets
    for (var i = 0; i < this.pockets.length; i++) {
        var pk = this.pockets[i];
        var isSide = (i === 1 || i === 4);

        var rim = isSide ? this.pocketDiameter * 1.2 : this.pocketDiameter * 1.6;
        var hole = isSide ? this.pocketDiameter * 0.9 : this.pocketDiameter * 1.1;

        p.push();
        p.translate(pk.x, pk.y);
        p.noStroke();
        p.fill(200, 160, 40);
        p.ellipse(0, 0, rim);
        p.fill(240, 200, 80);
        p.ellipse(0, 0, rim * 0.78);
        p.fill(6);
        p.ellipse(0, 0, hole);
        p.pop();
    }

    // Baulk line
    p.stroke(255);
    p.strokeWeight(2);
    var baulkX = cx - halfL + this.length * 0.25;

    var dashY1 = cy - halfW;
    var dashY2 = cy + halfW;

    var dash = 10;
    var gap = 8;
    var y = dashY1;

    while (y < dashY2) {
        p.line(baulkX, y, baulkX, Math.min(y + dash, dashY2));
        y += dash + gap;
    }

    // D-zone arc
    p.noFill();
    p.stroke(255);
    p.strokeWeight(3);

    var bigD = this.dRadius * 1.3;
    p.arc(baulkX, cy, bigD * 2, bigD * 2, p.HALF_PI, -p.HALF_PI);

    // Rail dots
    var dotCount = 10;
    var spacing = this.length / (dotCount + 1);
    for (var k = 1; k <= dotCount; k++) {
        var dx = cx - halfL + spacing * k;
        p.fill(230, 190, 70);
        p.noStroke();
        p.ellipse(dx, cy - halfW - 20, this.ballDiameter * 0.5);
        p.ellipse(dx, cy + halfW + 20, this.ballDiameter * 0.5);
    }

    // Border
    p.noFill();
    p.stroke(20, 10, 6, 140);
    p.strokeWeight(1.5);
    p.rect(cx, cy, this.length + 58, this.width + 58, 8);
};
