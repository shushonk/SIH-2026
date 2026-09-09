import React, { useState } from 'react';
import { api } from '../../services/api';
import { 
  X, 
  Bug, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Sparkles,
  Layers,
  Thermometer
} from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

export function TrapLoggerModal({ isOpen, onClose, fieldId = '104', onLogged }) {
  const [activeTab, setActiveTab] = useState('trap'); // 'trap' or 'sensor'
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Trap Form State
  const [trapType, setTrapType] = useState('pheromone_trap');
  const [targetPest, setTargetPest] = useState('Helicoverpa armigera');
  const [trapCount, setTrapCount] = useState(18);
  const [economicThreshold, setEconomicThreshold] = useState(15);
  const [trapNotes, setTrapNotes] = useState('Field canopy inspection at dusk');

  // Sensor Form State
  const [sensorType, setSensorType] = useState('leaf_wetness');
  const [sensorValue, setSensorValue] = useState(8.5);
  const [sensorUnit, setSensorUnit] = useState('hours');

  if (!isOpen) return null;

  const isTrapBreached = Number(trapCount) >= Number(economicThreshold);

  const handleSubmitTrap = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.logTrap({
        field_id: fieldId,
        trap_type: trapType,
        target_pest: targetPest,
        count: Number(trapCount),
        economic_threshold: Number(economicThreshold),
        notes: trapNotes
      });
      setSuccessMsg(res.message || 'Pest trap reading successfully logged.');
      if (onLogged) onLogged();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to log trap count:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSensor = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await api.logSensorReading({
        field_id: fieldId,
        sensor_type: sensorType,
        value: Number(sensorValue),
        unit: sensorUnit,
        source: 'Manual_Field_Entry'
      });
      setSuccessMsg('Field sensor reading logged and risk factors updated.');
      if (onLogged) onLogged();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to log sensor reading:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Log Field Trap & Sensor Evidence</h3>
                <Badge variant="outline" size="sm">Field #{fieldId}</Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Independent evidence stream feeding the explainable risk engine (Item 10a)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-2 bg-slate-950/50 border-b border-slate-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('trap')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'trap'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            Pheromone / Pest Trap
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sensor')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'sensor'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            IoT / Field Sensor
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'trap' ? (
            <form onSubmit={handleSubmitTrap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Pest Specie</label>
                <select
                  value={targetPest}
                  onChange={(e) => {
                    setTargetPest(e.target.value);
                    if (e.target.value === 'Helicoverpa armigera') setEconomicThreshold(15);
                    if (e.target.value === 'Spodoptera litura') setEconomicThreshold(12);
                    if (e.target.value === 'Bemisia tabaci (Whitefly)') setEconomicThreshold(30);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="Helicoverpa armigera">Helicoverpa armigera (Tomato Fruit Borer)</option>
                  <option value="Spodoptera litura">Spodoptera litura (Armyworm)</option>
                  <option value="Bemisia tabaci (Whitefly)">Bemisia tabaci (Whitefly / Leaf Curl vector)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Observed Count (/night)</label>
                  <input
                    type="number"
                    min="0"
                    value={trapCount}
                    onChange={(e) => setTrapCount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Economic Threshold (ETL)</label>
                  <input
                    type="number"
                    min="1"
                    value={economicThreshold}
                    onChange={(e) => setEconomicThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-400 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Threshold Indicator */}
              <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                isTrapBreached
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                {isTrapBreached ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Economic Threshold Exceeded ({trapCount} &gt; {economicThreshold})</p>
                      <p className="text-[11px] text-rose-300/80 mt-0.5">
                        Logging will trigger an automatic +18 point elevation in the field's explainable risk score even without a leaf photo scan.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Within Safe Threshold ({trapCount} &lt; {economicThreshold})</p>
                      <p className="text-[11px] text-emerald-300/80 mt-0.5">
                        Pest density is below action threshold. Normal monitoring routine maintained.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Field Observation Notes</label>
                <input
                  type="text"
                  value={trapNotes}
                  onChange={(e) => setTrapNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={loading}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {loading ? 'Submitting...' : 'Record Trap Count'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmitSensor} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sensor Telemetry Type</label>
                <select
                  value={sensorType}
                  onChange={(e) => {
                    setSensorType(e.target.value);
                    if (e.target.value === 'leaf_wetness') { setSensorUnit('hours'); setSensorValue(8.5); }
                    if (e.target.value === 'soil_moisture') { setSensorUnit('%'); setSensorValue(74); }
                    if (e.target.value === 'canopy_humidity') { setSensorUnit('% RH'); setSensorValue(86); }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
                >
                  <option value="leaf_wetness">Foliage Leaf Wetness Duration</option>
                  <option value="soil_moisture">Root-Zone Soil Moisture</option>
                  <option value="canopy_humidity">Canopy Microclimate Humidity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Measured Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sensorValue}
                    onChange={(e) => setSensorValue(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                  <input
                    type="text"
                    value={sensorUnit}
                    disabled
                    className="w-full bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <p className="font-semibold text-slate-300">IoT Integration Note:</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Architecture allows continuous automated telemetry feeds from field edge nodes (ESP32/LoRaWAN).
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={loading}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  {loading ? 'Logging...' : 'Record Sensor Reading'}
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
