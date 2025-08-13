// Reemplaza tu Dashboard.js con esta versión corregida
// hk/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  Clock,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import '../css/admin.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    usuarios: { total_usuarios: 0, administradores: 0, doctores: 0, secretarias: 0 },
    pacientes: { total_pacientes: 0, pacientes_hoy: 0, pacientes_mes: 0 },
    citas: { total_citas: 0, citas_hoy: 0, citas_pendientes: 0 },
    historiales: { total_consultas: 0, consultas_mes: 0 }
  });
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [movementAlerts, setMovementAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-detectar URL base
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

  useEffect(() => {
    fetchStats();
    fetchInventoryAlerts();
    fetchMovementAlerts();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('No hay token de autenticación');
        return;
      }
      
      const response = await fetch(`${API_URL}/admin/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Estadísticas recibidas:', data);
        setStats(data);
      } else {
        console.error('Error en respuesta:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Detalle del error:', errorText);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryAlerts = async () => {
    try {
      console.log('🔍 Iniciando consulta de alertas de inventario...');
      const token = localStorage.getItem('token');
      console.log('🔑 Token encontrado:', token ? 'SÍ' : 'NO');
      
      const response = await fetch(`${API_URL}/admin/alerts/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Respuesta del servidor:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Alertas recibidas:', data);
        console.log('📊 Número de alertas:', data.length);
        setInventoryAlerts(data);
      } else {
        console.error('❌ Error en respuesta:', response.status);
        const errorText = await response.text();
        console.error('❌ Detalle del error:', errorText);
      }
    } catch (error) {
      console.error('💥 Error en la petición de alertas de inventario:', error);
    }
  };

  const fetchMovementAlerts = async () => {
    try {
      console.log('📋 Iniciando consulta de movimientos...');
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/alerts/movements`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Respuesta movimientos:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📋 Movimientos recibidos:', data);
        setMovementAlerts(data);
      }
    } catch (error) {
      console.error('Error al cargar alertas de movimientos:', error);
    }
  };

  // Debug del estado actual
  console.log('🎨 Renderizando alertas. Estado actual:', inventoryAlerts);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">
          Resumen general del sistema OdontoSys
        </p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Usuarios */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900">{stats.usuarios.total_usuarios}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs">
            <span className="text-red-600">Admin: {stats.usuarios.administradores}</span>
            <span className="text-blue-600">Docs: {stats.usuarios.doctores}</span>
            <span className="text-green-600">Sec: {stats.usuarios.secretarias}</span>
          </div>
        </div>

        {/* Total Pacientes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pacientes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pacientes.total_pacientes}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Hoy: <span className="font-medium">{stats.pacientes.pacientes_hoy}</span> nuevos
            </p>
          </div>
        </div>

        {/* Total Citas */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Citas Totales</p>
              <p className="text-3xl font-bold text-gray-900">{stats.citas.total_citas}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Pendientes: <span className="font-medium">{stats.citas.citas_pendientes}</span>
            </p>
          </div>
        </div>

        {/* Total Consultas */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consultas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.historiales.total_consultas}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full">
              <Stethoscope className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              Este mes: <span className="font-medium">{stats.historiales.consultas_mes}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de actividad */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Actividad Hoy</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">Citas de hoy</span>
              </div>
              <span className="font-semibold text-blue-600">{stats.citas.citas_hoy}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Pacientes nuevos</span>
              </div>
              <span className="font-semibold text-green-600">{stats.pacientes.pacientes_hoy}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">Citas pendientes</span>
              </div>
              <span className="font-semibold text-purple-600">{stats.citas.citas_pendientes}</span>
            </div>
          </div>
        </div>

        {/* Panel de alertas de inventario */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Alertas de Inventario</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {inventoryAlerts.length} alertas
            </span>
          </div>
          
          <div className="space-y-3">
            {inventoryAlerts.length > 0 ? (
              inventoryAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  alert.tipo_alerta === 'danger' ? 'bg-red-50 border-red-500' :
                  alert.tipo_alerta === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  alert.tipo_alerta === 'info' ? 'bg-blue-50 border-blue-500' :
                  'bg-green-50 border-green-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.nombre_producto}</p>
                      <p className="text-xs text-gray-500">{alert.categoria} - {alert.nivel_alerta}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${
                        alert.tipo_alerta === 'danger' ? 'text-red-600' :
                        alert.tipo_alerta === 'warning' ? 'text-yellow-600' :
                        alert.tipo_alerta === 'info' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {alert.stock_actual} {alert.unidad_medida}
                      </p>
                      <p className="text-xs text-gray-500">Min: {alert.stock_minimo}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-green-600 text-sm">✅ No hay alertas de inventario</p>
                <p className="text-gray-500 text-xs">Todos los productos tienen stock suficiente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alertas de movimientos del sistema */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Movimientos Recientes (Últimas 24h)</h3>
        </div>
        
        <div className="space-y-3">
          {movementAlerts.length > 0 ? (
            movementAlerts.map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    movement.tipo_alerta === 'success' ? 'bg-green-500' :
                    movement.tipo_alerta === 'warning' ? 'bg-yellow-500' :
                    movement.tipo_alerta === 'danger' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{movement.descripcion}</p>
                    <p className="text-xs text-gray-500">
                      {movement.tipo_movimiento.charAt(0).toUpperCase() + movement.tipo_movimiento.slice(1)} • 
                      Usuario: {movement.usuario || 'Sistema'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(movement.fecha_hora).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(movement.fecha_hora).toLocaleTimeString('es-ES', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No hay movimientos recientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Información del sistema */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Última actualización:</span>
            <span className="ml-2 text-gray-800 font-medium">{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;