import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, LayoutDashboard, DollarSign, LogOut, Save, UploadCloud, Edit3, X } from 'lucide-react';
import { db, storage } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SquadManagement from '../components/SquadManagement';
import MatchesFixtures from '../components/MatchesFixtures';
import ImageCropperModal from '../components/ImageCropperModal';

function Dashboard({ setTheme }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('squad');
  const teamId = localStorage.getItem('teamId');
  const [profile, setProfile] = useState(null);
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoViewOpen, setIsLogoViewOpen] = useState(false);
  
  // Settings State
  const [editProfile, setEditProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Cropper State
  const [cropImageSrc, setCropImageSrc] = useState(null);

  useEffect(() => {
    if (!teamId) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [teamId]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'teams', teamId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().profile) {
        setProfile(docSnap.data().profile);
        setEditProfile(docSnap.data().profile);
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Clear input so same file can be selected again
    e.target.value = '';

    const imageUrl = URL.createObjectURL(file);
    setCropImageSrc(imageUrl);
  };

  const handleCropComplete = async (croppedBase64Url) => {
    setCropImageSrc(null);
    setUploading(true);
    try {
      setEditProfile({ ...editProfile, logoUrl: croppedBase64Url });
    } catch (error) {
      console.error("Error setting logo:", error);
      alert("อัปเดตโลโก้ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setCropImageSrc(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'teams', teamId);
      await setDoc(docRef, { profile: editProfile }, { merge: true });
      setProfile(editProfile);
      setIsEditModalOpen(false);
      alert('บันทึกข้อมูลสำเร็จ!');
    } catch (error) {
      console.error("Error saving profile", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('teamId');
    navigate('/login');
  };

  if (!profile) return <div className="min-h-screen flex-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen flex text-white" style={{ display: 'flex' }}>
      
      <ImageCropperModal 
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        onCancel={handleCancelCrop}
      />

      {/* Full Logo View Modal */}
      {isLogoViewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setIsLogoViewOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="relative max-w-2xl w-full flex-center flex-col" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsLogoViewOpen(false)} className="absolute -top-10 right-0 text-white hover:text-cyan-400" style={{ position: 'absolute', top: '-2.5rem', right: 0 }}>
              <X size={32} />
            </button>
            <img src={profile.logoUrl} alt="Team Logo Full" className="max-h-[80vh] object-contain rounded-xl" style={{ maxHeight: '80vh', objectFit: 'contain', borderRadius: '0.75rem', border: '4px solid var(--theme-primary)', boxShadow: '0 0 30px var(--theme-primary-glow)' }} />
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditModalOpen && editProfile && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
          <div className="glass-panel w-full max-w-xl flex flex-col max-h-[90vh] overflow-y-auto" style={{ width: '100%', maxWidth: '36rem', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="p-4 border-b border-gray-800 flex justify-between items-center" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="text-xl font-bold title-glow" style={{ fontSize: '1.25rem' }}>แก้ไขข้อมูลทีม (Edit Profile)</h3>
              <button onClick={() => { setIsEditModalOpen(false); setEditProfile(profile); }} className="text-gray-400 hover:text-white" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            
            <div className="p-6" style={{ padding: '1.5rem' }}>
              <div className="flex items-center gap-6 mb-6" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-400 flex-center bg-gray-800" style={{ width: '96px', height: '96px', borderRadius: '50%', border: '2px solid var(--theme-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
                  <img src={editProfile.logoUrl} alt="Team Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {uploading && <div className="absolute inset-0 bg-black/50 flex-center text-xs" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>Uploading...</div>}
                </div>
                <div>
                  <input type="file" id="editModalLogoUpload" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                  <label htmlFor="editModalLogoUpload" className="btn-primary flex items-center gap-2 cursor-pointer text-sm" style={{ padding: '8px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UploadCloud size={16} /> เปลี่ยนรูปโลโก้ทีม
                  </label>
                  <p className="text-xs text-gray-500 mt-2" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>เมื่อเลือกรูปภาพแล้ว จะสามารถตัดภาพเป็นวงกลมก่อนอัปโหลดได้</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ชื่อทีม (Team Name)</label>
                  <input required className="input-field" value={editProfile.teamName} onChange={e => setEditProfile({...editProfile, teamName: e.target.value})} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ประเภทกีฬา</label>
                    <select className="input-field" value={editProfile.sportType} onChange={e => setEditProfile({...editProfile, sportType: e.target.value})}>
                      <option value="Football">ฟุตบอล (11 คน)</option>
                      <option value="Futsal">ฟุตซอล (5 คน)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ระดับทีม</label>
                    <select className="input-field" value={editProfile.level} onChange={e => setEditProfile({...editProfile, level: e.target.value})}>
                      <option value="Amateur">เดินสาย / อเมเจอร์</option>
                      <option value="School">ทีมโรงเรียน</option>
                      <option value="Academy">อะคาเดมี</option>
                      <option value="Pro">สโมสรอาชีพ</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ชื่อผู้จัดการทีม</label>
                  <input className="input-field" value={editProfile.managerName} onChange={e => setEditProfile({...editProfile, managerName: e.target.value})} />
                </div>
                
                <div className="flex justify-end gap-3 mt-4" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => { setIsEditModalOpen(false); setEditProfile(profile); }} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors" style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-card)', color: 'white', border: 'none', cursor: 'pointer' }}>
                    ยกเลิก
                  </button>
                  <button type="submit" className="btn-primary flex-center gap-2" disabled={saving || uploading}>
                    <Save size={20} /> {saving ? 'Saving...' : 'บันทึกการเปลี่ยนแปลง'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 flex flex-col hidden md:flex" style={{ width: '256px', margin: '1rem', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        <div className="p-6 border-b border-gray-800" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="text-xl font-bold title-glow" style={{ fontSize: '1.25rem' }}>Vider Mgmt</h2>
        </div>
        
        <nav className="flex-1 p-4" style={{ flex: '1', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={() => setActiveTab('squad')}
            className={`flex items-center gap-3 p-3 w-full rounded-lg text-left transition-colors ${activeTab === 'squad' ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/5'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', width: '100%', borderRadius: '0.5rem', background: activeTab === 'squad' ? 'var(--theme-primary-glow)' : 'transparent', color: activeTab === 'squad' ? 'var(--theme-primary)' : 'inherit', border: 'none', cursor: 'pointer' }}
          >
            <Users size={20} /> Squad
          </button>
          <button 
            onClick={() => setActiveTab('matches')}
            className={`flex items-center gap-3 p-3 w-full rounded-lg text-left transition-colors ${activeTab === 'matches' ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/5'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', width: '100%', borderRadius: '0.5rem', background: activeTab === 'matches' ? 'var(--theme-primary-glow)' : 'transparent', color: activeTab === 'matches' ? 'var(--theme-primary)' : 'inherit', border: 'none', cursor: 'pointer' }}
          >
            <Calendar size={20} /> Matches
          </button>
          <button 
            onClick={() => setActiveTab('tactics')}
            className={`flex items-center gap-3 p-3 w-full rounded-lg text-left transition-colors ${activeTab === 'tactics' ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/5'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', width: '100%', borderRadius: '0.5rem', background: activeTab === 'tactics' ? 'var(--theme-primary-glow)' : 'transparent', color: activeTab === 'tactics' ? 'var(--theme-primary)' : 'inherit', border: 'none', cursor: 'pointer' }}
          >
            <LayoutDashboard size={20} /> Tactics
          </button>
          <button 
            onClick={() => setActiveTab('finances')}
            className={`flex items-center gap-3 p-3 w-full rounded-lg text-left transition-colors ${activeTab === 'finances' ? 'bg-white/10 text-cyan-400' : 'hover:bg-white/5'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', width: '100%', borderRadius: '0.5rem', background: activeTab === 'finances' ? 'var(--theme-primary-glow)' : 'transparent', color: activeTab === 'finances' ? 'var(--theme-primary)' : 'inherit', border: 'none', cursor: 'pointer' }}
          >
            <DollarSign size={20} /> Finances
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800" style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>THEME</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setTheme('theme-blue')} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#00E5FF', border: 'none', cursor: 'pointer' }} title="Sporty Blue"></button>
              <button onClick={() => setTheme('theme-green')} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#39FF14', border: 'none', cursor: 'pointer' }} title="Neon Green"></button>
              <button onClick={() => setTheme('theme-gold')} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#FFD700', border: 'none', cursor: 'pointer' }} title="Gold"></button>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 w-full rounded-lg text-left hover:bg-red-900/20 text-red-400 transition-colors"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', width: '100%', borderRadius: '0.5rem', color: 'var(--danger)', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative" style={{ flex: '1', padding: '2rem', overflowY: 'auto', position: 'relative' }}>
        <header className="glass-panel p-6 mb-8 flex justify-between items-center" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 className="text-3xl font-bold title-glow" style={{ fontSize: '1.875rem' }}>{profile.teamName}</h1>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-gray-400 hover:text-cyan-400 transition-colors bg-gray-800/50 p-2 rounded-full" 
                style={{ background: 'rgba(31, 41, 55, 0.5)', padding: '0.5rem', borderRadius: '9999px', border: 'none', cursor: 'pointer' }}
                title="Edit Team Profile"
              >
                <Edit3 size={20} />
              </button>
            </div>
            <p className="text-gray-400 mt-1" style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {profile.level} {profile.sportType} • Manager: {profile.managerName || 'N/A'}
            </p>
          </div>
          <div 
            className="w-16 h-16 rounded-full bg-gray-800 border-2 border-cyan-400 flex-center overflow-hidden cursor-pointer hover:border-white transition-colors" 
            onClick={() => setIsLogoViewOpen(true)}
            style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-card)', border: '2px solid var(--theme-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
            title="View Full Logo"
          >
            <img src={profile.logoUrl} alt="Team Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </header>

        {/* Tab Content */}
        <div className="glass-panel p-6 min-h-[500px]" style={{ padding: '1.5rem', minHeight: '500px' }}>
          {activeTab === 'squad' && <SquadManagement sportType={profile.sportType} />}
          {activeTab === 'matches' && <MatchesFixtures />}
          {activeTab === 'tactics' && (
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tactics Board</h2>
              <p style={{ color: 'var(--text-muted)' }}>กระดานวางแผนการเล่นแบบ Interactive (อยู่ระหว่างการพัฒนา)</p>
            </div>
          )}
          {activeTab === 'finances' && (
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Team Finances</h2>
              <p style={{ color: 'var(--text-muted)' }}>บัญชีรายรับ-รายจ่าย (อยู่ระหว่างการพัฒนา)</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
