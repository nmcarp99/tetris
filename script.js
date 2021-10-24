var mapWidth = 10;
var mapHeight = 15;
var delay = 500;
var canvas;
var canvasContext;
var objects;
var updateInterval;
var lastCreatedObjectIndex;

window.addEventListener("keydown", handleKeyPress); // handle key presses

window.addEventListener("focus", () => {
  if (updateInterval == null) {
    updateInterval = setInterval(update, delay);
  }
});

window.addEventListener("blur", () => {
  if (updateInterval != null) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
});

function handleKeyPress(e) {
  if (
    lastCreatedObjectIndex == null ||
    !objects[lastCreatedObjectIndex].falling
  )
    return;

  let direction = 0;

  let object = objects[lastCreatedObjectIndex];

  if (e.code == "ArrowRight" || e.code == "KeyD") {
    direction = 1;
  } else if (e.code == "ArrowLeft" || e.code == "KeyA") {
    direction = -1;
  } else if (e.code == "ArrowDown" || e.code == "KeyS") {
    update();
    return;
  } else if (e.code == "ArrowUp" || e.code == "KeyW") {
    objects[lastCreatedObjectIndex].position[1] += getFallLevel(lastCreatedObjectIndex);
    draw();
    return;
  } else if (e.code == "KeyQ") {
    rotate(1);

    draw();

    return;
  } else if (e.code == "KeyE") {
    rotate(-1);

    draw();

    return;
  } else if (e.code == "Space") {
    rotate(1);

    draw();

    return;
  } else {
    return;
  }

  let relativePositions =
    object.relativePositions[object.relativePositionsIndex];

  if (checkObjectTrajectory(lastCreatedObjectIndex, [direction, 0])) return;

  objects[lastCreatedObjectIndex].position[0] += direction;

  draw();
}

function draw() {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

  for (var i = 0; i < objects.length; i++) {
    // loop through all of the shapes (objects)
    let object = objects[i];

    canvasContext.fillStyle = object.color;

    canvasContext.beginPath();

    let relativePositions =
      object.relativePositions[object.relativePositionsIndex];

    for (var j = 0; j < relativePositions.length; j++) {
      // loop through all of the squares in the shape (object)
      let blockPosition = relativePositions[j];

      canvasContext.rect(
        (object.position[0] + blockPosition[0]) * 30,
        (object.position[1] + blockPosition[1]) * 30,
        30,
        30
      ); // add a square in the position of a part of the piece we are currently drawing (object)
    }

    canvasContext.fill(); // draw the current path
  }
}

function reset() {
  objects = [];
}

function spawnObject() {
  objects.push(
    JSON.parse(
      JSON.stringify(
        possibleObjects[Math.floor(Math.random() * possibleObjects.length)]
      )
    )
  ); // add a new object to the objects list. Create a new object with the same values instead of accesing the same piece of memory.

  lastCreatedObjectIndex = objects.length - 1;
}

function positionIsEmpty(position) {
  // returns null if no object, otherwise returns index in objects array
  if (position[0] < 0 || position[0] >= mapWidth || position[1] >= mapHeight) {
    return -1;
  }

  for (var i = 0; i < objects.length; i++) {
    // loop through all objects
    let object = objects[i];

    let relativePositions =
      object.relativePositions[object.relativePositionsIndex];

    for (var j = 0; j < relativePositions.length; j++) {
      // loop through all squares in current object ( object)
      let blockPosition = [
        relativePositions[j][0] + object.position[0],
        relativePositions[j][1] + object.position[1]
      ];

      if (blockPosition[0] == position[0] && blockPosition[1] == position[1]) {
        return i;
      }
    }
  }

  return null;
}

function checkObjectTrajectory(
  objectIndex,
  direction,
  temporaryRelativePositionsIndex = null
) {
  let object = objects[objectIndex];

  let relativePositions;

  if (temporaryRelativePositionsIndex == null) {
    relativePositions = object.relativePositions[object.relativePositionsIndex];
  } else {
    relativePositions =
      object.relativePositions[temporaryRelativePositionsIndex];
  }

  for (var j = 0; j < relativePositions.length; j++) {
    // loop through all squares in object (object) to check if there is an object in the way
    let positionValue = positionIsEmpty([
      relativePositions[j][0] + object.position[0] + direction[0],
      relativePositions[j][1] + object.position[1] + direction[1]
    ]);

    if (positionValue != null && positionValue != objectIndex) {
      // check if position isn't itself and it isn't empty
      return true;
    }
  }

  return false;
}

