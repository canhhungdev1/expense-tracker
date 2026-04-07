const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'expense_tracker'
  });
  console.log('Disabling FK checks...');
  await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
  console.log('Dropping categories table...');
  await conn.execute('DROP TABLE IF EXISTS categories');
  console.log('Enabling FK checks...');
  await conn.execute('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();
  console.log('Success!');
}
run().catch(console.error);
