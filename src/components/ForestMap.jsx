import React from 'react';
import { motion } from 'framer-motion';
import { Mountain, Waves, TreePine, MapPin } from 'lucide-react';

const Biome = ({ type, x, y, width, height, label }) => {
  const colors = {
    forest: 'rgba(46, 204, 113, 0.1)',
    water: 'rgba(52, 152, 219, 0.1)',
    mountain: 'rgba(149, 165, 166, 0.1)',
    grass: 'rgba(39, 174, 96, 0.05)'
  };
  
  const Icons = {
    forest: TreePine,
    water: Waves,
    mountain: Mountain,
    grass: TreePine
  };

  const Icon = Icons[type];

  return (
    <div style={{
      position: 'absolute',
      left: `${x}%`,
      top: `${y}%`,
      width: `${width}%`,
      height: `${height}%`,
      background: colors[type],
      borderRadius: '24px',
      border: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
    }}>
      <Icon size={32} opacity={0.3} />
      <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
    </div>
  );
};

const ForestMap = ({ trees = [] }) => {
  const biomes = [
    { type: 'forest', x: 5, y: 5, width: 40, height: 40, label: 'Emerald Woods' },
    { type: 'water', x: 50, y: 10, width: 45, height: 35, label: 'Azure Lake' },
    { type: 'mountain', x: 10, y: 55, width: 35, height: 40, label: 'Peak of Focus' },
    { type: 'grass', x: 55, y: 55, width: 40, height: 40, label: 'Golden Plains' }
  ];

  const landmarks = [
    { id: 1, x: 20, y: 20, name: 'Ancient Oak', unlocked: trees.length >= 5 },
    { id: 2, x: 70, y: 25, name: 'Crystal Falls', unlocked: trees.length >= 15 },
    { id: 3, x: 25, y: 75, name: 'Wisdom Temple', unlocked: trees.length >= 30 },
  ];

  return (
    <div className="card glass-morphism map-view" style={{ 
      position: 'relative', 
      width: '100%', 
      aspectRatio: '16/9', 
      overflow: 'hidden',
      padding: '20px',
      background: 'radial-gradient(circle at center, #141e1b, #0a0f0d)'
    }}>
      <h2 style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 10, fontSize: '24px' }}>Discovery Map</h2>
      
      <div style={{ position: 'relative', width: '100%', height: '100%', marginTop: '40px' }}>
        {biomes.map((b, i) => (
          <Biome key={i} {...b} />
        ))}

        {landmarks.map(mark => (
          <motion.div
            key={mark.id}
            style={{
              position: 'absolute',
              left: `${mark.x}%`,
              top: `${mark.y}%`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: mark.unlocked ? 'pointer' : 'not-allowed',
              opacity: mark.unlocked ? 1 : 0.3,
              zIndex: 20
            }}
            whileHover={mark.unlocked ? { scale: 1.2 } : {}}
          >
            <div style={{ 
              background: mark.unlocked ? 'var(--primary-green)' : 'var(--bg-card)', 
              padding: '10px', 
              borderRadius: '50%',
              border: '2px solid var(--glass-border)',
              boxShadow: mark.unlocked ? '0 0 15px var(--primary-green)' : 'none'
            }}>
              <MapPin size={24} color={mark.unlocked ? 'white' : 'var(--text-muted)'} />
            </div>
            <span style={{ 
              marginTop: '4px', 
              fontSize: '12px', 
              fontWeight: '700', 
              color: mark.unlocked ? 'white' : 'var(--text-muted)',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
              {mark.unlocked ? mark.name : 'Unknown Location'}
            </span>
          </motion.div>
        ))}

        {/* Small "fog" tiles for locked areas */}
        {!trees.length > 50 && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            padding: '12px 20px',
            background: 'rgba(0,0,0,0.6)',
            borderRadius: '12px',
            zIndex: 30,
            border: '1px solid var(--glass-border)'
          }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Progress: {trees.length}/50 trees to clear all fog</div>
            <div style={{ 
              width: '150px', 
              height: '6px', 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '3px', 
              marginTop: '8px',
              overflow: 'hidden'
            }}>
              <div style={{ width: `${(trees.length / 50) * 100}%`, height: '100%', background: 'var(--primary-green)' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForestMap;
