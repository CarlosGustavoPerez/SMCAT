import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Star } from 'lucide-react';

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
  const fetchOperadores = async () => {
    try {
      const res = await fetch('/api/evaluacion/operadores');
      const data = await res.json();
      if (data.success) {
        setOperadores(data.operadores);
      } else {
        alert('No se pudieron cargar los operadores');
      }
    } catch (err) {
      console.error('Error al cargar operadores:', err);
      alert('Error al cargar operadores');
    }
  };

  fetchOperadores();
  const fetchCampanias = async () => {
    try {
      const res = await fetch('/api/evaluacion/campanias');
      const data = await res.json();
      if (data.success) {
        setCampanias(data.campanias);
      } else {
        alert('Error al obtener campañas');
      }
    } catch (err) {
      console.error(err);
      alert('Error al obtener campañas');
    }
  };

  fetchCampanias();
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
      observations
    } = formData;
    if (!operator || !date || !time || !callDuration || !campaign || !attitude || !callStructure || !protocolCompliance) {
      toast.warning('⚠️ Todos los campos obligatorios deben completarse.');
      return;
    }
    const fechaHora = `${date}T${time}:00`;
    try {
      const res = await fetch('/api/evaluacion/nueva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEvaluado: operator,
          idEvaluador: usuario.idUsuario,
          fechaHora,
          duracion: `00:${callDuration}`,
          actitud: attitude,
          estructura: callStructure,
          protocolos: protocolCompliance,
          observaciones: observations,
          idCampaña: campaign
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('✅ Evaluación guardada correctamente');
        if (onEvaluacionGuardada) onEvaluacionGuardada(); // redirige al dashboard
      } else {
        toast.error(`❌ ${data.error || 'Error al guardar'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('❌ Error al guardar evaluación');
    }
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
                onChange={async (e) => {
                    const selectedId = e.target.value;
                    setFormData({ ...formData, operator: selectedId });

                    if (selectedId) {
                    const res = await fetch('/api/evaluacion/datos-operador', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idOperador: selectedId })
                    });
                    const data = await res.json();
                    if (data.success) {
                        setTeamLeader(data.teamLeader);
                    } else {
                        setTeamLeader('No asignado');
                    }
                    } else {
                    setTeamLeader('');
                    }
                }}
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
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
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
              value={formData.time}
              onChange={(e) => setFormData({...formData, time: e.target.value})}
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
              value={formData.callDuration}
              onChange={(e) => setFormData({...formData, callDuration: e.target.value})}
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
            onChange={(value) => setFormData({...formData, attitude: value})}
            label="Puntuación Actitud"
            required={true}
          />
          
          <StarRating
            value={formData.callStructure}
            onChange={(value) => setFormData({...formData, callStructure: value})}
            label="Puntuación Estructura"
            required={true}
          />
          
          <StarRating
            value={formData.protocolCompliance}
            onChange={(value) => setFormData({...formData, protocolCompliance: value})}
            label="Puntuación Protocolos"
            required={true}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
          <textarea
            value={formData.observations}
            onChange={(e) => setFormData({...formData, observations: e.target.value})}
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