import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';
import Draggable from 'react-draggable';
import { Save, RefreshCw } from 'lucide-react';

function TacticsBoard({ sportType = 'Football' }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [positions, setPositions] = useState({}); // { playerId: {x, y} }
  const [pitchSize, setPitchSize] = useState({ width: 340, height: 510 });

  const teamId = localStorage.getItem('teamId');

  useEffect(() => {
    fetchPlayers();
    
    // Auto adjust pitch size based on screen width for responsive
    const handleResize = () => {
      const container = document.getElementById('pitch-container');
      if (container) {
        setPitchSize({ width: container.clientWidth, height: container.clientHeight });
      }
    };
    
    window.addEventListener('resize', handleResize);
    setTimeout(handleResize, 100); // Initial check after render
    
    return () => window.removeEventListener('resize', handleResize);
  }, [teamId]);

  const fetchPlayers = async () => {
    if (!teamId) return;
    try {
      const playersRef = collection(db, 'teams', teamId, 'players');
      const snapshot = await getDocs(playersRef);
      const playersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersList);
      
      // Load saved positions
      const initialPos = {};
      playersList.forEach((p, index) => {
        if (p.tacticX !== undefined && p.tacticY !== undefined) {
          initialPos[p.id] = { x: p.tacticX, y: p.tacticY };
        } else {
          // Default positions off the pitch (bench)
          initialPos[p.id] = { x: (index % 5) * 50, y: -60 };
        }
      });
      setPositions(initialPos);
      
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStop = (playerId, e, data) => {
    setPositions(prev => ({
      ...prev,
      [playerId]: { x: data.x, y: data.y }
    }));
  };

  const saveTactics = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      players.forEach(player => {
        if (positions[player.id]) {
          const playerRef = doc(db, 'teams', teamId, 'players', player.id);
          batch.update(playerRef, {
            tacticX: positions[player.id].x,
            tacticY: positions[player.id].y
          });
        }
      });
      
      await batch.commit();
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

  if (loading) return <div className="text-gray-400">Loading tactics board...</div>;

  return (
    <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex justify-between items-center flex-wrap gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="text-2xl font-bold title-glow" style={{ fontSize: '1.5rem' }}>Tactics Board</h2>
        <div className="flex gap-3" style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchPlayers} className="btn-secondary flex-center gap-2" style={{ height: '40px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
            <RefreshCw size={18} /> รีเซ็ต
          </button>
          <button onClick={saveTactics} disabled={saving} className="btn-primary flex-center gap-2" style={{ height: '40px', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} /> {saving ? 'กำลังบันทึก...' : 'บันทึกแผน'}
          </button>
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto" style={{ width: '100%', maxWidth: '42rem', margin: '0 auto' }}>
        
        {/* Bench Area (Off-pitch) */}
        <div className="glass-panel p-4 mb-4 min-h-[100px] relative z-10" style={{ padding: '1rem', marginBottom: '1rem', minHeight: '100px', position: 'relative', zIndex: 10 }}>
          <h3 className="text-sm font-bold text-gray-400 mb-2" style={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ผู้เล่นตัวสำรอง / ยังไม่จัดลงสนาม (ลากลงไปในสนามได้เลย)</h3>
          {/* This area just serves as a visual drop zone origin, the draggables are absolute anyway */}
        </div>

        {/* Pitch Area */}
        <div 
          id="pitch-container"
          className="relative w-full aspect-[2/3] max-h-[700px] mx-auto rounded-lg border-4 border-white/20 shadow-2xl" 
          style={{ 
            position: 'relative', 
            width: '100%', 
            aspectRatio: '2/3',
            maxHeight: '700px', 
            margin: '0 auto',
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
            
            {/* Outer boundary */}
            <rect x="20" y="20" width="360" height="560" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            
            {/* Center line */}
            <line x1="20" y1="300" x2="380" y2="300" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            
            {/* Center circle & spot */}
            <circle cx="200" cy="300" r="45" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <circle cx="200" cy="300" r="3" fill="rgba(255,255,255,0.5)" />
            
            {/* Top Penalty Box */}
            <rect x="80" y="20" width="240" height="90" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <rect x="140" y="20" width="120" height="30" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <path d="M 155 110 A 45 45 0 0 0 245 110" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <circle cx="200" cy="80" r="3" fill="rgba(255,255,255,0.5)" />
            
            {/* Bottom Penalty Box */}
            <rect x="80" y="490" width="240" height="90" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <rect x="140" y="550" width="120" height="30" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <path d="M 155 490 A 45 45 0 0 1 245 490" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
            <circle cx="200" cy="520" r="3" fill="rgba(255,255,255,0.5)" />
          </svg>

          {/* Draggable Players */}
          {players.map(player => (
            <Draggable
              key={player.id}
              defaultPosition={positions[player.id]}
              onStop={(e, data) => handleDragStop(player.id, e, data)}
            >
              <div 
                className="absolute z-20 cursor-grab active:cursor-grabbing flex flex-col items-center group touch-none"
                style={{ position: 'absolute', zIndex: 20, cursor: 'grab', display: 'flex', flexDirection: 'column', alignItems: 'center', touchAction: 'none', padding: '10px', margin: '-10px' }} // padded margin for easier touch grab
              >
                <div 
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-bold shadow-lg transition-transform group-hover:scale-110 ${getOvrColor(player.ovr)}`}
                  style={{ 
                    width: '3rem', height: '3rem', borderRadius: '50%', border: '2px solid', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  <span style={{ fontSize: '1.125rem' }}>{player.number}</span>
                </div>
                
                <div className="mt-1 px-2 py-0.5 bg-black/70 rounded text-[10px] md:text-xs text-white font-bold whitespace-nowrap border border-white/10" style={{ marginTop: '0.25rem', padding: '0.125rem 0.5rem', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: '0.25rem', fontSize: '0.75rem', color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {player.name}
                </div>
                <div className="mt-0.5 px-1 py-0.5 bg-cyan-500/80 rounded text-[9px] md:text-[10px] text-white font-bold" style={{ marginTop: '0.125rem', padding: '0.125rem 0.25rem', backgroundColor: 'rgba(6,182,212,0.8)', borderRadius: '0.25rem', fontSize: '0.65rem', color: 'white', fontWeight: 'bold' }}>
                  {player.position}
                </div>
              </div>
            </Draggable>
          ))}
          
        </div>
        
      </div>
    </div>
  );
}

export default TacticsBoard;
