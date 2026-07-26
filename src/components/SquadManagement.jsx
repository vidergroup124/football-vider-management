import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, UserCircle } from 'lucide-react';

function SquadManagement({ sportType = 'Football' }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    nickname: '',
    number: '',
    position: 'MF', // default
    status: 'Ready'
  });

  const teamId = localStorage.getItem('teamId');

  useEffect(() => {
    fetchPlayers();
  }, [teamId]);

  // Update default position when sportType changes
  useEffect(() => {
    setNewPlayer(prev => ({
      ...prev,
      position: sportType === 'Futsal' ? 'ALA' : 'MF'
    }));
  }, [sportType]);

  const fetchPlayers = async () => {
    if (!teamId) return;
    try {
      const playersRef = collection(db, 'teams', teamId, 'players');
      const snapshot = await getDocs(playersRef);
      const playersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      setNewPlayer({ name: '', nickname: '', number: '', position: sportType === 'Futsal' ? 'ALA' : 'MF', status: 'Ready' });
      fetchPlayers(); // Refresh list
    } catch (error) {
      console.error("Error adding player:", error);
    }
  };

  const handleDelete = async (playerId) => {
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

  return (
    <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="text-2xl font-bold title-glow" style={{ fontSize: '1.5rem' }}>Squad Management</h2>
      </div>

      {/* Add Player Form */}
      <div className="glass-panel p-6" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--theme-primary)' }}>เพิ่มนักเตะใหม่</h3>
        <form onSubmit={handleAddPlayer} className="grid grid-cols-1 md:grid-cols-6 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>หมายเลข (No.)</label>
            <input type="number" className="input-field" value={newPlayer.number} onChange={e => setNewPlayer({...newPlayer, number: e.target.value})} required />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ชื่อ-นามสกุล</label>
            <input type="text" className="input-field" value={newPlayer.name} onChange={e => setNewPlayer({...newPlayer, name: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ตำแหน่ง</label>
            <select className="input-field" value={newPlayer.position} onChange={e => setNewPlayer({...newPlayer, position: e.target.value})}>
              {sportType === 'Futsal' ? (
                <>
                  <option value="GK">GK (ผู้รักษาประตู)</option>
                  <option value="FIXO">FIXO (ตัวรับ)</option>
                  <option value="ALA">ALA (ริมเส้น)</option>
                  <option value="PIVO">PIVO (หน้าเป้า)</option>
                </>
              ) : (
                <>
                  <option value="GK">GK</option>
                  <option value="DF">DF</option>
                  <option value="MF">MF</option>
                  <option value="FW">FW</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>สถานะ</label>
            <select className="input-field" value={newPlayer.status} onChange={e => setNewPlayer({...newPlayer, status: e.target.value})}>
              <option value="Ready">พร้อมแข่ง</option>
              <option value="Injured">บาดเจ็บ</option>
              <option value="Banned">ติดโทษแบน</option>
            </select>
          </div>
          <button type="submit" className="btn-primary flex-center gap-2" style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> เพิ่ม
          </button>
        </form>
      </div>

      {/* Players List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading squad...</p>
        ) : players.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีข้อมูลนักเตะในทีม</p>
        ) : (
          players.map(player => (
            <div key={player.id} className="glass-panel p-4 flex items-center justify-between" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="w-12 h-12 rounded-full bg-gray-800 flex-center text-xl font-bold border-2" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold', borderColor: 'var(--theme-primary)', color: 'var(--text-main)' }}>
                  {player.number}
                </div>
                <div>
                  <h4 className="font-semibold" style={{ fontWeight: '600' }}>{player.name}</h4>
                  <div className="flex gap-2 mt-1" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>{player.position}</span>
                    <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(player.status)}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid' }}>
                      {player.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleDelete(player.id)} className="text-red-400 hover:text-red-300 p-2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SquadManagement;
