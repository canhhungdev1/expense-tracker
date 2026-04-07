const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'expense_tracker'
  });

  try {
    const [categories] = await connection.execute('SELECT id, name, `group` FROM categories LIMIT 5');
    console.log('Sample Categories with UUID IDs:');
    console.table(categories);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}
check();
