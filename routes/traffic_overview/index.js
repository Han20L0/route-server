function traffic_overview(req, res) {
  return res.sendFile(__dirname + "/traffic.html");
}

module.exports = traffic_overview;
