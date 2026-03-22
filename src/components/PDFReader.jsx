import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, FileText, Download, Loader2, Info } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// More robust worker setup for Vite
// Fallback to CDN but with a more standard approach if Vite import fails
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const PDFReader = () => {
  const [text, setText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [speech, setSpeech] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [debugInfo, setDebugInfo] = useState({ pages: 0, textLength: 0, status: 'Idle' });
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeech(synth);
      setDebugInfo(prev => ({ ...prev, status: 'Speech API Ready' }));

      const loadVoices = () => {
        const availableVoices = synth.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoice) {
          // Prefer English voices
          const preferred = availableVoices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) || 
                            availableVoices.find(v => v.lang.startsWith('en')) || 
                            availableVoices[0];
          setSelectedVoice(preferred.name);
        }
      };

      loadVoices();
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices;
      }
    } else {
      setDebugInfo(prev => ({ ...prev, status: 'Speech API Not Supported' }));
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setIsExtracting(true);
      setText('');
      setCurrentChunkIndex(0);
      setDebugInfo({ pages: 0, textLength: 0, status: 'Loading PDF...' });
      
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        setDebugInfo(prev => ({ ...prev, pages: pdf.numPages, status: `Extracted ${pdf.numPages} pages` }));
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map(item => item.str)
            .join(' ')
            .replace(/\s+/g, ' '); 
          fullText += pageText + '\n\n';
          setDebugInfo(prev => ({ ...prev, status: `Processing page ${i}/${pdf.numPages}...` }));
        }
        
        const finalText = fullText.trim();
        if (!finalText) {
          setText('No text found in PDF. This might be a scanned document or image-based PDF (OCR required).');
          setDebugInfo(prev => ({ ...prev, textLength: 0, status: 'No text content found' }));
        } else {
          setText(finalText);
          setDebugInfo(prev => ({ ...prev, textLength: finalText.length, status: 'Ready to read' }));
        }
      } catch (error) {
        console.error('Error extracting PDF text:', error);
        setDebugInfo(prev => ({ ...prev, status: `Error: ${error.message}` }));
        setText('Error extracting text from PDF. Please ensure it is a valid PDF and try again.');
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const readChunk = (index, textArray) => {
    if (index >= textArray.length) {
      setIsReading(false);
      setCurrentChunkIndex(0);
      setDebugInfo(prev => ({ ...prev, status: 'Finished reading' }));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textArray[index]);
    if (selectedVoice) {
      const voiceObject = voices.find(v => v.name === selectedVoice);
      if (voiceObject) utterance.voice = voiceObject;
    }

    utterance.onstart = () => {
      setCurrentChunkIndex(index);
      setDebugInfo(prev => ({ ...prev, status: `Reading paragraph ${index + 1} of ${textArray.length}` }));
      
      // Auto-scroll to current paragraph
      const element = document.getElementById(`chunk-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    utterance.onend = () => {
      readChunk(index + 1, textArray);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsReading(false);
      setDebugInfo(prev => ({ ...prev, status: 'Speech error occurred' }));
    };
    speech.speak(utterance);
  };

  const toggleRead = () => {
    if (isReading) {
      speech.cancel();
      setIsReading(false);
      setDebugInfo(prev => ({ ...prev, status: 'Paused' }));
    } else {
      if (!text || text.startsWith('No text found')) return;
      
      const textArray = text.split('\n\n').filter(t => t.trim().length > 2);
      if (textArray.length === 0) return;

      setIsReading(true);
      readChunk(currentChunkIndex, textArray);
    }
  };

  const handleReset = () => {
    setText('');
    speech?.cancel();
    setIsReading(false);
    setCurrentChunkIndex(0);
    setDebugInfo({ pages: 0, textLength: 0, status: 'Idle' });
  };

  const textChunks = text.split('\n\n').filter(t => t.trim().length > 0);

  return (
    <div className="pdf-reader glass-morphism" style={{ padding: '40px', maxWidth: '800px', margin: '40px auto' }}>
      <style>{`
        .active-chunk { background: rgba(46, 204, 113, 0.2); border-left: 4px solid var(--primary-green); padding-left: 12px; border-radius: 4px; }
        .chunk { padding: 4px 0; transition: background 0.3s ease; }
      `}</style>
      
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Volume2 size={48} color="var(--primary-green)" style={{ marginBottom: '16px' }} />
        <h2>Study Audio Assistant</h2>
        <p style={{ color: 'var(--text-muted)' }}>Convert your study PDFs to natural audio and listen while you focus.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          padding: '12px 20px', 
          borderRadius: '10px', 
          fontSize: '13px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          flexWrap: 'wrap',
          border: '1px solid var(--glass-border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={16} color="var(--primary-green)" />
            <span style={{ color: 'var(--text-muted)' }}>Status: </span>
            <span style={{ fontWeight: '600' }}>{debugInfo.status}</span>
          </div>
          
          {voices.length > 0 && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Voice: </span>
              <select 
                value={selectedVoice || ''} 
                onChange={(e) => setSelectedVoice(e.target.value)}
                style={{ background: 'var(--bg-card)', color: 'white', border: '1px solid var(--glass-border)', borderRadius: '4px', fontSize: '12px', padding: '2px 4px' }}
              >
                {voices.map(v => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!text && !isExtracting ? (
          <div style={{ border: '2px dashed var(--glass-border)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <input type="file" accept=".pdf" id="pdf-input" onChange={handleFileUpload} style={{ display: 'none' }} />
            <label htmlFor="pdf-input" className="btn btn-primary" style={{ display: 'inline-flex', cursor: 'pointer' }}>
              <Download size={20} />
              Upload PDF
            </label>
            <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>PDF text will be extracted automatically</p>
          </div>
        ) : isExtracting ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary-green)" style={{ margin: '0 auto 16px' }} />
            <p>{debugInfo.status}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '20px', 
              borderRadius: '12px', 
              maxHeight: '400px', 
              overflowY: 'auto',
              border: '1px solid var(--glass-border)',
              fontSize: '15px',
              lineHeight: '1.8',
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap'
            }}>
              {textChunks.map((chunk, idx) => (
                <div 
                  key={idx} 
                  id={`chunk-${idx}`}
                  className={`chunk ${idx === currentChunkIndex && isReading ? 'active-chunk' : ''}`}
                  style={{ marginBottom: '16px' }}
                >
                  {chunk}
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button className="btn btn-primary" onClick={toggleRead} disabled={!text || text.startsWith('No text found')}>
                {isReading ? <Pause size={20} /> : <Play size={20} />}
                {isReading ? 'Pause Audio' : (currentChunkIndex > 0 ? 'Resume Audio' : 'Start Audio')}
              </button>
              <button className="btn" onClick={handleReset} style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}>
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
