// hk/src/pages/Inventario.jsx
import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Eye,
  Download,
  Upload,
  Grid3X3,
  List,
  Calendar,
  DollarSign
} from 'lucide-react';
import '../css/admin.css';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStock, setFiltroStock] = useState('');
  const [viewMode, setViewMode] = useState('categories'); // 'categories', 'category-detail', 'table'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productoMovimiento, setProductoMovimiento] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [stats, setStats] = useState({
    total_productos: 0,
    productos_bajo_stock: 0,
    valor_total_inventario: 0,
    productos_agotados: 0
  });

  // Auto-detectar URL base
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

  const [formData, setFormData] = useState({
    nombre_producto: '',
    categoria: '',
    codigo_producto: '',
    stock_actual: 0,
    stock_minimo: 0,
    stock_maximo: 0,
    precio_unitario: 0,
    unidad_medida: 'unidad',
    proveedor: '',
    fecha_vencimiento: '',
    descripcion: ''
  });

  const [movimientoData, setMovimientoData] = useState({
    tipo_movimiento: 'entrada',
    cantidad: 0,
    precio_unitario: 0,
    motivo: '',
    documento_referencia: ''
  });

  useEffect(() => {
    fetchProductos();
    fetchEstadisticas();
  }, []);

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/inventario`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProductos(data);
        
        // Extraer categorías únicas
        const categoriasUnicas = [...new Set(data.map(p => p.categoria))].filter(Boolean);
        setCategorias(categoriasUnicas);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/inventario/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingProduct 
        ? `${API_URL}/admin/inventario/${editingProduct.id}`
        : `${API_URL}/admin/inventario`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchProductos();
        await fetchEstadisticas();
        resetForm();
        setShowModal(false);
      } else {
        console.error('Error al guardar producto');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMovimiento = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/admin/inventario/${productoMovimiento.id}/movimiento`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movimientoData)
      });

      if (response.ok) {
        await fetchProductos();
        await fetchEstadisticas();
        setShowMovimientoModal(false);
        setProductoMovimiento(null);
        setMovimientoData({
          tipo_movimiento: 'entrada',
          cantidad: 0,
          precio_unitario: 0,
          motivo: '',
          documento_referencia: ''
        });
      }
    } catch (error) {
      console.error('Error al registrar movimiento:', error);
    }
  };

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setFormData(producto);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/inventario/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          await fetchProductos();
          await fetchEstadisticas();
        }
      } catch (error) {
        console.error('Error al eliminar producto:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_producto: '',
      categoria: '',
      codigo_producto: '',
      stock_actual: 0,
      stock_minimo: 0,
      stock_maximo: 0,
      precio_unitario: 0,
      unidad_medida: 'unidad',
      proveedor: '',
      fecha_vencimiento: '',
      descripcion: ''
    });
    setEditingProduct(null);
  };

  const getStockStatus = (producto) => {
    const { stock_actual, stock_minimo } = producto;
    
    if (stock_actual === 0) {
      return { status: 'agotado', color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Agotado', icon: '🔴' };
    } else if (stock_actual <= stock_minimo) {
      return { status: 'critico', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Stock Crítico', icon: '⚠️' };
    } else if (stock_actual <= stock_minimo * 1.5) {
      return { status: 'bajo', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', label: 'Stock Bajo', icon: '🟡' };
    } else {
      return { status: 'normal', color: 'text-green-600', bg: 'bg-green-50 border-green-200', label: 'Normal', icon: '✅' };
    }
  };

  const getCategoryIcon = (categoria) => {
    const icons = {
      'Materiales': '🦷',
      'Medicamentos': '💊',
      'Protección': '🧤',
      'Instrumentos': '🔧',
      'Anestesia': '💉',
      'Limpieza': '🧽',
      'Papelería': '📄',
      'default': '📦'
    };
    return icons[categoria] || icons.default;
  };

  const getCategoryStats = (categoria) => {
    const productosCategoria = productos.filter(p => p.categoria === categoria);
    const totalProductos = productosCategoria.length;
    const stockBajo = productosCategoria.filter(p => p.stock_actual <= p.stock_minimo).length;
    const agotados = productosCategoria.filter(p => p.stock_actual === 0).length;
    const valorTotal = productosCategoria.reduce((sum, p) => sum + (p.stock_actual * p.precio_unitario), 0);
    
    return {
      total: totalProductos,
      stockBajo,
      agotados,
      valorTotal
    };
  };

  const openCategory = (categoria) => {
    setSelectedCategory(categoria);
    setViewMode('category-detail');
  };

  const backToCategories = () => {
    setSelectedCategory(null);
    setViewMode('categories');
  };

  // Filtrar productos para la vista detallada de categoría
  const productosCategoria = selectedCategory 
    ? productos.filter(p => p.categoria === selectedCategory).filter(producto => {
        const matchSearch = producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (producto.codigo_producto && producto.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase()));
        
        let matchStock = true;
        if (filtroStock === 'agotado') {
          matchStock = producto.stock_actual === 0;
        } else if (filtroStock === 'bajo') {
          matchStock = producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo;
        } else if (filtroStock === 'normal') {
          matchStock = producto.stock_actual > producto.stock_minimo;
        }

        return matchSearch && matchStock;
      })
    : [];

  // Filtrar productos para vista de tabla general
  const productosFiltrados = productos.filter(producto => {
    const matchSearch = producto.nombre_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (producto.codigo_producto && producto.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchCategoria = !filtroCategoria || producto.categoria === filtroCategoria;
    
    let matchStock = true;
    if (filtroStock === 'agotado') {
      matchStock = producto.stock_actual === 0;
    } else if (filtroStock === 'bajo') {
      matchStock = producto.stock_actual > 0 && producto.stock_actual <= producto.stock_minimo;
    } else if (filtroStock === 'normal') {
      matchStock = producto.stock_actual > producto.stock_minimo;
    }

    return matchSearch && matchCategoria && matchStock;
  });

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
            <p className="text-gray-600 mt-2">
              Administra productos, stock y movimientos de inventario
            </p>
          </div>
          <div className="flex gap-3">
            {viewMode !== 'categories' && (
              <button
                onClick={backToCategories}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                ← Volver a Categorías
              </button>
            )}
            
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('categories')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  viewMode === 'categories' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Categorías
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                Lista General
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Download className="w-4 h-4" />
              Exportar
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-4 aspect-square flex flex-col justify-center text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-blue-50 rounded-full">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1">Total Productos</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total_productos}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 aspect-square flex flex-col justify-center text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-orange-50 rounded-full">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1">Stock Bajo</p>
          <p className="text-2xl font-bold text-orange-600">{stats.productos_bajo_stock}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 aspect-square flex flex-col justify-center text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-red-50 rounded-full">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1">Productos Agotados</p>
          <p className="text-2xl font-bold text-red-600">{stats.productos_agotados}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4 aspect-square flex flex-col justify-center text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-green-50 rounded-full">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs font-medium text-gray-600 mb-1">Valor Total</p>
          <p className="text-xl font-bold text-green-600">
            ${stats.valor_total_inventario?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>

          <select
            value={filtroStock}
            onChange={(e) => setFiltroStock(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Estado de stock</option>
            <option value="normal">Stock Normal</option>
            <option value="bajo">Stock Bajo</option>
            <option value="agotado">Agotado</option>
          </select>

          <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Más Filtros
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      {viewMode === 'categories' ? (
        /* Vista de categorías cuadradas */
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Categorías de Inventario</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categorias.map(categoria => {
              const stats = getCategoryStats(categoria);
              return (
                <div
                  key={categoria}
                  onClick={() => openCategory(categoria)}
                  className="aspect-square bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="h-full flex flex-col justify-between text-center">
                    {/* Icono */}
                    <div className="flex justify-center">
                      <span className="text-4xl group-hover:scale-110 transition-transform">
                        {getCategoryIcon(categoria)}
                      </span>
                    </div>
                    
                    {/* Información */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {categoria}
                      </h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>{stats.total} productos</p>
                        {stats.stockBajo > 0 && (
                          <p className="text-orange-600">
                            {stats.stockBajo} con stock bajo
                          </p>
                        )}
                        {stats.agotados > 0 && (
                          <p className="text-red-600">
                            {stats.agotados} agotados
                          </p>
                        )}
                      </div>
                      <div className="text-xs font-medium text-green-600">
                        ${stats.valorTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : viewMode === 'category-detail' ? (
        /* Vista detallada de una categoría */
        <div className="space-y-6">
          {/* Header de categoría */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">{getCategoryIcon(selectedCategory)}</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedCategory}</h3>
                <p className="text-gray-600">{productosCategoria.length} productos en esta categoría</p>
              </div>
            </div>
            
            {/* Filtros específicos de categoría */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar en esta categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={filtroStock}
                onChange={(e) => setFiltroStock(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Estado de stock</option>
                <option value="normal">Stock Normal</option>
                <option value="bajo">Stock Bajo</option>
                <option value="agotado">Agotado</option>
              </select>

              <button className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Más Filtros
              </button>
            </div>
          </div>

          {/* Productos de la categoría */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productosCategoria.map(producto => {
                const stockStatus = getStockStatus(producto);
                return (
                  <div 
                    key={producto.id} 
                    className={`border-2 rounded-lg p-4 hover:shadow-md transition-all ${stockStatus.bg}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {producto.nombre_producto}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {producto.codigo_producto || 'Sin código'}
                        </p>
                      </div>
                      <div className="relative">
                        <button 
                          className="p-1 text-gray-400 hover:text-gray-600"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          {producto.stock_actual}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color} border`}>
                          {stockStatus.icon} {stockStatus.label}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <p>Mín: {producto.stock_minimo} {producto.unidad_medida}</p>
                        <p>Precio: ${producto.precio_unitario}</p>
                        {producto.proveedor && (
                          <p>Proveedor: {producto.proveedor}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductoMovimiento(producto);
                          setShowMovimientoModal(true);
                        }}
                        className="flex-1 p-2 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                        title="Movimiento"
                      >
                        <TrendingUp className="w-3 h-3 mx-auto" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(producto);
                        }}
                        className="flex-1 p-2 text-xs bg-gray-50 text-gray-600 rounded hover:bg-gray-100 transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-3 h-3 mx-auto" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(producto.id);
                        }}
                        className="flex-1 p-2 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {productosCategoria.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl">{getCategoryIcon(selectedCategory)}</span>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || filtroStock 
                    ? 'No se encontraron productos que coincidan con los filtros.'
                    : `No hay productos en la categoría ${selectedCategory}.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Vista de tabla */
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proveedor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {productosFiltrados.map((producto) => {
                  const stockStatus = getStockStatus(producto);
                  return (
                    <tr key={producto.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{getCategoryIcon(producto.categoria)}</span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {producto.nombre_producto}
                            </div>
                            <div className="text-sm text-gray-500">
                              {producto.codigo_producto || 'Sin código'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {producto.stock_actual} {producto.unidad_medida}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {producto.stock_minimo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                          <span>{stockStatus.icon}</span>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${producto.precio_unitario}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {producto.proveedor || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setProductoMovimiento(producto);
                              setShowMovimientoModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Registrar movimiento"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(producto)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(producto.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filtroCategoria || filtroStock 
                  ? 'No se encontraron productos que coincidan con los filtros.'
                  : 'Comienza agregando un nuevo producto.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de producto */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre_producto}
                  onChange={(e) => setFormData({...formData, nombre_producto: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Código
                  </label>
                  <input
                    type="text"
                    value={formData.codigo_producto}
                    onChange={(e) => setFormData({...formData, codigo_producto: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Actual
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_actual}
                    onChange={(e) => setFormData({...formData, stock_actual: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Mínimo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({...formData, stock_minimo: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock Máximo
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock_maximo}
                    onChange={(e) => setFormData({...formData, stock_maximo: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precio Unitario
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_unitario}
                    onChange={(e) => setFormData({...formData, precio_unitario: parseFloat(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unidad de Medida
                  </label>
                  <select
                    value={formData.unidad_medida}
                    onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="unidad">Unidad</option>
                    <option value="par">Par</option>
                    <option value="tubo">Tubo</option>
                    <option value="ampolla">Ampolla</option>
                    <option value="frasco">Frasco</option>
                    <option value="caja">Caja</option>
                    <option value="kg">Kilogramo</option>
                    <option value="litro">Litro</option>
                    <option value="metro">Metro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Proveedor
                </label>
                <input
                  type="text"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_vencimiento}
                  onChange={(e) => setFormData({...formData, fecha_vencimiento: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de movimiento */}
      {showMovimientoModal && productoMovimiento && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Registrar Movimiento
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getCategoryIcon(productoMovimiento.categoria)}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {productoMovimiento.nombre_producto}
                  </p>
                  <p className="text-xs text-gray-500">
                    Stock actual: <strong>{productoMovimiento.stock_actual} {productoMovimiento.unidad_medida}</strong>
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleMovimiento} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Movimiento *
                </label>
                <select
                  value={movimientoData.tipo_movimiento}
                  onChange={(e) => setMovimientoData({...movimientoData, tipo_movimiento: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="entrada">Entrada (Compra/Recepción)</option>
                  <option value="salida">Salida (Uso/Venta)</option>
                  <option value="ajuste">Ajuste de Inventario</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movimientoData.cantidad}
                  onChange={(e) => setMovimientoData({...movimientoData, cantidad: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio Unitario
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={movimientoData.precio_unitario}
                  onChange={(e) => setMovimientoData({...movimientoData, precio_unitario: parseFloat(e.target.value) || 0})}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Motivo *
                </label>
                <input
                  type="text"
                  required
                  value={movimientoData.motivo}
                  onChange={(e) => setMovimientoData({...movimientoData, motivo: e.target.value})}
                  placeholder="Ej: Compra, Uso en consulta, Ajuste por inventario..."
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Documento de Referencia
                </label>
                <input
                  type="text"
                  value={movimientoData.documento_referencia}
                  onChange={(e) => setMovimientoData({...movimientoData, documento_referencia: e.target.value})}
                  placeholder="Ej: Factura #123, Orden #456..."
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Previsualización del stock resultante */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Previsualización</h4>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Stock actual:</span>
                    <span>{productoMovimiento.stock_actual}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>
                      {movimientoData.tipo_movimiento === 'entrada' ? 'Entrada:' : 
                       movimientoData.tipo_movimiento === 'salida' ? 'Salida:' : 'Ajuste a:'}
                    </span>
                    <span className={movimientoData.tipo_movimiento === 'salida' ? 'text-red-600' : 'text-green-600'}>
                      {movimientoData.tipo_movimiento === 'entrada' ? '+' : 
                       movimientoData.tipo_movimiento === 'salida' ? '-' : '='} {movimientoData.cantidad}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex items-center justify-between font-medium">
                    <span>Stock resultante:</span>
                    <span className="text-blue-600">
                      {movimientoData.tipo_movimiento === 'entrada' 
                        ? productoMovimiento.stock_actual + (movimientoData.cantidad || 0)
                        : movimientoData.tipo_movimiento === 'salida'
                        ? Math.max(0, productoMovimiento.stock_actual - (movimientoData.cantidad || 0))
                        : movimientoData.cantidad || 0
                      } {productoMovimiento.unidad_medida}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowMovimientoModal(false);
                    setProductoMovimiento(null);
                    setMovimientoData({
                      tipo_movimiento: 'entrada',
                      cantidad: 0,
                      precio_unitario: 0,
                      motivo: '',
                      documento_referencia: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Registrar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;