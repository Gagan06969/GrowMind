import React, { useState, useEffect } from 'react';
import { Volume2, Play, Pause, FileText, Download, Loader2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const PDFReader = () => {
  const [text, setText] = useState('');
  const [isReading, setIsReading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [speech, setSpeech] = useState(null);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      setSpeech(synth);
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
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        setText(fullText.trim() || 'No text found in PDF.');
      } catch (error) {
        console.error('Error extracting PDF text:', error);
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
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textArray[index]);
    utterance.onend = () => {
      setCurrentChunkIndex(index + 1);
      readChunk(index + 1, textArray);
    };
    utterance.onerror = () => {
      setIsReading(false);
    };
    speech.speak(utterance);
  };

  const toggleRead = () => {
    if (isReading) {
      speech.cancel();
      setIsReading(false);
    } else {
      if (!text) return;
      
      // Split by double newline (paragraphs) for smoother reading and better API handling
      const textArray = text.split('\n\n').filter(t => t.trim().length > 0);
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
  };

  return (
    <div className="pdf-reader glass-morphism" style={{ padding: '40px', maxWidth: '800px', margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Volume2 size={48} color="var(--primary-green)" style={{ marginBottom: '16px' }} />
        <h2>Study Audio Assistant</h2>
        <p style={{ color: 'var(--text-muted)' }}>Convert your study PDFs to natural audio and listen while you focus.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <p>Extracting text from your book...</p>
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
              lineHeight: '1.6',
              color: 'var(--text-light)',
              whiteSpace: 'pre-wrap'
            }}>
              {text}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <button className="btn btn-primary" onClick={toggleRead} disabled={!text}>
                {isReading ? <Pause size={20} /> : <Play size={20} />}
                {isReading ? 'Stop Reading' : 'Start Audio'}
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
