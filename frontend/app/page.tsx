'use client';

import { useMemo, useState } from 'react';
import { Download, Video, Instagram, Facebook } from 'lucide-react';

export default function Home() {
  const [videoLink, setVideoLink] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = useMemo(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}:8001`;
    }
    return 'http://localhost:8001';
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    setDownloadUrl(null);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoLink }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong.');
      }

      const data = await response.json();
      const bestUrl = data.force_download_url
        ? new URL(data.force_download_url, API_BASE).href
        : (data.download_url
            ? new URL(data.download_url, API_BASE).href
            : null);
      setDownloadUrl(bestUrl);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { name: 'YouTube', icon: Video, color: 'text-blue-400' },
    { name: 'Instagram', icon: Instagram, color: 'text-purple-400' },
    { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
    { name: 'TikTok', icon: Video, color: 'text-purple-500' }
  ];

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .main-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a0b2e 25%, #16213e 50%, #0f3460 75%, #0d1b2a 100%);
          position: relative;
          overflow: hidden;
        }
        
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 8s ease-in-out infinite;
        }
        
        .orb-1 {
          width: 350px;
          height: 350px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%);
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        
        .orb-2 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(147, 51, 234, 0.35) 0%, rgba(147, 51, 234, 0.08) 50%, transparent 100%);
          top: 55%;
          right: 5%;
          animation-delay: 3s;
        }
        
        .orb-3 {
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 100%);
          bottom: 15%;
          left: 45%;
          animation-delay: 6s;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          33% { transform: translateY(-30px) rotate(120deg) scale(1.1); }
          66% { transform: translateY(15px) rotate(240deg) scale(0.9); }
        }
        
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        
        .particle-1 {
          width: 10px;
          height: 10px;
          background: rgba(59, 130, 246, 0.7);
          top: 12%;
          left: 18%;
          animation: bounce-particle 4s infinite;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
        
        .particle-2 {
          width: 6px;
          height: 6px;
          background: rgba(147, 51, 234, 0.8);
          top: 28%;
          right: 22%;
          animation: ping-particle 3s infinite;
          box-shadow: 0 0 15px rgba(147, 51, 234, 0.6);
        }
        
        .particle-3 {
          width: 8px;
          height: 8px;
          background: rgba(99, 102, 241, 0.7);
          bottom: 25%;
          left: 20%;
          animation: bounce-particle 4s infinite 1.5s;
          box-shadow: 0 0 18px rgba(99, 102, 241, 0.5);
        }
        
        .particle-4 {
          width: 4px;
          height: 4px;
          background: rgba(168, 85, 247, 0.9);
          top: 50%;
          left: 30%;
          animation: ping-particle 2.5s infinite 0.8s;
          box-shadow: 0 0 12px rgba(168, 85, 247, 0.7);
        }
        
        .particle-5 {
          width: 12px;
          height: 12px;
          background: rgba(59, 130, 246, 0.6);
          bottom: 30%;
          right: 12%;
          animation: bounce-particle 4s infinite 2s;
          box-shadow: 0 0 25px rgba(59, 130, 246, 0.4);
        }
        
        @keyframes bounce-particle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        
        @keyframes ping-particle {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
        
        .logo-container {
          position: relative;
          display: inline-block;
          margin-bottom: 2.5rem;
        }
        
        .logo-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #3b82f6);
          border-radius: 50%;
          filter: blur(15px);
          opacity: 0.8;
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .logo {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 90px;
          height: 90px;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%);
          border-radius: 50%;
          box-shadow: 0 25px 50px rgba(59, 130, 246, 0.3);
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        .title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 800;
          margin-bottom: 1rem;
          position: relative;
        }
        
        .title-gradient {
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 25%, #60a5fa 50%, #c084fc 75%, #60a5fa 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 4s ease-in-out infinite;
        }
        
        .title-shadow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 25%, #60a5fa 50%, #c084fc 75%, #60a5fa 100%);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: blur(8px);
          opacity: 0.6;
          animation: gradient-shift 4s ease-in-out infinite;
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .main-card {
          position: relative;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 2rem;
          padding: 3rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
        }
        
        .card-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%);
          border-radius: 2rem;
          filter: blur(20px);
          z-index: -1;
        }
        
        .platform-icon {
          position: relative;
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .platform-icon:hover {
          transform: translateY(-5px) scale(1.1);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }
        
        .platform-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%);
          border-radius: 1.5rem;
          filter: blur(8px);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        
        .platform-icon:hover::before {
          opacity: 1;
        }
        
        .input-container {
          position: relative;
          margin-bottom: 2rem;
        }
        
        .input-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%);
          border-radius: 1.5rem;
          filter: blur(10px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .input-container:hover .input-glow {
          opacity: 1;
        }
        
        .video-input {
          position: relative;
          width: 100%;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 1.5rem;
          color: white;
          font-size: 1.1rem;
          font-weight: 500;
          backdrop-filter: blur(20px);
          box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        
        .video-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .video-input:focus {
          outline: none;
          border-color: rgba(59, 130, 246, 0.6);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), inset 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .download-btn {
          position: relative;
          width: 100%;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%);
          background-size: 200% 200%;
          border: none;
          border-radius: 1.5rem;
          color: white;
          font-size: 1.2rem;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          cursor: pointer;
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        .download-btn:hover:not(:disabled) {
          background-position: 100% 0%;
          transform: translateY(-2px);
          box-shadow: 0 25px 50px rgba(59, 130, 246, 0.4);
        }
        
        .download-btn:disabled {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .btn-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 1.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .download-btn:hover:not(:disabled) .btn-glow {
          opacity: 1;
        }
        
        .success-card {
          margin-top: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(16, 185, 129, 0.15) 50%, rgba(34, 197, 94, 0.25) 100%);
          border: 1px solid rgba(34, 197, 94, 0.4);
          border-radius: 1.5rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 15px 35px rgba(34, 197, 94, 0.2);
        }
        
        .error-card {
          margin-top: 2rem;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(244, 63, 94, 0.15) 50%, rgba(239, 68, 68, 0.25) 100%);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 1.5rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 15px 35px rgba(239, 68, 68, 0.2);
        }
        
        .status-indicator {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          animation: pulse-indicator 2s infinite;
          box-shadow: 0 0 20px currentColor;
        }
        
        .status-indicator.success {
          background: #22c55e;
        }
        
        .status-indicator.error {
          background: #ef4444;
        }
        
        @keyframes pulse-indicator {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        .download-link {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          color: #93c5fd;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          padding: 0.75rem;
          border-radius: 1rem;
          background: rgba(59, 130, 246, 0.1);
        }
        
        .download-link:hover {
          color: #dbeafe;
          background: rgba(59, 130, 246, 0.2);
          transform: translateX(5px);
        }
        
        .api-info {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.9rem;
        }
        
        .api-code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          color: #93c5fd;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2rem;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          margin-top: 2rem;
        }
        
        .pulse-dots {
          display: flex;
          gap: 0.25rem;
        }
        
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }
        
        .pulse-dot:nth-child(1) {
          background: #60a5fa;
          animation-delay: 0s;
        }
        
        .pulse-dot:nth-child(2) {
          background: #a78bfa;
          animation-delay: 0.3s;
        }
        
        .pulse-dot:nth-child(3) {
          background: #34d399;
          animation-delay: 0.6s;
        }
        
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .main-card {
            padding: 2rem;
          }
          
          .orb-1, .orb-2, .orb-3 {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>
      
      <div className="main-container">
        {/* Animated background elements */}
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        
        {/* Floating particles */}
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>

        <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
          <div className="w-full max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="logo-container">
                <div className="logo-glow"></div>
                <div className="logo">
                  <Download size={40} color="white" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
                </div>
              </div>
              <h1 className="title">
                <span className="title-gradient">Video Downloader</span>
                <div className="title-shadow"></div>
              </h1>
              <p style={{ color: '#d1d5db', fontSize: '1.1rem', fontWeight: '500', letterSpacing: '0.5px' }}>
                Download from <span style={{ color: '#60a5fa', fontWeight: '700' }}>multiple platforms</span> instantly
              </p>
            </div>

            {/* Main Card */}
            <div className="main-card">
              <div className="card-glow"></div>
              
              {/* Platform Icons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
                {platforms.map((platform, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div className="platform-icon">
                      <platform.icon size={32} className={platform.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#d1d5db', fontWeight: '600', letterSpacing: '0.5px' }}>
                      {platform.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div className="input-container">
                  <div className="input-glow"></div>
                  <input
                    type="text"
                    className="video-input"
                    placeholder="✨ Paste your video link here..."
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleDownload}
                  disabled={loading || !videoLink}
                  className="download-btn"
                >
                  <div className="btn-glow"></div>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                    {loading ? (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                          <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Processing Magic...</span>
                      </>
                    ) : (
                      <>
                        <Download size={24} />
                        <span>Download Video</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {/* Download Result */}
              {downloadUrl && (
                <div className="success-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div className="status-indicator success"></div>
                      <div style={{ position: 'absolute', inset: '0', width: '18px', height: '18px', background: '#22c55e', borderRadius: '50%', animation: 'ping-particle 2s infinite', opacity: '0.6' }}></div>
                    </div>
                    <p style={{ color: '#86efac', fontWeight: '700', fontSize: '1.2rem' }}>✨ Ready to download!</p>
                  </div>
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="download-link"
                  >
                    <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.75rem' }}>
                      <Download size={20} />
                    </div>
                    <span>Click here to download your video</span>
                  </a>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="error-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="status-indicator error"></div>
                    <p style={{ color: '#fca5a5', fontWeight: '700', fontSize: '1.2rem' }}>❌ Something went wrong</p>
                  </div>
                  <p style={{ color: '#fecaca', fontSize: '1rem', lineHeight: '1.6' }}>{error}</p>
                </div>
              )}

              {/* API Info */}
              <div className="api-info">
                <span style={{ color: '#9ca3af', fontWeight: '500' }}>API Endpoint</span>
                <code className="api-code">
                  {API_BASE}
                </code>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign: 'center' }}>
              <div className="footer-badge">
                <div className="pulse-dots">
                  <div className="pulse-dot"></div>
                  <div className="pulse-dot"></div>
                  <div className="pulse-dot"></div>
                </div>
                <p style={{ color: '#d1d5db', fontSize: '0.95rem', fontWeight: '500' }}>
                  Supports YouTube, Instagram, Facebook, TikTok & more
                </p>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </>
  );
}