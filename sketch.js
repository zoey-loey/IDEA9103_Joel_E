// These globals are declared at top-level so every function can see them
// Define Variables
let rez1; 
let rez2;
let gap;
let length;
let startVary;
// let startColor; 
let noiseGraphics; // Perlin noise part 

// Merge lake and land L2-L4
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


function setup() {
  createCanvas(windowWidth, windowHeight); // Canvas fit window size

  scaleX = windowWidth / originW;
  scaleY = windowHeight / originH;
  
  // Off-screen buffers (Implementation uses p5.createGraphics: https://p5js.org/reference/#/p5/createGraphics)
  // pg  – holds the clean, geometric artwork for Level 1 (mainly for lake + land)
  // pg2 – regenerated on every Level 2-4 click (mainly for lake + land); replaces the geometry, with painterly “brush-stroke” groups
  // level 1 pg
  pg = createGraphics(originW, originH);
  pg.clear();

  // level > 1 pg
  pg2 = createGraphics(originW, originH);
  pg2.clear();

  // Basic typographic settings for button labels & HUD text
  textAlign(CENTER, CENTER); // text alignment center
  textSize(15); // text size
  noStroke();

  createButtons(); 

  // Render the static Level 1 artwork into the pg buffer
  drawPG1();

  // Create an off-screen layer for the sky
  noiseGraphics = createGraphics(windowWidth, windowHeight);
  noiseGraphics.colorMode(HSB, 360, 100, 100, 255);
  noiseGraphics.background(25, 80, 30);

  // Tunable flow-field + texture parameters
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

  // Force a first layout pass so everything scales to the current window size before draw() starts looping
  windowResized();
}


function draw() {
  background(255);
  noStroke();
  image(noiseGraphics, 0, 0, width, height); 

  /* The original noiseGraphics layer used its default size, which caused mismatches when combined with other elements. To fix this, 
  it is now explicitly scaled to match the main canvas dimensions, ensuring consistent and proportionate display in the final output. */

  // Lake & Land layer
  // Level 1 : pg  (vector geometry)
  // Level 2-4 : pg2 (painterly brush strokes, regenerated on click)
  // Both buffers were created with p5.createGraphics, keep the original 1811*1280 aspect via scaleX / scaleY
  const targetW = originW * scaleX;   // scaleX = width / originW
  const targetH = originH * scaleY;   // scaleY = height / originH
  const layer   = (activeLevel <= 1) ? pg : pg2;
  image(layer, 0, 0, targetW, targetH);

  drawBridge();
  
  // drawScreamCharacter() needs a label like "level 2", so this array
  // Turns the number 1-4 into that text. Slot 0 is an empty string;
  // When activeLevel is 0 we return nothing and avoid an error.
  if (activeLevel > 0) {
  let levelTexts = ["", "level 1", "level 2", "level 3", "level 4"];

  drawScreamCharacter(levelTexts[activeLevel]);   // draw character
  }

  // Each level is a little closer to the screaming people
  // Setting a different position for each level creates the effect of movement.
   let ghostX = [10, 50, 100, 150]; 
   let ghostY = [100, 150, 200, 250];
   drawGhostCharacter(ghostX[activeLevel-1], ghostY[activeLevel-1], 0.4); 

  drawButtons(); // Draw Buttons, see bottom of code; the button is always rendered last, ensuring it is above all layers
}

