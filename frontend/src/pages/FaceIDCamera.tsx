import React, { useRef, useState } from 'react';
import './FaceIDCamera.css';

const FaceIDCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  // Camera state
  const [cameraActive, setCameraActive] = useState(false);

  // Start the camera
  const startCamera = async () => {
    setError(null);
    setResult(null);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setError('Could not access camera.');
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Capture the image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 320, 240);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  // Send image to backend
  const sendToBackend = async () => {
    if (!capturedImage) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const response = await fetch('/api/faceIDVerifier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: capturedImage }),
      });
      if (!response.ok) throw new Error('Verification failed');
      const data = await response.json();
      setResult(JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || 'Error sending image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="faceid-camera-container">
      <h2>Face ID Verification</h2>
      <div className="camera-box">
        <video ref={videoRef} width={320} height={240} style={{ borderRadius: 10 }} />
        <canvas ref={canvasRef} width={320} height={240} style={{ display: 'none' }} />
      </div>
      <div className="camera-controls">
        {/* Initial state: only show Start Camera */}
        {!cameraActive && !capturedImage && (
          <button onClick={startCamera}>Start Camera</button>
        )}
        {/* Camera active, no image: show Capture and Stop Camera */}
        {cameraActive && !capturedImage && (
          <>
            <button onClick={captureImage}>Capture</button>
            <button onClick={stopCamera}>Stop Camera</button>
          </>
        )}
        {/* Image captured: show Capture (to retake) and Verify */}
        {capturedImage && (
          <>
            <button onClick={() => { setCapturedImage(null); setResult(null); setError(null); setTimeout(() => { if (!cameraActive) startCamera(); }, 0); }}>Retake</button>
            <button onClick={sendToBackend}>Verify</button>
          </>
        )}
      </div>
      {capturedImage && (
        <div className="preview-box">
          <h4>Preview:</h4>
          <img src={capturedImage} alt="Captured" style={{ borderRadius: 10, width: 160 }} />
        </div>
      )}
      {loading && <div className="loading">Verifying...</div>}
      {result && <div className="result">Result: {result}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default FaceIDCamera;
