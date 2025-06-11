let rez1;
let rez2;
let gap;
let length;
let startVary;
// let startColor; 
let noiseGraphics; // Perlin noise part 

// Merge lake and land L2-L4
let btnWidth = 243.87;
let btnHeight = 99.87;
let btnRadius = 49.94;
let activeLevel = 0;
let originW = 1811;
let originH = 1280;
let scaleX = 1;
let scaleY = 1;
let pg;
let pg2;
let groups = [];

// let currentExpression = 'level 1'; Because the lake land code already has let activeLevel = 0; to indicate the current level, so remove this first
let buttons = [];

function createButtons() {
  buttons = [];

  // Change original height - 55 from my group member to 50
  let y = 50;
  let spacing = 150;

//   //Define Buttons
//   buttons.push(new Button("Level 1", width / 2 - spacing, y, () => currentExpression = 'level 1'));
//   buttons.push(new Button("Level 2", width / 2 - spacing / 3, y, () => currentExpression = 'level 2'));
//   buttons.push(new Button("Level 3", width / 2 + spacing / 3, y, () => currentExpression = 'level 3'));
//   buttons.push(new Button("Level 4", width / 2 + spacing, y, () => currentExpression = 'level 4'));
// }

  //Define Buttons - changed from my group member code to let lake and land work together
  buttons.push(new Button("Level 1", width / 2 - spacing, y, () => {
    activeLevel = 1;
    drawPG2();
  }));
  buttons.push(new Button("Level 2", width / 2 - spacing / 3, y, () => {
    activeLevel = 2;
    drawPG2();
  }));
  buttons.push(new Button("Level 3", width / 2 + spacing / 3, y, () => {
    activeLevel = 3;
    drawPG2();
  }));
  buttons.push(new Button("Level 4", width / 2 + spacing, y, () => {
    activeLevel = 4;
    drawPG2();
  }));
}


function setup() {
  createCanvas(windowWidth, windowHeight);

  scaleX = windowWidth / originW;
  scaleY = windowHeight / originH;
  
  // Refer to https://p5js.org/reference/p5/createGraphics/
  // level1 pg
  pg = createGraphics(originW, originH);
  pg.clear();

  // Refer to https://p5js.org/reference/p5/createGraphics/
  // level > 1 pg
  pg2 = createGraphics(originW, originH);
  pg2.clear();

  textAlign(CENTER, CENTER); // text alignment center
  textSize(15); // text size
  noStroke();

  createButtons(); //This line belongs to my group member

  // initial level1 pg
  drawPG1();

  noiseGraphics = createGraphics(windowWidth, windowHeight);
  noiseGraphics.colorMode(HSB, 360, 100, 100, 255);
  noiseGraphics.background(25, 80, 30);
  rez1 = 0.006;
  rez2 = 0.003;
  gap = 15;
  length = 12;
  startVary = 40;
  startColor = 40;
  noiseGraphics.strokeCap(SQUARE);
  drawNoiseLines();
  applyPaperTexture(1);
  applyPaperTexture(0);

  windowResized();
}

// function setup() {
//   createCanvas(windowWidth, windowHeight);
//   textAlign(CENTER, CENTER);


//   createButtons(); // Setup initial buttons based on window size
// }

// // Beginning of Perlin noise
// function setup() {    
//   createCanvas(windowWidth, windowHeight);
//   colorMode(HSB, 360, 100, 100, 255);
//   background(25, 80, 30); 

//   rez1 = 0.006;
//   rez2 = 0.003;
//   gap = 15;
//   length = 12; 
//   startVary = 40;
//   startColor = 40;
//   strokeCap(SQUARE);

//   drawNoiseLines();
//   applyPaperTexture(1);
//   applyPaperTexture(0);
// }


// function draw() {}

// function drawNoiseLines() {
//   for (let x = -20; x < width + 20; x += gap) {
//     for (let y = -20; y < height + 20; y += gap) {
//       let colorNoise = noise(x * rez2, y * rez2);
//       let hue;

//       if (colorNoise < 0.3) {
//         hue = map(colorNoise, 0, 0.3, 210, 220); 
//       } else if (colorNoise < 0.7) {
//         hue = map(colorNoise, 0.3, 0.7, 30, 50); 
//       } else {
//         hue = map(colorNoise, 0.7, 1, 20, 30); 
//       }

//       let saturation = map(colorNoise, 0, 1, 70, 90);
//       let brightness = map(colorNoise, 0, 1, 20, 80);

//       stroke(hue, saturation, brightness, 160 + random(-30, 30)); 

//       let currentX = x + random(-startVary, startVary);
//       let currentY = y + random(-startVary, startVary);

//       for (let step = 10; step > 0; step--) {
//         strokeWeight(step * 0.6); 

//         let angleNoise = (noise(currentX * rez1, currentY * rez1) - 0.2) * 2;
//         let angle = angleNoise * PI * 0.2;

//         let nextX = cos(angle) * length + currentX;
//         let nextY = sin(angle) * length + currentY;

//         line(currentX, currentY, nextX, nextY);

//         currentX = nextX;
//         currentY = nextY;
//       }
//     }
//   }
// }

// function applyPaperTexture(textureType) {
//   noFill();
//   let colorVariation = 15;
//   let textureCount;
//   let alphaValue;

