import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ForestView from './components/ForestView'
import SessionTracker from './components/SessionTracker'
import PDFReader from './components/PDFReader'
import ForestMap from './components/ForestMap'
import Analytics from './components/Analytics'
import StudyHub from './components/StudyHub'
import './App.css'
import { Plus, Clock, TreePine, Flame, Menu, X } from 'lucide-react'

import { supabase } from './supabaseClient'
import Auth from './components/Auth'

function App() {
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [trees, setTrees] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBiome, setActiveBiome] = useState('forest')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchUserData()
    } else {
      setLoading(false)
    }
  }, [session])

  const fetchUserData = async () => {
    setLoading(true)
    const { data: treesData } = await supabase
      .from('trees')
      .select('*')
      .eq('user_id', session.user.id)
    
    const { data: sessionsData } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (treesData) setTrees(treesData)
    if (sessionsData) setSessions(sessionsData)
    setLoading(false)
  }

  const categorizeSession = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('mosfet') || lowerTitle.includes('electronics') || lowerTitle.includes('circuit') || lowerTitle.includes('semiconductor')) return 'Electronics';
    if (lowerTitle.includes('dsa') || lowerTitle.includes('algorithm') || lowerTitle.includes('data structure')) return 'DSA';
    if (lowerTitle.includes('aptitude') || lowerTitle.includes('math') || lowerTitle.includes('reasoning') || lowerTitle.includes('quant')) return 'Aptitude';
    if (lowerTitle.includes('os') || lowerTitle.includes('dbms') || lowerTitle.includes('networking') || lowerTitle.includes('core')) return 'Core Subjects';
    if (lowerTitle.includes('react') || lowerTitle.includes('vite') || lowerTitle.includes('js') || lowerTitle.includes('coding') || lowerTitle.includes('project')) return 'Projects';
    return 'Misc';
  }

  const handleSessionComplete = async (sessionData) => {
    const category = categorizeSession(sessionData.title);
    const durationMins = sessionData.duration / 60;
    
    // Determine growth stage based on focus time
    let stage = 1; // Sprout
    if (durationMins >= 300) stage = 4;      // 5+ hrs: Complete Tree
    else if (durationMins >= 180) stage = 3;  // 3-5 hrs: Small Tree
    else if (durationMins >= 60) stage = 2;   // 1-3 hrs: Sapling
    else stage = 1;                           // <1 hr: Sprout

    const newSession = {
      ...sessionData,
      user_id: session.user.id,
      category,
      date: new Date().toLocaleDateString()
    }
    
    const { error: sError } = await supabase.from('sessions').insert([newSession])
    if (!sError) setSessions(prev => [newSession, ...prev])
    
    // Add a new tree with calculated stage
    const occupiedPositions = trees.map(t => t.position)
    let randomPos
    do {
      randomPos = Math.floor(Math.random() * 250)
    } while (occupiedPositions.includes(randomPos))

    const newTree = {
      user_id: session.user.id,
      position: randomPos,
      stage: stage,
      title: `${newSession.title} (${category})`,
      category,
      date: newSession.date
    }
    
    const { error: tError } = await supabase.from('trees').insert([newTree])
    if (!tError) setTrees(prev => [...prev, newTree])
    
    setActiveTab('dashboard')
  }

  if (!session) return <Auth />
  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-green)' }}>Growing your forest...</div>

  const calculateStreak = (sessionData) => {
    if (!sessionData || sessionData.length === 0) return 0;
    
    // Sort unique dates in descending order
    const dates = [...new Set(sessionData.map(s => s.date))].sort((a, b) => new Date(b) - new Date(a));
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let streak = 0;
    let currentDate = new Date(dates[0]);

    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i]);
      const diff = Math.floor((currentDate - d) / (1000 * 60 * 60 * 24));
      
      if (diff <= 1) {
        streak++;
        currentDate = d;
      } else {
        break;
      }
    }
    return streak;
  }

  const currentStreak = calculateStreak(sessions);
  const totalHours = sessions.reduce((acc, s) => acc + (s.duration / 3600), 0).toFixed(1)

  const stats = [
    { label: 'Total Hours', value: `${totalHours}h`, icon: Clock, color: '#3498db' },
    { label: 'Trees Grown', value: trees.length, icon: TreePine, color: '#2ecc71' },
    { label: 'Current Streak', value: currentStreak, icon: Flame, color: '#e67e22' },
  ]

  return (
    <div className={`app-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} streak={currentStreak} isOpen={isSidebarOpen} />
      
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="btn menu-toggle" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              style={{ background: 'var(--bg-card)', padding: '10px' }}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>Welcome back, {session?.user?.email?.split('@')[0] || 'GrowMind User'}</h1>
              <p style={{ color: 'var(--text-muted)' }}>World Power: {trees.length + (currentStreak * 3)} — You've unlocked {Math.floor((trees.length + currentStreak * 3) / 30)} focus biomes.</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setActiveTab('session')}>
            <Plus size={20} />
            Start Session
          </button>
        </header>

        <section className="stats-row" style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-morphism stat-card" style={{ flex: '1 1 200px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', background: `${stat.color}22`, borderRadius: '12px' }}>
                <stat.icon size={24} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{stat.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </section>

        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            <ForestView trees={trees} biome={activeBiome} />
            <div className="card glass-morphism" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Recent Growth</h3>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trees.slice(-5).reverse().map(tree => (
                  <div key={tree.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <TreePine size={16} color="var(--primary-green)" />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tree.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{tree.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn" style={{ background: 'transparent', color: 'var(--primary-green)', padding: '0', fontSize: '14px' }}>
                View Full History
              </button>
            </div>
          </div>
        )}

        {activeTab === 'session' && (
          <SessionTracker 
            onComplete={handleSessionComplete} 
            onCancel={() => setActiveTab('dashboard')} 
          />
        )}

        {activeTab === 'pdf-reader' && <PDFReader />}

        {activeTab === 'map' && <ForestMap trees={trees} onSelectBiome={setActiveBiome} activeBiome={activeBiome} />}

        {activeTab === 'analytics' && <Analytics trees={trees} sessions={sessions} />}

        {activeTab === 'study-hub' && <StudyHub onComplete={handleSessionComplete} />}
      </main>
    </div>
  )
}

export default App
