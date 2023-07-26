function accessible_overview(req, res) {
  // approaches:
  // 1. get type
  // 2. get all accessible by type from DB

  const type = req.params.type;

  if (type === "car") {
    return res.sendFile(__dirname + "/car.html");
  } else {
    return res.sendFile(__dirname + "/motor.html");
  }
}

module.exports = accessible_overview;
