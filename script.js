var mapWidth = 10;
var mapHeight = 15;
var delay = 500;
var canvas;
var canvasContext;
var holdingCanvas;
var holdingCanvasContext;
var nextCanvas;
var nextCanvasContext;
var objects;
var updateInterval;
var lastCreatedObjectIndex;
var dimBox;
var possibleObjects;
var nextObject;
var swappedThisBlock;
var swapObject;
var objectStartPos;

const classroomIconUrl =
  "https://cdn.glitch.me/61845a2e-50dd-416e-b27c-f6c4d479d0ad%2Ffavicon.png?v=1633720408561";

window.addEventListener("keydown", handleKeyPress); // handle key presses

window.addEventListener("focus", () => {
  if (updateInterval == null && objects.length > 0) {
    updateInterval = setInterval(update, delay);
  }
});

window.addEventListener("blur", () => {
  if (updateInterval != null && objects.length > 0) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
});

window.addEventListener("message", event => {
  handleKeyPress({ code: event.data });
});

function checkSchoolHours(force = false) {
  if (getCookie("disguiseTab") == "off" && !force) {
    return;
  }

  let date = new Date();
  if (
    (date.getDay() != 0 && date.getDay() != 6) ||
    getCookie("disguiseTab") == "force" ||
    force
  ) {
    if (
      (date.getHours() > 7 && date.getHours() < 14) ||
      (date.getHours() == 7 && date.getMinutes() >= 40) ||
      (date.getHours() == 14 && date.getMinutes() <= 40) ||
      getCookie("disguiseTab") == "force" ||
      force
    ) {
      if (
        getCookie("disguiseTab") == "force" ||
        force ||
        getCookie("disguiseTab") == "on" ||
        confirm(
          "You are playing tetris during school hours.\nWould you like to disguise this tab as a google classroom window?"
        )
      ) {
        document.getElementById("icon").href = classroomIconUrl;
        document.getElementById("tabTitle").innerHTML = "Classes";
      }
    }
  }
}

function openInWindow() {
  let url = prompt(
    "What url would you like the control window to open to?\n(Leave blank for Google Classroom)"
  );

  if (url == "") {
    url = "https://classroom.google.com/h";
  } else if (!url.startsWith("http")) {
    url = "http://" + url;
  }

  window.open(url, "Classes");
}

