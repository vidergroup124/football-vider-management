import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, storage } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UploadCloud } from 'lucide-react';
import ImageCropperModal from '../components/ImageCropperModal';

function Onboarding() {
  const navigate = useNavigate();
  const teamId = localStorage.getItem('teamId');

  const [profile, setProfile] = useState({
    teamName: '',
    sportType: 'Football', // 'Football' or 'Futsal'
    level: 'Amateur',
    managerName: '',
    logoUrl: 'https://via.placeholder.com/150'
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    e.target.value = '';
    const imageUrl = URL.createObjectURL(file);
    setCropImageSrc(imageUrl);
  };

  const handleCropComplete = async (croppedBase64Url) => {
    setCropImageSrc(null);
    setUploading(true);
    try {
      setProfile({ ...profile, logoUrl: croppedBase64Url });
    } catch (error) {
      console.error("Error setting logo:", error);
      alert("อัปโหลดโลโก้ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setCropImageSrc(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamId || !profile.teamName) return;

    setLoading(true);
    try {
      const docRef = doc(db, 'teams', teamId);
      // We use setDoc with merge: true to avoid overwriting other subcollections if they somehow exist
      await setDoc(docRef, { profile }, { merge: true });
      navigate('/dashboard');
    } catch (error) {
      console.error("Error saving team profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex-center flex-col p-4 relative" style={{ 
      backgroundImage: 'radial-gradient(circle at top right, rgba(0,229,255,0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(0,229,255,0.05), transparent 40%)' 
    }}>
      <ImageCropperModal 
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        onCancel={handleCancelCrop}
      />

      <div className="glass-panel p-8 w-full max-w-2xl" style={{ padding: '2rem' }}>
        <h2 className="text-2xl font-bold title-glow mb-2" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          ตั้งค่าข้อมูลทีม (Team Setup)
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
          ยินดีต้อนรับ! กรุณากรอกข้อมูลทีมของคุณสำหรับการใช้งานครั้งแรก (สามารถแก้ไขได้ภายหลัง)
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="flex flex-col items-center gap-4 mb-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-cyan-400 flex-center bg-gray-800" style={{ width: '128px', height: '128px', borderRadius: '50%', border: '2px solid var(--theme-primary)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
              <img src={profile.logoUrl} alt="Team Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {uploading && <div className="absolute inset-0 bg-black/50 flex-center text-xs" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.75rem' }}>Uploading...</div>}
            </div>
            
            <div>
              <input type="file" id="logoUpload" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
              <label htmlFor="logoUpload" className="btn-primary flex items-center gap-2 cursor-pointer text-sm" style={{ padding: '8px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={16} /> อัปโหลดโลโก้ทีม
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ชื่อทีม (Team Name)</label>
            <input 
              required
              className="input-field" 
              placeholder="เช่น Vider United" 
              value={profile.teamName}
              onChange={e => setProfile({...profile, teamName: e.target.value})}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ประเภทกีฬา (Sport Type)</label>
              <select 
                className="input-field"
                value={profile.sportType}
                onChange={e => setProfile({...profile, sportType: e.target.value})}
              >
                <option value="Football">ฟุตบอล (11 คน)</option>
                <option value="Futsal">ฟุตซอล (5 คน)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ระดับของทีม (Level)</label>
              <select 
                className="input-field"
                value={profile.level}
                onChange={e => setProfile({...profile, level: e.target.value})}
              >
                <option value="Amateur">เดินสาย / อเมเจอร์</option>
                <option value="School">ทีมโรงเรียน</option>
                <option value="Academy">อะคาเดมี</option>
                <option value="Pro">สโมสรอาชีพ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>ชื่อผู้จัดการทีม / โค้ชหลัก</label>
            <input 
              className="input-field" 
              placeholder="ชื่อผู้จัดการทีม" 
              value={profile.managerName}
              onChange={e => setProfile({...profile, managerName: e.target.value})}
            />
          </div>
          
          <button 
            type="submit"
            className="btn-primary mt-4" 
            disabled={loading || uploading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกและเข้าสู่ Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Onboarding;