//   if (textureType < 1) {
//     textureCount = 10000;
//     strokeWeight(width * 0.02);
//     alphaValue = 15;
//   } else {
//     textureCount = 15000;
//     strokeWeight(max(1, width * 0.0011));
//     alphaValue = 210;
//   }

//   colorMode(RGB);
//   for (let i = 0; i < textureCount; i++) {
//     let x = random(width);
//     let y = random(height);
//     let sampledColor = get(x, y);
//     stroke(
//       sampledColor[0] + random(-colorVariation, colorVariation),
//       sampledColor[1] + random(-colorVariation, colorVariation),
//       sampledColor[2] + random(-colorVariation, colorVariation),
//       alphaValue
//     );

//     push();
//     translate(x, y);
//     rotate(random(TWO_PI));
//     curve(
//       height * random(0.035, 0.14),
//       0,
//       0,
//       height * random(-0.03, 0.03),
//       height * random(-0.03, 0.03),
//       height * random(0.035, 0.07),
//       height * random(0.035, 0.07),
//       height * random(0.035, 0.14)
//     );
//     pop();
//   }
//   colorMode(HSB, 360, 100, 100, 255);
// }   // Perlin noise part ends

// This part was previous draw code:
// function draw() {
//   image(noiseGraphics, 0, 0); 

//   // The below lines belong to my group member
//   drawWave();
//   drawLayerBottom();
//   drawSeaSunlight();
//   drawBubbleland();
//   drawLandCircles();
//   drawRightCircles();

//   drawScreamCharacter(currentExpression); 
//   drawButtons(); 
// }
// When I introduced the pg2 layer of Level 2-4 (brush stroke, interactive drawing), the original structure could not be displayed correctly.
// 1) All content is drawn in real time on the main canvas, without layers, and cannot be controlled to refresh or combine independently. 2) The button state does not control the drawn content, and all layers are always drawn, resulting in performance waste and difficulty in implementing Level switching. 3) noiseGraphics is not scaled, and will be misaligned when it is inconsistent with the canvas size.
// So it was changed to the following:


function draw() {
  background(255);
  noStroke();
  image(noiseGraphics, 0, 0, width, height); // Originally the noiseGraphics layer was drawn using its original width and height. However, when merged with other elements, the dimensions of the noiseGraphics layer differed from the main canvas, causing size mismatches or incorrect display. To resolve this issue, the noiseGraphics layer is explicitly scaled to match the width and height of the main canvas, ensuring consistency across the final output

  // push()
  // // canvas scale
  // scale(scaleX, scaleY);

  // // Draw different layer contents according to the current button state
  // if (activeLevel <= 1) {
  //   image(pg, 0, 0);
  // } else if (activeLevel > 1) {
  //   image(pg2, 0, 0);
  // }
  // pop();
  // Lakes and landmasses could not be resized, so based on Chatgpt's troubleshooting advice I changed the code to the following

  // Just drag the off-screen canvas to the target width and height in equal proportions.
  const targetW = originW * scaleX;   // scaleX = width / originW
  const targetH = originH * scaleY;   // scaleY = height / originH
  const layer   = (activeLevel <= 1) ? pg : pg2;
  image(layer, 0, 0, targetW, targetH);

  if (activeLevel > 0) {
  let levelTexts = ["", "level 1", "level 2", "level 3", "level 4"];
  // Render the character
  drawScreamCharacter(levelTexts[activeLevel]);
  }
  drawButtons(); 
}

// Below part added for lake and land
function drawPG1() {
  drawWave();
  drawLayerBottom();
  drawSeaSunlight();
  drawBubbleland();
  drawLandCircles();
  drawRightCircles();
}
function drawPG2() {
  pg2.clear();
  drawWave2();

  // Density corresponding to different levels of lake and land
  // The smaller and denser the numbers are, the more likely they are to get stuck.
  let spaces = [180, 140, 100]
  groups = []

  // Traverse the pixels of level1, use the pixels that meet the conditions as the center point of the group, and create a group object
  for (let x = 0; x < pg.width; x += spaces[activeLevel - 2]) {
    for (let y = 300; y < pg.height; y += spaces[activeLevel - 2]) {
      // Get the color value of the current pixel
      let c = pg.get(x, y);
      // Check the color to exclude the background color
      if (alpha(c) > 0 && red(c) != 21 && green(c) != 28 && blue(c) != 47) {
        groups.push(new Group(x, y, c))
      }
    }
  }

  // Traverse the groups and call the show method to display the group
  for (let i = 0; i < groups.length; i++) {
    groups[i].show()
  }
}

// This part of the code draws buttons of different colors depending on the currently activated button state. Use fill() to set the fill color, noStroke() to remove the border, rect() to draw a rounded rectangle, and text() to display the button label.
// Reference: p5.js official documentation on fill(), noStroke(), rect(), and text().
function drawButtons() {
  let scaleX = windowWidth / originW;
  let scaleY = windowHeight / originH;

  for (let btn of buttons) {
    let bx = btn.x * scaleX;
    let by = btn.y * scaleY;
    let bw = btnWidth * scaleX;
    let bh = btnHeight * scaleY;
    let br = btnRadius * scaleX;

    // Refer to: https://p5js.org/examples/input-rollover.html
    // Highlight the active button after click
    fill(btn.level === activeLevel ? color(209, 99, 0) : color(248, 208, 19));
    noStroke();
    rect(bx, by, bw, bh, br);

    fill(0);
    text(btn.label, bx + bw / 2, by + bh / 2);
  }
}

