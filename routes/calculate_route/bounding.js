const PADDING = 0.01;

const MAXEAST = 107.5126878,
  MAXNORTH = -6.9419709,
  MAXWEST = 107.7046799,
  MAXSOUTH = -7.029609;
function set_bounds(sourceCoordinates, targetCoordinates) {
  // approaches
  // 1. get latitude and longitude of coords
  // 2. set south,west,north,east boundings
  // 3. return boundings

  // 1. get latitude and longitude of coords
  const sourceLat = sourceCoordinates[0],
    sourceLon = sourceCoordinates[1];

  const targetLat = targetCoordinates[0],
    targetLon = targetCoordinates[1];

  // 2. set south,west,north,east boundings
  // addition: use paddings
  let south = sourceLat,
    west = sourceLon,
    north = sourceLat,
    east = sourceLon;

  if (south > targetLat) south = targetLat;
  if (west > targetLon) west = targetLon;
  if (targetLat > north) north = targetLat;
  if (targetLon > east) east = targetLon;

  let inBounds = true;

  if (south < MAXSOUTH) inBounds = false;
  if (west > MAXWEST) inBounds = false;
  if (east < MAXEAST) inBounds = false;
  if (north > MAXNORTH) inBounds = false;

  // addition: use paddings
  south -= PADDING;
  west -= PADDING;
  north += PADDING;
  east += PADDING;

  return {
    south,
    west,
    north,
    east,
    inBounds,
  };
}

module.exports = set_bounds;
