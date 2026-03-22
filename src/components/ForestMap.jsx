import React from 'react';
import { motion } from 'framer-motion';
import { Mountain, Waves, TreePine, MapPin, Lock, Zap } from 'lucide-react';

const Biome = ({ type, x, y, width, height, label, unlocked, active, onClick }) => {
  const colors = {
    forest: 'rgba(46, 204, 113, 0.1)',
    water: 'rgba(52, 152, 219, 0.1)',
    mountain: 'rgba(149, 165, 166, 0.1)',
    grass: 'rgba(241, 196, 15, 0.1)'
  };
  
  const Icons = {
    forest: TreePine,
    water: Waves,
    mountain: Mountain,
    grass: TreePine
  };

  const Icon = Icons[type];

  return (
    <motion.div 
      whileHover={unlocked ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
      onClick={() => unlocked && onClick(type)}
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        background: active ? 'rgba(255,255,255,0.08)' : colors[type],
        borderRadius: '24px',
        border: active ? '2px solid var(--primary-green)' : '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: active ? '0 0 30px rgba(46, 204, 113, 0.2)' : 'inset 0 0 20px rgba(0,0,0,0.2)',
        cursor: unlocked ? 'pointer' : 'not-allowed',
        opacity: unlocked ? 1 : 0.4,
        transition: 'all 0.3s ease'
      }}
    >
      {!unlocked && <Lock size={20} style={{ marginBottom: '4px', opacity: 0.5 }} />}
      <Icon size={32} color={active ? 'var(--primary-green)' : 'white'} opacity={active ? 1 : 0.4} />
      <span style={{ 
        fontSize: '11px', 
        fontWeight: '700', 
        color: active ? 'var(--primary-green)' : 'var(--text-muted)', 
        textTransform: 'uppercase', 
        letterSpacing: '1px' 
      }}>
        {label}
      </span>
    </motion.div>
  );
};

const ForestMap = ({ trees = [], onSelectBiome, activeBiome, streak = 0 }) => {
  const worldPower = trees.length + (streak * 3);
  
  const biomes = [
    { type: 'forest', x: 5, y: 5, width: 42, height: 42, label: 'Emerald Woods', threshold: 0 },
    { type: 'water', x: 52, y: 5, width: 42, height: 42, label: 'Azure Lake', threshold: 30 },
    { type: 'mountain', x: 5, y: 52, width: 42, height: 42, label: 'Mystic Peaks', threshold: 80 },
    { type: 'grass', x: 52, y: 52, width: 42, height: 42, label: 'Golden Plains', threshold: 150 }
  ];

  return (
    <div className="card glass-morphism map-view" style={{ 
      position: 'relative', 
      width: '100%', 
      aspectRatio: '16/9', 
      overflow: 'hidden',
      padding: '40px',
      background: 'radial-gradient(circle at center, #141e1b, #0a0f0d)'
    }}>
      <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10 }}>
        <h2 style={{ fontSize: '24px', margin: 0 }}>Discovery Map</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Growth + Consistency = World Power</p>
      </div>
      
      <div style={{ position: 'relative', width: '100%', height: '100%', marginTop: '30px' }}>
        {biomes.map((b, i) => (
          <Biome 
            key={i} 
            {...b} 
            unlocked={worldPower >= b.threshold}
            active={activeBiome === b.type}
            onClick={onSelectBiome}
          />
        ))}

        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          background: 'rgba(0,0,0,0.4)',
          borderRadius: '30px',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          zIndex: 50,
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={16} color="var(--primary-green)" fill="var(--primary-green)" />
            <span style={{ fontSize: '12px', color: 'white', fontWeight: 'bold' }}>{worldPower} World Power</span>
          </div>
          <div style={{ height: '15px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {worldPower < 30 ? `Unlocks Azure Lake at 30 Power` : 
             worldPower < 80 ? `Unlocks Mystic Peaks at 80 Power` : 
             worldPower < 150 ? `Unlocks Golden Plains at 150 Power` : `Master of the World!`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ForestMap;
