const mysql = require('mysql2/promise');

async function cleanup() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'expense_tracker'
  });

  try {
    console.log('Disabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('Truncating tables...');
    await connection.execute('TRUNCATE TABLE transactions');
    await connection.execute('TRUNCATE TABLE categories');
    await connection.execute('TRUNCATE TABLE users');
    
    console.log('Enabling foreign key checks...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Cleanup successful!');
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
  } finally {
    await connection.end();
  }
}

cleanup();
