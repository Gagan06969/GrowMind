import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Youtube, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const SessionTracker = ({ onComplete, onCancel }) => {
  const [url, setUrl] = useState('');
  const [duration, setDuration] = useState(25 * 60); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionType, setSessionType] = useState('youtube');
  const [status, setStatus] = useState('idle');
  const [syncWithVideo, setSyncWithVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [isStudyContent, setIsStudyContent] = useState(true);
  const [showQuote, setShowQuote] = useState(false);
  
  const timerRef = useRef(null);

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
    if (isActive && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && isActive) {
      handleComplete();
    } else {
      clearInterval(timerRef.current);
    }

    // Motivation Quote trigger every 20 minutes (1200 seconds)
    const elapsed = duration - timeLeft;
    if (isActive && !isPaused && elapsed > 0 && elapsed % 1200 === 0) {
      setShowQuote(true);
      setTimeout(() => setShowQuote(false), 8000);
    }

    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused, timeLeft]);

  const fetchVideoMetadata = async (videoUrl) => {
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
          // Attempt to fetch duration via AllOrigins CORS proxy
          const corsRes = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(videoUrl)}`);
          const corsData = await corsRes.json();
          const html = corsData.contents;
          const durationMatch = html.match(/itemprop="duration" content="PT(\d+H)?(\d+M)?(\d+S)?"/);
          
          if (durationMatch) {
            const h = parseInt(durationMatch[1]?.replace('H', '') || 0);
            const m = parseInt(durationMatch[2]?.replace('M', '') || 0);
            const s = parseInt(durationMatch[3]?.replace('S', '') || 0);
            const secs = (h * 3600) + (m * 60) + s;
            if (secs > 0) {
              setDuration(secs);
              setTimeLeft(secs);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    } finally {
      setLoading(false);
    }
  };

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
      duration: duration,
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

  const progress = ((duration - timeLeft) / duration) * 100;

  const quotes = [
    "Focus transforms the ordinary into the extraordinary.",
    "The secret of getting ahead is getting started.",
    "Small steady growth creates a massive forest.",
    "Your future self will thank you for this focus session.",
    "Stay disciplined. The results are worth it."
  ];

  return (
    <div className="session-tracker glass-morphism" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
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
                if (e.target.value.includes('youtube.com') || e.target.value.includes('youtu.be')) {
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
                  if (e.target.checked && (url.includes('youtube') || url.includes('youtu.be'))) {
                    fetchVideoMetadata(url);
                  }
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', position: 'relative' }}>
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

          <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ position: 'absolute', transform: 'rotate(-90deg)' }} width="220" height="220">
              <circle cx="110" cy="110" r="100" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
              <circle 
                cx="110" cy="110" r="100" 
                stroke="var(--primary-green)" strokeWidth="12" 
                fill="transparent" 
                strokeDasharray="628.3"
                strokeDashoffset={628.3 - (628.3 * progress / 100)}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: '800', fontFamily: 'monospace', letterSpacing: '2px' }}>
                {formatTime(timeLeft)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>TIME REMAINING</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="btn" onClick={handlePause} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white', width: '64px', height: '64px', borderRadius: '50%', justifyContent: 'center', padding: 0 }}>
              {isPaused ? <Play size={28} fill="white" /> : <Pause size={28} fill="white" />}
            </button>
            <button className="btn" onClick={handleReset} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white', width: '64px', height: '64px', borderRadius: '50%', justifyContent: 'center', padding: 0 }}>
              <RotateCcw size={28} />
            </button>
          </div>

          <div style={{ 
            padding: '12px 24px', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '20px', 
            fontSize: '13px', 
            color: 'var(--text-muted)',
            border: '1px solid var(--glass-border)'
          }}>
            {url.includes('youtube') ? `📺 Studying: ${videoTitle}` : '🎯 Focused Study Session'}
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
          <button className="btn btn-primary" onClick={onCancel} style={{ padding: '16px 32px' }}>
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default SessionTracker;
