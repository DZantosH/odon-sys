const mysql = require('mysql2/promise');
require('dotenv').config();

console.log('🔍 Configuración de BD:');
console.log('Host:', process.env.DB_HOST);
console.log('User:', process.env.DB_USER);
console.log('Database:', process.env.DB_NAME);
console.log('Port:', process.env.DB_PORT);

// ✅ CONFIGURACIÓN MEJORADA PARA HOSTINGER
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  
  // 🆕 TIMEOUTS MÁS LARGOS PARA HOSTINGER
  connectTimeout: 60000,      // 60 segundos (vs default 10s)
  acquireTimeout: 60000,      // 60 segundos
  timeout: 60000,             // 60 segundos
  
  // 🆕 POOL OPTIMIZADO PARA SHARED HOSTING
  waitForConnections: true,
  connectionLimit: 3,         // REDUCIDO: Hostinger limita conexiones
  queueLimit: 0,
  
  // 🆕 RECONEXIÓN AUTOMÁTICA
  reconnect: true,
  
  // 🆕 SSL PARA HOSTINGER (Opcional, prueba si es necesario)
  ssl: {
    rejectUnauthorized: false
  }
};

console.log('🔧 Pool configurado con límite de', dbConfig.connectionLimit, 'conexiones');

// Crear el pool
const pool = mysql.createPool(dbConfig);

// 🆕 MANEJO DE EVENTOS DEL POOL
pool.on('connection', (connection) => {
  console.log('✅ Nueva conexión BD establecida:', connection.threadId);
});

pool.on('error', (err) => {
  console.error('❌ Error en pool BD:', err.code);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Conexión perdida, reconectando...');
  }
});

// 🆕 FUNCIÓN DE CONEXIÓN CON RETRY
const testConnection = async (retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Probando conexión a BD (intento ${attempt}/${retries})...`);
      
      const connection = await pool.getConnection();
      console.log('✅ Conexión a base de datos exitosa');
      
      // Probar una consulta simple
      const [result] = await connection.execute('SELECT 1 as test, NOW() as timestamp');
      console.log('✅ Query de prueba exitosa:', result[0]);
      
      connection.release();
      return true;
      
    } catch (err) {
      console.error(`❌ Intento ${attempt} falló:`, err.message);
      console.error('❌ Código de error:', err.code);
      
      if (attempt === retries) {
        console.error('❌ Todos los intentos fallaron');
        return false;
      }
      
      // Esperar antes del siguiente intento
      const delay = attempt * 2000; // 2s, 4s, 6s...
      console.log(`⏳ Esperando ${delay/1000}s antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};

// 🆕 FUNCIÓN PARA EJECUTAR QUERIES CON RETRY
const executeQuery = async (query, params = []) => {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
};

module.exports = { 
  pool, 
  testConnection, 
  executeQuery 
};