import React from 'react';
import { motion } from 'framer-motion';

const Tree = ({ stage }) => {
  return (
    <motion.svg
      className="tree-svg"
      viewBox="0 0 100 100"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <rect x="45" y="60" width="10" height="30" fill="#5D4037" rx="2" />
      {stage >= 1 && <circle cx="50" cy="50" r="25" fill="#2ecc71" opacity="0.9" />}
      {stage >= 2 && <circle cx="35" cy="45" r="20" fill="#27ae60" opacity="0.8" />}
      {stage >= 2 && <circle cx="65" cy="45" r="20" fill="#2ecc71" opacity="0.85" />}
      {stage >= 3 && <circle cx="50" cy="30" r="22" fill="#2ecc71" />}
    </motion.svg>
  );
};

const ForestView = ({ trees = [] }) => {
  // 30x30 Infinite Grid (900 tiles)
  const gridSize = 30;
  const totalTiles = gridSize * gridSize;
  
  const grid = Array.from({ length: totalTiles }, (_, i) => {
    const tree = trees.find(t => t.position === i);
    return {
      id: i,
      tree: tree || null,
      locked: i > 200 && !trees.some(t => t.position === i) // Lock most of the infinite space initially
    };
  });

  return (
    <div className="card glass-morphism forest-view" style={{ 
      flex: '1 1 600px', 
      overflow: 'auto', 
      maxHeight: '600px',
      cursor: 'grab'
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
               style={{ width: '60px', height: '60px' }}
               title={tile.tree ? `${tile.tree.title}\n${tile.tree.date}` : ''}>
            {tile.tree && <Tree stage={tile.tree.stage} />}
            {tile.locked && <div style={{ fontSize: '10px', opacity: 0.1 }}>🔒</div>}
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
        zIndex: 10
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>Forest Stats</div>
        <div style={{ fontSize: '12px', color: 'var(--primary-green)' }}>{trees.length} Trees Planted</div>
      </div>
    </div>
  );
};

export default ForestView;
