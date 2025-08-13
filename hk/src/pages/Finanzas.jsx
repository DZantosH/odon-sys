import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Finanzas = () => {
  // Estados principales
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  
  // Estados para filtros
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  // Estado para formulario
  const [formData, setFormData] = useState({
    tipo: 'ingreso',
    monto: '',
    categoria: '',
    descripcion: '',
    metodo_pago: '',
    fecha: new Date().toISOString().split('T')[0]
  });
  
  // Estado para alertas
  const [showAlert, setShowAlert] = useState({
    show: false,
    type: '',
    message: ''
  });

  // Configuración de la API
  const API_BASE_URL = 'http://localhost:5000/api';

  // useEffect para cargar datos iniciales
  useEffect(() => {
    fetchTransacciones();
  }, []);

  // useEffect para filtros automáticos
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      // Los datos se filtrarán automáticamente en el render
    }
  }, [dateRange, selectedCategory, selectedType]);

  // Función para obtener transacciones de la API
  const fetchTransacciones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/finanzas/transacciones`);
      setTransacciones(response.data || []);
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
      setShowAlert({
        show: true,
        type: 'error',
        message: 'Error al cargar las transacciones'
      });
      setTransacciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para crear nueva transacción
  const createTransaction = async (transactionData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/finanzas/transacciones`, transactionData);
      return response.data;
    } catch (error) {
      console.error('Error al crear transacción:', error);
      throw error;
    }
  };

  // Función para actualizar transacción
  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/finanzas/transacciones/${id}`, transactionData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
      throw error;
    }
  };

  // Función para eliminar transacción
  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/finanzas/transacciones/${id}`);
      return true;
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      throw error;
    }
  };

  // Función para manejar envío del formulario
  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    
    if (!formData.monto || !formData.categoria || !formData.fecha) {
      setShowAlert({
        show: true,
        type: 'error',
        message: 'Por favor completa todos los campos obligatorios'
      });
      return;
    }

    try {
      setLoading(true);
      
      const transactionData = {
        ...formData,
        monto: parseFloat(formData.monto)
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, transactionData);
        setShowAlert({
          show: true,
          type: 'success',
          message: 'Transacción actualizada correctamente'
        });
      } else {
        await createTransaction(transactionData);
        setShowAlert({
          show: true,
          type: 'success',
          message: 'Transacción creada correctamente'
        });
      }

      await fetchTransacciones();
      closeTransactionModal();
    } catch (error) {
      setShowAlert({
        show: true,
        type: 'error',
        message: 'Error al guardar la transacción'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir modal de edición
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      tipo: transaction.tipo,
      monto: transaction.monto.toString(),
      categoria: transaction.categoria,
      descripcion: transaction.descripcion || '',
      metodo_pago: transaction.metodo_pago || '',
      fecha: new Date(transaction.fecha).toISOString().split('T')[0]
    });
    setShowTransactionModal(true);
  };

  // Función para manejar eliminación
  const handleDeleteTransaction = (id) => {
    setTransactionToDelete(id);
    setShowDeleteModal(true);
  };

  // Función para confirmar eliminación
  const confirmDeleteTransaction = async () => {
    try {
      setLoading(true);
      await deleteTransaction(transactionToDelete);
      await fetchTransacciones();
      setShowAlert({
        show: true,
        type: 'success',
        message: 'Transacción eliminada correctamente'
      });
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      setShowAlert({
        show: true,
        type: 'error',
        message: 'Error al eliminar la transacción'
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar modal de transacción
  const closeTransactionModal = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
    setFormData({
      tipo: 'ingreso',
      monto: '',
      categoria: '',
      descripcion: '',
      metodo_pago: '',
      fecha: new Date().toISOString().split('T')[0]
    });
  };

  // Función para formatear moneda
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  // Función para obtener datos filtrados por período
  const getFilteredData = () => {
    let filtered = [...transacciones];

    // Filtrar por rango de fechas
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(transaccion => {
        const transactionDate = new Date(transaccion.fecha);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(transaccion => transaccion.categoria === selectedCategory);
    }

    // Filtrar por tipo
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaccion => transaccion.tipo === selectedType);
    }

    return filtered;
  };

  // Función para calcular totales
  const calculateTotals = (data) => {
    const totals = {
      ingresos: 0,
      gastos: 0,
      balance: 0,
      totalTransacciones: data.length
    };

    data.forEach(transaccion => {
      if (transaccion.tipo === 'ingreso') {
        totals.ingresos += parseFloat(transaccion.monto || 0);
      } else {
        totals.gastos += parseFloat(transaccion.monto || 0);
      }
    });

    totals.balance = totals.ingresos - totals.gastos;
    return totals;
  };

  // Función para obtener datos agrupados por categoría
  const getDataByCategory = (data) => {
    const categoryData = {};
    
    data.forEach(transaccion => {
      const categoria = transaccion.categoria || 'Sin categoría';
      if (!categoryData[categoria]) {
        categoryData[categoria] = {
          ingresos: 0,
          gastos: 0,
          total: 0,
          transacciones: 0
        };
      }
      
      const monto = parseFloat(transaccion.monto || 0);
      if (transaccion.tipo === 'ingreso') {
        categoryData[categoria].ingresos += monto;
        categoryData[categoria].total += monto;
      } else {
        categoryData[categoria].gastos += monto;
        categoryData[categoria].total -= monto;
      }
      categoryData[categoria].transacciones++;
    });
    
    return categoryData;
  };

  // Función para obtener datos mensuales para gráficos
  const getMonthlyData = (data) => {
    const monthlyData = {};
    
    data.forEach(transaccion => {
      const fecha = new Date(transaccion.fecha);
      const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          mes: monthKey,
          ingresos: 0,
          gastos: 0,
          balance: 0
        };
      }
      
      const monto = parseFloat(transaccion.monto || 0);
      if (transaccion.tipo === 'ingreso') {
        monthlyData[monthKey].ingresos += monto;
      } else {
        monthlyData[monthKey].gastos += monto;
      }
      monthlyData[monthKey].balance = monthlyData[monthKey].ingresos - monthlyData[monthKey].gastos;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.mes.localeCompare(b.mes));
  };

  // Función para manejar cambios en los filtros
  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para resetear filtros
  const resetFilters = () => {
    setDateRange({ start: '', end: '' });
    setSelectedCategory('all');
    setSelectedType('all');
  };

  // Función para exportar datos
  const exportData = () => {
    const filteredData = getFilteredData();
    const dataToExport = filteredData.map(transaccion => ({
      Fecha: new Date(transaccion.fecha).toLocaleDateString('es-MX'),
      Tipo: transaccion.tipo.charAt(0).toUpperCase() + transaccion.tipo.slice(1),
      Categoría: transaccion.categoria || 'Sin categoría',
      Descripción: transaccion.descripcion,
      Monto: transaccion.monto,
      'Método de Pago': transaccion.metodo_pago || 'No especificado'
    }));

    console.log('Exportar datos:', dataToExport);
    setShowAlert({
      show: true,
      type: 'success',
      message: 'Datos exportados correctamente'
    });
  };

  // Calcular datos para mostrar
  const filteredTransactions = getFilteredData();
  const totals = calculateTotals(filteredTransactions);
  const categoryData = getDataByCategory(filteredTransactions);
  const monthlyData = getMonthlyData(filteredTransactions);

  if (loading && transacciones.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos financieros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Título y botones principales */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          💰 Gestión Financiera
        </h1>
        <div className="flex gap-3">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            🔄 Resetear Filtros
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📊 Exportar Datos
          </button>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            ➕ Nueva Transacción
          </button>
        </div>
      </div>

      {/* Alerta */}
      {showAlert.show && (
        <div className={`p-4 rounded-lg border ${
          showAlert.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <div className="flex justify-between items-center">
            <span>{showAlert.message}</span>
            <button 
              onClick={() => setShowAlert({ show: false, type: '', message: '' })}
              className="text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🔍 Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las categorías</option>
              <option value="tratamientos">Tratamientos</option>
              <option value="materiales">Materiales</option>
              <option value="servicios">Servicios</option>
              <option value="equipos">Equipos</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos</option>
              <option value="ingreso">Ingresos</option>
              <option value="gasto">Gastos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(totals.ingresos)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gastos</p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(totals.gastos)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-2xl">📉</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Balance</p>
              <p className={`text-3xl font-bold ${
                totals.balance >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(totals.balance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              totals.balance >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <span className="text-2xl">
                {totals.balance >= 0 ? '💰' : '⚠️'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transacciones</p>
              <p className="text-3xl font-bold text-blue-600">
                {totals.totalTransacciones}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de líneas - Tendencia mensual */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            📈 Tendencia Mensual
          </h3>
          {monthlyData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mes" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return `${month}/${year.slice(2)}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name]}
                    labelFormatter={(label) => {
                      const [year, month] = label.split('-');
                      const monthNames = [
                        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
                      ];
                      return `${monthNames[parseInt(month) - 1]} ${year}`;
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="ingresos" 
                    stroke="#10B981" 
                    name="Ingresos"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="gastos" 
                    stroke="#EF4444" 
                    name="Gastos"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#3B82F6" 
                    name="Balance"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📊</span>
                <p>No hay datos para mostrar</p>
                <p className="text-sm">Selecciona un rango de fechas</p>
              </div>
            </div>
          )}
        </div>

        {/* Gráfico de barras - Por categoría */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            📊 Ingresos vs Gastos por Categoría
          </h3>
          {Object.keys(categoryData).length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={Object.entries(categoryData).map(([categoria, data]) => ({
                    categoria: categoria.length > 10 ? categoria.slice(0, 10) + '...' : categoria,
                    ingresos: data.ingresos,
                    gastos: data.gastos,
                    balance: data.total
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="categoria" 
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(value), name]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="ingresos" 
                    fill="#10B981" 
                    name="Ingresos"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="gastos" 
                    fill="#EF4444" 
                    name="Gastos"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <span className="text-4xl mb-2 block">📈</span>
                <p>No hay datos por categoría</p>
                <p className="text-sm">Agrega transacciones para ver el análisis</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de transacciones recientes */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              📋 Transacciones Recientes
            </h3>
            <span className="text-sm text-gray-500">
              Mostrando {filteredTransactions.length} transacciones
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {filteredTransactions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Método
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.slice(0, 10).map((transaccion) => (
                  <tr key={transaccion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaccion.fecha).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaccion.tipo === 'ingreso' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaccion.tipo === 'ingreso' ? '📈' : '📉'} 
                        {transaccion.tipo.charAt(0).toUpperCase() + transaccion.tipo.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaccion.categoria || 'Sin categoría'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {transaccion.descripcion || 'Sin descripción'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(transaccion.monto)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaccion.metodo_pago || 'No especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditTransaction(transaccion)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(transaccion.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <span className="text-4xl mb-4 block">💰</span>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No hay transacciones
              </h4>
              <p>No se encontraron transacciones para los filtros seleccionados.</p>
              <button
                onClick={() => setShowTransactionModal(true)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                ➕ Crear primera transacción
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nueva/Editar Transacción */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  {editingTransaction ? '✏️ Editar Transacción' : '➕ Nueva Transacción'}
                </h3>
                <button
                  onClick={closeTransactionModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitTransaction} className="p-6 space-y-4">
              {/* Tipo de transacción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Transacción *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'ingreso' }))}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                      formData.tipo === 'ingreso'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                    }`}
                  >
                    📈 Ingreso
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipo: 'gasto' }))}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                      formData.tipo === 'gasto'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-red-300'
                    }`}
                  >
                    📉 Gasto
                  </button>
                </div>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monto}
                    onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  <option value="tratamientos">🦷 Tratamientos</option>
                  <option value="materiales">🧪 Materiales</option>
                  <option value="servicios">⚙️ Servicios</option>
                  <option value="equipos">🔧 Equipos</option>
                  <option value="salarios">👥 Salarios</option>
                  <option value="alquiler">🏢 Alquiler</option>
                  <option value="marketing">📢 Marketing</option>
                  <option value="otros">📋 Otros</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Descripción detallada de la transacción..."
                />
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={formData.metodo_pago}
                  onChange={(e) => setFormData(prev => ({ ...prev, metodo_pago: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar método</option>
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="tarjeta_debito">💳 Tarjeta de Débito</option>
                  <option value="tarjeta_credito">💳 Tarjeta de Crédito</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="cheque">📝 Cheque</option>
                  <option value="otro">🔄 Otro</option>
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeTransactionModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 text-white rounded-lg transition-colors ${
                    formData.tipo === 'ingreso'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? '⏳ Guardando...' : (editingTransaction ? '💾 Actualizar' : '➕ Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Confirmar Eliminación
              </h3>
              <p className="text-gray-600 text-center mb-6">
                ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
              </p>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteTransaction}
                  disabled={loading}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Finanzas;