const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔍 Configuración de BD:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT);

// Configuración desde .env (sin opciones inválidas)
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear el pool
const pool = mysql.createPool(dbConfig);

// Probar conexión al cargar
const testConnection = async () => {
  try {
    console.log('🔄 Probando conexión a base de datos...');
    const connection = await pool.getConnection();
    console.log('✅ Conexión a base de datos exitosa');
    
    // Probar una consulta simple
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query de prueba exitosa:', result[0]);
    
    connection.release();
    return true;
  } catch (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    console.error('❌ Código de error:', err.code);
    return false;
  }
};

module.exports = { pool, testConnection };