import React, { useState } from 'react';
import { User, Lock, BarChart3, FileText, Users, TrendingUp, Calendar, Search, Filter, Star, CheckCircle, AlertCircle } from 'lucide-react';

// Componente de Login
const LoginScreen = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">SMCAT</h1>
          <p className="text-gray-600">Sistema de Monitoreo de Call Center</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese su usuario"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
          </div>
          
          <button
            onClick={onLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Dashboard
const Dashboard = () => {
  const stats = [
    { title: 'Evaluaciones Hoy', value: '24', icon: FileText, color: 'bg-blue-500' },
    { title: 'Agentes Activos', value: '12', icon: Users, color: 'bg-green-500' },
    { title: 'Promedio General', value: '8.5', icon: TrendingUp, color: 'bg-purple-500' },
    { title: 'Llamadas Monitoreadas', value: '156', icon: BarChart3, color: 'bg-orange-500' }
  ];

  const recentEvaluations = [
    { agent: 'María González', date: '2024-05-27', score: 9.2, status: 'Excelente' },
    { agent: 'Carlos Rodríguez', date: '2024-05-27', score: 7.8, status: 'Bueno' },
    { agent: 'Ana Martínez', date: '2024-05-26', score: 8.5, status: 'Muy Bueno' },
    { agent: 'Luis Torres', date: '2024-05-26', score: 6.9, status: 'Regular' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-2 text-gray-600">
          <Calendar className="h-5 w-5" />
          <span>Hoy, 27 de Mayo 2024</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Evaluations */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Evaluaciones Recientes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Agente</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Puntuación</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recentEvaluations.map((evaluation, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{evaluation.agent}</td>
                  <td className="py-3 px-4 text-gray-600">{evaluation.date}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-600">{evaluation.score}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      evaluation.score >= 9 ? 'bg-green-100 text-green-800' :
                      evaluation.score >= 8 ? 'bg-blue-100 text-blue-800' :
                      evaluation.score >= 7 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {evaluation.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente Formulario de Evaluación
const EvaluationForm = () => {
  const [formData, setFormData] = useState({
    agent: '',
    date: '',
    callType: '',
    attitude: 5,
    callStructure: 5,
    protocolCompliance: 5,
    comments: ''
  });

  const handleSubmit = () => {
    alert('Evaluación guardada correctamente');
  };

  const StarRating = ({ value, onChange, label }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">({value}/5)</span>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Nueva Evaluación</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agente</label>
            <select
              value={formData.agent}
              onChange={(e) => setFormData({...formData, agent: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar agente</option>
              <option value="maria">María González</option>
              <option value="carlos">Carlos Rodríguez</option>
              <option value="ana">Ana Martínez</option>
              <option value="luis">Luis Torres</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Llamada</label>
          <select
            value={formData.callType}
            onChange={(e) => setFormData({...formData, callType: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Seleccionar tipo</option>
            <option value="ventas">Ventas</option>
            <option value="soporte">Soporte Técnico</option>
            <option value="reclamos">Reclamos</option>
            <option value="consultas">Consultas Generales</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StarRating
            value={formData.attitude}
            onChange={(value) => setFormData({...formData, attitude: value})}
            label="Actitud del Agente"
          />
          
          <StarRating
            value={formData.callStructure}
            onChange={(value) => setFormData({...formData, callStructure: value})}
            label="Estructura de Llamada"
          />
          
          <StarRating
            value={formData.protocolCompliance}
            onChange={(value) => setFormData({...formData, protocolCompliance: value})}
            label="Cumplimiento de Protocolos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Comentarios</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({...formData, comments: e.target.value})}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Observaciones adicionales..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Guardar Evaluación
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente de Reportes
const Reports = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    agent: '',
    callType: ''
  });

  const reportData = [
    { agent: 'María González', evaluations: 15, avgScore: 9.2, trend: '+0.3' },
    { agent: 'Carlos Rodríguez', evaluations: 12, avgScore: 7.8, trend: '-0.1' },
    { agent: 'Ana Martínez', evaluations: 18, avgScore: 8.5, trend: '+0.2' },
    { agent: 'Luis Torres', evaluations: 10, avgScore: 6.9, trend: '-0.4' }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reportes y Análisis</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Agente</label>
            <select
              value={filters.agent}
              onChange={(e) => setFilters({...filters, agent: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="maria">María González</option>
              <option value="carlos">Carlos Rodríguez</option>
              <option value="ana">Ana Martínez</option>
              <option value="luis">Luis Torres</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center">
              <Search className="h-4 w-4 mr-2" />
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Gráfico simulado */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Evaluaciones</h2>
        <div className="h-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Gráfico de tendencias</p>
            <p className="text-sm text-gray-500">Aquí se mostraría un gráfico interactivo</p>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen por Agente</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Agente</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Evaluaciones</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Promedio</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Tendencia</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{row.agent}</td>
                  <td className="py-3 px-4">{row.evaluations}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-600">{row.avgScore}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${row.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {row.trend}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {row.avgScore >= 8.5 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : row.avgScore >= 7.5 ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Componente Principal con Navegación
const SMCATApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'evaluation', label: 'Nueva Evaluación', icon: FileText },
    { id: 'reports', label: 'Reportes', icon: TrendingUp }
  ];

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'evaluation':
        return <EvaluationForm />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">SMCAT</h1>
          <p className="text-sm text-gray-600">Sistema de Monitoreo</p>
        </div>
        
        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition duration-200 ${
                currentView === item.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-600' : 'text-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-6 left-6">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default SMCATApp;