// Start of button drawing 
/* Reference inspiration
1. Strut slide editor – creates a `buttons` array with buttons.push(new Button(...)) inside createButtons()
https://github.com/tusharvikky/Strut/blob/41c6e5359b727d55cdfb5c5f2d5789824e79d7a4/app/bundles/app/strut.slide_components/main.js#L24
2. xaota/ui pagination component – also builds an array of buttons via buttons.push() before attaching click events
https://github.com/xaota/ui/blob/4c7bda33feda53b75c24d3e2b7d12ee9aada4b2d/components/pagination.js#L3
Both links use DOM buttons, not p5.js, but we borrowed the same “array + push” idea. Here each Button is a lightweight p5.js object that
draws a rectangle on the canvas and stores a callback; every click is processed later in mousePressed(). */
function createButtons() { 
  buttons = [];
  let y = 50; // vertical position of buttons
  let spacing = 150; // horizontal spacing between buttons

  // Define Buttons
  
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
// End of button drawing


// Below part added for lake and land
function drawPG1() {
  drawWave();
  drawLayerBottom();
  drawSeaSunlight();
  drawBubbleland();
  drawLandCircles();
  drawRightCircles();
}

// Lake & land: Base idea from OpenProcessing #1612706 (Group & BrushStroke classes): https://openprocessing.org/sketch/1612706
function drawPG2() {
  pg2.clear(); // reset the painterly layer each time
  drawWave2(); // keep the dark lake outline (same as drawWave)
  // OpenProcessing fixed minDistance=100 ; we map 180/140/100 instead.
  // Density corresponding to different levels of lake and land
  // The smaller and denser the numbers are, the more likely they are to get stuck.
  let spaces = [180, 140, 100] // Level 2/3/4
  groups = []

  // Traverse the pixels of level 1, use the pixels that meet the conditions as the center point of the group, and create a group object
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


// Start of Lake and Land drawing
  // Path originally drawn in Adobe Illustrator, then exported as <path> data in an SVG file.
  // The SVG path was converted to p5.js code with the online tool “svg2p5” (https://svg2p5.com) which outputs beginShape() + vertex() + bezierVertex() commands
  // Manual tweaks after conversion:
  // 1. Replaced generic canvas calls with pg./pg2. to draw into the levels buffer instead of the main canvas
  // 2. Unified fill colour to match the artwork palette
  // 3. Added explicit CLOSE flag at endShape() for a sealed outline
  // Result: Adobe Illustrator vector -> SVG -> svg2p5 code -> Integration code

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
/* Group & BrushStroke  –  adapted from OpenProcessing sketch #1612706: https://openprocessing.org/sketch/1612706
HOW THIS VERSION DIFFERS FROM THE ORIGINAL
1.  Colour source  
• Original: chose random colours from a fixed palette.  
• Changes: passes in ‘c’ sampled from pg.get(x,y), so every stroke inherits the exact lake / land colour underneath.
2.  Placement logic  
• Original: Group centres are generated by Poisson-Disk sampling.  
• Changes: Groups are placed on a regular grid over pg; we only create a Group if that pixel belongs to the lake/land 
(alpha>0 and not background navy).  Grid step comes from spaces[] to give different densities for Level 2-4.
3.  Drawing surface  
• Original: strokes are drawn directly on the main canvas.  
• Ours: strokes are rendered into pg2 (an off-screen buffer) so we can toggle the whole layer with activeLevel.
4.  Parameter tweaks  
• shapeWidth 20-50 px  (was 50-200 px) to fit our smaller scale.  
• shapeHeight 1-3 px   (was 1-6 px) for a finer brush feel.  
• groupRad random(120,125) and density 0.002 kept the same.
Aside from these edits, the polar distribution in Group.prepare() and the curved “capsule” outline in BrushStroke.show() follow the original
algorithm almost line-for-line, preserving its painterly aesthetic.*/

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
}  // End of Lake and Land drawing

//draw bridge
//I just tried adding and subtracting different distances and looking at the positional effects to adjust the slope a little bit.
function drawBridge() {
  noStroke(); 
  fill(139, 69, 19); // brown

  // Drawing a ‘wide’ bridge with a quadrilateral
  let x1 = 0;
  let y1 = height / 2; // left up

  let x2 = 0;
  let y2 = height; // left down

  let x3 = width / 2;
  let y3 = height;  // right down

  let x4 = width / 10;
  let y4 = height /2; // right up

  quad(x1, y1, x2, y2, x3, y3, x4, y4); // color the bridge

  //railings   
  //The angle and start point of the slant line are manually and repeatedly adjusted data

  stroke(101, 67, 33); // brown
  strokeWeight(10);

  line(x1 , y1-20 , x4+5 , y4-20); 
  line(x4+5 , y4-20 , x3+50 , y3)

  stroke(193, 154, 107,70); // light brown
  strokeWeight(10);
  line(x1 , y1+20 , x2+150 , y2); 
  line(x1+70 , y1+60 , x2+250 , y2); 

    stroke(75, 54, 33,100); // dark brown
  strokeWeight(8);
  line(x1 , y1+120 , x2+80 , y2); 
  line(x1+80 , y1+30 , x2+350 , y2); 


}

//ghost character  
//To make custom shapes, I traced the reference image in Adobe Illustrator and exported it as an SVG vector. 
//I then opened the SVG file in VS Code to access the path data, which I converted into p5.js code 
//using ChatGPT and the svg2p5.com converter. 

//chat GPT links:  https://chatgpt.com/share/684a6dbd-bae4-8003-b2d5-6f8f3033412e
//tutorial on youtube links:  https://www.youtube.com/watch?v=BATJDnUsTiU


function drawGhostCharacter(x = 200, y = 600, scaleVal = 1) {
  push();
  translate(x, y);
  scale(scaleVal);

  // black body with white stroke
  fill(0);
  stroke(255);
  strokeWeight(1);
  beginShape();
  vertex(160.16, 787.79);
  bezierVertex(173.49, 754.28, 176.56, 729.45, 176.56, 729.45);
  bezierVertex(179.64, 704.62, 181.17, 668.01, 181.69, 636.36);
  bezierVertex(182.2, 604.71, 188.87, 520.31, 205.27, 491.14);
  bezierVertex(221.67, 461.97, 227.31, 450.18, 255.51, 455.15);
  bezierVertex(283.71, 460.12, 293.96, 469.42, 294.47, 487.42);
  bezierVertex(294.98, 505.42, 307.8, 559.41, 307.28, 596.64);
  bezierVertex(306.77, 633.88, 289.35, 671.73, 290.38, 705.86);
  bezierVertex(291.41, 740, 319.6, 781.58, 330.36, 787.79);
  bezierVertex(341.12, 794, 306.78, 813.85, 281.15, 808.89);
  bezierVertex(255.52, 803.93, 229.38, 803.64, 208.36, 809.68);
  bezierVertex(187.34, 815.72, 175.02, 804.55, 160.16, 787.79);
  endShape(CLOSE);

  // white face mask
  noStroke();
  fill(255);
  beginShape();
  vertex(232.51, 479.62);
  bezierVertex(242.34, 467.33, 269.26, 469.1, 277.6, 494.42);
  bezierVertex(283.67, 512.85, 280.22, 528.49, 278.65, 541.61);
  bezierVertex(276.76, 557.4, 263.71, 577.35, 244.3, 572.6);
  bezierVertex(225.81, 568.08, 223.86, 556.4, 221.5, 540.77);
  bezierVertex(217.57, 514.69, 222.68, 491.9, 232.51, 479.62);
  endShape(CLOSE);

  // eyes,mouth...  black
  fill(0)
  ellipse(238.04, 508.01, 8.13 * 2, 3.81 * 2);
  ellipse(239.08, 494.61, 1.56 * 2, 7.27 * 2);
  ellipse(267.89, 497.15, 1.56 * 2, 7.27 * 2);
  ellipse(236.99, 521.41, 1.56 * 2, 7.27 * 2);
  ellipse(266.84, 525.13, 1.56 * 2, 7.27 * 2);
  ellipse(266.84, 510.55, 8.13 * 2, 3.81 * 2);
  ellipse(249.37, 549.05, 7.87 * 2, 11.53 * 2);
  pop();
}


/* Character
To make custom shapes, I traced the reference image in Adobe Illustrator and exported it as an SVG vector. 
I then opened the SVG file in VS Code to access the path data, which I converted into p5.js code 
using ChatGPT and the svg2p5.com converter. 

ChatGPT Links: 
https://chatgpt.com/share/68441ed9-aadc-800a-973f-e1387b4b74cc
https://chatgpt.com/share/68441f02-1634-800a-8e9f-7963758f5023
https://chatgpt.com/share/68441f26-1460-800a-926a-effebb2238c6 */

function drawScreamCharacter(expression) {   // Start of character drawing
  push();   // Save current drawing style and transform state, keeps shape in place
  translate(width / 3, height / 3);   // Shrink character to fit screen
  scale(0.8);   // Scale down the character for better visibility

  //Body
  push(); // Save current drawing style and transform state, keeps shape in place
  noStroke();
  beginShape(); // Start of custom shape
  fill('#4a4b4c');
  // Starting point
  vertex(219.56, 283.215); // Add vertices to specify the corner points of a custom shape. Tecnique ref: https://p5js.org/reference/p5/vertex/ 
  bezierVertex(161.235, 285.11, 142.937, 326.477, 142.937, 326.477); // Curves are drawn by adding curved segments to custom shapes. Technique ref: https://p5js.org/reference/p5/bezierVertex/ 
  bezierVertex(142.937, 326.477, 131.807, 398.212, 131.807, 398.212);
  bezierVertex(131.807, 398.212, 153.263, 531.879, 123.641, 603.675);
  bezierVertex(86.829, 692.899, 75.15, 841.89, 75.15, 841.89);
  vertex(331.565, 841.89);
  bezierVertex(331.565, 841.89, 326.833, 700.232, 381.303, 619.149);
  bezierVertex(423.32, 556.603, 427.325, 429.452, 427.325, 429.452);
  vertex(431.177, 356.817);
  bezierVertex(440.094, 305.459, 396.782, 306.213, 396.782, 306.213);
  vertex(219.56, 283.215);
  endShape(CLOSE); // End of custom shape
  pop(); // Restore the previous drawing state

  //Left Arm
  push();
  fill('#231f20');
  stroke('#231f20');
  strokeWeight(6);
  beginShape(); // Start of custom shape
  // Starting point
  vertex(211.545, 313.387); // Add vertices
  bezierVertex(194.578, 377.035, 161.081, 408.672, 161.081, 408.672); // Add a curved segment
  bezierVertex(110.591, 504.957, 94.983, 572.776, 111.983, 626.02);
  bezierVertex(129.061, 679.87, 170.607, 661.739, 185.081, 635.424);
  bezierVertex(199.555, 609.109, 227.349, 565.018, 253.587, 470.564);
  bezierVertex(279.825, 376.11, 278.494, 329.459, 278.494, 329.459);
  bezierVertex(278.494, 329.459, 265.664, 282.703, 235.501, 316.298);
  endShape(CLOSE); // Start of custom shape
  pop();

  //Right Arm
  push();
  fill('#231f20');
  stroke('#231f20');
  strokeWeight(6);
  beginShape();
  // Starting point
  vertex(442.677, 289.429); // Add vertices
  bezierVertex(454.049, 289.429, 462.203, 300.443, 458.824, 311.301); // Add a curved segment
  bezierVertex(452.597, 331.308, 445.033, 361.594, 446.453, 387.167);
  bezierVertex(448.808, 429.559, 467.459, 610.129, 405.95, 639.371);
  bezierVertex(405.95, 639.371, 395.692, 645.241, 377.59, 646.093);
  bezierVertex(364.222, 646.722, 355.426, 632.28, 362.159, 620.714);
  bezierVertex(379.38, 591.128, 406.468, 537.069, 407.301, 488.539);
  bezierVertex(407.301, 488.539, 409.603, 424.838, 398.665, 381.545);
  bezierVertex(398.234, 379.838, 398.043, 378.086, 398.148, 376.329);
  bezierVertex(398.786, 365.618, 402.948, 326.224, 430.018, 295.127);
  bezierVertex(433.196, 291.477, 437.837, 289.429, 442.677, 289.429);
  endShape(CLOSE); // End of custom shape
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

  /* Interactive Mouth 
  Mouth size change upon each button click */
  push(); // Save current drawing style and transform state, keeps shape in place
  fill(169, 146, 109)
  stroke(0)
  strokeWeight(6)
  let q = mousePressed ? 3 : 0; // Jitter amount (quiver strength)

  if (expression === 'level 1') { // 'level 1' button clicked
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
  else if (expression === 'level 2') { // 'level 2' button clicked
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
  else if (expression === 'level 3') { // 'level 3' button clicked
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
  else if (expression === 'level 4') {  // 'level 4' button clicked
    /* Mouth XL — with quiver on click
    Reference technique:
    https://p5js.org/examples/calculating-values-random/ 
    Lines jitter randomly with q value to simulate a quivering mouth. */
    beginShape();
    vertex(364.399 + random(-q, q), 332.493 + random(-q, q)); 
    bezierVertex(
      368.739 + random(-q, q), 324.013 + random(-q, q),
      375.142 + random(-q, q), 301.543 + random(-q, q),
      376.357 + random(-q, q), 292.13 + random(-q, q)
    );
    bezierVertex(
      390.439 + random(-q, q), 182.973 + random(-q, q),
      264.752 + random(-q, q), 226.114 + random(-q, q),
      289.869 + random(-q, q), 373.671 + random(-q, q)
    );
    bezierVertex(
      292.281 + random(-q, q), 387.84 + random(-q, q),
      271.93 + random(-q, q), 437.821 + random(-q, q),
      306.561 + random(-q, q), 418.423 + random(-q, q)
    );
    bezierVertex(
      317.439 + random(-q, q), 412.33 + random(-q, q),
      324.061 + random(-q, q), 407.319 + random(-q, q),
      335.264 + random(-q, q), 384.368 + random(-q, q)
    );
    bezierVertex(
      342.704 + random(-q, q), 369.126 + random(-q, q),
      342.788 + random(-q, q), 367.185 + random(-q, q),
      346.478 + random(-q, q), 362.086 + random(-q, q)
    );
    bezierVertex(
      354.184 + random(-q, q), 351.436 + random(-q, q),
      360.157 + random(-q, q), 340.782 + random(-q, q),
      364.399 + random(-q, q), 332.493 + random(-q, q)
    );
    endShape();
  }
  pop();

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

  pop(); // End of character drawing *********************************
}


// Start of Sky Drawing
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
} // End of sky drawing *********************************


// Button class
class Button {
  constructor(label, x, y, action) {
    this.label = label; // Text shown on the button
    this.x = x; // X Position on the canvas
    this.y = y;  // Y Position on the canvas
    this.w = 80; // Button width
    this.h = 30; // Button width
    this.action = action; // A function that runs when the button is pressed
  }
  isHovered() { // Returns true if the mouse is over the button area
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
    rect(this.x, this.y, this.w, this.h, 5); // Draw button (rounded)
    textSize(17);
    fill(0);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2); // Draw label
  }

  clicked(mx, my) { // Checks if the mouse click falls inside the button’s area
    return mx > this.x && mx < this.x + this.w && my > this.y && my < this.y + this.h;
  }
}

function drawButtons() { // Loop through the array of buttons and calls show() on each one
  for (let b of buttons) {
    b.show();
  }
}

// This code implements the function of updating activeLevel when the mouse clicks the button
function mousePressed() { // Button clicked
  for (let b of buttons) {
    if (b.clicked(mouseX, mouseY)) {
      b.action();
    }
  }
}


function windowResized() { // Make elements adjust to window size
  resizeCanvas(windowWidth, windowHeight);
  createButtons();  // Recalculate button positions
  
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
