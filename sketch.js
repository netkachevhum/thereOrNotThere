let positions = [];
let vortexNumber = 7;
let cubesTexturesInd = [];
let stickLength = 1000; // Length of the stick
let stickThickness = 10; // Thickness of the stick
let showWeb = false;
let minDistance = 200; // Minimum distance between vortices
let showTextWindow = false; // Variable to manage the display of the text window
let textWindowOpacity = 255; // Variable to manage the opacity of the text window
let fadeStartTime = 0; // Variable to track the start time of the fade effect
let textContent = "In the Web, presence per se is substituted by networked effects of presence. Linked to each other, cybernetic machines enact a complex choreography of calculations, which, in turn, give rise to those effects of simultaneity and connectivity. But is there presence in between the intervals between the electric impulses --- the basic elements of this choreography?";
let texts = [];


let windowWidthHalf;
let skyes = [];
let skyesDark = [];
let skyesLight = [];
let useDarkTextures = true;
let propagate = false;
let nextPropagationTime = 0;
let propagationIndex = 0;
let propagationDelay = 1000;
let propagationInterval = 9000; 

function preload() {
  inconsolata = loadFont("Inconsolata.otf");
  sky = loadImage("sky_texture.jpeg");
  
  let imgLen = 3;
  
  for (let i = 1; i < imgLen; i++) {
    let path = 'skyes3/' + str(i) + '.png';
    let loaded_image = loadImage(path);
    skyes.push(loaded_image);
  }
  
  for(let i = 1; i < imgLen; i++){
    let path = 'skyesDark/' + str(i) + '.png';
    let loaded_image = loadImage(path);
    skyesDark.push(loaded_image);
  }
  
  for(let i = 1; i < imgLen; i++){
    let path = 'skyesLight/' + str(i) + '.png';
    let loaded_image = loadImage(path);
    skyesLight.push(loaded_image);
  }
  
  for (let i = 0; i < vortexNumber; i++){
    cubesTexturesInd.push(skyesDark[Math.floor(random(skyesDark.length))]);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  windowWidthHalf = windowWidth / 2;

  while (positions.length < vortexNumber) {
    let x = random(-width / 2 + 100, width / 2 - 100);
    let y = random(-height / 2 + 100, height / 2 - 100);
    let z = random(-100, 200);
    let newPos = createVector(x, y, z);
    if (isFarEnough(newPos)) {
      positions.push(newPos);
    }
  }

  setInterval(() => {
    if (!propagate) {
      nextPropagationTime = millis() + random(100, propagationInterval);
    }
  }, 1000);
  
  texts = loadStrings("texts.txt");
}

function draw() {
  background(0, 0, 255);

  updatePositions();
  if (showWeb) {
    drawWeb(positions);
  }
  drawCubes(positions);
  let cursor3D = get3DCursor();
  drawStick(cursor3D);
  showWeb = false;
  for (let i = 0; i < positions.length; i++) {
    let cubePos = positions[i];
    let collided = checkCollision(cursor3D, stickLength, stickThickness, cubePos, 50);
    if (collided) {
      showWeb = true;
      break;
    }
  }
  drawTextWindow();
  handleTexturePropagation();
}

function updatePositions() {
  for (let i = 0; i < positions.length; i++) {
    positions[i].add(p5.Vector.random3D().mult(0.5));
  }
}

function drawWeb(positions) {
  stroke(255);
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      line(positions[i].x, positions[i].y, positions[i].z, positions[j].x, positions[j].y, positions[j].z);
    }
  }
}

function drawCubes(positions) {
  noStroke();
  for (let i = 0; i < positions.length; i++) {
    push();
    texture(cubesTexturesInd[i]);
    translate(positions[i].x, positions[i].y, positions[i].z);
    box(50);
    pop();
  }
}

function get3DCursor() {
  let x = mouseX - width / 2;
  let y = mouseY - height / 2;
  let cursor3D = createVector(x, y, 0);
  return cursor3D;
}

function drawStick(position) {
  push();
  translate(position.x, position.y, position.z);
  fill(255, 0, 0);
  pop();
}

function checkCollision(point, length, thickness, cubePos, cubeSize) {
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
    let collided = checkCollision(cursor3D, stickLength, stickThickness, cubePos, 50);
    if (collided) {
      textContent = texts[i];
      print(i);
      print(textContent);
      showTextWindow = true;
      textWindowOpacity = 255;
      fadeStartTime = millis();
      break;
    }
  }
}

function drawTextWindow() {
  if (showTextWindow) {
    let elapsedTime = millis() - fadeStartTime;
    textWindowOpacity = map(elapsedTime, 0, 15000, 255, 0);
    textWindowOpacity = max(textWindowOpacity, 0);
    let borderLenChars = width / 15;
    let lines = splitTextIntoLines(textContent, borderLenChars);
    let startX = -windowWidth / 4;
    let startY = -lines.length * 10;
    push();
    translate(0, 0, 200);
    textFont(inconsolata);
    textAlign(LEFT, TOP);
    textSize(width/20);
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let yOffset = i * 20;
      for (let j = 0; j < line.length; j++) {
        let char = line.charAt(j);
        let charOpacity = textWindowOpacity * random(0.8, 1);
        let charX = startX + textWidth(line.substring(0, j)) + random(-0.5, 0.5);
        let charY = startY + yOffset + random(-0.5, 0.5);
        fill(255, charOpacity);
        text(char, charX, charY);
      }
    }
    pop();
  }
}

function splitTextIntoLines(text, maxCharsPerLine) {
  let words = text.split(' ');
  let lines = [];
  let currentLine = '';
  for (let i = 0; i < words.length; i++) {
    let word = words[i];
    if ((currentLine + word).length <= maxCharsPerLine) {
      if (currentLine.length > 0) {
        currentLine += ' ';
      }
      currentLine += word;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = '';
      }
      while (word.length > maxCharsPerLine) {
        lines.push(word.substring(0, maxCharsPerLine));
        word = word.substring(maxCharsPerLine);
      }
      currentLine = word;
    }
  }
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }
  return lines;
}

function updateCubeTextures() {
  let textures = useDarkTextures ? skyesDark : skyesLight;
  for (let i = 0; i < vortexNumber; i++) {
    cubesTexturesInd[i] = textures[Math.floor(random(textures.length))];
  }
}

function handleTexturePropagation() {
  if (millis() > nextPropagationTime) {
    propagate = true;
    nextPropagationTime = millis() + propagationInterval;
    useDarkTextures = !useDarkTextures; // Toggle between dark and light textures
    propagationIndex = 0; // Reset propagation index
  }
  // print(propagate);
  // print(millis() + " millis");
  // print(nextPropagationTime + " next time");
  
  if (propagate) {
    let textures = useDarkTextures ? skyesDark : skyesLight;
    cubesTexturesInd[propagationIndex] = textures[Math.floor(random(textures.length))];
    propagationIndex++;
    if (propagationIndex >= vortexNumber) {
      propagate = false;
      nextPropagationTime = millis() + propagationInterval; // Reset next propagation time
    }
  }
}