// This code implements the function of updating activeLevel when the mouse clicks the button
function mousePressed() {
  for (let b of buttons) {
    if (b.clicked(mouseX, mouseY)) {
      b.action();
    }
  }
}

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   createButtons(); // Recalculate button positions
// }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createButtons(); 
  
  scaleX = windowWidth / originW;
  scaleY = windowHeight / originH;

  noiseGraphics = createGraphics(windowWidth, windowHeight);
  noiseGraphics.colorMode(HSB, 360, 100, 100, 255);
  noiseGraphics.background(25, 80, 30);
  noiseGraphics.strokeCap(SQUARE);
  drawNoiseLines();
  applyPaperTexture(1);
  applyPaperTexture(0);
}



// function draw() {
  

//   // Draw Background Elements
//   drawWave();
//   drawLayerBottom();
//   drawSeaSunlight();
//   drawBubbleland();
//   drawLandCircles();
//   drawRightCircles();

//   // Draw character
//   drawScreamCharacter(currentExpression);

//   // Draw buttons
//   drawButtons();
// }

// Lake and land part
function drawWave() {
  pg.noStroke();

  pg.fill(21, 28, 47);
  pg.beginShape();
  pg.vertex(1351.35, 388.26);
  pg.bezierVertex((1351.35 - 286.45), (388.26 + 127.97), (1351.35 - 501.68), (388.26 + 54.74), (1351.35 - 501.68), (388.26 + 54.74));
  pg.bezierVertex(320.13, 251, 0, 625.71, 0, 625.71);
  pg.vertex(0, 1280);
  pg.vertex(1811, 1280);
  pg.vertex(1811, 429.84);
  pg.bezierVertex((1811 - 114.81), (429.84 - 206.71), (1811 - 459.65), (429.84 - 41.58), (1811 - 459.65), (429.84 - 41.58));
  pg.endShape(CLOSE);
}

function drawWave2() {
  pg2.noStroke();

  pg2.fill(21, 28, 47);
  pg2.beginShape();
  pg2.vertex(1351.35, 388.26);
  pg2.bezierVertex((1351.35 - 286.45), (388.26 + 127.97), (1351.35 - 501.68), (388.26 + 54.74), (1351.35 - 501.68), (388.26 + 54.74));
  pg2.bezierVertex(320.13, 251, 0, 625.71, 0, 625.71);
  pg2.vertex(0, 1280);
  pg2.vertex(1811, 1280);
  pg2.vertex(1811, 429.84);
  pg2.bezierVertex((1811 - 114.81), (429.84 - 206.71), (1811 - 459.65), (429.84 - 41.58), (1811 - 459.65), (429.84 - 41.58));
  pg2.endShape(CLOSE);
}

function drawLayerBottom() {
  pg.noStroke();

  pg.fill(119, 165, 199); pg.ellipse(556.43, 518.48, 363.26 * 2, 110.27 * 2);
  pg.fill(100, 142, 184); pg.ellipse(601.58, 533.79, 408.41 * 2, 113.2 * 2);
  pg.fill(54, 101, 129); pg.ellipse(625.51, 552.45, 398.67 * 2, 100.98 * 2);
  pg.fill(23, 50, 79); pg.ellipse(1523.89, 503.61, 241.43 * 2, 145.46 * 2);
  pg.fill(125, 155, 181); pg.ellipse(1446.04, 529.41, 241.43 * 2, 145.46 * 2);
  pg.fill(89, 138, 170); pg.ellipse(1348.32, 566.53, 241.43 * 2, 145.46 * 2);
  pg.fill(13, 52, 109); pg.ellipse(1241.81, 602.29, 385.94 * 2, 145.46 * 2);
  pg.fill(61, 103, 125); pg.ellipse(1230.88, 664.21, 385.94 * 2, 145.46 * 2);
}

function drawSeaSunlight() {
  pg.noStroke();

  pg.fill(25, 54, 70); pg.ellipse(1228.69, 1062.82, 578.67 * 2, 210.8 * 2);
  pg.fill(15, 22, 40); pg.ellipse(1185.14, 944.66, 624.77 * 2, 228.39 * 2);
  pg.fill(26, 73, 101); pg.ellipse(1144.41, 867.08, 657.53 * 2, 228.39 * 2);
  pg.fill(33, 43, 55); pg.ellipse(1080.95, 776.19, 657.53 * 2, 228.39 * 2);
  pg.fill(61, 103, 125); pg.ellipse(1054.57, 716.27, 657.53 * 2, 228.39 * 2);
  pg.fill(21, 28, 46); pg.ellipse(1024.18, 682.21, 657.53 * 2, 205.94 * 2);
  pg.fill(25, 54, 70); pg.ellipse(1018.69, 647.26, 693.42 * 2, 153.96 * 2);
  pg.fill(89, 138, 170); pg.ellipse(829.66, 618.21, 515.51 * 2, 129.55 * 2);
  pg.fill(26, 35, 50); pg.ellipse(751.17, 609.82, 470.9 * 2, 111.52 * 2);
  pg.fill(225, 190, 28); pg.ellipse(724.94, 587.76, 415.84 * 2, 85.94 * 2);
  pg.fill(195, 83, 20); pg.ellipse(725.62, 568.34, 366.39 * 2, 49.86 * 2);
  pg.fill(248, 200, 16); pg.ellipse(722.04, 548.85, 279.39 * 2, 21.48 * 2);
  pg.fill(236, 224, 166); pg.ellipse(734.9, 538.38, 214.65 * 2, 3.27 * 2);
}

