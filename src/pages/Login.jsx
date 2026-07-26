import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const WHITELIST_IDS = ['1709901591262', '7170212'];

function Login() {
  const [teamId, setTeamId] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (WHITELIST_IDS.includes(teamId.trim())) {
      setLoading(true);
      try {
        const id = teamId.trim();
        localStorage.setItem('teamId', id);
        
        // ตรวจสอบว่ามีข้อมูลทีมแล้วหรือยัง
        const docRef = doc(db, 'teams', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().profile) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } catch (err) {
        console.error("Error fetching team profile:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex-center" style={{ 
      backgroundImage: 'radial-gradient(circle at top right, rgba(0,229,255,0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(0,229,255,0.05), transparent 40%)' 
    }}>
      <div className="glass-panel p-8 w-full max-w-md mx-4" style={{ padding: '2rem' }}>
        <div className="flex-center flex-col mb-8 text-center">
          <div className="bg-black p-4 rounded-full border border-gray-800 mb-4 shadow-lg shadow-cyan-500/20">
            <ShieldCheck size={48} className="text-cyan-400" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <h1 className="text-3xl font-bold title-glow mb-2" style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>
            Football Vider
          </h1>
          <h2 className="text-xl text-gray-400 font-medium" style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            Management
          </h2>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              TEAM ID (รหัสทีม)
            </label>
            <input
              type="text"
              value={teamId}
              onChange={(e) => {
                setTeamId(e.target.value);
                setError(false);
              }}
              className="input-field"
              placeholder="กรอก Team ID ของคุณ"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'rgba(255, 23, 68, 0.1)', border: '1px solid var(--danger)', color: '#ff8a80', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.875rem' }}>ไม่พบ Team ID ในระบบ กรุณาติดต่อผู้ดูแล</span>
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-4" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