function deleteRow(row) {
  for (var i = 0; i < objects.length; i++) {
    let object = objects[i];
    
    let relativePositions = object.relativePositions[object.relativePositionsIndex];
    
    let newRelativePositions = [];
    
    for (var j = 0; j < relativePositions.length; j++) {
      if (object.position[1] + relativePositions[j][1] != row) {
        newRelativePositions.push(relativePositions[j]);
      }
    }
    
    object.relativePositions[object.relativePositionsIndex] = newRelativePositions;
  }
}

function collectGarbage() {
  for (var i = 0; i < objects.length; i++) { // loop through all objects
    let object = objects[i];
    
    if (object.relativePositions[object.relativePositionsIndex].length == 0) {
      objects.splice(i, 1);
    }
  }
}

function splitObjects(row) {
  
  let output = [];
  
  for (var i = 0; i < objects.length; i++) { // loop through all objects
    let topHalf = []; // contains the positions of the top squares
    let bottomHalf = []; // contains the positions of the top squares.
    
    let object = objects[i];
    
    let relativePositions = object.relativePositions[object.relativePositionsIndex];
    
    for (var j = 0; j < relativePositions.length; j++) { // loop through all squares in the object
      if (relativePositions[j][1] + object.position[1] > row) {
        topHalf.push(relativePositions[j]);
      } else {
        bottomHalf.push(relativePositions[j]);
      }
    }
    
    // add a new object to output and change the relativePositions to tophalf. do the same thing for bottomhalf
    
    output.push(JSON.parse(JSON.stringify(object)));
    
    output[output.length - 1].relativePositions[object.relativePositionsIndex] = topHalf;
    
    output.push(JSON.parse(JSON.stringify(object)));
    
    output[output.length - 1].relativePositions[object.relativePositionsIndex] = bottomHalf;
  }
  
  objects = output;
  
  collectGarbage();
}

function checkRowFull() {
  for (var i = 0; i < mapHeight; i++) {
    let rowIsFull = true;

    for (var j = 0; j < mapWidth; j++) {
      if (positionIsEmpty([j, i]) == null) {
        rowIsFull = false;

        break;
      }
    }

    if (rowIsFull) {
      deleteRow(i);

      splitObjects(i);
    }
  }
}

function update() {
  // allowcreateobject is for when you press up... it simply runs update over and over and doesn't create a new block until the real update is called
  // move the objects to where they go
  for (var i = 0; i < objects.length; i++) {
    // loop through all objects

    if (checkObjectTrajectory(i, [0, 1])) {
      if (objects[i].falling) {
        lastCreatedObjectIndex = null;
        objects[i].falling = false;
        
        checkRowFull();
        
        spawnObject();
      }

      continue;
    }

    objects[i].position[1]++;
  }

  draw();
}

function start() {
  spawnObject();
  update();
  updateInterval = setInterval(update, delay);
}

function getFallLevel(objectIndex) {
  let object = objects[objectIndex];

  let relativePositions =
    object.relativePositions[object.relativePositionsIndex];
  
  let smallestRelativePosition = mapHeight;

  for (var i = 0; i < relativePositions.length; i++) {
    // loop through each square in object
    
    let startPosition = [object.position[0] + relativePositions[i][0], object.position[1] + relativePositions[i][1]];
    
    let relativePosition = 0; // how much y coordinate to add until you hit an object or  the border.
    
    let positionValue = null;

    while (positionValue == null || positionValue == objectIndex) { // loop while the new position is empty
      relativePosition++;
      positionValue = positionIsEmpty([startPosition[0], startPosition[1] + relativePosition]); // check to see if we have hit something
    }
    
    if (relativePosition < smallestRelativePosition) { // if the new position is less than the smallest one so far, overwrite it.
      smallestRelativePosition = relativePosition;
    }
  }
  
  return smallestRelativePosition - 1;
}

function rotate(amount) {
  let newRelativePositionsIndex =
    (objects[lastCreatedObjectIndex].relativePositionsIndex + (4 + amount)) % 4;

  if (
    checkObjectTrajectory(
      lastCreatedObjectIndex,
      [0, 0],
      newRelativePositionsIndex
    )
  )
    return;

  objects[
    lastCreatedObjectIndex
  ].relativePositionsIndex = newRelativePositionsIndex;
}

$(() => {
  canvas = document.getElementById("canvas");
  canvasContext = canvas.getContext("2d");

  reset(); // reset all the components
  start(); // start the game
});