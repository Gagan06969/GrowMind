import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, FileText, Download } from 'lucide-react';

const PDFReader = () => {
  const [text, setText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [speech, setSpeech] = useState(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeech(synth);
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For a real app, use pdfjs-dist. Here we simulate text extraction for MVP.
      setText(`This is a processed version of ${file.name}. 
Learning with audio helps retain information 40% better.
Focus on the core concepts while your mind visualizes the forest grow.`);
    }
  };

  const toggleRead = () => {
    if (isReading) {
      speech.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsReading(false);
      speech.speak(utterance);
      setIsReading(true);
    }
  };

  return (
    <div className="pdf-reader glass-morphism" style={{ padding: '40px', maxWidth: '800px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Volume2 size={48} color="var(--primary-green)" style={{ marginBottom: '16px' }} />
        <h2>Study Audio Assistant</h2>
        <p style={{ color: 'var(--text-muted)' }}>Convert your study PDFs to natural audio and listen while you focus.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {!text ? (
          <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <input type="file" accept=".pdf" id="pdf-input" onChange={handleFileUpload} style={{ display: 'none' }} />
            <label htmlFor="pdf-input" className="btn btn-primary" style={{ display: 'inline-flex', cursor: 'pointer' }}>
              <Download size={20} />
              Upload PDF
            </label>
            <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>PDF text will be extracted automatically</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '20px', 
              borderRadius: '12px', 
              maxHeight: '200px', 
              overflowY: 'auto',
              border: '1px solid var(--glass-border)',
              fontSize: '14px',
              fontStyle: 'italic',
              color: 'var(--text-muted)'
            }}>
              {text}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button className="btn btn-primary" onClick={toggleRead}>
                {isReading ? <Pause size={20} /> : <Play size={20} />}
                {isReading ? 'Stop Reading' : 'Start Audio'}
              </button>
              <button className="btn" onClick={() => setText('')} style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFReader;