function handleKeyPress(e) {
  if (objects.length == 0) {
    if (e.code == "Space" || e.code == "Enter") {
      start();
    }

    return;
  }

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
    objects[lastCreatedObjectIndex].position[1] += getFallLevel(
      lastCreatedObjectIndex
    );

    draw();

    update();
    return;
  } else if (e.code == "KeyQ") {
    rotate(1);

    draw();

    return;
  } else if (e.code == "KeyE") {
    rotate(-1);

    draw();

    return;
  } else if (e.code == "KeyC") {
    swap();
    
    draw();

    return;
  } else if (e.code == "Escape") {
    die();

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

function getSmallestPosition(object, direction) {
  let relativePositions =
    object.relativePositions[object.relativePositionsIndex];

  let farthestPosition = Infinity;

  for (var i = 0; i < relativePositions.length; i++) {
    if (relativePositions[i][direction] < farthestPosition) {
      farthestPosition = relativePositions[i][0];
    }
  }

  return farthestPosition;
}

function draw() {
  nextCanvasContext.lineWidth = 4;
  canvasContext.lineWidth = 4;
  
  canvasContext.clearRect(0, 0, canvas.width, canvas.height); // clear the canvases
  nextCanvasContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  holdingCanvasContext.clearRect(0, 0, holdingCanvas.width, holdingCanvas.height);

  for (var i = 0; i < objects.length; i++) {
    // loop through all of the shapes (objects)
    let object = objects[i];

    canvasContext.fillStyle = object.color;
    canvasContext.strokeStyle = object.borderColor;

    let relativePositions =
      object.relativePositions[object.relativePositionsIndex];

    for (var j = 0; j < relativePositions.length; j++) {
      // loop through all of the squares in the shape (object)
      let blockPosition = relativePositions[j];

      canvasContext.beginPath();

      canvasContext.rect(
        (object.position[0] + blockPosition[0]) * 30,
        (object.position[1] + blockPosition[1]) * 30,
        30,
        30
      ); // add a square in the position of a part of the piece we are currently drawing (object)

      canvasContext.fill(); // fill the current path

      canvasContext.beginPath();

      canvasContext.rect(
        (object.position[0] + blockPosition[0]) * 30 + 2, // the 2 is to account for the border being on both sides of the path (2 is half of the linewidth)
        (object.position[1] + blockPosition[1]) * 30 + 2,
        26,
        26
      ); // add a square in the position of a part of the piece we are currently drawing (object)

      canvasContext.stroke(); // draw the outline
    }
  }

  // draw the ghost image

  let object = objects[lastCreatedObjectIndex];

  let relativePositions =
    object.relativePositions[object.relativePositionsIndex];

  for (var i = 0; i < relativePositions.length; i++) {
    let blockPosition = relativePositions[i];

    canvasContext.strokeStyle = object.backgroundColor;

    canvasContext.beginPath();

    canvasContext.rect(
      (object.position[0] + blockPosition[0]) * 30 + 2,
      (object.position[1] +
        blockPosition[1] +
        getFallLevel(lastCreatedObjectIndex)) *
        30 +
        2,
      26,
      26
    );

    canvasContext.stroke();
  }

  if (nextObject != null) {
    relativePositions =
      nextObject.relativePositions[nextObject.relativePositionsIndex];

    for (var i = 0; i < relativePositions.length; i++) {
      // loop through all of the squares in the shape (object)
      let blockPosition = relativePositions[i];

      nextCanvasContext.strokeStyle = nextObject.borderColor;
      nextCanvasContext.fillStyle = nextObject.color;

      nextCanvasContext.beginPath();

      nextCanvasContext.rect(
        (blockPosition[0] - getSmallestPosition(nextObject, 0)) * 30,
        blockPosition[1] * 30,
        30,
        30
      ); // add a square in the position of a part of the piece we are currently drawing (object)

      nextCanvasContext.fill(); // fill the current path

      nextCanvasContext.beginPath();

      nextCanvasContext.rect(
        (blockPosition[0] - getSmallestPosition(nextObject, 0)) * 30 + 2, // the 2 is to account for the border being on both sides of the path (2 is half of the linewidth)
        blockPosition[1] * 30 + 2,
        26,
        26
      ); // add a square in the position of a part of the piece we are currently drawing (object)

      nextCanvasContext.stroke(); // draw the outline
    }
  }

  if (swapObject != null) {
    relativePositions =
      swapObject.relativePositions[swapObject.relativePositionsIndex];

    for (var i = 0; i < relativePositions.length; i++) {
      // loop through all of the squares in the shape (object)
      let blockPosition = relativePositions[i];

      holdingCanvasContext.strokeStyle = swapObject.borderColor;
      holdingCanvasContext.fillStyle = swapObject.color;

      holdingCanvasContext.beginPath();

      holdingCanvasContext.rect(
        (blockPosition[0] - getSmallestPosition(swapObject, 0)) * 30,
        blockPosition[1] * 30,
        30,
        30
      ); // add a square in the position of a part of the piece we are currently drawing (object)

      holdingCanvasContext.fill(); // fill the current path

      holdingCanvasContext.beginPath();

      holdingCanvasContext.rect(
        (blockPosition[0] - getSmallestPosition(swapObject, 0)) * 30 + 2, // the 2 is to account for the border being on both sides of the path (2 is half of the linewidth)
        blockPosition[1] * 30 + 2,
        26,
        26
      ); // add a square in the position of a part of the piece we are currently drawing (object)

      holdingCanvasContext.stroke(); // draw the outline
    }
  }
}

function reset() {
  objects = [];
  swappedThisBlock = false;
  swapObject = null;
  nextObject = null;
}

function die() {
  clearInterval(updateInterval);

  reset();

  dimBox.style.display = "";
}

function getNextObject() {
  nextObject = JSON.parse(
    JSON.stringify(
      possibleObjects[Math.floor(Math.random() * possibleObjects.length)]
    )
  );
}

function spawnObject() {
  if (nextObject == null) {
    getNextObject();
  }

  objects.push(JSON.parse(JSON.stringify(nextObject))); // add a new object to the objects list. Create a new object with the same values instead of accesing the same piece of memory.

  getNextObject();

  lastCreatedObjectIndex = objects.length - 1;

  if (checkObjectTrajectory(lastCreatedObjectIndex, [0, 0])) {
    die();
  }
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

function swap() {
  if (!swappedThisBlock) {
    if (swapObject == null) {
      swapObject = JSON.parse(JSON.stringify(objects[lastCreatedObjectIndex]));

      // reset the position
      swapObject.position = objectStartPos;

      // reset the rotation
      swapObject.relativePositionsIndex = 0;

      objects.splice(lastCreatedObjectIndex, 1);
      spawnObject();
    } else {
      let swapObjectCopy = JSON.parse(JSON.stringify(swapObject));

      swapObject = JSON.parse(JSON.stringify(objects[lastCreatedObjectIndex]));

      // reset the position
      swapObject.position = objectStartPos;

      // reset the rotation
      swapObject.relativePositionsIndex = 0;

      objects.splice(lastCreatedObjectIndex, 1);
      objects.push(JSON.parse(JSON.stringify(swapObjectCopy)));
    }

    swappedThisBlock = true;
  }
}

function deleteRow(row) {
  for (var i = 0; i < objects.length; i++) {
    let object = objects[i];

    let relativePositions =
      object.relativePositions[object.relativePositionsIndex];

    let newRelativePositions = [];

    for (var j = 0; j < relativePositions.length; j++) {
      if (object.position[1] + relativePositions[j][1] != row) {
        newRelativePositions.push(relativePositions[j]);
      }
    }

    object.relativePositions[
      object.relativePositionsIndex
    ] = newRelativePositions;
  }
}

function collectGarbage() {
  for (var i = 0; i < objects.length; i++) {
    // loop through all objects
    let object = objects[i];

    if (object.relativePositions[object.relativePositionsIndex].length == 0) {
      objects.splice(i, 1);
    }
  }
}

function splitObjects(row) {
  let output = [];

  for (var i = 0; i < objects.length; i++) {
    // loop through all objects
    let topHalf = []; // contains the positions of the top squares
    let bottomHalf = []; // contains the positions of the top squares.

    let object = objects[i];

    let relativePositions =
      object.relativePositions[object.relativePositionsIndex];

    for (var j = 0; j < relativePositions.length; j++) {
      // loop through all squares in the object
      if (relativePositions[j][1] + object.position[1] > row) {
        topHalf.push(relativePositions[j]);
      } else {
        bottomHalf.push(relativePositions[j]);
      }
    }

    // add a new object to output and change the relativePositions to tophalf. do the same thing for bottomhalf

    if (topHalf.length > 0) {
      output.push(JSON.parse(JSON.stringify(object)));

      output[output.length - 1].relativePositions[
        object.relativePositionsIndex
      ] = topHalf;
    }

    if (bottomHalf.length > 0) {
      output.push(JSON.parse(JSON.stringify(object)));

      output[output.length - 1].relativePositions[
        object.relativePositionsIndex
      ] = bottomHalf;
    }
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
  // move the objects to where they go
  let startObjectLength = objects.length;

  for (var i = 0; i < startObjectLength; i++) {
    // loop through all objects

    if (checkObjectTrajectory(i, [0, 1])) {
      if (objects[i].falling) {
        lastCreatedObjectIndex = null;
        objects[i].falling = false;

        checkRowFull();

        spawnObject();

        swappedThisBlock = false;

        console.log(objects.length);
      }

      continue;
    }

    objects[i].position[1]++;
  }

  draw();
}

function start() {
  dimBox.style.display = "none";

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

    let startPosition = [
      object.position[0] + relativePositions[i][0],
      object.position[1] + relativePositions[i][1]
    ];

    let relativePosition = 0; // how much y coordinate to add until you hit an object or  the border.

    let positionValue = null;

    while (positionValue == null || positionValue == objectIndex) {
      // loop while the new position is empty
      relativePosition++;
      positionValue = positionIsEmpty([
        startPosition[0],
        startPosition[1] + relativePosition
      ]); // check to see if we have hit something
    }

    if (relativePosition < smallestRelativePosition) {
      // if the new position is less than the smallest one so far, overwrite it.
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

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2)
    return parts
      .pop()
      .split(";")
      .shift();
}

function updateSelectOption(object, optionName, reloadPage) {
  if (
    object.value < parseInt(object.getAttribute("min"), 10) ||
    object.value > parseInt(object.getAttribute("max"), 10)
  ) {
    alert(
      "Value must be between " +
        object.getAttribute("min") +
        " and " +
        object.getAttribute("max") +
        "."
    );
    reloadPage();
    return;
  }

  document.cookie = optionName + "=" + object.value;
  loadCookies();
}

function updateSliderOption(object, optionName) {
  document.cookie = optionName + "=" + object.value;
  loadCookies();
}

function updateCheckOption(object, optionName) {
  document.cookie = optionName + "=" + (object.checked ? "on" : "off");
  loadCookies();
}

function generateBlockColorOptions(url, letter, color, altColor) {
  return (
    `
    <img src='` +
    url +
    `' class='blockDiagram' /><br>
    <label for="` +
    letter +
    `Color">Color</label><input value="` +
    color +
    `" onchange="updateSliderOption(this, '` +
    letter +
    `Color')" id="` +
    letter +
    `Color" type="color"><br>
    <label for="` +
    letter +
    `BorderColor">Border Color</label><input value="` +
    altColor +
    `" onchange="updateSliderOption(this, '` +
    letter +
    `BorderColor')" id="` +
    letter +
    `BorderColor" type="color"><br><br>
  `
  );
}

function loadColorValue(name, defaultColor) {
  document.getElementById(name).value =
    getCookie(name) === undefined ? defaultColor : getCookie(name);
}

function setColorValue(name, object) {
  if (getCookie(name) === undefined) return;

  object.color = getCookie(name);
}

function setBackgroundColorValue(name, object) {
  if (getCookie(name) === undefined) return;

  object.backgroundColor = getCookie(name);
}

function blockOptions() {
  $("#optionsContent").html(
    generateBlockColorOptions(
      "https://cdn.glitch.me/caeb91db-3a89-4b7b-aeb9-5db17fab57c6%2FI.png?v=1635117748498",
      "i",
      "#00FFFF",
      "#00CCCC"
    ) +
      generateBlockColorOptions(
        "https://cdn.glitch.me/caeb91db-3a89-4b7b-aeb9-5db17fab57c6%2FJ.png?v=1635117723853",
        "j",
        "#0000FF",
        "#0000CC"
      ) +
      generateBlockColorOptions(
        "https://cdn.glitch.me/caeb91db-3a89-4b7b-aeb9-5db17fab57c6%2FL.png?v=1635117732997",
        "l",
        "#FFA500",
        "#CC7200"
      ) +
      generateBlockColorOptions(
        "https://cdn.glitch.me/caeb91db-3a89-4b7b-aeb9-5db17fab57c6%2FO.png?v=1635117742983",
        "o",
        "#FFFF00",
        "#CCCC00"
      ) +
      generateBlockColorOptions(
        "https://cdn.glitch.me/caeb91db-3a89-4b7b-aeb9-5db17fab57c6%2FS.png?v=1635117728603",
        "s",
        "#00FF00",
        "#00CC00"
      ) +
      generateBlockColorOptions(
        "https://cdn.glitch.me/caeb91db-3a89-4b7b-aeb9-5db17fab57c6%2FZ.png?v=1635117718087",
        "z",
        "#FF0000",
        "#CC0000"
      ) +
      generateBlockColorOptions(
        "https://cdn.glitch.me/caeb91db-3a89-4b7b-aeb9-5db17fab57c6%2FT.png?v=1635117737825",
        "t",
        "#FF00FF",
        "#CC00CC"
      )
  );

  loadColorValue("iColor", "#00FFFF");
  loadColorValue("iBorderColor", "#00CCCC");

  loadColorValue("jColor", "#0000FF");
  loadColorValue("jBorderColor", "#0000CC");

  loadColorValue("lColor", "#FFA500");
  loadColorValue("lBorderColor", "#CC7200");

  loadColorValue("oColor", "#FFFF00");
  loadColorValue("oBorderColor", "#CCCC00");

  loadColorValue("sColor", "#00FF00");
  loadColorValue("sBorderColor", "#00CC00");

  loadColorValue("zColor", "#FF0000");
  loadColorValue("zBorderColor", "#CC0000");

  loadColorValue("tColor", "#FF00FF");
  loadColorValue("tBorderColor", "#CC00CC");

  document.getElementById("blockOptions").style.backgroundColor = "gray";
  document.getElementById("otherOptions").style.backgroundColor = "";
}

function otherOptions() {
  $("#optionsContent").html(`
    <br style="line-height: 15px"><label style="margin-top: 30px;" for="disguiseTab" onclick="updateCheckOption(this, 'disguiseTab')">Disguise Tab</label>
    <select id="disguiseTab" onchange="updateSelectOption(this, 'disguiseTab')">
      <option value="on">Automatic</option>
      <option value="force">Always</option>
      <option value="off">Never</option>
      <option value="undefined">Ask At School</option>
    </select>
    <button type="button" class="start" onclick="checkSchoolHours(true)">Disguise Now</button>
    <button type="button" class="start" onclick="openInWindow()">Control Window</button>
    <br><br><a target="_blank" class="controlWindow" href="https://snakegamejs.glitch.me/controlWindow.html">How to use the control window?</a>
  `);
  document.getElementById("disguiseTab").value = getCookie("disguiseTab");
  document.getElementById("blockOptions").style.backgroundColor = "";
  document.getElementById("otherOptions").style.backgroundColor = "gray";
}

function loadCookies() {
  setColorValue("iColor", possibleObjects[0]);
  setColorValue("jColor", possibleObjects[1]);
  setColorValue("lColor", possibleObjects[2]);
  setColorValue("oColor", possibleObjects[3]);
  setColorValue("sColor", possibleObjects[4]);
  setColorValue("tColor", possibleObjects[5]);
  setColorValue("zColor", possibleObjects[6]);

  setBackgroundColorValue("iBackgroundColor", possibleObjects[0]);
  setBackgroundColorValue("jBackgroundColor", possibleObjects[1]);
  setBackgroundColorValue("lBackgroundColor", possibleObjects[2]);
  setBackgroundColorValue("oBackgroundColor", possibleObjects[3]);
  setBackgroundColorValue("sBackgroundColor", possibleObjects[4]);
  setBackgroundColorValue("tBackgroundColor", possibleObjects[5]);
  setBackgroundColorValue("zBackgroundColor", possibleObjects[6]);
}

$(() => {
  canvas = document.getElementById("canvas");
  canvasContext = canvas.getContext("2d");

  holdingCanvas = document.getElementById("holdingCanvas");
  holdingCanvasContext = holdingCanvas.getContext("2d");

  nextCanvas = document.getElementById("nextCanvas");
  nextCanvasContext = nextCanvas.getContext("2d");

  dimBox = document.getElementById("dimBox");

  loadCookies(); // load all cookies into variables

  checkSchoolHours();

  reset(); // reset all the components

  blockOptions(); // open the block options
});