function drawBubbleland() {
  pg.noStroke();

  pg.fill(148, 129, 53); pg.circle(1775, 721, 90);
  pg.fill(39, 69, 59); pg.circle(1775, 715, 50);
}

function drawLandCircles() {
  pg.noStroke();
  let yOffset = 300;

  pg.fill(105, 133, 95); pg.circle(1610.05, (769.67 + yOffset), 399.48 * 2);
  pg.fill(183, 169, 130); pg.circle(1613.58, (782.01 + yOffset), 339.22 * 2);
  pg.fill(102, 125, 119); pg.circle(1640.33, (799.11 + yOffset), 323.67 * 2);
  pg.fill(205, 185, 148); pg.circle(1700.99, (858.13 + yOffset), 355.6 * 2);
  pg.fill(193, 165, 58); pg.circle(1821.48, (864.71 + yOffset), 355.6 * 2);
  pg.fill(218, 179, 39); pg.circle(1878.53, (849.43 + yOffset), 340.32 * 2);
  pg.fill(37, 56, 52); pg.circle(1964, (790.71 + yOffset), 340.32 * 2);
  pg.fill(143, 109, 63); pg.circle(1984.93, (793.4 + yOffset), 319.39 * 2);
  pg.fill(39, 69, 59); pg.circle(2009.53, (763.96 + yOffset), 308.54 * 2);
}

function drawRightCircles() {
  pg.noStroke();

  pg.fill(74, 100, 113); pg.circle(1605.94, 510.69, 192.9 * 2);
  pg.fill(34, 53, 109); pg.circle(1551.19, 510.52, 168.45 * 2);
  pg.fill(98, 125, 116); pg.circle(1529.84, 518.35, 151.66 * 2);
  pg.fill(40, 61, 116); pg.circle(1504.31, 529.92, 154.27 * 2);
  pg.fill(106, 134, 156); pg.circle(1491, 536.01, 140.96 * 2);
  pg.fill(175, 150, 119); pg.circle(1450.5, 542.76, 94.6 * 2);
  pg.fill(175, 115, 115); pg.circle(1425.62, 555.33, 82.03 * 2);
  pg.fill(86, 91, 111); pg.circle(1399.86, 568.86, 74.85 * 2);
}

// Define a Group class to represent a group of shapes
class Group {
  constructor(x, y, c) {
    // Coordinates of the center point
    this.center = createVector(x, y)
    // Radius
    this.groupRad = random(120, 125)
    // Density of the shapes
    this.density = 0.002
    // Angle, randomly select one of 8 directions
    this.angle = floor(random(8)) * PI / 4
    // Array to store all shapes within the group
    this.shapes = []
    // Color of the shapes
    this.c = c;
    // Call the prepare method to prepare the shapes
    this.prepare()
  }

  // Prepare the shapes within the group
  prepare() {
    // Calculate the number of shapes based on the group's radius and density
    let numShapes = sq(this.groupRad) * PI * this.density
    // Loop to create the specified number of shapes
    for (let i = 0; i < numShapes; i++) {
      // Calculate the distance of the shape from the center point
      let distCenter = this.groupRad * sqrt(random())
      // Randomly generate a polar coordinate angle
      let anglePolar = random(TAU)
      // Calculate the position vector of the shape
      let brushPos = createVector(this.center.x + distCenter * cos(anglePolar), this.center.y + distCenter * sin(anglePolar))
      // Add the newly created BrushStroke instance to the shapes array
      this.shapes.push(new BrushStroke(brushPos, this.c, this.angle))
    }
  }

  // Display all shapes within the group
  show() {
    for (let shape of this.shapes) {
      shape.show()
    }
  }
}

// Define a BrushStroke class to represent a single shape stroke
class BrushStroke {
  constructor(pos, col, baseAngle) {
    // Position of the shape
    this.pos = pos
    // Color of the shape
    this.color = col
    // Base angle of the shape
    this.ang = baseAngle
  }

  show() {
    // Randomly generate the width of the shape
    let shapeWidth = random(20, 50)
    // Randomly generate the height of the shape
    let shapeHeight = random(1, 3)
    // Array to store the vertices of the shape
    let vertices = []
    // Loop to generate the vertices of the shape
    for (let theta = 0; theta < TAU; theta += TAU / 45) {
      vertices.push(createVector(shapeWidth * cos(theta) + 10 * random(-1, 1), shapeHeight * sin(theta)))
    }
    pg2.push()
    pg2.translate(this.pos.x, this.pos.y)
    pg2.rotate(this.ang)
    pg2.fill(this.color)
    pg2.beginShape()
    for (let vertice of vertices) {
      pg2.curveVertex(vertice.x, vertice.y)
    }
    pg2.curveVertex(vertices[0].x, vertices[0].y)
    pg2.curveVertex(vertices[1].x, vertices[1].y)
    pg2.curveVertex(vertices[2].x, vertices[2].y)
    pg2.endShape()
    pg2.pop()
  }
}


