const mysql = require('mysql2/promise');

async function check() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'expense_tracker'
  });

  try {
    const [categories] = await connection.execute('SELECT name, `group` FROM categories WHERE user_id IS NULL');
    console.log('System Categories (Groups):');
    console.table(categories);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await connection.end();
  }
}
check();
