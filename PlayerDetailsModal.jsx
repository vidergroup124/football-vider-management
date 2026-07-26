import { useState } from 'react';
import { X, Save } from 'lucide-react';

function PlayerDetailsModal({ player, onSave, onClose }) {
  const [editData, setEditData] = useState({
    name: player.name || '',
    nickname: player.nickname || '',
    number: player.number || '',
    position: player.position || 'MF',
    status: player.status || 'Ready',
    height: player.height || '',
    weight: player.weight || '',
    preferredFoot: player.preferredFoot || 'Right',
    stats: player.stats || {
      PAC: 70, SHO: 70, PAS: 70, DRI: 70, DEF: 70, PHY: 70
    }
  });

  const handleStatChange = (stat, value) => {
    let numValue = parseInt(value) || 0;
    if (numValue > 99) numValue = 99;
    if (numValue < 1) numValue = 1;
    
    setEditData({
      ...editData,
      stats: {
        ...editData.stats,
        [stat]: numValue
      }
    });
  };

  const calculateOVR = () => {
    const { PAC, SHO, PAS, DRI, DEF, PHY } = editData.stats;
    return Math.round((PAC + SHO + PAS + DRI + DEF + PHY) / 6);
  };

  const ovr = calculateOVR();
  
  const getOvrColor = (rating) => {
    if (rating >= 90) return 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]';
    if (rating >= 80) return 'text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]';
    if (rating >= 70) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
    return 'text-gray-400';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...player, ...editData, ovr });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
      <div className="glass-panel w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '48rem', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(17,24,39,0.5)' }}>
          <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="text-4xl font-black italic" style={{ fontSize: '2.25rem', fontWeight: 900, fontStyle: 'italic' }}>
              <span className={getOvrColor(ovr)}>{ovr}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold title-glow" style={{ fontSize: '1.25rem' }}>{editData.name} <span className="text-sm text-gray-400 font-normal">#{editData.number}</span></h3>
              <p className="text-sm text-cyan-400" style={{ fontSize: '0.875rem', color: 'var(--theme-primary)' }}>{editData.position} • {editData.status}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1" style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          <form id="player-form" onSubmit={handleSubmit} className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              
              {/* Personal Details */}
              <div className="glass-panel p-4" style={{ padding: '1rem' }}>
                <h4 className="text-sm font-bold text-gray-400 mb-4 border-b border-gray-800 pb-2" style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>ข้อมูลส่วนตัว</h4>
                
                <div className="flex flex-col gap-3" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ชื่อนักเตะ</label>
                    <input className="input-field py-1" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} required style={{ padding: '0.25rem 0.5rem' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>หมายเลข</label>
                      <input type="number" className="input-field py-1" value={editData.number} onChange={e => setEditData({...editData, number: e.target.value})} required style={{ padding: '0.25rem 0.5rem' }} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>สถานะ</label>
                      <select className="input-field py-1" value={editData.status} onChange={e => setEditData({...editData, status: e.target.value})} style={{ padding: '0.25rem 0.5rem' }}>
                        <option value="Ready">พร้อมแข่ง</option>
                        <option value="Injured">บาดเจ็บ</option>
                        <option value="Banned">ติดโทษแบน</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ส่วนสูง (cm)</label>
                      <input type="number" className="input-field py-1" value={editData.height} onChange={e => setEditData({...editData, height: e.target.value})} placeholder="175" style={{ padding: '0.25rem 0.5rem' }} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>น้ำหนัก (kg)</label>
                      <input type="number" className="input-field py-1" value={editData.weight} onChange={e => setEditData({...editData, weight: e.target.value})} placeholder="70" style={{ padding: '0.25rem 0.5rem' }} />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-400 mb-1" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>เท้าที่ถนัด</label>
                    <select className="input-field py-1" value={editData.preferredFoot} onChange={e => setEditData({...editData, preferredFoot: e.target.value})} style={{ padding: '0.25rem 0.5rem' }}>
                      <option value="Right">ขวา (Right)</option>
                      <option value="Left">ซ้าย (Left)</option>
                      <option value="Both">สองเท้า (Both)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stats FC Style */}
              <div className="glass-panel p-4" style={{ padding: '1rem' }}>
                <h4 className="text-sm font-bold text-gray-400 mb-4 border-b border-gray-800 pb-2 flex justify-between" style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>ค่าพลัง (Stats)</span>
                  <span className="text-xs text-cyan-400">1-99</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '1rem', rowGap: '0.75rem' }}>
                  {Object.keys(editData.stats).map(stat => (
                    <div key={stat} className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <label className="w-10 text-xs font-bold text-gray-300" style={{ width: '2.5rem', fontSize: '0.75rem', fontWeight: 'bold', color: '#d1d5db' }}>{stat}</label>
                      <input 
                        type="number" 
                        min="1" max="99" 
                        className="input-field py-1 text-center font-bold" 
                        value={editData.stats[stat]} 
                        onChange={e => handleStatChange(stat, e.target.value)}
                        style={{ padding: '0.25rem', textAlign: 'center', fontWeight: 'bold', flex: 1 }} 
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-3 bg-black/30 rounded-lg flex justify-between items-center" style={{ marginTop: '1.5rem', padding: '0.75rem', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="text-sm text-gray-400" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ภาพรวม (OVR)</span>
                  <div className="h-2 flex-1 mx-4 bg-gray-800 rounded-full overflow-hidden" style={{ height: '0.5rem', flex: 1, margin: '0 1rem', backgroundColor: '#1f2937', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div 
                      className="h-full bg-cyan-400 transition-all duration-300" 
                      style={{ height: '100%', backgroundColor: 'var(--theme-primary)', width: `${ovr}%` }}
                    ></div>
                  </div>
                </div>

              </div>

            </div>
          </form>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', backgroundColor: 'rgba(17,24,39,0.5)' }}>
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors" style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-card)', color: 'white', border: 'none', cursor: 'pointer' }}>
            ยกเลิก
          </button>
          <button type="submit" form="player-form" className="btn-primary flex-center gap-2">
            <Save size={20} /> บันทึกข้อมูลนักเตะ
          </button>
        </div>

      </div>
    </div>
  );
}

export default PlayerDetailsModal;