// Character
function drawScreamCharacter(expression) {
  push();
  translate(width / 3, height / 3);
  scale(0.8); // Scale down the character for better visibility

  //Body
  push();
  beginShape();
  fill('#4a4b4c');
  // Starting point
  vertex(219.56, 283.215);
  bezierVertex(161.235, 285.11, 142.937, 326.477, 142.937, 326.477);
  bezierVertex(142.937, 326.477, 131.807, 398.212, 131.807, 398.212);
  bezierVertex(131.807, 398.212, 153.263, 531.879, 123.641, 603.675);
  bezierVertex(86.829, 692.899, 75.15, 841.89, 75.15, 841.89);
  vertex(331.565, 841.89);
  bezierVertex(331.565, 841.89, 326.833, 700.232, 381.303, 619.149);
  bezierVertex(423.32, 556.603, 427.325, 429.452, 427.325, 429.452);
  vertex(431.177, 356.817);
  bezierVertex(440.094, 305.459, 396.782, 306.213, 396.782, 306.213);
  vertex(219.56, 283.215);
  endShape(CLOSE);
  pop();

  //Left Arm
  push();
  fill('#231f20');
  stroke('#231f20');
  strokeWeight(6);
  beginShape();
  // Starting point
  vertex(211.545, 313.387);
  bezierVertex(194.578, 377.035, 161.081, 408.672, 161.081, 408.672);
  bezierVertex(110.591, 504.957, 94.983, 572.776, 111.983, 626.02);
  bezierVertex(129.061, 679.87, 170.607, 661.739, 185.081, 635.424);
  bezierVertex(199.555, 609.109, 227.349, 565.018, 253.587, 470.564);
  bezierVertex(279.825, 376.11, 278.494, 329.459, 278.494, 329.459);
  bezierVertex(278.494, 329.459, 265.664, 282.703, 235.501, 316.298);
  endShape(CLOSE);
  pop();

  //Right Arm
  push();
  fill('#231f20');
  stroke('#231f20');
  strokeWeight(6);
  beginShape();
  // Starting point
  vertex(442.677, 289.429);
  bezierVertex(454.049, 289.429, 462.203, 300.443, 458.824, 311.301);
  bezierVertex(452.597, 331.308, 445.033, 361.594, 446.453, 387.167);
  bezierVertex(448.808, 429.559, 467.459, 610.129, 405.95, 639.371);
  bezierVertex(405.95, 639.371, 395.692, 645.241, 377.59, 646.093);
  bezierVertex(364.222, 646.722, 355.426, 632.28, 362.159, 620.714);
  bezierVertex(379.38, 591.128, 406.468, 537.069, 407.301, 488.539);
  bezierVertex(407.301, 488.539, 409.603, 424.838, 398.665, 381.545);
  bezierVertex(398.234, 379.838, 398.043, 378.086, 398.148, 376.329);
  bezierVertex(398.786, 365.618, 402.948, 326.224, 430.018, 295.127);
  bezierVertex(433.196, 291.477, 437.837, 289.429, 442.677, 289.429);
  endShape(CLOSE);
  pop();

  //Right Hand
  push();
  fill('#ffe6cc');
  stroke('#231f20');
  strokeWeight(4);
  beginShape();
  // Starting point
  vertex(447.245, 50.525);
  // Simulating "c" cubic bezier to right with flowing control
  bezierVertex(452.5, 52, 472, 60, 489.433, 92.645); // 42.188 as implied curve
  bezierVertex(490.7, 96.133, 492.75, 99.288, 495.4, 101.888); // smooth flow
  bezierVertex(500.6, 106.989, 508.855, 112.633, 519.283, 111.471);
  // Large body bulge (mimicking back curve)
  bezierVertex(570, 160, 470, 240, 440, 310); // rough placement of 64.25 → 256.397
  // Tail end of bulge (toward center-bottom)
  bezierVertex(440, 310, 435, 340, 425, 325); // simulate -6.916, 19.246
  // Inside spine/torso
  bezierVertex(404, 280, 460, 210, 480, 180); // 27.606–107.857
  // Inside return to top
  bezierVertex(500, 140, 490, 100, 447.245, 50.525); // 43.033–138.515
  endShape(CLOSE);
  pop();

  //Left Hand
  push();
  fill('#ffe6cc');
  stroke('#231f20');
  strokeWeight(4);
  beginShape();
  // Starting point
  vertex(319.081, 36.459);
  // Curve representing: -5.555, 6.292, -25.792, 26.585
  bezierVertex(310, 45, 290, 65, 264.23, 61.841);
  // Subtle transition to reflect control points for facial structure
  bezierVertex(262.8, 61.782, 261.5, 62.6, 260.6, 63.7);
  bezierVertex(256.54, 70.86, 241.357, 94.234, 215.052, 96.577);
  bezierVertex(213.113, 96.75, 211.575, 98.284, 211.485, 100.229);
  // Cheek and chin curvature
  bezierVertex(210.785, 115.477, 206.139, 177.001, 176.314, 204.537);
  bezierVertex(175.075, 205.681, 174.726, 207.489, 175.455, 209.009);
  // Side curls
  bezierVertex(177.781, 213.863, 182.525, 224.581, 183.306, 232.761);
  bezierVertex(183.372, 233.448, 183.59, 234.102, 183.986, 234.667);
  // Flow into the complex body region (arm/torso folds)
  bezierVertex(190.155, 243.472, 240.736, 320.702, 189.38, 417.725);
  bezierVertex(189.317, 417.843, 189.264, 417.959, 189.214, 418.084);
  // Bump with highlight ("magic" curved ridge)
  bezierVertex(188.139, 420.81, 176.295, 451.972, 207.684, 425.199);
  // Midsection folding out toward right side
  bezierVertex(207.684, 425.199, 261.337, 378.981, 259.612, 315.9);
  bezierVertex(259.596, 315.332, 257.954, 310.38, 257.7, 309.872);
  // Central vertical flow
  bezierVertex(252.842, 300.179, 213.925, 235.547, 222.344, 173.325);
  // Chin dip modifier
  bezierVertex(222.384, 173.027, 224.861, 160.095, 224.92, 159.8);
  // Neckline to skull region
  bezierVertex(225.981, 154.477, 238.182, 100.1, 301.196, 57.738);
  bezierVertex(301.196, 57.738, 313.013, 49.276, 324.745, 42.457);
  // The curve that wraps back toward the beginning
  bezierVertex(327.857, 40.648, 327.028, 35.868, 323.469, 35.332);
  bezierVertex(323.183, 35.289, 322.905, 35.241, 322.635, 35.188);
  bezierVertex(321.261, 34.917, 319.847, 35.338, 318.92, 36.389);
  endShape(CLOSE);
  pop();

  //Head
  push();
  fill("#ffe6cc")
  stroke("#231f20")
  strokeWeight(6)
  beginShape();
  vertex(452.178, 246.297);
  bezierVertex(452.178, 246.297, 540.969, 120.142, 447.127, 53.367999999999995);
  bezierVertex(355.017, -12.175000000000011, 267.65999999999997, 76.21, 237.026, 128.115);
  bezierVertex(214.53900000000002, 166.216, 191.57100000000003, 209.933, 256.218, 304.88300000000004);
  bezierVertex(256.218, 304.88300000000004, 268.59200000000004, 317.25700000000006, 270.332, 353.50800000000004);
  bezierVertex(270.745, 362.115, 270.044, 370.73400000000004, 268.495, 379.21000000000004);
  bezierVertex(264.434, 401.43800000000005, 258.811, 458.69900000000007, 308.743, 458.418);
  bezierVertex(308.743, 458.418, 338.001, 468.463, 361.268, 380.64);
  bezierVertex(385.93699999999995, 287.52299999999997, 415.813, 304.882, 452.17699999999996, 246.297);
  endShape();
  pop();

  //Interactive Mouth 
  fill(169, 146, 109)
  stroke(0)
  strokeWeight(6)
  if (expression === 'level 1') {
    //Mouth S
    fill(169, 146, 109)
    stroke(0)
    strokeWeight(6)
    beginShape();
    vertex(354.706, 297.443);
    bezierVertex(375.408, 226.783, 294.19800000000004, 249.492, 309.59200000000004, 328.71);
    bezierVertex(310.607, 333.431, 300.398, 353.59, 320.641, 345.37399999999997);
    bezierVertex(334.492, 340.65, 334.17600000000004, 328.33599999999996, 341.545, 318.789);
    bezierVertex(351.509, 307.632, 352.774, 301.245, 354.706, 297.443);
    endShape();
  }
  else if (expression === 'level 2') {
    //Mouth M
    fill(169, 146, 109)
    stroke(0)
    strokeWeight(6)
    beginShape();
    vertex(364.611, 308.765);
    bezierVertex(394.705, 208.14, 276.652, 240.48, 299.031, 353.292);
    bezierVertex(300.50600000000003, 360.01599999999996, 285.666, 388.72299999999996, 315.092, 377.022);
    bezierVertex(326.20099999999996, 371.51099999999997, 333.92699999999996, 366.106, 336.421, 355.521);
    bezierVertex(337.693, 350.599, 342.234, 342.72900000000004, 345.48199999999997, 339.166);
    bezierVertex(359.965, 323.277, 361.803, 314.181, 364.61199999999997, 308.766);
    endShape();
  }
  else if (expression === 'level 3') {
    //Mouth L
    fill(169, 146, 109)
    stroke(0)
    strokeWeight(6)
    beginShape();
    vertex(365.897, 319.784);
    bezierVertex(398.451, 193.85899999999998, 270.75, 234.32999999999998, 294.957, 375.506);
    bezierVertex(296.553, 383.91999999999996, 280.5, 419.84499999999997, 312.331, 405.203);
    bezierVertex(324.348, 398.306, 332.706, 391.542, 335.403, 378.296);
    bezierVertex(336.779, 372.137, 341.69100000000003, 362.287, 345.204, 357.828);
    bezierVertex(360.871, 337.94399999999996, 362.85900000000004, 326.55999999999995, 365.897, 319.784);
    endShape();
  }
  else if (expression === 'level 4') {
    //Mouth XL
    fill(169, 146, 109)
    stroke(0)
    strokeWeight(6)
    beginShape();
    vertex(364.399, 332.493);
    bezierVertex(368.739, 324.013, 375.142, 301.543, 376.357, 292.13);
    bezierVertex(390.439, 182.973, 264.752, 226.11399999999998, 289.869, 373.671);
    bezierVertex(292.281, 387.84, 271.93, 437.821, 306.56100000000004, 418.423);
    bezierVertex(317.439, 412.33, 324.06100000000004, 407.319, 335.264, 384.368);
    bezierVertex(342.704, 369.126, 342.788, 367.185, 346.478, 362.086);
    bezierVertex(354.184, 351.43600000000004, 360.157, 340.78200000000004, 364.399, 332.493);
    endShape();
  }

  //Right Eye
  push();
  fill("#ffffff")
  noStroke()
  beginShape();
  vertex(416.595, 171.886);
  bezierVertex(425.19100000000003, 155.048, 430.98400000000004, 137.918, 424.63500000000005, 122.745);
  bezierVertex(420.91900000000004, 115.02900000000001, 412.93000000000006, 112.161, 403.77400000000006, 115.429);
  bezierVertex(378.7660000000001, 125.225, 359.87100000000004, 159.052, 359.7830000000001, 185.506);
  bezierVertex(359.59600000000006, 195.825, 365.15600000000006, 206.13400000000001, 374.60600000000005, 206.48);
  bezierVertex(392.68800000000005, 207.016, 408.13800000000003, 186.962, 416.4870000000001, 172.084);
  vertex(416.5950000000001, 171.887);
  endShape();
  pop();

  //Right Eye Outline
  push();
  fill("rgba(0, 0, 0, 0)")
  stroke("#231f20")
  strokeWeight(5)
  strokeCap(ROUND);
  beginShape();
  vertex(425.527, 149.649);
  bezierVertex(427.93899999999996, 140.331, 428.187, 131.232, 424.635, 122.745);
  bezierVertex(420.919, 115.02900000000001, 412.93, 112.161, 403.774, 115.429);
  bezierVertex(378.766, 125.225, 359.871, 159.052, 359.783, 185.506);
  bezierVertex(359.596, 195.825, 365.156, 206.13400000000001, 374.606, 206.48);
  bezierVertex(384.007, 206.75799999999998, 392.69599999999997, 201.47199999999998, 400.046, 194.23999999999998);
  endShape()
  pop();


  //Left Eye
  push();
  fill(255); // #fff from SVG
  noStroke()
  beginShape();
  vertex(328.75, 142.738);
  bezierVertex(329.671, 130.989, 325.435, 115.691, 312.937, 112.038);
  bezierVertex(299.665, 108.694, 284.614, 116.215, 274.81, 124.913);
  bezierVertex(262.72, 135.79, 254.997, 153.045, 254.551, 169.228);
  bezierVertex(254.163, 177.005, 254.866, 184.389, 256.365, 191.75);
  bezierVertex(257.204, 195.357, 257.782, 198.886, 259.572, 201.562);
  bezierVertex(267.724, 214.213, 283.887, 209.047, 293.307, 200.46);
  bezierVertex(299.037, 195.606, 303.805, 190.603, 308.817, 184.51);
  bezierVertex(318.808, 172.522, 327.847, 157.459, 328.738, 142.899);
  endShape(CLOSE);
  pop()

  //Left Eye Outline
  push();
  fill("rgba(0, 0, 0, 0)")
  stroke("#231f20")
  strokeWeight(5)
  strokeCap(ROUND);
  beginShape();
  vertex(327.445, 128.638);
  bezierVertex(326.841, 126.745, 326.055, 124.905, 325.081, 123.146);
  bezierVertex(319.56100000000004, 113.177, 307.719, 104.426, 282.67100000000005, 119.841);
  bezierVertex(239.73000000000005, 146.266, 258.72300000000007, 198.291, 258.72300000000007, 198.291);
  bezierVertex(258.72300000000007, 198.291, 268.1820000000001, 225.542, 298.54800000000006, 194.988);
  bezierVertex(314.16300000000007, 179.276, 321.0930000000001, 168.15, 324.59100000000007, 159.252);
  endShape()
  pop();


  //Left Eye Pupil
  push();
  fill("#be1e2d")
  noStroke()
  translate(46.038, 371.874);
  rotate(-1.2341746739627502);
  beginShape();
  vertex(285.08, 147.874);
  bezierVertex(291.0557209931692, 147.874, 295.9, 150.39015970595094, 295.9, 153.494);
  bezierVertex(295.9, 156.59784029404906, 291.0557209931692, 159.114, 285.08, 159.114);
  bezierVertex(279.1042790068308, 159.114, 274.26, 156.59784029404906, 274.26, 153.494);
  bezierVertex(274.26, 150.39015970595094, 279.1042790068308, 147.874, 285.08, 147.874);
  endShape();
  pop();

  //Right Eye Pupil
  push();
  fill("#be1e2d")
  noStroke()
  translate(118.093, 479.258);
  rotate(-1.2341746739627502);
  beginShape();
  vertex(396.78, 150.789);
  bezierVertex(403.25388183751653, 150.789, 408.50199999999995, 153.30515970595093, 408.50199999999995, 156.409);
  bezierVertex(408.50199999999995, 159.51284029404906, 403.25388183751653, 162.029, 396.78, 162.029);
  bezierVertex(390.3061181624834, 162.029, 385.058, 159.51284029404906, 385.058, 156.409);
  bezierVertex(385.058, 153.30515970595093, 390.3061181624834, 150.789, 396.78, 150.789);
  endShape();
  pop();

  // Left Nostril
  push();
  fill("#231f20")
  beginShape();
  vertex(318.629, 204.211);
  bezierVertex(319.47200000000004, 203.34300000000002, 320.35, 202.514, 321.24800000000005, 201.704);
  bezierVertex(323.99700000000007, 199.226, 329.74100000000004, 193.377, 325.76500000000004, 190.91500000000002);
  bezierVertex(320.65200000000004, 187.75000000000003, 317.487, 191.15800000000002, 312.86100000000005, 199.193);
  bezierVertex(308.23500000000007, 207.227, 304.82700000000006, 209.662, 307.50500000000005, 211.61);
  bezierVertex(309.57900000000006, 213.119, 315.88900000000007, 207.03300000000002, 318.6290000000001, 204.211);
  endShape();
  pop();

  //Right Nostril
  push();
  fill("#231f20")
  beginShape();
  vertex(344.744, 193.793);
  bezierVertex(344.56, 193.61, 344.357, 193.441, 344.14700000000005, 193.288);
  bezierVertex(342.7420000000001, 192.27, 337.5160000000001, 189.01700000000002, 336.50600000000003, 196.08700000000002);
  bezierVertex(335.80400000000003, 201.002, 338.264, 202.68400000000003, 340.34200000000004, 203.24400000000003);
  bezierVertex(341.944, 203.67500000000004, 343.62800000000004, 203.13400000000001, 344.75500000000005, 201.91700000000003);
  bezierVertex(346.38900000000007, 200.15200000000004, 348.06600000000003, 197.10100000000003, 344.744, 193.79300000000003);
  endShape();
  pop();

  pop(); // End of character drawing
}

