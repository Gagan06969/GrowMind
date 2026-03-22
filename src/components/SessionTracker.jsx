import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Youtube, CheckCircle, AlertCircle } from 'lucide-react';

const SessionTracker = ({ onComplete, onCancel }) => {
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState(25 * 60); // Default 25 mins
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState('youtube'); // 'youtube' or 'manual'
  const [status, setStatus] = useState('idle'); // 'idle', 'running', 'completed'
  
  const timerRef = useRef(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive && !isPaused) {
        setIsPaused(true);
        console.log('Focus lost! Timer paused.');
        // Notify user via console or a small UI alert could be added here
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, isPaused]);

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    } else {
      clearInterval(timerRef.current);
    }

    // Trigger quote every 20 minutes (1200 seconds)
    if (isActive && !isPaused && (duration - timeLeft) > 0 && (duration - timeLeft) % 1200 === 0) {
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 5000);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused, timeLeft]);

  const [videoTitle, setVideoTitle] = useState('');
  const [isStudyContent, setIsStudyContent] = useState(true);
  const [showQuote, setShowQuote] = useState(false);

  const quotes = [
    "Focus transforms the ordinary into the extraordinary.",
    "The secret of getting ahead is getting started.",
    "Your future self will thank you for this focus session.",
    "Don't stop when you're tired, stop when you're done.",
    "Small steady growth creates a massive forest."
  ];

  const fetchVideoMetadata = async (videoUrl) => {
    try {
      const response = await fetch(`https://noembed.com/embed?url=${videoUrl}`);
      const data = await response.json();
      if (data.title) {
        setVideoTitle(data.title);
        
        // Anti-Cheat: Simple keyword check
        const nonStudyKeywords = ['song', 'music video', 'official trailer', 'movie', 'full episode', 'live stream'];
        const isCheat = nonStudyKeywords.some(kw => data.title.toLowerCase().includes(kw));
        setIsStudyContent(!isCheat);
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
  };

  useEffect(() => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      fetchVideoMetadata(url);
    } else {
      setVideoTitle('');
    }
  }, [url]);

  const handleStart = () => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      setSessionType('youtube');
      setStatus('running');
      setIsActive(true);
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
    setTimeLeft(duration);
    setStatus('idle');
  };

  const handleComplete = () => {
    clearInterval(timerRef.current);
    setIsActive(false);
    setStatus('completed');
    onComplete({
      duration: duration - timeLeft,
      type: sessionType,
      title: videoTitle || url || 'Study Session'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="session-tracker glass-morphism" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      {status === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', color: 'var(--primary-green)' }}>
            <Youtube size={32} />
            <h2 style={{ margin: 0 }}>Start Learning</h2>
          </div>
          
          <input 
            type="text" 
            placeholder="Paste YouTube Link or Session Title" 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              fontSize: '16px'
            }}
          />

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

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[15, 25, 45, 60].map(m => (
              <button 
                key={m} 
                onClick={() => { setDuration(m * 60); setTimeLeft(m * 60); }}
                className="btn"
                style={{ 
                  background: duration === m * 60 ? 'var(--primary-green)' : 'rgba(255,255,255,0.05)',
                  color: duration === m * 60 ? 'white' : 'var(--text-muted)',
                  fontSize: '14px'
                }}
              >
                {m}m
              </button>
            ))}
            {url.includes('youtube') && (
              <button 
                className="btn"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '14px' }}
                onClick={() => alert('Feature: In a production app with YouTube API, this would auto-sync duration.')}
              >
                Sync with Video
              </button>
            )}
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', fontSize: '18px', opacity: isStudyContent ? 1 : 0.5 }} 
            onClick={handleStart}
            disabled={!isStudyContent}
          >
            <Play fill="white" size={24} />
            {isStudyContent ? 'Begin Focus Session' : 'Locked (Study Only)'}
          </button>
        </div>
      )}

      {status === 'running' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', position: 'relative' }}>
          {showQuote && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                position: 'absolute',
                top: '-60px',
                padding: '16px 24px',
                background: 'var(--primary-green)',
                color: 'white',
                borderRadius: '12px',
                fontWeight: '600',
                boxShadow: '0 4px 20px rgba(46, 204, 113, 0.4)',
                zIndex: 100
              }}
            >
              {quotes[Math.floor(Math.random() * quotes.length)]}
            </motion.div>
          )}
          <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', transform: 'rotate(-90deg)' }} width="200" height="200">
              <circle cx="100" cy="100" r="90" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="transparent" />
              <circle 
                cx="100" cy="100" r="90" 
                stroke="var(--primary-green)" strokeWidth="10" 
                fill="transparent" 
                strokeDasharray="565.48"
                strokeDashoffset={565.48 - (565.48 * progress / 100)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{ fontSize: '48px', fontWeight: '700', fontFamily: 'monospace' }}>
              {formatTime(timeLeft)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="btn" onClick={handlePause} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', width: '60px', height: '60px', borderRadius: '50%', justifyContent: 'center', padding: 0 }}>
              {isPaused ? <Play size={24} fill="white" /> : <Pause size={24} fill="white" />}
            </button>
            <button className="btn" onClick={handleReset} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', width: '60px', height: '60px', borderRadius: '50%', justifyContent: 'center', padding: 0 }}>
              <RotateCcw size={24} />
            </button>
          </div>

          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {url.includes('youtube') ? 'Watching Video...' : 'Focusing on Study...'}
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <CheckCircle size={64} color="var(--primary-green)" />
          <h2>Session Completed!</h2>
          <p>You've earned a new tree for your forest.</p>
          <button className="btn btn-primary" onClick={onCancel}>
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionTracker;
