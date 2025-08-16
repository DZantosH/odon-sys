// admin-panel/src/pages/Users.jsx
import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Stethoscope,
  Clipboard,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulario
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formRol, setFormRol] = useState('Secretaria');
  const [formPassword, setFormPassword] = useState('');
  const [formActivo, setFormActivo] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    administradores: 0,
    doctores: 0,
    secretarias: 0,
    activos: 0,
    inactivos: 0
  });

  // Auto-detectar URL base
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : '/api';

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando usuarios...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('No hay token de autenticación', 'error');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Usuarios cargados:', data.length);
        setUsers(data);
        calculateStats(data);
        showNotification(`${data.length} usuarios cargados correctamente`);
      } else {
        const errorData = await response.json().catch(() => ({ 
          message: `Error HTTP ${response.status}` 
        }));
        console.error('❌ Error en response:', errorData);
        showNotification(errorData.message || 'Error al cargar usuarios', 'error');
      }
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      showNotification(`Error de conexión: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const newStats = {
      total: usersData.length,
      administradores: usersData.filter(u => u.rol === 'Administrador').length,
      doctores: usersData.filter(u => u.rol === 'Doctor').length,
      secretarias: usersData.filter(u => u.rol === 'Secretaria').length,
      activos: usersData.filter(u => u.activo).length,
      inactivos: usersData.filter(u => !u.activo).length
    };
    setStats(newStats);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.telefono && user.telefono.includes(searchTerm))
      );
    }

    if (selectedRole) {
      filtered = filtered.filter(user => user.rol === selectedRole);
    }

    if (selectedStatus !== '') {
      filtered = filtered.filter(user => 
        selectedStatus === 'activo' ? user.activo : !user.activo
      );
    }

    setFilteredUsers(filtered);
  };

  const clearForm = () => {
    setFormNombre('');
    setFormEmail('');
    setFormTelefono('');
    setFormRol('Secretaria');
    setFormPassword('');
    setFormActivo(true);
  };

  const openModal = (user = null) => {
    console.log('🎬 Abriendo modal');
    
    if (user) {
      setEditingUser(user);
      setFormNombre(`${user.nombre} ${user.apellido_completo || ''}`.trim());
      setFormEmail(user.email);
      setFormTelefono(user.telefono || '');
      setFormRol(user.rol);
      setFormPassword('');
      setFormActivo(user.activo);
    } else {
      setEditingUser(null);
      clearForm();
    }
    setShowModal(true);
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    console.log('❌ Cerrando modal');
    setShowModal(false);
    setEditingUser(null);
    setSubmitting(false);
    clearForm();
    
    // Restaurar scroll del body
    document.body.style.overflow = 'auto';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('📤 Enviando formulario...');
    
    // Validaciones
    if (!formNombre.trim()) {
      showNotification('El nombre es obligatorio', 'error');
      return;
    }
    
    if (!formEmail.trim()) {
      showNotification('El email es obligatorio', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail)) {
      showNotification('El formato del email no es válido', 'error');
      return;
    }
    
    if (!editingUser && !formPassword.trim()) {
      showNotification('La contraseña es obligatoria', 'error');
      return;
    }
    
    if (!formRol) {
      showNotification('Debe seleccionar un rol', 'error');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('No hay token de autenticación', 'error');
        return;
      }
      
      const url = editingUser 
        ? `${API_URL}/admin/users/${editingUser.id}`
        : `${API_URL}/admin/users`;
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const submitData = {
        nombre: formNombre,
        email: formEmail,
        telefono: formTelefono || null,
        rol: formRol,
        activo: formActivo
      };
      
      // Solo incluir password si no es edición o si se proporcionó
      if (!editingUser || (editingUser && formPassword.trim())) {
        submitData.password = formPassword;
      }
      
      console.log('🚀 Enviando:', method, url, submitData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Resultado:', result);
        
        await fetchUsers();
        closeModal();
        showNotification(
          editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
          'success'
        );
      } else {
        const error = await response.json().catch(() => ({ 
          message: `Error HTTP ${response.status}` 
        }));
        console.error('❌ Error en response:', error);
        showNotification(error.message || 'Error al guardar usuario', 'error');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      showNotification(`Error de conexión: ${error.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        await fetchUsers();
        showNotification(result.message, 'success');
      } else {
        const error = await response.json().catch(() => ({ 
          message: `Error HTTP ${response.status}` 
        }));
        showNotification(error.message || 'Error al cambiar estado', 'error');
      }
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      showNotification(`Error de conexión: ${error.message}`, 'error');
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!window.confirm(`¿Está seguro de eliminar el usuario ${userEmail}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        await fetchUsers();
        showNotification(result.message, 'success');
      } else {
        const error = await response.json().catch(() => ({ 
          message: `Error HTTP ${response.status}` 
        }));
        showNotification(error.message || 'Error al eliminar usuario', 'error');
      }
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      showNotification(`Error de conexión: ${error.message}`, 'error');
    }
  };

  const getRoleIcon = (rol) => {
    switch (rol) {
      case 'Administrador': return <Shield className="w-4 h-4" />;
      case 'Doctor': return <Stethoscope className="w-4 h-4" />;
      case 'Secretaria': return <Clipboard className="w-4 h-4" />;
      default: return <UsersIcon className="w-4 h-4" />;
    }
  };

  const getRoleColor = (rol) => {
    switch (rol) {
      case 'Administrador': return 'text-red-600 bg-red-50';
      case 'Doctor': return 'text-blue-600 bg-blue-50';
      case 'Secretaria': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Notificaciones */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-400 text-green-800' 
            : notification.type === 'error'
            ? 'bg-red-50 border-red-400 text-red-800'
            : 'bg-blue-50 border-blue-400 text-blue-800'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5 mr-2" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-7 h-7" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Administra usuarios del sistema y sus permisos
          </p>
        </div>
        <button
          onClick={() => openModal()}
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <UsersIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Administradores</p>
              <p className="text-2xl font-bold text-red-600">{stats.administradores}</p>
            </div>
            <Shield className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Doctores</p>
              <p className="text-2xl font-bold text-blue-600">{stats.doctores}</p>
            </div>
            <Stethoscope className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Secretarias</p>
              <p className="text-2xl font-bold text-green-600">{stats.secretarias}</p>
            </div>
            <Clipboard className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactivos}</p>
            </div>
            <UserX className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Doctor">Doctor</option>
            <option value="Secretaria">Secretaria</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.nombre} {user.apellido_completo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                      {getRoleIcon(user.rol)}
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.telefono || 'No registrado'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.activo 
                        ? 'text-green-800 bg-green-100' 
                        : 'text-red-800 bg-red-100'
                    }`}>
                      {user.activo ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.fecha_registro).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openModal(user)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Editar usuario"
                        style={{ cursor: 'pointer' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id, user.activo)}
                        className={`p-1 ${user.activo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        style={{ cursor: 'pointer' }}
                      >
                        {user.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id, user.email)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Eliminar usuario"
                        style={{ cursor: 'pointer' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron usuarios</p>
              {(searchTerm || selectedRole || selectedStatus) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRole('');
                    setSelectedStatus('');
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                  style={{ cursor: 'pointer' }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL SUPER SIMPLE - SIN COMPLICACIONES */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                style={{ cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Juan Pérez García"
                  disabled={submitting}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="usuario@ejemplo.com"
                  disabled={submitting}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formTelefono}
                  onChange={(e) => setFormTelefono(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5512345678"
                  disabled={submitting}
                />
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  required
                  value={formRol}
                  onChange={(e) => setFormRol(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="">Seleccionar rol...</option>
                  <option value="Secretaria">Secretaria</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={editingUser ? 'Dejar vacío para mantener' : 'Mínimo 6 caracteres'}
                  minLength={editingUser ? 0 : 6}
                  disabled={submitting}
                />
              </div>

              {/* Usuario activo */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formActivo}
                  onChange={(e) => setFormActivo(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={submitting}
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Usuario activo
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  style={{ cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center"
                  style={{ cursor: 'pointer' }}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingUser ? 'Actualizando...' : 'Creando...'}
                    </>
                  ) : (
                    editingUser ? 'Actualizar Usuario' : 'Crear Usuario'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;