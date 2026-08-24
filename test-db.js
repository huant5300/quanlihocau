import { Client } from 'pg';

async function testConnection() {
  const connectionString = "postgresql://postgres:PAEeEyPyQSHdUwBhInamRaMkIirpdYBQ@yamabiko.proxy.rlwy.net:37551/railway?sslmode=no-verify";
  const client = new Client({ connectionString });
  try {
    console.log("Connecting...");
    await client.connect();
    console.log("Connected to Railway database!");
    const res = await client.query('SELECT COUNT(*) FROM "User"');
    console.log("User count:", res.rows[0]);
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

testConnection();