// Button class
class Button {
  constructor(label, x, y, action) {
    this.label = label;
    this.x = x;
    this.y = y;
    this.w = 80;
    this.h = 30;
    this.action = action;
  }
  isHovered() {
    return mouseX > this.x && mouseX < this.x + this.w &&
      mouseY > this.y && mouseY < this.y + this.h;
  }

  show() {
    if (this.isHovered()) {
      fill(209, 99, 0); //Hover Color
    } else {
      fill(248, 208, 19); //Default Color
    }
    noStroke();
    rect(this.x, this.y, this.w, this.h, 5);
    textSize(17);
    fill(0);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);
  }

  clicked(mx, my) {
    return mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;
  }
}

function drawButtons() {
  for (let b of buttons) {
    b.show();
  }
}

function mousePressed() {
  for (let b of buttons) {
    if (b.clicked(mouseX, mouseY)) {
      b.action();
    }
  }
}

function drawNoiseLines() {
  for (let x = -20; x < width + 20; x += gap) {
    for (let y = -20; y < height + 20; y += gap) {
      let colorNoise = noise(x * rez2, y * rez2);
      let hue;
      if (colorNoise < 0.3) hue = map(colorNoise, 0, 0.3, 210, 220);
      else if (colorNoise < 0.7) hue = map(colorNoise, 0.3, 0.7, 30, 50);
      else hue = map(colorNoise, 0.7, 1, 20, 30);

      let saturation = map(colorNoise, 0, 1, 70, 90);
      let brightness = map(colorNoise, 0, 1, 20, 80);
      noiseGraphics.stroke(hue, saturation, brightness, 160 + random(-30, 30));

      let currentX = x + random(-startVary, startVary);
      let currentY = y + random(-startVary, startVary);
      for (let step = 10; step > 0; step--) {
        noiseGraphics.strokeWeight(step * 0.6);
        let angleNoise = (noise(currentX * rez1, currentY * rez1) - 0.2) * 2;
        let angle = angleNoise * PI * 0.2;
        let nextX = cos(angle) * length + currentX;
        let nextY = sin(angle) * length + currentY;
        noiseGraphics.line(currentX, currentY, nextX, nextY);
        currentX = nextX;
        currentY = nextY;
      }
    }
  }
}

