'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Video, Instagram, Facebook } from 'lucide-react';

export default function Home() {
  const [videoLink, setVideoLink] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = useMemo(() => {
    if (process.env.NEXT_PUBLIC_API_BASE) return process.env.NEXT_PUBLIC_API_BASE;
    if (typeof window !== 'undefined') return window.location.origin;
    return '';
  }, []);

  const handleDownload = async () => {
    setLoading(true);
    setDownloadUrl(null);
    setError(null);

    try {
      const endpoint = API_BASE ? `${API_BASE}/download` : '/download';
      const response = await fetch(endpoint, {
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
        ? (API_BASE ? new URL(data.force_download_url, API_BASE).href : data.force_download_url)
        : (data.download_url
            ? (API_BASE ? new URL(data.download_url, API_BASE).href : data.download_url)
            : null);
      setDownloadUrl(bestUrl);
      // Try to immediately trigger a download without opening a new tab
      if (bestUrl) {
        try {
          const a = document.createElement('a');
          a.href = bestUrl;
          a.download = '';
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } catch (_) {
          // ignore; user can click the link manually
        }
      }
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
    // { name: 'YouTube', icon: Video, color: 'text-blue-400' },
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
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body, html {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        .main-container {
          position: relative;
          min-height: 100vh;
          width: 100%;
          background: linear-gradient(135deg, #0f0f23 0%, #1a0b2e 25%, #16213e 50%, #0f3460 75%, #0d1b2a 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: float 8s ease-in-out infinite;
          pointer-events: none;
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
        
        .content-wrapper {
          width: 100%;
          max-width: 500px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }
        
        .logo-container {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
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
          width: 80px;
          height: 80px;
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
          font-size: 2.5rem;
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
          padding: 1.5rem;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
          width: 100%;
          margin: 0 auto;
        }
        
        .card-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 50%, rgba(59, 130, 246, 0.1) 100%);
          border-radius: 2rem;
          filter: blur(20px);
          z-index: -1;
        }
        
        .platform-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
          justify-items: center;
        }
        
        .platform-icon {
          position: relative;
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .platform-icon:hover {
          transform: translateY(-3px) scale(1.05);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
        }
        
        .platform-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%);
          border-radius: 1rem;
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
          margin-bottom: 1.5rem;
        }
        
        .input-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%);
          border-radius: 1rem;
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
          padding: 1rem 1.25rem;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 1rem;
          color: white;
          font-size: 1rem;
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
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #3b82f6 100%);
          background-size: 200% 200%;
          border: none;
          border-radius: 1rem;
          color: white;
          font-size: 1rem;
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
          border-radius: 1rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .download-btn:hover:not(:disabled) .btn-glow {
          opacity: 1;
        }
        
        .success-card {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(16, 185, 129, 0.15) 50%, rgba(34, 197, 94, 0.25) 100%);
          border: 1px solid rgba(34, 197, 94, 0.4);
          border-radius: 1rem;
          backdrop-filter: blur(20px);
          box-shadow: 0 15px 35px rgba(34, 197, 94, 0.2);
        }
        
        .error-card {
          margin-top: 1.5rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(244, 63, 94, 0.15) 50%, rgba(239, 68, 68, 0.25) 100%);
          border: 1px solid rgba(239, 68, 68, 0.4);
          border-radius: 1rem;
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
          border-radius: 0.5rem;
          background: rgba(59, 130, 246, 0.1);
        }
        
        .download-link:hover {
          color: #dbeafe;
          background: rgba(59, 130, 246, 0.2);
          transform: translateX(5px);
        }
        
        .footer-section {
          margin-top: 2rem;
          text-align: center;
        }
        
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 1.5rem;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          margin-bottom: 1.5rem;
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
        
        .social-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #9ca3af;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          text-decoration: none;
        }
        
        .social-link:hover {
          transform: translateY(-3px) scale(1.05);
          color: #ffffff;
          background: rgba(255, 255, 255, 0.2);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .main-container {
            padding: 0.75rem;
          }
          
          .content-wrapper {
            max-width: 100%;
          }
          
          .main-card {
            padding: 1.25rem;
          }
          
          .title {
            font-size: 2rem;
          }
          
          .platform-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          
          .platform-icon {
            width: 55px;
            height: 55px;
          }
          
          .orb-1, .orb-2, .orb-3 {
            width: 200px;
            height: 200px;
          }
        }
        
        @media (max-width: 480px) {
          .main-container {
            padding: 0.5rem;
          }
          
          .main-card {
            padding: 1rem;
          }
          
          .title {
            font-size: 1.75rem;
          }
          
          .platform-icon {
            width: 50px;
            height: 50px;
          }
          
          .video-input {
            padding: 0.875rem 1rem;
            font-size: 0.9rem;
          }
          
          .download-btn {
            padding: 0.875rem 1.25rem;
            font-size: 0.95rem;
          }
          
          .logo {
            width: 70px;
            height: 70px;
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

        <div className="content-wrapper">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="logo-container">
              <div className="logo-glow"></div>
              <div className="logo">
                <Download size={35} color="white" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
              </div>
            </div>
            <h1 className="title">
              <span className="title-gradient">Video Downloader</span>
              <div className="title-shadow"></div>
            </h1>
            <p style={{ color: '#d1d5db', fontSize: '1rem', fontWeight: '500', letterSpacing: '0.5px' }}>
              Download from <span style={{ color: '#60a5fa', fontWeight: '700' }}>multiple platforms</span> instantly
            </p>
          </div>

          {/* Main Card */}
          <div className="main-card">
            <div className="card-glow"></div>
            
            {/* Platform Icons */}
            <div className="platform-grid">
              {platforms.map((platform, index) => (
                <div key={index} style={{ textAlign: 'center' ,justifyContent: 'center',display: 'flex',flexDirection: 'column',alignItems: 'center'}}>
                  <div className="platform-icon">
                    <platform.icon size={24} className={platform.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#d1d5db', fontWeight: '600', letterSpacing: '0.5px' }}>
                    {platform.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Input Section */}
            <div>
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
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                        <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing Magic...</span>
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      <span>Download Video</span>
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* Download Result */}
            {downloadUrl && (
              <div className="success-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <div className="status-indicator success"></div>
                    <div style={{ position: 'absolute', inset: '0', width: '18px', height: '18px', background: '#22c55e', borderRadius: '50%', animation: 'ping-particle 2s infinite', opacity: '0.6' }}></div>
                  </div>
                  <p style={{ color: '#86efac', fontWeight: '700', fontSize: '1.1rem' }}>✨ Ready to download!</p>
                </div>
                <a
                  href={downloadUrl}
                  download
                  className="download-link"
                >
                  <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '0.5rem' }}>
                    <Download size={18} />
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
                  <p style={{ color: '#fca5a5', fontWeight: '700', fontSize: '1.1rem' }}>❌ Something went wrong</p>
                </div>
                <p style={{ color: '#fecaca', fontSize: '0.95rem', lineHeight: '1.6' }}>{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="footer-section">
            {/* Project Contact Message */}
            <div style={{ 
              marginBottom: '1.5rem', 
              padding: '0.75rem 1.5rem', 
              background: 'rgba(59, 130, 246, 0.1)', 
              borderRadius: '0.75rem', 
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(10px)'
            }}>
              <p style={{ 
                color: '#93c5fd', 
                fontSize: '0.9rem', 
                fontWeight: '600', 
                margin: '0'
              }}>
                💼 Need a custom project? <span style={{ color: '#60a5fa' }}>Let&apos;s work together!</span>
              </p>
            </div>

            <div className="footer-badge">
              <div className="pulse-dots">
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
                <div className="pulse-dot"></div>
              </div>
              <p style={{ color: '#d1d5db', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>
                Supports  Instagram, Facebook, TikTok & more
              </p>
            </div>

            {/* Social Links */}
            <div className="social-links">
              <a
                href="https://github.com/abdulahad-2/Sage-video-downloader"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>

              <a
                href="https://www.linkedin.com/in/abdul-ahad-7908a82b4/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>

              <a
                href="mailto:abdul.ahadt732@gmail.com"
                className="social-link"
                title="Email"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/abdul_ahadt/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                title="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            {/* Creator Credit */}
            <div style={{ color: '#9ca3af', fontSize: '0.85rem', fontWeight: '500' }}>
              <p>Built with ❤️ by <span style={{ color: '#60a5fa', fontWeight: '600' }}>Abdul Ahad</span></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}