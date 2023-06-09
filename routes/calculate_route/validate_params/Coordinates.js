function validating_coordinates(res, coordinates) {
  //Check if the coordinates is defined
  if (coordinates === undefined) {
    res.status(400).json({
      message: "Coordinates is undefined",
    });
  }

  //Spliting Coordinates
  const coordinate_array = coordinates.split(";");
  const coordinates_source = coordinate_array[0]
    .split(",")
    .map((coordinates_sourcecoordinate_array) => parseFloat(coordinates_sourcecoordinate_array.trim()));
  const coordinates_target = coordinate_array[1]
    .split(",")
    .map((coordinates_targetcoordinate_array) => parseFloat(coordinates_targetcoordinate_array.trim()));

  //Splited Coordinates
  const coordinates_Ready = [coordinates_source, coordinates_target];

  //Checking Coordinates validation
  if (coordinates_Ready[0][0] >= -90 && coordinates_Ready[0][0] <= 90) {
  } else {
    res.status(400).json({
      message: "Coordinates Source lat not valid",
    });
  }
  if (coordinates_Ready[0][1] >= -180 && coordinates_Ready[0][1] <= 180) {
  } else {
    res.status(400).json({
      message: "Coordinates Source lon not valid",
    });
  }
  if (coordinates_Ready[1][0] >= -90 && coordinates_Ready[1][0] <= 90) {
  } else {
    res.status(400).json({
      message: "Coordinates Target lat not valid",
    });
  }
  if (coordinates_Ready[1][1] >= -180 && coordinates_Ready[1][1] <= 180) {
  } else {
    res.status(400).json({
      message: "Coordinates Target lon not valid",
    });
  }

  return coordinates_Ready;
}

module.exports = { validating_coordinates };
