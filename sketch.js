let positions = [];
let stickLength = 1000; // Length of the stick
let stickThickness = 10; // Thickness of the stick
let showWeb = false;
let minDistance = 200; // Minimum distance between vortices
let showTextWindow = false; // Variable to manage the display of the text window
let textWindowOpacity = 255; // Variable to manage the opacity of the text window
let fadeStartTime = 0; // Variable to track the start time of the fade effect

function preload() {
  inconsolata = loadFont("Inconsolata.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  
  // Initialize positions for each vortex with minimum distance constraint
  while (positions.length < 7) {
    let x = random(-width / 2 + 100, width / 2 - 100);
    let y = random(-height / 2 + 100, height / 2 - 100);
    let z = random(-130, 200); // Updated z range
    let newPos = createVector(x, y, z);
    if (isFarEnough(newPos)) {
      positions.push(newPos);
    }
  }
}

function draw() {
  background(0, 0, 255); // Clear blue background

  // Update positions of vortices to create floating effect
  updatePositions();

  // Draw the web connecting the points in 3D mode if required
  if (showWeb) {
    drawWeb(positions);
  }

  // Draw cubes at each vortex position
  drawCubes(positions);

  // Draw stick at cursor position
  let cursor3D = get3DCursor();
  drawStick(cursor3D);

  // Check collision between stick and cubes
  showWeb = false; // Reset showWeb
  for (let i = 0; i < positions.length; i++) {
    let cubePos = positions[i];
    let collided = checkCollision(cursor3D, stickLength, stickThickness, cubePos, 50); // Assume cube size is 50x50x50
    if (collided) {
      showWeb = true;
      break; // If any collision is detected, no need to check further
    }
  }

  // Draw the text window if a cube is clicked
  drawTextWindow();
}

function updatePositions() {
  for (let i = 0; i < positions.length; i++) {
    positions[i].add(p5.Vector.random3D().mult(0.5)); // Randomly update position
  }
}

function drawWeb(positions) {
  stroke(255); // White color for the web
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      line(positions[i].x, positions[i].y, positions[i].z, positions[j].x, positions[j].y, positions[j].z); // Draw line between each pair of points
    }
  }
}

function drawCubes(positions) {
  noStroke(); // No stroke for the cubes
  fill(255, 0, 0); // Red color for the cubes
  for (let i = 0; i < positions.length; i++) {
    push();
    translate(positions[i].x, positions[i].y, positions[i].z); // Move to vortex position
    box(50); // Draw cube
    pop();
  }
}

function get3DCursor() {
  // Convert mouse position to 3D coordinates
  let x = mouseX - width / 2;
  let y = mouseY - height / 2;
  let cursor3D = createVector(x, y, 0); // Assuming the cursor is on the XY plane
  return cursor3D;
}

function drawStick(position) {
  // Draw the stick as a long, thick box
  push();
  translate(position.x, position.y, position.z);
  fill(255, 0, 0); // Red color
  box(stickThickness, stickThickness, stickLength);
  pop();
}

function checkCollision(point, length, thickness, cubePos, cubeSize) {
  // Check if the stick (box) intersects with the cube
  let stickMinX = point.x - thickness / 2;
  let stickMaxX = point.x + thickness / 2;
  let stickMinY = point.y - thickness / 2;
  let stickMaxY = point.y + thickness / 2;
  let stickMinZ = point.z;
  let stickMaxZ = point.z + length;

  let cubeMinX = cubePos.x - cubeSize / 2;
  let cubeMaxX = cubePos.x + cubeSize / 2;
  let cubeMinY = cubePos.y - cubeSize / 2;
  let cubeMaxY = cubePos.y + cubeSize / 2;
  let cubeMinZ = cubePos.z - cubeSize / 2;
  let cubeMaxZ = cubePos.z + cubeSize / 2;

  return (stickMinX <= cubeMaxX && stickMaxX >= cubeMinX &&
          stickMinY <= cubeMaxY && stickMaxY >= cubeMinY &&
          stickMinZ <= cubeMaxZ && stickMaxZ >= cubeMinZ);
}

function isFarEnough(newPos) {
  for (let i = 0; i < positions.length; i++) {
    if (dist(newPos.x, newPos.y, newPos.z, positions[i].x, positions[i].y, positions[i].z) < minDistance) {
      return false;
    }
  }
  return true;
}

function mousePressed() {
  let cursor3D = get3DCursor();
  for (let i = 0; i < positions.length; i++) {
    let cubePos = positions[i];
    let collided = checkCollision(cursor3D, stickLength, stickThickness, cubePos, 50); // Assume cube size is 50x50x50
    if (collided) {
      showTextWindow = true;
      textWindowOpacity = 255; // Reset the opacity when a cube is clicked
      fadeStartTime = millis(); // Record the start time of the fade effect
      break;
    }
  }
}

function drawTextWindow() {
  if (showTextWindow) {
    // Calculate the elapsed time since the fade effect started
    let elapsedTime = millis() - fadeStartTime;

    // Calculate the new opacity based on the elapsed time
    textWindowOpacity = map(elapsedTime, 0, 15000, 255, 0); // 15000 ms = 15 seconds

    // Ensure the opacity doesn't go below 0
    textWindowOpacity = max(textWindowOpacity, 0);

    // Set the position and size of the text window
    let windowWidth = 300;
    let windowHeight = 150;
    let windowX = 0;
    let windowY = 0;

    // Draw the background of the text window
    push();
    translate(windowX, windowY, 200); // Ensure the window is in front of other objects
    fill(255, 255, 255, textWindowOpacity); // White background with current opacity
    rectMode(CENTER);
    rect(0, 0, windowWidth, windowHeight);

    // Draw the text
    fill(0, textWindowOpacity); // Black text with current opacity
    textFont(inconsolata);
    textAlign(CENTER, CENTER);
    textSize(16);
    let text_str = "In the Web, presence per se is substituted by networked effects of presence. Linked to each other, cybernetic machines enact a complex choreography of calculations, which, in turn, give rise to those effects of simultaneity and connectivity.";
    text(text_str, 0, 0, windowWidth, windowHeight);
    pop();
  }
}
