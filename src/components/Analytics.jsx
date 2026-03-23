import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

const Analytics = ({ trees = [], sessions = [], streak = 0 }) => {
  // 1. Process Weekly Data
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const weeklyData = last7Days.map(dateStr => {
    const dailySessions = sessions.filter(s => s.date === dateStr);
    const totalHours = dailySessions.reduce((acc, s) => acc + (s.duration / 3600), 0);
    const dayName = days[new Date(dateStr).getUTCDay()];
    return { day: dayName, hours: parseFloat(totalHours.toFixed(1)), date: dateStr };
  });

  // 2. Process Category Data (Radar)
  const actualCategories = [...new Set(sessions.map(s => s.category))].filter(Boolean);
  const defaultCategories = ['DSA', 'Aptitude', 'Electronics', 'Projects', 'Core Subjects'];
  const categories = actualCategories.length > 0 ? actualCategories : defaultCategories;
  
  const categoryData = categories.map(cat => {
    const catSessions = sessions.filter(s => s.category === cat);
    const totalHours = catSessions.reduce((acc, s) => acc + (s.duration / 3600), 0);
    const mastery = Math.min(100, (totalHours / 5) * 100);
    return { subject: cat, value: parseFloat(mastery.toFixed(0)), fullMark: 100 };
  });

  // 3. Consistency Score
  const consistentDays = weeklyData.filter(d => d.hours > 0).length;
  const consistencyScore = Math.floor((consistentDays / 7) * 100);

  // 4. Peak Focus Time
  const peakTime = sessions.length > 0 ? "Morning (6 AM - 10 AM)" : "No sessions yet";

  // 5. Next Reward Goal (World Power based)
  const worldPower = trees.length + (streak * 3);
  const milestones = [30, 80, 150, 300, 500];
  const nextMilestone = milestones.find(m => m > worldPower) || 300;
  const powerNeeded = Math.max(0, nextMilestone - worldPower);

  return (
    <div className="analytics-container" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Weekly Trend */}
        <div className="card glass-morphism" style={{ padding: '24px', minHeight: '350px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Weekly Learning Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary-green)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary-green)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--primary-green)' }}
              />
              <Area type="monotone" dataKey="hours" stroke="var(--primary-green)" fillOpacity={1} fill="url(#colorHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="card glass-morphism" style={{ padding: '40px', minHeight: '350px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Subject Mastery (RADAR)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="subject" stroke="var(--text-muted)" fontSize={10} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="transparent" />
              <Radar name="Mastery" dataKey="value" stroke="var(--primary-green)" fill="var(--primary-green)" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="card glass-morphism" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Consistency Score</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary-green)', margin: '10px 0' }}>{consistencyScore}%</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Based on last 7 days</div>
        </div>

        <div className="card glass-morphism" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Peak Focus Time</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db', margin: '20px 0' }}>{peakTime}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Analyzed from your sessions</div>
        </div>

        <div className="card glass-morphism" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Next Reward Goal</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e67e22', margin: '10px 0' }}>{powerNeeded} Power</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>To reach {nextMilestone} World Power</div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
