/*
OVERVIEW & DESIGN APPROACH

This project implements an interactive snooker table using p5.js for rendering
and Matter.js for physics simulation. The main design goal was to create a
realistic yet responsive snooker experience while keeping the code modular,
readable, and easy to maintain.

The program follows an object-oriented design. Each major element of the game,
including the table, balls, cue, animations, and overall game logic, is
implemented as a separate class with a clear responsibility. This approach
reduces duplicated logic and allows individual components to be modified or
tested without affecting the rest of the system.

The Game class acts as the central controller. It manages the physics engine,
initialises the table and balls, handles mode switching, and coordinates updates
and rendering each frame. User input is routed through the Game class to the Cue
class, keeping interaction logic separate from physics and drawing code.

PHYSICS & INTERACTION

All ball movement and collisions are handled using the Matter.js physics engine.
Each ball is represented as a circular rigid body with carefully chosen values
for restitution, friction, air resistance, and density. The cue ball uses
slightly higher friction and density so that it behaves more realistically and
comes to rest sooner than the object balls.

User interaction is centred around the cue system. Mouse input is used for
charge-based shots: clicking near the cue ball begins charging, dragging away
from the ball increases shot power, and releasing the mouse applies a force in
the aiming direction. This force is calculated from the drag distance and mapped
to a maximum power value before being applied using
Matter.Body.applyForce().

Keyboard input provides an alternative control method. The arrow keys adjust shot
power in discrete steps, and pressing the space bar fires an instant shot using
the selected power level. This avoids unnecessary complexity while still
allowing precise control without relying on the mouse.

To maintain stable physics behaviour, a post-placement overlap check is applied
when balls are created. This ensures that no balls begin in overlapping states,
which could otherwise cause unstable or unpredictable collisions.

GAME MODES & CODE STRUCTURE

The application supports three table modes that can be switched at runtime using
the number keys. Mode 1 recreates the official snooker layout, with coloured
balls placed at standard positions and red balls arranged in a triangle. Mode 2
introduces variation by generating multiple random clusters of red balls while
keeping the coloured balls fixed. Mode 3 provides a practice-focused layout
where balls are arranged in a cross formation and the cue ball can be manually
repositioned.

All mode-specific logic is contained within the ModeManager class, which is
responsible only for ball placement and initial setup. This separation makes it
easy to modify or extend game modes without affecting other parts of the
program.

As a creative extension, additional visual and physical feedback was added to
enhance realism. The cue ball displays a speed-based halo and direction arrow
while moving, providing immediate feedback on motion. A temporary restitution
boost is also applied after each shot, making collisions feel more dynamic while
automatically restoring original values to preserve stable physics behaviour.

*/


// main.js
//p5 setup, draw, and input routing

var engine;
var game;

function setup() {
    createCanvas(1200, 700);

    engine = Matter.Engine.create();
    engine.world.gravity.x = 0;
    engine.world.gravity.y = 0;

    // Create the whole game controller
    game = new Game(engine, width, height);

    noSmooth();
}

function draw() {
    background(18, 80, 40);

    // Update physics + internal logic
    game.update();

    // Draw everything (table, balls, cue, UI)
    game.draw(this);
}


//INPUT to Game.js

function mousePressed() {
    if (game) game.mousePressed(mouseX, mouseY);
}

function mouseDragged() {
    if (game) game.mouseDragged(mouseX, mouseY);
}

function mouseReleased() {
    if (game) game.mouseReleased(mouseX, mouseY);
}

function keyPressed() {
    if (game) game.keyPressed(key, keyCode);
}


