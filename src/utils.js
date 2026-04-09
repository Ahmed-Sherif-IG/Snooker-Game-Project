// utils.js
//small math helper functions

//Returns the speed length of a vector 
function mag2(x, y) {
    return Math.sqrt(x*x + y*y);
}

//Keeps a number inside a safe range.
function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

//Distance between two points
function dist2(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx*dx + dy*dy);
}

//Returns a value smoothly blended between a and b using factor t
function lerp(a, b, t) {
    return a + (b - a) * t;
}
