import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ScanFace, Camera, RefreshCw, Check, AlertTriangle, VideoOff, Loader2, X,
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import useWebcam from '../../hooks/useWebcam';

const ERROR_MESSAGES = {
  permission: {
    title: 'Camera Permission Required',
    message: 'Please allow camera access in your browser to register a face photo.',
    retry: true,
  },
  noCamera: {
    title: 'No Camera Detected',
    message: 'No webcam was found on this device. Connect a webcam and try again.',
    retry: false,
  },
  readable: {
    title: 'Camera Unavailable',
    message: 'Your camera is currently in use by another application. Close it and try again.',
    retry: true,
  },
  unavailable: {
    title: 'Camera Access Unavailable',
    message: 'Camera access is not supported in this browser or context (use HTTPS or localhost).',
    retry: true,
  },
  unknown: {
    title: 'Camera Error',
    message: 'Something went wrong while accessing your camera. Please try again.',
    retry: true,
  },
};

/**
 * Face Registration capture modal.
 *
 * Frontend prototype only: captures a still image from the device webcam
 * and hands it back via onCapture as a data URL. This performs no face
 * detection, matching, or liveness checks - it is not a biometric
 * authentication system. It exists to prepare the registration workflow so
 * a later backend implementation can replace this mock capture step with
 * real biometric processing.
 */
export default function FaceCaptureModal({ isOpen, employeeId, employeeName, onCapture, onClose }) {
  const { videoRef, status, error, start, stop } = useWebcam();
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const run = async () => {
      setCapturedImage(null);
      if (cancelled) return;
      await start();
    };
    run();
    return () => {
      cancelled = true;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(dataUrl);
    stop();
  }, [videoRef, stop]);

  const handleRetake = () => {
    setCapturedImage(null);
    start();
  };

  const handleConfirm = () => {
    if (!capturedImage) return;
    onCapture?.(capturedImage);
  };

  const handleClose = () => {
    stop();
    onClose?.();
  };

  const errorInfo = ERROR_MESSAGES[error?.type] || ERROR_MESSAGES.unknown;
  const isActive = status === 'active';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Register Face" size="sm">
      <div className="flex items-center gap-2 -mt-1 mb-4">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <ScanFace className="w-5 h-5 text-blue-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{employeeName || 'New Employee'}</p>
          <p className="text-xs text-gray-400">{employeeId}</p>
        </div>
      </div>

      {status === 'error' ? (
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${error?.type === 'noCamera' ? 'bg-gray-100' : 'bg-red-50'}`}>
            {error?.type === 'noCamera' ? (
              <VideoOff className="w-7 h-7 text-gray-500" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-red-500" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{errorInfo.title}</h3>
            <p className="text-xs text-gray-500 mt-1.5 max-w-xs">{errorInfo.message}</p>
          </div>
          <div className="flex items-center gap-3 w-full mt-1">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Cancel</Button>
            {errorInfo.retry && (
              <Button variant="primary" className="flex-1" icon={RefreshCw} onClick={start}>Retry</Button>
            )}
          </div>
        </div>
      ) : capturedImage ? (
        <>
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 aspect-square">
            <img src={capturedImage} alt="Captured face preview" className="w-full h-full object-cover" />
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-3">
            Review the photo below. This mock capture is stored with the employee's ID for prototype purposes only.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Button variant="outline" className="flex-1" icon={RefreshCw} onClick={handleRetake}>Retake</Button>
            <Button variant="primary" className="flex-1" icon={Check} onClick={handleConfirm}>Confirm Registration</Button>
          </div>
        </>
      ) : (
        <>
          <div className="relative rounded-2xl overflow-hidden bg-[#0B1F3A] aspect-square">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-xs font-medium tracking-wide">
                  {status === 'requesting' ? 'Requesting camera access...' : 'Starting camera...'}
                </p>
              </div>
            )}
            {isActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-[62%] aspect-square rounded-full border-2 border-dashed border-blue-400/80" />
                <div className="absolute left-4 top-4 w-8 h-8 border-l-2 border-t-2 border-blue-400 rounded-tl-lg" />
                <div className="absolute right-4 top-4 w-8 h-8 border-r-2 border-t-2 border-blue-400 rounded-tr-lg" />
                <div className="absolute left-4 bottom-4 w-8 h-8 border-l-2 border-b-2 border-blue-400 rounded-bl-lg" />
                <div className="absolute right-4 bottom-4 w-8 h-8 border-r-2 border-b-2 border-blue-400 rounded-br-lg" />
              </div>
            )}
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-3">
            Position your face inside the frame, then capture. Camera feed is processed locally and never leaves this device.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Button variant="outline" className="flex-1" icon={X} onClick={handleClose}>Cancel</Button>
            <Button variant="primary" className="flex-1" icon={Camera} onClick={handleCapture} disabled={!isActive}>
              Capture
            </Button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </Modal>
  );
}
