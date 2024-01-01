var main;
var mouseClickPos; // To store the position of the mouse click
var colorGrid = [];
var showLines = false;
const lineButton = document.getElementById("line-button");
lineButton.addEventListener("click", (event) => {
  showLines = !showLines;
  if(!showLines){
	lineButton.textContent = "Turn on lines"
  }
  else{
	lineButton.textContent = "Turn off lines"
  }
});

function setup() {
  var cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('parent');
  background(255);
  main = makeGrid(windowWidth, windowHeight, 20);
  // colorGrid = new Array(main.length)
}

function draw() {
  background(255);
  fill(0);
  ellipse(mouseX, mouseY, 20, 20);
  textSize(20);

  // for (var i = 0; i < main.length; i++) {
  // 	main[i].draw(50);
  // }
  // Draw points from colorGrid
  // colorGrid.forEach(point => {
  // 		fill(point.color);
  // 		ellipse(point.x, point.y, 2, 2); // Adjust size as needed
  // 	});

  if (showLines) {
    for (var i = 0; i < main.length; i++) {
      var point = main[i];
      // Draw lines between previous positions
      for (var j = 1; j < point.prevPos.length; j++) {
        line(
          point.prevPos[j - 1].x,
          point.prevPos[j - 1].y,
          point.prevPos[j].x,
          point.prevPos[j].y
        );
      }
    }
  }

  main.forEach((elem) => {
    elem.update();
    elem.draw(50);
  });
}

function mouseDragged() {
  burst();
}

function mousePressed() {
  burst();
}

function burst() {
  mouseClickPos = new Posn(mouseX, mouseY);
  main.forEach((elem) => {
    // elem.applyForce(elem.pos.offset(mouseClickPos).mul(pow(2, -(elem.pos.dist(mouseClickPos) * 0.04))));
    // elem.color = getColorBasedOnDistance(elem.pos.dist(mouseClickPos));
    var force = elem.pos
      .offset(mouseClickPos)
      .mul(pow(2, -(elem.pos.dist(mouseClickPos) * 0.04)));
    // console.log("elem.pos.offset(mouseClickPos)", elem.pos.offset(mouseClickPos), "-(elem.pos.dist(mouseClickPos)", -(elem.pos.dist(mouseClickPos), "pow(2, -(elem.pos.dist(mouseClickPos) * 0.04))", pow(2, -(elem.pos.dist(mouseClickPos) * 0.04))))

    if (force > 0) {
      console.log(force);
    }
    elem.applyForce(force, true); // Pass 'true' to indicate mouse event
    // console.log("i am force", force)
    elem.color = getColorBasedOnDistance(elem.pos.dist(mouseClickPos));
  });
}

function getColorBasedOnDistance(distance) {
  // Calculate a color based on the distance
  var alpha = map(distance, 0, 200, 255, 0); // Adjust 200 for the effect radius
  return color(0, 0, 0, alpha); // Black color with varying alpha
}

function makeGrid(width, height, blockSize) {
  var arr = [];

  for (var i = blockSize; i < width; i += blockSize) {
    for (var j = blockSize; j < height; j += blockSize) {
      arr.push(new Point(i, j, Math.random().toString(20)[3]));
      //arr.push(new Point(i, j, "a"));
    }
  }

  return arr;
}

function Point(x, y, letter, mass) {
  this.supposed = new Posn(x, y);
  this.pos = new Posn(x, y);
  this.vel = new Posn(0, 0);
  this.acc = new Posn(0, 0);
  this.lettering = letter != null;
  this.letter = letter;
  this.mass = mass == null ? 1 : mass;
  this.maxForce = 0.00025;
  this.maxDistance = 2;
  this.color = color(0, 0, 0, 0); // Initial color: transparent
  this.colorBang = color(0, 0, 0); // Initial color: transparent
  this.added = false;

  this.draw = (size) => {
    fill(this.color);
    if (this.lettering) {
      text(this.letter, this.pos.x, this.pos.y);
    } else {
      ellipse(this.pos.x, this.pos.y, size, size);
    }
  };

  this.update = () => {
    // should draw, update position, tell if clicked, etc, etc,
    this.applyForce(new Posn(random(-0.01, 0.01), random(-0.01, 0.01)));
    this.seek(this.supposed);
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.vel.mul(0.95); // friction
    this.acc.mul(0); //clear acc
  };

  this.seek = (target) => {
    this.applyForce(
      this.pos.offset(target).mul(this.pos.dist(target)).mul(-0.0001)
    );
  };

  this.prevPos = []; // Array to store previous positions

  this.applyForce = (force, record = false) => {
    this.acc.add(force);
    var magnitude = Math.sqrt(force.x * force.x + force.y * force.y);
    if (record && magnitude > 0.2) {
      // Store the current position in prevPos before updating it
      this.prevPos.push({ x: this.pos.x, y: this.pos.y });
      // Limit the size of prevPos to avoid memory issues
      if (this.prevPos.length > 10) {
        this.prevPos.shift();
      }
    }
  };

  this.click = (mousePos) => {
    // click (posn) -> void
  };
}

function Posn(x, y) {
  this.x = x;
  this.y = y;

  this.get = () => {
    return new Posn(this.x, this.y);
  };

  this.apply = (f) => {
    this.x = f(this.x);
    this.y = f(this.y);

    return new Posn(this.x, this.y);
  };

  this.add = (other) => {
    this.x += other.x;
    this.y += other.y;

    return this.get();
  };

  this.mul = (c) => {
    this.x *= c;
    this.y *= c;

    return this.get();
  };

  this.offset = (other) => {
    return new Posn(this.x - other.x, this.y - other.y);
  };

  this.dist = (other) => {
    return sqrt(sq(other.x - this.x) + sq(other.y - this.y));
  };
}
