import React from 'react';
import { motion } from 'framer-motion';

const Tree = ({ stage, biome }) => {
  const treeColors = {
    forest: ['#2ecc71', '#27ae60', '#5D4037'],
    water: ['#3498db', '#2980b9', '#34495e'],
    mountain: ['#95a5a6', '#7f8c8d', '#2c3e50'],
    grass: ['#f1c40f', '#f39c12', '#a04000']
  };

  const [leaf1, leaf2, trunk] = treeColors[biome] || treeColors.forest;

  return (
    <motion.svg
      className="tree-svg"
      viewBox="0 0 100 100"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <rect x="46" y="70" width="8" height="20" fill={trunk} rx="1" />
      {/* Stage 1: Sprout (A tiny leaf) */}
      {stage === 1 && (
        <motion.ellipse cx="50" cy="65" rx="8" ry="12" fill={leaf1} initial={{ rotate: -45 }} />
      )}
      
      {/* Stage 2: Sapling (A few more leaves) */}
      {stage === 2 && (
        <g>
          <circle cx="50" cy="55" r="15" fill={leaf1} />
          <circle cx="40" cy="60" r="10" fill={leaf2} />
        </g>
      )}

      {/* Stage 3: Small Tree (A rounded canopy) */}
      {stage === 3 && (
        <g>
          <circle cx="50" cy="45" r="22" fill={leaf1} />
          <circle cx="35" cy="55" r="18" fill={leaf2} />
          <circle cx="65" cy="55" r="18" fill={leaf2} />
        </g>
      )}

      {/* Stage 4: Big Tree (A lush, layered canopy) */}
      {stage >= 4 && (
        <g>
          <circle cx="50" cy="35" r="25" fill={leaf1} />
          <circle cx="30" cy="50" r="20" fill={leaf2} />
          <circle cx="70" cy="50" r="20" fill={leaf2} />
          <circle cx="50" cy="55" r="22" fill={leaf1} />
        </g>
      )}
    </motion.svg>
  );
};

const ForestView = ({ trees = [], biome = 'forest' }) => {
  const gridSize = 30;
  const totalTiles = gridSize * gridSize;
  
  const biomeConfigs = {
    forest: { bg: 'rgba(46, 204, 113, 0.05)', tileBg: 'rgba(255,255,255,0.02)' },
    water: { bg: 'rgba(52, 152, 219, 0.05)', tileBg: 'rgba(52, 152, 219, 0.05)' },
    mountain: { bg: 'rgba(149, 165, 166, 0.05)', tileBg: 'rgba(149, 165, 166, 0.05)' },
    grass: { bg: 'rgba(241, 196, 15, 0.05)', tileBg: 'rgba(241, 196, 15, 0.05)' }
  };

  const currentConfig = biomeConfigs[biome] || biomeConfigs.forest;

  const grid = Array.from({ length: totalTiles }, (_, i) => {
    // Optimization: find tree by position efficiently
    const tree = trees.find(t => t.position === i);
    
    // In Forest View, we show any tree if it's the home turf, otherwise filter by biome maybe?
    // Actually, let's just show all trees in the "World Map" and current trees in view.
    return {
      id: i,
      tree: tree || null,
      locked: i > 250
    };
  });

  const biomeLabels = {
    forest: 'Emerald Woods',
    water: 'Azure Lake',
    mountain: 'Mystic Peaks',
    grass: 'Golden Plains'
  };

  return (
    <div className="card glass-morphism forest-view" style={{ 
      flex: '1 1 600px', 
      overflow: 'auto', 
      maxHeight: '600px',
      cursor: 'grab',
      background: currentConfig.bg
    }}>
      <div className="tree-grid" style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        width: `${gridSize * 80}px`,
        height: `${gridSize * 80}px`,
        padding: '100px',
        gap: '20px'
      }}>
        {grid.map((tile) => (
          <div key={tile.id} className={`tile ${tile.locked ? 'locked' : ''}`} 
               style={{ 
                 width: '60px', 
                 height: '60px',
                 background: tile.tree ? 'transparent' : currentConfig.tileBg,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
               title={tile.tree ? `${tile.tree.title}\n${tile.tree.date}` : ''}>
            {tile.tree && <Tree stage={tile.tree.stage} biome={tile.tree.category?.toLowerCase() || 'forest'} />}
          </div>
        ))}
      </div>
      
      <div className="forest-overlay" style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        padding: '12px 20px',
        background: 'var(--glass-bg)',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(4px)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ fontSize: '10px', color: 'var(--primary-green)', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Region</div>
        <div style={{ fontSize: '16px', fontWeight: '800', color: 'white' }}>{biomeLabels[biome]}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{trees.length} Trees in World</div>
      </div>
    </div>
  );
};

export default ForestView;
