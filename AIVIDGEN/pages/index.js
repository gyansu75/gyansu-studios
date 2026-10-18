import { useState } from 'react';
import Head from 'next/head';

export default function GyansuStudio() {
  const [prompt, setPrompt] = useState('');
  const [cameraMotion, setCameraMotion] = useState('Pan Right');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);

  // Replace this with your active Localtunnel / Backend URL from Google Colab
  const API_URL = "https://many-beers-kneel.loca.lt"; 

  const handleGenerate = async () => {
    setLoading(true);
    setVideoUrl(null);
    
    // Combine Prompt with Camera Motion preset
    const finalPrompt = `${prompt}, camera motion: ${cameraMotion}, 4k resolution, cinematic lighting, hyper-realistic, high detail`;

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: finalPrompt })
      });
      
      const data = await res.json();
      if (data.job_id) {
        pollStatus(data.job_id);
      } else {
        alert("Server returned an invalid response.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to connect to Gyansu Studio rendering engine.");
      setLoading(false);
    }
  };

  const pollStatus = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/status/${jobId}`);
        const data = await res.json();
        if (data.status === 'completed') {
          setVideoUrl(data.url);
          setLoading(false);
          clearInterval(interval);
        } else if (data.status === 'failed') {
          alert('Generation failed on backend pipeline.');
          setLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 4000);
  };

  return (
    <>
      <Head>
        <title>Gyansu Studio | Next-Gen AI Video Engine</title>
        <meta name="description" content="Commercial AI Video Generation Platform with Precision Motion Controls" />
      </Head>

      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10 font-sans selection:bg-indigo-500 selection:text-white">
        {/* Header */}
        <header className="max-w-6xl mx-auto flex justify-between items-center pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
              G
            </div>
            <h1 className="text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              GYANSU<span className="text-indigo-400 font-semibold">STUDIO</span>
            </h1>
          </div>
          <span className="text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
            AI Engine v1.0
          </span>
        </header>

        {/* Main Workspace */}
        <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Controls Panel */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-sm space-y-5 shadow-xl">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">Motion Control Studio</h2>
              <p className="text-xs text-slate-400 mt-0.5">Describe your prompt and choose camera movement.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">Scene Prompt</label>
              <textarea 
                rows="4" 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition"
                placeholder="A high-speed luxury sports car zooming through a rainy neon cyberpunk city..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">Camera Motion Control</label>
              <select 
                value={cameraMotion}
                onChange={(e) => setCameraMotion(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option>Pan Right</option>
                <option>Pan Left</option>
                <option>Dolly Zoom (Vertigo Effect)</option>
                <option>Orbit 360</option>
                <option>Dynamic FPV Shake</option>
                <option>Slow Motion Crane Up</option>
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold py-3.5 rounded-xl transition shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Rendering in Gyansu Engine...</span>
                </>
              ) : (
                <span>Generate Video Clips</span>
              )}
            </button>
          </div>

          {/* Video Preview Canvas */}
          <div className="lg:col-span-7 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center min-h-[420px] overflow-hidden relative shadow-xl">
            {loading && (
              <div className="text-center space-y-3 p-6">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-300 text-sm font-medium">Gyansu Engine is synthesizing frames...</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Executing camera path presets on open-source diffusion pipeline.</p>
              </div>
            )}

            {!loading && videoUrl && (
              <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover rounded-2xl" />
            )}

            {!loading && !videoUrl && (
              <div className="text-center space-y-2 p-6">
                <div className="w-12 h-12 bg-slate-800/60 rounded-full flex items-center justify-center mx-auto text-slate-500 text-xl font-mono">
                  ▶
                </div>
                <p className="text-slate-400 text-sm font-medium">No clip generated yet</p>
                <p className="text-xs text-slate-600 max-w-xs">Enter a prompt on the left to render your cinematic video.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}