import React, { useState, useCallback, useRef } from 'react';
import Dot from './components/Dot.jsx';
import { POS } from './data/positions.js';

function App() {
  const [rot, setRot] = useState("L1");
  const [mode, setMode] = useState("actual");
  const [customPositions, setCustomPositions] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [previousPositions, setPreviousPositions] = useState({});
  const currentPositions = useRef({});

  // Get current positions - custom override or default
  const getCurrentPositions = () => {
    const key = `${rot}-${mode}`;
    return customPositions[key] || POS[rot][mode];
  };

  // Handle mode/rotation changes to track previous positions for path visualization
  const handleModeChange = (newMode) => {
    if (showPath) {
      setPreviousPositions(getCurrentPositions());
    }
    setMode(newMode);
  };

  const handleRotChange = (newRot) => {
    if (showPath) {
      setPreviousPositions(getCurrentPositions());
    }
    setRot(newRot);
  };

  const handleDrag = useCallback((role, x, y) => {
    const key = `${rot}-${mode}`;
    setCustomPositions(prev => ({
      ...prev,
      [key]: {
        ...getCurrentPositions(),
        [role]: { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 }
      }
    }));
  }, [rot, mode, getCurrentPositions]);

  const exportPositions = () => {
    const allData = {};
    
    // Include all rotations and modes
    Object.keys(POS).forEach(rotation => {
      allData[rotation] = {};
      Object.keys(POS[rotation]).forEach(modeKey => {
        const key = `${rotation}-${modeKey}`;
        allData[rotation][modeKey] = customPositions[key] || POS[rotation][modeKey];
      });
    });

    const jsonString = JSON.stringify(allData, null, 2);
    
    // Copy to clipboard
    navigator.clipboard.writeText(jsonString).then(() => {
      alert('Coordinates copied to clipboard!');
    }).catch(() => {
      // Fallback - show in alert
      prompt('Copy these coordinates:', jsonString);
    });
  };

  const coords = getCurrentPositions();

  return (
    <div className="app">
      <div className="hdr" style={{position: 'relative'}}>
        <h1>5–1 Läufer {rot.substring(1)} — Exact Positions</h1>
        
        {/* Settings Icon */}
        <div className="settings-icon" onClick={() => setShowDropdown(!showDropdown)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="m12 1 1.09 3.09L16 5l-2 4 4-2 .91 3.09L22 12l-3.09 1.09L18 16l-4-2 2 4-3.09.91L12 22l-1.09-3.09L8 18l2-4-4 2-.91-3.09L2 12l3.09-1.09L6 8l4 2-2-4 3.09-.91z"/>
          </svg>
        </div>

        {/* Dropdown Menu */}
        <div className={`dropdown ${showDropdown ? 'active' : ''}`}>
          <div className="dropdown-item" onClick={() => {
            setShowPath(!showPath);
            setShowDropdown(false);
          }}>
            <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <input 
                type="checkbox" 
                checked={showPath} 
                onChange={() => {}}
                style={{margin: 0}}
              />
              Show Path
            </label>
          </div>
        </div>
      </div>

      <div className="bar">
        <button className={`btn ${rot==="L1"?"active":""}`} onClick={()=>handleRotChange("L1")}>L1</button>
        <button className={`btn ${rot==="L6"?"active":""}`} onClick={()=>handleRotChange("L6")}>L6</button>
        <button className={`btn ${rot==="L5"?"active":""}`} onClick={()=>handleRotChange("L5")}>L5</button>
        <button className={`btn ${rot==="L4"?"active":""}`} onClick={()=>handleRotChange("L4")}>L4</button>
        <button className={`btn ${rot==="L3"?"active":""}`} onClick={()=>handleRotChange("L3")}>L3</button>
        <button className={`btn ${rot==="L2"?"active":""}`} onClick={()=>handleRotChange("L2")}>L2</button>
      </div>

      <div className="bar" style={{paddingTop:8}}>
        <button className={`btn ${mode==="actual"?"active":""}`}  onClick={()=>handleModeChange("actual")}>Actual</button>
        <button className={`btn ${mode==="service"?"active":""}`} onClick={()=>handleModeChange("service")}>Service</button>
        <button className={`btn ${mode==="receive"?"active":""}`} onClick={()=>handleModeChange("receive")}>Serve Receive</button>
        <button className={`btn ${mode==="base"?"active":""}`}    onClick={()=>handleModeChange("base")}>Base (Defense)</button>
      </div>

      <div className="stage">
        <div className="court">
          <div className="net"></div>

          {/* Path lines (dotted) showing previous positions */}
          {showPath && Object.keys(previousPositions).length > 0 && Object.entries(coords).map(([role, {x, y}]) => {
            const prevPos = previousPositions[role];
            if (!prevPos) return null;
            
            const courtWidth = 720;
            const courtHeight = 580;
            const startX = (prevPos.x / 100) * courtWidth;
            const startY = (prevPos.y / 100) * courtHeight;
            const endX = (x / 100) * courtWidth;
            const endY = (y / 100) * courtHeight;
            
            // Calculate arrow direction
            const dx = endX - startX;
            const dy = endY - startY;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            // Only show arrow if there's meaningful movement
            if (length < 5) return null;
            
            const angle = Math.atan2(dy, dx);
            const arrowLength = 12;
            const arrowAngle = Math.PI / 6; // 30 degrees
            
            const arrowX1 = endX - arrowLength * Math.cos(angle - arrowAngle);
            const arrowY1 = endY - arrowLength * Math.sin(angle - arrowAngle);
            const arrowX2 = endX - arrowLength * Math.cos(angle + arrowAngle);
            const arrowY2 = endY - arrowLength * Math.sin(angle + arrowAngle);
            
            return (
              <svg 
                key={`path-${role}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 1
                }}
              >
                <defs>
                  <marker
                    id={`arrowhead-${role}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#666"
                      opacity="0.7"
                    />
                  </marker>
                </defs>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#666"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.7"
                  markerEnd={`url(#arrowhead-${role})`}
                />
              </svg>
            );
          })}

          {Object.entries(coords).map(([role, {x,y}]) => (
            <Dot key={role} role={role} x={x} y={y} onDrag={handleDrag} />
          ))}
        </div>
      </div>
      
      <button className="export-btn" onClick={exportPositions}>Export JSON</button>
    </div>
  );
}

export default App;