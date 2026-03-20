import { useRef, useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, SwitchCamera, Zap, ZapOff } from 'lucide-react';

interface CameraScannerProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const CameraScanner = ({ onCapture, onClose }: CameraScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
      // Check torch support
      const track = stream.getVideoTracks()[0];
      const caps = track.getCapabilities?.() as any;
      setHasTorch(!!caps?.torch);
    } catch {
      setError('Unable to access camera. Please allow camera permissions.');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const toggleCamera = async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    setCameraReady(false);
    await startCamera(newMode);
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      await (track as any).applyConstraints({ advanced: [{ torch: !torchOn }] });
      setTorchOn(!torchOn);
    } catch {}
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCapture(dataUrl);
  };

  if (error) {
    return (
      <div className="relative w-full h-80 rounded-xl bg-muted flex flex-col items-center justify-center gap-4 p-6 text-center">
        <Camera className="w-12 h-12 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-border bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-72 object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Viewfinder overlay */}
      {cameraReady && (
        <div className="absolute inset-0 h-72 pointer-events-none">
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary rounded-br-lg" />
          {/* Scan line animation */}
          <div className="absolute left-6 right-6 h-0.5 bg-primary/60 animate-scan-line" />
          {/* Label */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <p className="text-xs text-white font-medium">Position plant in frame</p>
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-background">
        {hasTorch && (
          <Button variant="ghost" size="icon" onClick={toggleTorch} className="rounded-full">
            {torchOn ? <Zap className="w-5 h-5 text-yellow-500" /> : <ZapOff className="w-5 h-5" />}
          </Button>
        )}

        <button
          onClick={captureImage}
          disabled={!cameraReady}
          className="w-16 h-16 rounded-full border-4 border-primary bg-primary/10 flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="w-11 h-11 rounded-full bg-primary" />
        </button>

        <Button variant="ghost" size="icon" onClick={toggleCamera} className="rounded-full">
          <SwitchCamera className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default CameraScanner;
