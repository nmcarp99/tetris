const startPosition = [5, -2];
var possibleObjects = [
  {
    falling: true,
    position: startPosition,
    relativePositions: [
      [[-2, 1], [-1, 1], [0, 1], [1, 1]], // 0deg
      [[0, 2], [0, 1], [0, 0], [0, -1]], // 90deg (from 0 deg, multiply the x by -1, then flip the x and y)
      [[-2, 1], [-1, 1], [0, 1], [1, 1]], // 180deg (from 0 deg, multiply the x by -1, then multiply the y by -1)
      [[0, 2], [0, 1], [0, 0], [0, -1]], // 270deg (from 0 deg, multiply the y by -1, then flip the x and y)
    ],
    relativePositionsIndex: 0,
    color: "#00FFFF",
    borderColor: "#00CCCC"
  }, // I
  {
    falling: true,
    position: startPosition,
    relativePositions: [
      [[-1, 0], [-1, 1], [0, 1], [1, 1]],
      [[0, 1], [1, 1], [1, 0], [1, -1]],
      [[1, 0], [1, -1], [0, -1], [-1, -1]],
      [[0, -1], [-1, -1], [-1, 0], [-1, 1]]
    ],
    relativePositionsIndex: 0,
    color: "#0000FF",
    borderColor: "#0000CC"
  }, // J
  {
    falling: true,
    position: startPosition,
    relativePositions: [
      [[1, 0], [-1, 1], [0, 1], [1, 1]],
      [[0, -1], [1, 1], [1, 0], [1, -1]],
      [[-1, 0], [1, -1], [0, -1], [-1, -1]],
      [[0, 1], [-1, -1], [-1, 0], [-1, 1]]
    ],
    relativePositionsIndex: 0,
    color: "#FFA500",
    borderColor: "#CC7200"
  }, // L
  {
    falling: true,
    position: startPosition,
    relativePositions: [
      [[-1, 0], [0, 0], [-1, 1], [0, 1]],
      [[-1, 0], [0, 0], [-1, 1], [0, 1]],
      [[-1, 0], [0, 0], [-1, 1], [0, 1]],
      [[-1, 0], [0, 0], [-1, 1], [0, 1]]
    ],
    relativePositionsIndex: 0,
    color: "#FFFF00",
    borderColor: "#CCCC00"
  }, // O
  {
    falling: true,
    position: startPosition,
    relativePositions: [
      [[0, 0], [1, 0], [-1, 1], [0, 1]],
      [[0, 0], [0, -1], [1, 1], [1, 0]],
      [[0, 0], [1, 0], [-1, 1], [0, 1]],
      [[0, 0], [0, -1], [1, 1], [1, 0]]
    ],
    relativePositionsIndex: 0,
    color: "#00FF00",
    borderColor: "#00CC00"
  }, // S
  {
    falling: true,
    position: startPosition,
    relativePositions: [
      [[0, 0], [-1, 1], [0, 1], [1, 1]],
      [[0, 0], [1, 1], [1, 0], [1, -1]],
      [[0, 0], [1, -1], [0, -1], [-1, -1]],
      [[0, 0], [-1, -1], [-1, 0], [-1, 1]]
    ],
    relativePositionsIndex: 0,
    color: "#FF00FF",
    borderColor: "#CC00CC"
  }, // T
  {
    falling: true,
    position: startPosition,
    relativePositions: [
      [[-1, 0], [0, 0], [0, 1], [1, 1]],
      [[0, 1], [0, 0], [1, 0], [1, -1]],
      [[-1, 0], [0, 0], [0, 1], [1, 1]],
      [[0, 1], [0, 0], [1, 0], [1, -1]]
    ],
    relativePositionsIndex: 0,
    color: "#FF0000",
    borderColor: "#CC0000"
  } // Z
]; // put all possible shape objects here