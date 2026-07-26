import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

function ImageCropperModal({ imageSrc, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (e) {
      console.error(e);
      alert('Error cropping image');
    } finally {
      setProcessing(false);
    }
  };

  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', padding: '1rem' }}>
      <div className="glass-panel w-full max-w-lg overflow-hidden flex flex-col" style={{ width: '100%', maxWidth: '32rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="p-4 border-b border-gray-800" style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="text-xl font-bold title-glow" style={{ fontSize: '1.25rem' }}>ปรับขนาดโลโก้ (Crop Image)</h3>
        </div>
        
        <div className="relative w-full h-80 bg-black" style={{ position: 'relative', width: '100%', height: '320px', backgroundColor: 'black' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={onZoomChange}
          />
        </div>
        
        <div className="p-4 flex flex-col gap-4" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label className="text-sm text-gray-400" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Zoom</label>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(e.target.value);
              }}
              className="flex-1"
              style={{ flex: 1 }}
            />
          </div>
          
          <div className="flex justify-end gap-3" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', backgroundColor: 'var(--bg-card)', color: 'white', border: 'none', cursor: 'pointer' }}
              disabled={processing}
            >
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={processing}
            >
              {processing ? 'กำลังประมวลผล...' : 'ยืนยันรูปภาพ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageCropperModal;
