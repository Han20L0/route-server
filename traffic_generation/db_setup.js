const { mysql_query } = require("../mysql");

async function check_db() {
  const query = `SHOW TABLES LIKE 'tb_generated_traffics';`;
  const result = await mysql_query(query);

  if (result?.length) return true;
  return false;
}

async function create_db() {
  const createQuery = `CREATE TABLE tb_generated_traffics (connector_id int(11) NOT NULL,indicator_value int(1) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await mysql_query(createQuery);

  const primaryQuery = `ALTER TABLE tb_generated_traffics ADD PRIMARY KEY (connector_id);`;
  await mysql_query(primaryQuery);

  const constraintQuery = `ALTER TABLE tb_generated_traffics ADD CONSTRAINT tb_generated_connector_traffic_ibfk_1 FOREIGN KEY (connector_id) REFERENCES tb_connectors (id);`;
  await mysql_query(constraintQuery);
}

async function db_setup() {
  const isTableExists = await check_db();

  if (!isTableExists) {
    await create_db();
  }
}

module.exports = db_setup;
