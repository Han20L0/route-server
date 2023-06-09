const { connection, mysql_query } = require("../mysql");

const TRAFFIC_DATASET_DIR = "dataset\\traffic";
const XStart = 107.5249; // west (init)
const YStart = -6.9605; // north (init)
const XEnd = 107.6608; // east (limit)
const YEnd = -6.9926; // south (limit)

const TRAFFIC_X_DIR_INTERVAL = 0.04;
const TRAFFIC_Y_DIR_INTERVAL = 0.02;

function set_centers() {
  // get X bounds with traffic x interval
  const XCenters = [];
  let XCenter = XStart;

  while (true) {
    XCenter += TRAFFIC_X_DIR_INTERVAL;

    if (XCenter < XEnd) {
      XCenters.push(XCenter.toFixed(4));
    } else break;

    XCenter += TRAFFIC_X_DIR_INTERVAL;
  }

  // get Y bounds with traffic y interval
  const YCenters = [];
  let YCenter = YStart - TRAFFIC_Y_DIR_INTERVAL;

  while (1) {
    if (YCenter > YEnd) {
      YCenters.push(YCenter.toFixed(4));
    } else break;

    YCenter -= TRAFFIC_Y_DIR_INTERVAL;
  }

  return { XCenters, YCenters };
}

function recalculate_percentage(percentage1, percentage2) {
  // every percentage parameter contains array of three decimals [green, yellow, red]
  let greenPercentage = percentage1[0] + percentage2[0],
    yellowPercentage = percentage1[1] + percentage2[1],
    redPercentage = percentage1[2] + percentage2[2];

  const totalPercentage = greenPercentage + yellowPercentage + redPercentage;

  // get mean of each percentages
  greenPercentage = +(greenPercentage / totalPercentage).toFixed(4);
  yellowPercentage = +(yellowPercentage / totalPercentage).toFixed(4);
  redPercentage = +(redPercentage / totalPercentage).toFixed(4);

  const recalculatedPercentages = [greenPercentage, yellowPercentage, redPercentage];

  return recalculatedPercentages;
}

async function fetch_traffic_data(dayName, hour, minute) {
  // load_traffic_dataset approaches:

  // fetch group of every connector and its indicator values
  const query = `
  SELECT GROUP_CONCAT(DISTINCT(connectors.id)) AS connectorIDs, traffics.indicator_values
  FROM tb_traffics as traffics, tb_ways AS ways, tb_connectors AS connectors
  WHERE connectors.via_way_id = traffics.way_id AND traffics.way_id = ways.id AND traffics.day = '${dayName}' AND traffics.hour = ${hour} AND traffics.minute=${minute}
  GROUP BY ways.id;`;
  const results = await mysql_query(query);

  return results;
}

module.exports = fetch_traffic_data;
