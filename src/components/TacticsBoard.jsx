import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, RefreshCw, X, Plus } from 'lucide-react';
import { getFormationsForSport } from '../config/formations';

function TacticsBoard({ sportType = 'Football' }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Tactic State
  const formations = getFormationsForSport(sportType);
  const formationKeys = Object.keys(formations);
  const [selectedFormation, setSelectedFormation] = useState(formationKeys[0]);
  const [assignments, setAssignments] = useState({}); // slotId -> playerId
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); // slot object

  const teamId = localStorage.getItem('teamId');

  useEffect(() => {
    // Reset formation if sportType changes
    const newFormations = getFormationsForSport(sportType);
    setSelectedFormation(Object.keys(newFormations)[0]);
    setAssignments({});
    fetchData();
  }, [teamId, sportType]);

  const fetchData = async () => {
    if (!teamId) return;
    setLoading(true);
    try {
      // 1. Fetch Players
      const playersRef = collection(db, 'teams', teamId, 'players');
      const snapshot = await getDocs(playersRef);
      const playersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersList);
      
      // 2. Fetch Tactic
      const tacticRef = doc(db, 'teams', teamId, 'tactic', 'main');
      const tacticSnap = await getDoc(tacticRef);
      
      if (tacticSnap.exists()) {
        const data = tacticSnap.data();
        if (data.sportType === sportType && data.formation && formations[data.formation]) {
          setSelectedFormation(data.formation);
          setAssignments(data.assignments || {});
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveTactics = async () => {
    setSaving(true);
    try {
      const tacticRef = doc(db, 'teams', teamId, 'tactic', 'main');
      await setDoc(tacticRef, {
        sportType,
        formation: selectedFormation,
        assignments
      });
      alert('บันทึกแผนการเล่นเรียบร้อยแล้ว!');
    } catch (error) {
      console.error("Error saving tactics:", error);
      alert('เกิดข้อผิดพลาดในการบันทึกแผน');
    } finally {
      setSaving(false);
    }
  };

  const getOvrColor = (rating) => {
    if (!rating) return 'bg-gray-600 border-gray-500';
    if (rating >= 90) return 'bg-purple-900 border-purple-500 text-purple-100 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
    if (rating >= 80) return 'bg-green-900 border-green-500 text-green-100 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
    if (rating >= 70) return 'bg-yellow-900 border-yellow-500 text-yellow-100 shadow-[0_0_10px_rgba(234,179,8,0.5)]';
    return 'bg-gray-800 border-gray-600';
  };

  // Changing formation clears invalid assignments
  const handleFormationChange = (e) => {
    const newForm = e.target.value;
    setSelectedFormation(newForm);
    
    // Clear assignments for slots that no longer exist
    const newSlots = formations[newForm].map(s => s.id);
    const newAssignments = { ...assignments };
    Object.keys(newAssignments).forEach(slotId => {
      if (!newSlots.includes(slotId)) {
        delete newAssignments[slotId];
      }
    });
    setAssignments(newAssignments);
  };

  const openSlotModal = (slot) => {
    setActiveSlot(slot);
    setIsModalOpen(true);
  };

  const assignPlayer = (playerId) => {
    setAssignments(prev => {
      // Remove this player from any other slot first
      const cleaned = { ...prev };
      Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === playerId) delete cleaned[key];
      });
      
      // Assign to new slot
      return { ...cleaned, [activeSlot.id]: playerId };
    });
    setIsModalOpen(false);
  };

  const removeAssignment = () => {
    setAssignments(prev => {
      const next = { ...prev };
      delete next[activeSlot.id];
      return next;
    });
    setIsModalOpen(false);
  };

  if (loading) return <div className="text-gray-400">Loading tactics board...</div>;

  const currentSlots = formations[selectedFormation] || [];
  
  // Players not assigned to any slot
  const assignedPlayerIds = Object.values(assignments);
  const benchPlayers = players.filter(p => !assignedPlayerIds.includes(p.id));

  return (
    <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 className="text-2xl font-bold title-glow" style={{ fontSize: '1.5rem' }}>Tactics Board</h2>
          <select 
            value={selectedFormation} 
            onChange={handleFormationChange}
            className="input-field w-auto py-2"
            style={{ minWidth: '150px' }}
          >
            {formationKeys.map(fk => (
              <option key={fk} value={fk}>{fk}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-3" style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchData} className="btn-secondary flex-center gap-2" style={{ height: '40px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
            <RefreshCw size={18} /> โหลดใหม่
          </button>
          <button onClick={saveTactics} disabled={saving} className="btn-primary flex-center gap-2" style={{ height: '40px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} /> {saving ? 'กำลังบันทึก...' : 'บันทึกแผน'}
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto" style={{ width: '100%', maxWidth: '42rem', margin: '0 auto' }}>
        
        {/* Pitch Area */}
        <div 
          id="pitch-container"
          className="relative w-full aspect-[2/3] max-h-[700px] mx-auto rounded-lg border-4 border-white/20 shadow-2xl mb-6" 
          style={{ 
            position: 'relative', 
            width: '100%', 
            aspectRatio: '2/3',
            maxHeight: '700px', 
            margin: '0 auto',
            marginBottom: '1.5rem',
            borderRadius: '0.5rem',
            border: '4px solid rgba(255,255,255,0.2)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Authentic SVG Pitch */}
          <svg width="100%" height="100%" viewBox="0 0 400 600" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundColor: '#2e7d32', borderRadius: '0.25rem' }}>
            <rect x="0" y="0" width="400" height="100" fill="#29732d" />
            <rect x="0" y="100" width="400" height="100" fill="#2e7d32" />
            <rect x="0" y="200" width="400" height="100" fill="#29732d" />
            <rect x="0" y="300" width="400" height="100" fill="#2e7d32" />
            <rect x="0" y="400" width="400" height="100" fill="#29732d" />
            <rect x="0" y="500" width="400" height="100" fill="#2e7d32" />
            
            <rect x="20" y="20" width="360" height="560" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <line x1="20" y1="300" x2="380" y2="300" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <circle cx="200" cy="300" r="45" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <circle cx="200" cy="300" r="3" fill="rgba(255,255,255,0.5)" />
            
            <rect x="80" y="20" width="240" height="90" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <rect x="140" y="20" width="120" height="30" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <path d="M 155 110 A 45 45 0 0 0 245 110" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <circle cx="200" cy="80" r="3" fill="rgba(255,255,255,0.5)" />
            
            <rect x="80" y="490" width="240" height="90" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <rect x="140" y="550" width="120" height="30" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <path d="M 155 490 A 45 45 0 0 1 245 490" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <circle cx="200" cy="520" r="3" fill="rgba(255,255,255,0.5)" />
          </svg>

          {/* Formation Slots */}
          {currentSlots.map(slot => {
            const assignedPlayer = players.find(p => p.id === assignments[slot.id]);
            
            return (
              <div 
                key={slot.id}
                onClick={() => openSlotModal(slot)}
                className="absolute z-20 flex flex-col items-center group cursor-pointer transition-transform hover:scale-110"
                style={{ 
                  left: `${(slot.x / 400) * 100}%`, 
                  top: `${(slot.y / 600) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '60px'
                }}
              >
                {assignedPlayer ? (
                  <>
                    <div 
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-bold shadow-lg ${getOvrColor(assignedPlayer.ovr)}`}
                      style={{ 
                        width: '3rem', height: '3rem', borderRadius: '50%', border: '2px solid', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                      }}
                    >
                      <span style={{ fontSize: '1.125rem' }}>{assignedPlayer.number}</span>
                    </div>
                    <div className="mt-1 px-2 py-0.5 bg-black/80 rounded text-[10px] md:text-xs text-white font-bold whitespace-nowrap border border-white/10 text-center">
                      {assignedPlayer.name}
                    </div>
                  </>
                ) : (
                  <>
                    <div 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-dashed border-white/50 bg-black/30 flex items-center justify-center text-white/50"
                      style={{ width: '3rem', height: '3rem', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.5)', backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={20} />
                    </div>
                    <div className="mt-1 px-2 py-0.5 bg-black/50 rounded text-[9px] md:text-[10px] text-white/80 font-bold border border-white/10">
                      {slot.label}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Bench / Unassigned */}
        <div className="glass-panel p-4" style={{ padding: '1rem' }}>
          <h3 className="text-sm font-bold text-gray-400 mb-3" style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            ม้านั่งสำรอง ({benchPlayers.length})
          </h3>
          <div className="flex flex-wrap gap-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {benchPlayers.length === 0 ? (
              <p className="text-xs text-gray-500 w-full text-center py-2">ไม่มีผู้เล่นสำรอง</p>
            ) : (
              benchPlayers.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded border border-gray-700" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(31, 41, 55, 0.5)', padding: '0.375rem 0.75rem', borderRadius: '0.25rem', border: '1px solid #374151' }}>
                  <span className={`w-6 h-6 rounded-full flex-center text-xs font-bold ${getOvrColor(p.ovr)}`} style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                    {p.number}
                  </span>
                  <span className="text-sm text-white" style={{ fontSize: '0.875rem', color: 'white' }}>{p.name}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>

      {/* Select Player Modal */}
      {isModalOpen && activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setIsModalOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="glass-panel w-full max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '28rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            
            <div className="p-4 border-b border-gray-800 flex justify-between items-center" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-xl font-bold title-glow" style={{ fontSize: '1.25rem' }}>เลือกผู้เล่นตำแหน่ง {activeSlot.label}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1" style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
              
              {assignments[activeSlot.id] && (
                <button 
                  onClick={removeAssignment}
                  className="w-full py-3 mb-4 rounded-lg bg-red-900/30 text-red-400 border border-red-900/50 hover:bg-red-900/50 font-bold transition-colors"
                  style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '0.5rem', color: 'var(--danger)', fontWeight: 'bold', border: '1px solid rgba(220,38,38,0.5)', background: 'rgba(220,38,38,0.1)', cursor: 'pointer' }}
                >
                  ถอดนักเตะออก (นำไปพัก)
                </button>
              )}

              <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>ตัวสำรอง (ว่าง)</h4>
              <div className="flex flex-col gap-2 mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {benchPlayers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">ไม่มีผู้เล่นสำรอง</div>
                ) : (
                  benchPlayers.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => assignPlayer(p.id)}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-800/40 border border-gray-700/50 cursor-pointer hover:border-cyan-500/50 hover:bg-gray-800/80 transition-all"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #374151', cursor: 'pointer' }}
                    >
                      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`w-8 h-8 rounded-full flex-center font-bold ${getOvrColor(p.ovr)}`} style={{ width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>{p.number}</span>
                        <div>
                          <p className="font-bold text-white text-sm" style={{ fontWeight: 'bold', color: 'white', fontSize: '0.875rem' }}>{p.name}</p>
                          <p className="text-xs text-cyan-400" style={{ fontSize: '0.75rem', color: 'var(--theme-primary)' }}>{p.position}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold bg-gray-900 px-2 py-1 rounded" style={{ fontSize: '0.75rem', fontWeight: 'bold', background: '#111827', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>OVR {p.ovr || '-'}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Show assigned players just in case they want to swap directly */}
              <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>ผู้เล่นตัวจริง (สลับตำแหน่ง)</h4>
              <div className="flex flex-col gap-2" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {players.filter(p => assignedPlayerIds.includes(p.id) && assignments[activeSlot.id] !== p.id).map(p => {
                  // Find what slot this player is currently in
                  const currentSlotId = Object.keys(assignments).find(k => assignments[k] === p.id);
                  const currentSlotLabel = currentSlots.find(s => s.id === currentSlotId)?.label;

                  return (
                    <div 
                      key={p.id}
                      onClick={() => assignPlayer(p.id)}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-900/60 border border-gray-800 cursor-pointer hover:border-yellow-500/50 transition-all opacity-70 hover:opacity-100"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #1f2937', cursor: 'pointer', opacity: 0.7 }}
                    >
                      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`w-8 h-8 rounded-full flex-center font-bold ${getOvrColor(p.ovr)}`} style={{ width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>{p.number}</span>
                        <div>
                          <p className="font-bold text-white text-sm" style={{ fontWeight: 'bold', color: 'white', fontSize: '0.875rem' }}>{p.name}</p>
                          <p className="text-xs text-yellow-500" style={{ fontSize: '0.75rem', color: '#eab308' }}>กำลังเล่นที่ {currentSlotLabel || currentSlotId}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default TacticsBoard;
