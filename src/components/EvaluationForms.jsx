import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Star } from 'lucide-react';
import {
  obtenerCampanias,
  obtenerOperadores,
  obtenerTeamLeader,
  guardarEvaluacion,
} from '@/lib/services/evaluacionService';

const EvaluationForm = ({ usuario, onEvaluacionGuardada }) => {
  console.log('Usuario logueado:', usuario);
  const [teamLeader, setTeamLeader] = useState('');
  const [campanias, setCampanias] = useState([]);
  const [operadores, setOperadores] = useState([]);

  const [formData, setFormData] = useState({
    operator: '',
    date: '',
    time: '',
    callDuration: '',
    campaign: '',
    callType: '',
    attitude: '',
    callStructure: '',
    protocolCompliance: '',
    observations: ''
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ops, camps] = await Promise.all([
          obtenerOperadores(),
          obtenerCampanias()
        ]);
        setOperadores(ops);
        setCampanias(camps);
      } catch (err) {
        console.error(err);
        toast.error('Error al cargar operadores o campañas');
      }
    };
    fetchData();
  }, []);
  const handleSubmit = async () => {
    const {
      operator,
      date,
      time,
      callDuration,
      campaign,
      attitude,
      callStructure,
      protocolCompliance,
      observations,
    } = formData;
    if (
      !operator ||
      !date ||
      !time ||
      !callDuration ||
      !campaign ||
      !attitude ||
      !callStructure ||
      !protocolCompliance
    ) {
      toast.warning('⚠️ Todos los campos obligatorios deben completarse.');
      return;
    }
    const fechaHora = `${date}T${time}:00`;
    const evaluacion = {
      idEvaluado: operator,
      idEvaluador: usuario.idUsuario,
      fechaHora,
      duracion: `00:${callDuration}`,
      actitud: attitude,
      estructura: callStructure,
      protocolos: protocolCompliance,
      observaciones: observations,
      idCampaña: campaign,
    };
    try {
      await guardarEvaluacion(evaluacion);
      toast.success('✅ Evaluación guardada correctamente');
      if (onEvaluacionGuardada) onEvaluacionGuardada();
    } catch (err) {
      console.error(err);
      toast.error(`❌ ${err.message}`);
    }
  };
  const handleOperatorChange = async (e) => {
    const selectedId = e.target.value;
    setFormData((prev) => ({ ...prev, operator: selectedId }));
    if (selectedId) {
      try {
        const leader = await obtenerTeamLeader(selectedId);
        setTeamLeader(leader);
      } catch (err) {
        setTeamLeader('No asignado');
      }
    } else {
      setTeamLeader('');
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleStarChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const StarRating = ({ value, onChange, label, required = true }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operador <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.operator}
              onChange={handleOperatorChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar operador</option>
              {operadores.map(op => (
                <option key={op.id} value={op.id}>{op.nombreCompleto}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Leader
            </label>
            <input
              type="text"
              value={teamLeader}
              disabled
              className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaña <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.campaign}
              onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar campaña</option>
              {campanias.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora del Monitoreo <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duración de Llamada (MM:SS) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="callDuration"
              value={formData.callDuration}
              onChange={handleInputChange}
              placeholder="ej: 03:45"
              pattern="[0-9]{2}:[0-9]{2}"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StarRating
            value={formData.attitude}
            onChange={(val) => handleStarChange('attitude', val)}
            label="Puntuación Actitud"
            required
          />
          <StarRating
            value={formData.callStructure}
            onChange={(val) => handleStarChange('callStructure', val)}
            label="Puntuación Estructura"
            required
          />
          <StarRating
            value={formData.protocolCompliance}
            onChange={(val) => handleStarChange('protocolCompliance', val)}
            label="Puntuación Protocolos"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ejemplo: Falta claridad en el cierre de la llamada..."
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

export default EvaluationForm;