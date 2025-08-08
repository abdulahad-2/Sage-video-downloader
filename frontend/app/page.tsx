'use client';

import { useState } from 'react';

export default function Home() {
  const [videoLink, setVideoLink] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setDownloadUrl(null);
    setError(null);

    try {
      const response = await fetch('https://sage-video-downloader.onrender.com/download', { // TODO: Remove this comment after successful deployment
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
      setDownloadUrl(data.download_url);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background text-text font-poppins">
      <div className="bg-[#1A1A1A] p-8 rounded-lg shadow-lg max-w-lg w-full text-center border border-gray-800">
        <h1 className="text-3xl font-bold mb-4 text-white">Multi-Platform Video Downloader</h1>
        <p className="text-lg mb-6 text-gray-300">Download from YouTube, Instagram, Facebook & TikTok</p>

        <div className="mb-6">
          <input
            type="text"
            className="w-full p-3 rounded-md bg-[#2A2A2A] border border-gray-700 focus:border-primary-blue focus:ring focus:ring-primary-blue focus:ring-opacity-50 transition duration-300 ease-in-out text-white placeholder-gray-500"
            placeholder="Paste video link here (YouTube, Instagram, Facebook, TikTok)"
            value={videoLink}
            onChange={(e) => setVideoLink(e.target.value)}
          />
        </div>

        <button
          onClick={handleDownload}
          disabled={loading || !videoLink}
          className="w-full p-3 rounded-md bg-gradient-to-r from-primary-DEFAULT to-primary-blue text-white font-semibold hover:from-primary-blue hover:to-primary-DEFAULT transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Download"
          )}
        </button>

        {downloadUrl && (
          <div className="mt-6 p-4 bg-[#2A2A2A] rounded-md border border-gray-700 break-words text-left">
            <p className="text-gray-300 mb-2">Download Link:</p>
            <a
              href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
              className="text-primary-blue hover:underline transition-colors duration-300 ease-in-out"
            >
              {downloadUrl}
            </a>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900 text-white rounded-md border border-red-700">
            <p>Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
