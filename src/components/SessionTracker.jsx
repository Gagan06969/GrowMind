import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Youtube, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SessionTracker = ({ onComplete, onCancel }) => {
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState('manual');
  const [status, setStatus] = useState('idle');
  const [syncWithVideo, setSyncWithVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [isStudyContent, setIsStudyContent] = useState(true);
  const [showQuote, setShowQuote] = useState(false);
  
  const timerRef = useRef(null);

  const extractVideoId = (vUrl) => {
    if (!vUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = vUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive && !isPaused) {
        setIsPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, isPaused]);

  useEffect(() => {
    if (isActive && !isPaused) {
      if (syncWithVideo) {
        // For video sync, we count UP (focus time)
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => prev + 1);
        }, 1000);
      } else if (timeLeft > 0) {
        // For manual, we count DOWN
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else {
        handleComplete();
      }
    } else {
      clearInterval(timerRef.current);
    }

    // Motivation Quote trigger every 20 minutes (1200 seconds)
    const elapsed = syncWithVideo ? timeLeft : (duration - timeLeft);
    if (isActive && !isPaused && elapsed > 0 && elapsed % 1200 === 0) {
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 8000);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused, timeLeft, syncWithVideo]);

  const fetchVideoMetadata = async (videoUrl) => {
    const vId = extractVideoId(videoUrl);
    if (!vId) return;
    setVideoId(vId);

    try {
      setLoading(true);
      const response = await fetch(`https://noembed.com/embed?url=${videoUrl}`);
      const data = await response.json();
      
      if (data.title) {
        setVideoTitle(data.title);
        const nonStudyKeywords = ['song', 'music video', 'official trailer', 'movie', 'full episode', 'live stream'];
        const isCheat = nonStudyKeywords.some(kw => data.title.toLowerCase().includes(kw));
        setIsStudyContent(!isCheat);

        if (syncWithVideo) {
          // Reset timer for count-up focus
          setDuration(0);
          setTimeLeft(0);
        }
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    const vId = extractVideoId(url);
    if (vId) {
      setSessionType('youtube');
      setVideoId(vId);
      setStatus('running');
      setIsActive(true);
      if (syncWithVideo) {
        setTimeLeft(0); 
      }
    } else if (url.trim()) {
      setSessionType('manual');
      setVideoTitle(url);
      setStatus('running');
      setIsActive(true);
    } else {
      alert('Please enter a YouTube link or session title');
    }
  };

  const handlePause = () => setIsPaused(!isPaused);
  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(syncWithVideo ? 0 : duration);
    setStatus('idle');
  };

  const handleComplete = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setStatus('completed');
    onComplete({
      duration: syncWithVideo ? timeLeft : (duration - timeLeft),
      type: sessionType,
      title: videoTitle || url || 'Study Session'
    });
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = syncWithVideo ? 100 : ((duration - timeLeft) / duration) * 100;

  const quotes = [
    "Focus transforms the ordinary into the extraordinary.",
    "The secret of getting ahead is getting started.",
    "Small steady growth creates a massive forest.",
    "Your future self will thank you for this focus session.",
    "Stay disciplined. The results are worth it."
  ];

  return (
    <div className="session-tracker glass-morphism" style={{ padding: '40px', maxWidth: status === 'running' && videoId ? '900px' : '600px', margin: '0 auto', textAlign: 'center', transition: 'max-width 0.5s ease' }}>
      {status === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', color: 'var(--primary-green)' }}>
            <Youtube size={32} />
            <h2 style={{ margin: 0 }}>Start Learning</h2>
          </div>
          
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Paste YouTube Link or Session Title" 
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                const vid = extractVideoId(e.target.value);
                if (vid) {
                  fetchVideoMetadata(e.target.value);
                }
              }}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                background: 'rgba(0,0,0,0.2)',
                color: 'white',
                fontSize: '16px'
              }}
            />
            {loading && <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-green)', fontSize: '12px' }}>Fetching...</div>}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="number" 
                placeholder="Mins" 
                value={duration / 60} 
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setDuration(val * 60);
                  setTimeLeft(val * 60);
                }}
                disabled={syncWithVideo}
                style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '10px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
              />
            </div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '14px', whiteSpace: 'nowrap' }}>
              <input 
                type="checkbox" 
                checked={syncWithVideo}
                onChange={(e) => {
                  setSyncWithVideo(e.target.checked);
                  if (e.target.checked) setTimeLeft(0);
                  else setTimeLeft(duration);
                }}
                style={{ accentColor: 'var(--primary-green)' }}
              />
              Sync with Video
            </label>
          </div>

          {videoTitle && (
            <div style={{ 
              padding: '12px', 
              background: isStudyContent ? 'var(--primary-green)11' : '#e74c3c22', 
              borderRadius: '8px', 
              fontSize: '14px', 
              color: isStudyContent ? 'var(--primary-green)' : '#e74c3c',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}>
              {isStudyContent ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {isStudyContent ? `Found: ${videoTitle}` : `Warning: This looks like non-study content.`}
            </div>
          )}

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', fontSize: '18px', opacity: isStudyContent ? 1 : 0.5 }} 
            onClick={handleStart}
            disabled={!isStudyContent || loading}
          >
            <Play fill="white" size={24} />
            {isStudyContent ? 'Begin Focus Session' : 'Locked (Study Only)'}
          </button>
        </div>
      )}

      {status === 'running' && (
        <div style={{ display: 'flex', flexDirection: videoId ? 'row' : 'column', alignItems: 'center', gap: '32px', position: 'relative', flexWrap: 'wrap', justifyContent: 'center' }}>
          {showQuote && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              style={{
                position: 'absolute',
                top: '-80px',
                padding: '20px 30px',
                background: 'linear-gradient(135deg, var(--primary-green), #27ae60)',
                color: 'white',
                borderRadius: '16px',
                fontWeight: '700',
                boxShadow: '0 10px 40px rgba(46, 204, 113, 0.5)',
                zIndex: 100,
                width: '100%',
                maxWidth: '400px'
              }}
            >
              <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase' }}>Focus Boost</div>
              {quotes[Math.floor(Math.random() * quotes.length)]}
            </motion.div>
          )}

          {videoId && (
            <div style={{ flex: '1 1 500px', minHeight: '350px', borderRadius: '16px', overflow: 'hidden', background: 'black', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
               <iframe
                style={{ width: '100%', height: '100%', border: '0' }}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', flex: '0 0 250px' }}>
            <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ position: 'absolute', transform: 'rotate(-90deg)' }} width="200" height="200">
                <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.05)" strokeWidth="10" fill="transparent" />
                <circle 
                    cx="100" cy="100" r="90" 
                    stroke="var(--primary-green)" strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray="565.5"
                    strokeDashoffset={syncWithVideo ? 0 : (565.5 - (565.5 * progress / 100))}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
                </svg>
                <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '1px' }}>
                    {formatTime(timeLeft)}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{syncWithVideo ? 'FOCUS TIME' : 'TIME REMAINING'}</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
                <button className="btn" onClick={handlePause} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white', width: '56px', height: '56px', borderRadius: '50%', justifyContent: 'center', padding: 0 }}>
                {isPaused ? <Play size={24} fill="white" /> : <Pause size={24} fill="white" />}
                </button>
                <button className="btn" onClick={handleComplete} style={{ background: 'var(--primary-green)', color: 'white', width: '56px', height: '56px', borderRadius: '50%', justifyContent: 'center', padding: 0, boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)' }}>
                   <CheckCircle size={24} />
                </button>
                <button className="btn" onClick={handleReset} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white', width: '56px', height: '56px', borderRadius: '50%', justifyContent: 'center', padding: 0 }}>
                <RotateCcw size={24} />
                </button>
            </div>

            <div style={{ 
                padding: '12px 20px', 
                background: 'rgba(255,255,255,0.03)', 
                borderRadius: '16px', 
                fontSize: '12px', 
                color: 'var(--text-muted)',
                border: '1px solid var(--glass-border)',
                maxWidth: '220px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
            }}>
                {videoId ? `📺 ${videoTitle}` : '🎯 Focused Study'}
            </div>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            background: 'var(--primary-green)22', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <CheckCircle size={60} color="var(--primary-green)" />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800' }}>Excellence!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
            You've completed your focus session and grown a tree.
          </p>
          <button className="btn btn-primary" onClick={() => { handleReset(); onCancel(); }} style={{ padding: '16px 32px' }}>
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionTracker;
