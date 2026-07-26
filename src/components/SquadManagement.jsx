import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit } from 'lucide-react';
import PlayerDetailsModal from './PlayerDetailsModal';

const FOOTBALL_POSITIONS = ["GK", "CB", "LB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"];
const FUTSAL_POSITIONS = ["GK", "FIXO", "ALA", "PIVO"];

function SquadManagement({ sportType = 'Football' }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    nickname: '',
    number: '',
    position: 'CM', // default
    status: 'Ready',
    stats: { PAC: 70, SHO: 70, PAS: 70, DRI: 70, DEF: 70, PHY: 70 },
    ovr: 70,
    height: '',
    weight: '',
    preferredFoot: 'Right'
  });

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const teamId = localStorage.getItem('teamId');

  useEffect(() => {
    fetchPlayers();
  }, [teamId]);

  // Update default position when sportType changes
  useEffect(() => {
    setNewPlayer(prev => ({
      ...prev,
      position: sportType === 'Futsal' ? 'ALA' : 'CM'
    }));
  }, [sportType]);

  const fetchPlayers = async () => {
    if (!teamId) return;
    try {
      const playersRef = collection(db, 'teams', teamId, 'players');
      const snapshot = await getDocs(playersRef);
      const playersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by number
      playersList.sort((a, b) => (parseInt(a.number) || 0) - (parseInt(b.number) || 0));
      setPlayers(playersList);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.number) return;
    
    try {
      const playersRef = collection(db, 'teams', teamId, 'players');
      await addDoc(playersRef, newPlayer);
      setNewPlayer({ 
        name: '', nickname: '', number: '', 
        position: sportType === 'Futsal' ? 'ALA' : 'CM', 
        status: 'Ready',
        stats: { PAC: 70, SHO: 70, PAS: 70, DRI: 70, DEF: 70, PHY: 70 },
        ovr: 70, height: '', weight: '', preferredFoot: 'Right'
      });
      fetchPlayers(); // Refresh list
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  const handleUpdatePlayer = async (updatedPlayer) => {
    try {
      const playerRef = doc(db, 'teams', teamId, 'players', updatedPlayer.id);
      await updateDoc(playerRef, updatedPlayer);
      setSelectedPlayer(null);
      fetchPlayers();
    } catch (error) {
      console.error("Error updating player:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleDelete = async (e, playerId) => {
    e.stopPropagation();
    if (!confirm('ยืนยันการลบนักเตะคนนี้?')) return;
    try {
      await deleteDoc(doc(db, 'teams', teamId, 'players', playerId));
      fetchPlayers();
    } catch (error) {
      console.error("Error deleting player:", error);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Ready': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Injured': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Banned': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getOvrColor = (rating) => {
    if (!rating) return 'text-gray-400';
    if (rating >= 90) return 'text-purple-400';
    if (rating >= 80) return 'text-green-400';
    if (rating >= 70) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const positions = sportType === 'Futsal' ? FUTSAL_POSITIONS : FOOTBALL_POSITIONS;

  return (
    <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {selectedPlayer && (
        <PlayerDetailsModal 
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onSave={handleUpdatePlayer}
        />
      )}

      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="text-2xl font-bold title-glow" style={{ fontSize: '1.5rem' }}>Squad Management</h2>
      </div>

      {/* Add Player Form */}
      <div className="glass-panel p-6" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--theme-primary)' }}>เพิ่มนักเตะใหม่</h3>
        <form onSubmit={handleAddPlayer} className="grid grid-cols-1 md:grid-cols-6 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>หมายเลข (No.)</label>
            <input type="number" className="input-field py-2" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value})} required style={{ padding: '0.5rem' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ชื่อนักเตะ</label>
            <input type="text" className="input-field py-2" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} required style={{ padding: '0.5rem' }} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ตำแหน่ง</label>
            <select className="input-field py-2" value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})} style={{ padding: '0.5rem' }}>
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>สถานะ</label>
            <select className="input-field py-2" value={newPlayer.status} onChange={e => setNewPlayer({...newPlayer, status: e.target.value})} style={{ padding: '0.5rem' }}>
              <option value="Ready">พร้อมแข่ง</option>
              <option value="Injured">บาดเจ็บ</option>
              <option value="Banned">ติดโทษแบน</option>
            </select>
          </div>
          <button type="submit" className="btn-primary flex-center gap-2" style={{ height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> เพิ่ม
          </button>
        </form>
      </div>

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading squad...</p>
        ) : players.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีข้อมูลนักเตะในทีม</p>
        ) : (
          players.map(player => (
            <div 
              key={player.id} 
              onClick={() => setSelectedPlayer(player)}
              className="glass-panel p-4 flex items-center justify-between cursor-pointer hover:border-cyan-400/50 transition-colors group relative overflow-hidden" 
              style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.2s' }}
            >
              {/* OVR Watermark */}
              <div className="absolute -right-4 -bottom-6 text-8xl font-black italic opacity-5 pointer-events-none" style={{ position: 'absolute', right: '-1rem', bottom: '-1.5rem', fontSize: '6rem', fontWeight: 900, fontStyle: 'italic', opacity: 0.05, pointerEvents: 'none' }}>
                {player.ovr || 70}
              </div>

              <div className="flex items-center gap-4 relative z-10" style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 10 }}>
                <div className="w-14 h-14 rounded-xl bg-gray-800 flex flex-col items-center justify-center border border-gray-700 shadow-inner" style={{ width: '56px', height: '56px', borderRadius: '0.75rem', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                  <span className={`text-xs font-bold ${getOvrColor(player.ovr)}`} style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{player.ovr || 70}</span>
                  <span className="text-xl font-black text-white" style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{player.number}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-lg group-hover:text-cyan-400 transition-colors" style={{ fontWeight: '600', fontSize: '1.125rem' }}>{player.name}</h4>
                  <div className="flex gap-2 mt-1 items-center" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', alignItems: 'center' }}>
                    <span className="text-xs font-bold text-gray-300" style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#d1d5db' }}>{player.position}</span>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(player.status)}`} style={{ fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', border: '1px solid' }}>
                      {player.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative', zIndex: 10 }}>
                <button className="text-gray-500 hover:text-cyan-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Edit size={18} />
                </button>
                <button onClick={(e) => handleDelete(e, player.id)} className="text-gray-500 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SquadManagement;
