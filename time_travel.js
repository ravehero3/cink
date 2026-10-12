const { Client } = require("pg");
const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_7SXUOZYgpu1k@ep-old-star-agr0c654.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&options=-c%20neon.time_travel_commit_time='2026-10-05T20:00:00Z'"
});
async function run() {
  await client.connect();
  const res = await client.query('SELECT id, name, images FROM "Product" WHERE name LIKE \'%SPACE LOVE%\'');
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}
run().catch(console.error);
