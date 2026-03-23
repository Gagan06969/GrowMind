import React from 'react';
import { LayoutDashboard, Map, BarChart3, Headphones, Settings, Flame, Video } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';

const Sidebar = ({ activeTab, setActiveTab, streak = 0 }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'map', icon: Map, label: 'Forest Map' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'pdf-reader', icon: Headphones, label: 'PDF Reader' },
    { id: 'study-hub', icon: Video, label: 'Study Hub' },
  ];

  return (
    <div className="sidebar glass-morphism">
      <div className="logo sidebar-logo" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logo} alt="GrowMind" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
        <span className="logo-text">GrowMind</span>
      </div>

      <div className="streak-card sidebar-streak glass-morphism" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Flame color="#e67e22" fill="#e67e22" size={24} />
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Daily Streak</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{streak} Days</div>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`btn nav-item ${activeTab === item.id ? 'btn-primary' : ''}`}
            style={{
              justifyContent: 'flex-start',
              background: activeTab === item.id ? undefined : 'transparent',
              color: activeTab === item.id ? 'white' : 'var(--text-muted)'
            }}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button 
        onClick={() => supabase.auth.signOut()}
        className="btn logout-btn" 
        style={{ background: 'transparent', color: '#e74c3c', justifyContent: 'flex-start' }}
      >
        <Settings size={20} />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default Sidebar;