function applyPaperTexture(textureType) {
  noiseGraphics.noFill();
  let colorVariation = 15;
  let textureCount = textureType < 1 ? 10000 : 15000;
  let alphaValue = textureType < 1 ? 15 : 210;
  noiseGraphics.strokeWeight(textureType < 1 ? width * 0.02 : max(1, width * 0.0011));

  noiseGraphics.colorMode(RGB);
  for (let i = 0; i < textureCount; i++) {
    let x = random(width);
    let y = random(height);
    let sampledColor = noiseGraphics.get(x, y);
    noiseGraphics.stroke(
      sampledColor[0] + random(-colorVariation, colorVariation),
      sampledColor[1] + random(-colorVariation, colorVariation),
      sampledColor[2] + random(-colorVariation, colorVariation),
      alphaValue
    );
    noiseGraphics.push();
    noiseGraphics.translate(x, y);
    noiseGraphics.rotate(random(TWO_PI));
    noiseGraphics.curve(
      height * random(0.035, 0.14), 0,
      0, height * random(-0.03, 0.03),
      height * random(-0.03, 0.03), height * random(0.035, 0.07),
      height * random(0.035, 0.07), height * random(0.035, 0.14)
    );
    noiseGraphics.pop();
  }
  noiseGraphics.colorMode(HSB, 360, 100, 100, 255);
}

