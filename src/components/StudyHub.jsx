import React, { useState, useEffect, useRef } from 'react';
import { Link2, X, ExternalLink, Youtube, Clock, CheckCircle } from 'lucide-react';

const StudyHub = ({ onComplete }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [error, setError] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [videoTitle, setVideoTitle] = useState('Study Session');
  
  const timerRef = useRef(null);
  const [isSaved, setIsSaved] = useState(false);
  
  const elapsedTimeRef = useRef(0);
  const isActiveRef = useRef(false);
  const isSavedRef = useRef(false);
  const videoTitleRef = useRef('');
  const videoIdRef = useRef('');

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime;
    isActiveRef.current = !!videoId;
    isSavedRef.current = isSaved;
    videoTitleRef.current = videoTitle;
    videoIdRef.current = videoId;
  }, [elapsedTime, videoId, isSaved, videoTitle]);

  useEffect(() => {
    const handleAutoSave = () => {
      if (isActiveRef.current && !isSavedRef.current && elapsedTimeRef.current > 30) {
        onComplete({
          duration: elapsedTimeRef.current,
          type: 'youtube',
          title: videoTitleRef.current || `Study Session (${videoIdRef.current})`
        });
      }
    };

    window.addEventListener('beforeunload', handleAutoSave);
    return () => {
      window.removeEventListener('beforeunload', handleAutoSave);
      handleAutoSave(); 
    };
  }, []);
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('studyhub_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (videoId) {
      setSessionStartedAt(new Date());
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [videoId]);

  const extractVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const fetchVideoMetadata = async (id) => {
    try {
      const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${id}`);
      const data = await response.json();
      if (data.title) setVideoTitle(data.title);
    } catch (e) {
      console.error('Failed to fetch video title', e);
    }
  };

  const handleUrlSubmit = (e) => {
    if (e) e.preventDefault();
    const id = extractVideoId(videoUrl);
    if (id) {
      setVideoId(id);
      setError('');
      fetchVideoMetadata(id);
      
      // Update history
      const newHistory = [id, ...history.filter(h => h !== id)].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem('studyhub_history', JSON.stringify(newHistory));
    } else if (videoUrl) {
      setError('Invalid YouTube URL. Please check the link and try again.');
      setVideoId(null);
    }
  };

  const handleComplete = () => {
    if (onComplete && elapsedTime > 0) {
      setIsSaved(true);
      onComplete({
        duration: elapsedTime,
        type: 'youtube',
        title: videoTitle || `Study Session (${videoId})`
      });
    }
    clearVideo();
  };

  const loadFromHistory = (id) => {
    setVideoId(id);
    setVideoUrl(`https://www.youtube.com/watch?v=${id}`);
    setError('');
    fetchVideoMetadata(id);
  };

  const clearVideo = () => {
    setVideoId(null);
    setVideoUrl('');
    setError('');
    setElapsedTime(0);
    setVideoTitle('Study Session');
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="study-hub-container" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            <Youtube color="#ff0000" size={32} />
            Study Hub
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Enhance your focus with integrated video lectures and tutorials.</p>
        </div>
        {videoId && (
            <div className="glass-morphism" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '12px' }}>
                <Clock size={18} color="var(--primary-green)" />
                <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'monospace', color: 'var(--primary-green)' }}>{formatTime(elapsedTime)}</span>
            </div>
        )}
      </header>

      {!videoId ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          <div className="glass-morphism" style={{ padding: '60px 40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', flex: 1, justifyContent: 'center' }}>
            <div style={{ 
              padding: '24px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              borderRadius: '24px', 
              marginBottom: '10px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <Link2 size={64} color="var(--primary-green)" />
            </div>
            
            <div style={{ maxWidth: '600px', width: '100%' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Ready to start learning?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Paste any YouTube link below to transform it into a distraction-free study experience.</p>
              
              <form onSubmit={handleUrlSubmit} style={{ 
                display: 'flex', 
                gap: '12px',
                background: 'rgba(0, 0, 0, 0.2)',
                padding: '8px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
              }}>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: 'transparent',
                    color: 'white',
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ 
                    padding: '0 28px',
                    borderRadius: '12px',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(46, 204, 113, 0.3)'
                  }}
                >
                  Start Session
                </button>
              </form>
              {error && <p style={{ color: '#ff4757', fontSize: '14px', marginTop: '16px', fontWeight: '500' }}>{error}</p>}
            </div>
          </div>

          {history.length > 0 && (
            <div className="glass-morphism" style={{ padding: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                Recent Study Sessions
              </h4>
              <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                {history.map((id) => (
                  <div 
                    key={id} 
                    onClick={() => loadFromHistory(id)}
                    className="history-card"
                    style={{ 
                      flex: '0 0 180px', 
                      cursor: 'pointer',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img 
                      src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} 
                      alt="Thumbnail"
                      style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }}
                    />
                    <div style={{ padding: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      Video ID: {id}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="video-player-wrapper glass-morphism" style={{ flex: 1, position: 'relative', overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px 16px', borderRadius: '12px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Youtube color="#ff0000" size={24} />
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: 'white', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {videoTitle}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--primary-green)', fontWeight: '600' }}>Focusing for {formatTime(elapsedTime)}</div>
                </div>
             </div>
             <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={handleComplete} style={{ height: '42px', padding: '0 20px', fontSize: '14px' }}>
                   <CheckCircle size={18} />
                   Complete Session
                </button>
                <button className="btn-icon" onClick={() => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')} title="Open in YouTube">
                  <ExternalLink size={20} />
                </button>
                <button className="btn-icon" onClick={clearVideo} title="Back to Hub" style={{ color: '#ff4757' }}>
                  <X size={20} />
                </button>
             </div>
          </div>
          <div style={{ 
            position: 'relative', 
            width: '100%', 
            flex: 1,
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'black',
            boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <iframe
              key={videoId}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: '0'
              }}
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      <style>{`
        .btn-icon {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted);
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.12);
          color: white;
          transform: translateY(-2px);
        }
        .history-card:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          transform: translateY(-4px);
          border-color: var(--primary-green) !important;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }
        .history-card img {
          transition: transform 0.3s ease;
        }
        .history-card:hover img {
          transform: scale(1.05);
        }
        ::-webkit-scrollbar {
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.02);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default StudyHub;
