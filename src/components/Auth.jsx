import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, TreePine } from 'lucide-react';
import logo from '../assets/logo.png';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let error;
    if (isRegister) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    }

    if (error) {
      alert(error.message);
    } else if (isRegister) {
      alert('Registration successful! Please log in.');
      setIsRegister(false);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      width: '100vw',
      background: 'radial-gradient(circle at top right, #1a2a24, #0a0f0d)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: 'absolute',
        width: '400px',
        height: '400px',
        background: 'var(--primary-green)',
        filter: 'blur(150px)',
        opacity: 0.05,
        top: '10%',
        right: '10%',
        borderRadius: '50%'
      }}></div>

      <div className="glass-morphism" style={{ 
        padding: '48px', 
        width: '100%', 
        maxWidth: '440px', 
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '12px', 
            background: 'var(--primary-green)22', 
            borderRadius: '16px',
            marginBottom: '20px'
          }}>
            <img src={logo} alt="GrowMind" style={{ width: '48px', height: '48px' }} />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: 'white', marginBottom: '12px', letterSpacing: '-1px' }}>
            GrowMind
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6' }}>
            Your journey to deep focus starts here. <br/>
            Plant seeds, grow knowledge.
          </p>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginLeft: '4px', marginBottom: '8px', display: 'block' }}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', marginLeft: '4px', marginBottom: '8px', display: 'block' }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  borderRadius: '12px',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '16px', padding: '16px', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            {isRegister ? 'Already using GrowMind?' : 'New here?'}
          </span>
          <button 
            onClick={() => setIsRegister(!isRegister)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary-green)', 
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '0'
            }}
          >
            {isRegister ? 'Sign In' : "Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
