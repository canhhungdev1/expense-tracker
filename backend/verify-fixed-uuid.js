const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'expense_tracker'
  });
  const [res] = await conn.execute('SELECT id, name FROM categories WHERE id LIKE "c0000%" LIMIT 5');
  console.log('Fixed UUID Categories:');
  console.log(JSON.stringify(res, null, 2));
  await conn.end();
}
run();
