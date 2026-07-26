import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Calendar as CalendarIcon, Clock, MapPin, Trash2, Edit2, Check } from 'lucide-react';

function MatchesFixtures() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newMatch, setNewMatch] = useState({
    date: '',
    time: '',
    opponent: '',
    location: 'Home',
    competition: '',
    status: 'Upcoming',
    score: { home: 0, away: 0 }
  });

  const teamId = localStorage.getItem('teamId');

  useEffect(() => {
    fetchMatches();
  }, [teamId]);

  const fetchMatches = async () => {
    if (!teamId) return;
    try {
      const matchesRef = collection(db, 'teams', teamId, 'matches');
      const snapshot = await getDocs(matchesRef);
      const matchesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date (basic sorting)
      matchesList.sort((a, b) => new Date(a.date) - new Date(b.date));
      setMatches(matchesList);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!newMatch.date || !newMatch.opponent) return;
    
    try {
      const matchesRef = collection(db, 'teams', teamId, 'matches');
      await addDoc(matchesRef, newMatch);
      setNewMatch({
        date: '', time: '', opponent: '', location: 'Home', competition: '', status: 'Upcoming', score: { home: 0, away: 0 }
      });
      fetchMatches();
    } catch (error) {
      console.error("Error adding match:", error);
    }
  };

  const handleDelete = async (matchId) => {
    if (!confirm('ลบแมตช์นี้ใช่หรือไม่?')) return;
    try {
      await deleteDoc(doc(db, 'teams', teamId, 'matches', matchId));
      fetchMatches();
    } catch (error) {
      console.error("Error deleting match:", error);
    }
  };

  const updateScore = async (matchId, currentScore, isHome, increment) => {
    try {
      const matchRef = doc(db, 'teams', teamId, 'matches', matchId);
      const newScoreValue = isHome ? currentScore.home + increment : currentScore.away + increment;
      if (newScoreValue < 0) return;

      const newScore = { ...currentScore, [isHome ? 'home' : 'away']: newScoreValue };
      await updateDoc(matchRef, { score: newScore, status: 'Played' });
      fetchMatches();
    } catch (error) {
      console.error("Error updating score:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="text-2xl font-bold title-glow" style={{ fontSize: '1.5rem' }}>Matches & Fixtures</h2>
      </div>

      {/* Add Match Form */}
      <div className="glass-panel p-6" style={{ padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ fontSize: '1.125rem', marginBottom: '1rem', color: 'var(--theme-primary)' }}>เพิ่มโปรแกรมการแข่งขัน</h3>
        <form onSubmit={handleAddMatch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>วันที่</label>
            <input type="date" className="input-field" value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} required style={{ colorScheme: 'dark' }} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>เวลา</label>
            <input type="time" className="input-field" value={newMatch.time} onChange={e => setNewMatch({...newMatch, time: e.target.value})} style={{ colorScheme: 'dark' }} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ทีมคู่แข่ง</label>
            <input type="text" className="input-field" placeholder="ชื่อทีมคู่แข่ง" value={newMatch.opponent} onChange={e => setNewMatch({...newMatch, opponent: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>สถานที่</label>
            <select className="input-field" value={newMatch.location} onChange={e => setNewMatch({...newMatch, location: e.target.value})}>
              <option value="Home">เหย้า (Home)</option>
              <option value="Away">เยือน (Away)</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ height: '50px', gridColumn: '1 / -1' }}>บันทึกโปรแกรมแข่งขัน</button>
        </form>
      </div>

      {/* Match List */}
      <div className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading matches...</p>
        ) : matches.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>ยังไม่มีโปรแกรมการแข่งขัน</p>
        ) : (
          matches.map(match => (
            <div key={match.id} className="glass-panel p-5 flex flex-col md:flex-row justify-between items-center gap-4" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              
              <div className="flex flex-col gap-2 flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: '1' }}>
                <div className="flex items-center gap-2 text-sm text-gray-400" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <CalendarIcon size={16} /> {match.date} &nbsp; 
                  <Clock size={16} /> {match.time || 'TBD'} &nbsp;
                  <span className={`px-2 py-0.5 rounded text-xs ${match.location === 'Home' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'}`} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                    {match.location}
                  </span>
                </div>
                <div className="text-xl font-bold flex items-center gap-4" style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={match.location === 'Home' ? 'text-cyan-400' : ''} style={{ color: match.location === 'Home' ? 'var(--theme-primary)' : 'inherit' }}>Vider Utd</span>
                  <span className="text-gray-500 text-sm" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>VS</span>
                  <span className={match.location === 'Away' ? 'text-cyan-400' : ''} style={{ color: match.location === 'Away' ? 'var(--theme-primary)' : 'inherit' }}>{match.opponent}</span>
                </div>
              </div>

              {/* Score Editor */}
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-lg border border-gray-800" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <div className="flex flex-col items-center gap-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <button onClick={() => updateScore(match.id, match.score, true, 1)} className="text-gray-400 hover:text-white" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>▲</button>
                  <span className="text-2xl font-bold w-8 text-center" style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '2rem', textAlign: 'center' }}>{match.score?.home || 0}</span>
                  <button onClick={() => updateScore(match.id, match.score, true, -1)} className="text-gray-400 hover:text-white" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>▼</button>
                </div>
                <span className="text-gray-600 font-bold" style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>-</span>
                <div className="flex flex-col items-center gap-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <button onClick={() => updateScore(match.id, match.score, false, 1)} className="text-gray-400 hover:text-white" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>▲</button>
                  <span className="text-2xl font-bold w-8 text-center" style={{ fontSize: '1.5rem', fontWeight: 'bold', width: '2rem', textAlign: 'center' }}>{match.score?.away || 0}</span>
                  <button onClick={() => updateScore(match.id, match.score, false, -1)} className="text-gray-400 hover:text-white" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>▼</button>
                </div>
              </div>

              <button onClick={() => handleDelete(match.id)} className="text-red-400 hover:text-red-300 p-2" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MatchesFixtures;
