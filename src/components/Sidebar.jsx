import React from 'react';
import { LayoutDashboard, Map, BarChart3, Headphones, Settings, Flame } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';

const Sidebar = ({ activeTab, setActiveTab, streak = 0 }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'map', icon: Map, label: 'Forest Map' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'pdf-reader', icon: Headphones, label: 'PDF Reader' },
  ];

  return (
    <div className="sidebar glass-morphism" style={{
      width: 'var(--sidebar-width)',
      height: '100%',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      borderRight: '1px solid var(--glass-border)',
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0'
    }}>
      <div className="logo" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src={logo} alt="GrowMind" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
        GrowMind
      </div>

      <div className="streak-card glass-morphism" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Flame color="#e67e22" fill="#e67e22" size={24} />
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Daily Streak</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{streak} Days</div>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`btn ${activeTab === item.id ? 'btn-primary' : ''}`}
            style={{
              justifyContent: 'flex-start',
              background: activeTab === item.id ? undefined : 'transparent',
              color: activeTab === item.id ? 'white' : 'var(--text-muted)'
            }}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <button 
        onClick={() => supabase.auth.signOut()}
        className="btn" 
        style={{ background: 'transparent', color: '#e74c3c', justifyContent: 'flex-start' }}
      >
        <Settings size={20} />
        Sign Out
      </button>
    </div>
  );
};

export default Sidebar;
