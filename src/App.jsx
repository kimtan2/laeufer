import React, { useState, useCallback, useRef } from 'react';
import Dot from './components/Dot.jsx';
import { POS } from './data/positions.js';

function App() {
  const [rot, setRot] = useState("L2");
  const [mode, setMode] = useState("actual");
  const [customPositions, setCustomPositions] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPath, setShowPath] = useState(false);
  const [previousPositions, setPreviousPositions] = useState({});
  const currentPositions = useRef({});
  const [simulationMode, setSimulationMode] = useState(true);
  const [l6Direction, setL6Direction] = useState("default"); // "default" or "reversed"
  const [gamePhase, setGamePhase] = useState("setup"); // "setup", "angabe", "annahme", "zuspiel_bereit", "abwehr"
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [isZuspielReady, setIsZuspielReady] = useState(false);
  const [glowingPlayers, setGlowingPlayers] = useState([]);

  // Get current positions - custom override or default
  const getCurrentPositions = () => {
    const key = `${rot}-${mode}`;
    return customPositions[key] || POS[rot][mode];
  };

  // Get modified positions for Zuspiel mode (all players to base except setter)
  const getZuspielPositions = () => {
    if (!isZuspielReady) return getCurrentPositions();
    
    const receivePositions = POS[rot]["receive"];
    const basePositions = POS[rot]["base"];
    const modifiedPositions = {};
    
    Object.keys(receivePositions).forEach(role => {
      if (role === "S") {
        // Setter stays in receive position
        modifiedPositions[role] = receivePositions[role];
      } else {
        // All other players move to base positions
        modifiedPositions[role] = basePositions[role];
      }
    });
    
    return modifiedPositions;
  };

  // Determine front row players (excluding setter) in Zuspiel state
  // This version directly calculates without depending on isZuspielReady state
  const calculateFrontRowPlayers = () => {
    const receivePositions = POS[rot]["receive"];
    const basePositions = POS[rot]["base"];
    const zuspielPositions = {};
    
    // Build zuspiel positions: base for all except setter who stays in receive
    Object.keys(receivePositions).forEach(role => {
      if (role === "S") {
        zuspielPositions[role] = receivePositions[role];
      } else {
        zuspielPositions[role] = basePositions[role];
      }
    });
    
    const frontRowPlayers = [];
    Object.entries(zuspielPositions).forEach(([role, pos]) => {
      // Front row is top half (y < 50)
      if (role !== "S" && pos && pos.y < 50) {
        frontRowPlayers.push(role);
      }
    });
    
    console.log("Current rotation:", rot);
    console.log("Zuspiel positions:", zuspielPositions);
    console.log("Front row players detected:", frontRowPlayers);
    
    return frontRowPlayers;
  };

  // Handle mode/rotation changes to track previous positions for path visualization
  const handleModeChange = (newMode) => {
    if (showPath) {
      setPreviousPositions(getCurrentPositions());
    }
    setMode(newMode);
  };

  const handleRotChange = (newRot) => {
    setPreviousPositions({});
    setIsZuspielReady(false);
    setGlowingPlayers([]);
    setGamePhase("setup"); // Reset to initial state
    setShowActionButtons(false); // Hide action buttons
    setMode("actual"); // Reset to default mode
    setShowPath(false); // Hide path visualization
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

  const coords = isZuspielReady ? getZuspielPositions() : getCurrentPositions();

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white py-3 px-4 text-center relative">
        <h1 className="text-lg font-medium tracking-wide">5–1 Läufer {rot.substring(1)} — Exact Positions</h1>
        
        {/* Fire Toggle Button */}
        <div className="absolute top-4 right-12 cursor-pointer transition-transform duration-200 hover:scale-110" onClick={() => setSimulationMode(!simulationMode)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={simulationMode ? "#ff6b35" : "none"} stroke={simulationMode ? "#ff6b35" : "white"} strokeWidth="2">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
        </div>
        
        {/* Settings Icon */}
        <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowDropdown(!showDropdown)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="m12 1 1.09 3.09L16 5l-2 4 4-2 .91 3.09L22 12l-3.09 1.09L18 16l-4-2 2 4-3.09.91L12 22l-1.09-3.09L8 18l2-4-4 2-.91-3.09L2 12l3.09-1.09L6 8l4 2-2-4 3.09-.91z"/>
          </svg>
        </div>

        {/* Dropdown Menu */}
        <div className={`absolute top-10 right-4 bg-white border border-gray-300 shadow-lg z-10 ${showDropdown ? 'block' : 'hidden'}`}>
          <div className="py-2 px-3 cursor-pointer hover:bg-gray-100" onClick={() => {
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
          <div className="py-2 px-3 cursor-pointer hover:bg-gray-100" onClick={() => {
            setL6Direction(l6Direction === "default" ? "reversed" : "default");
            setShowDropdown(false);
          }}>
            <label style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <input 
                type="checkbox" 
                checked={l6Direction === "reversed"} 
                onChange={() => {}}
                style={{margin: 0}}
              />
              L6 →
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 p-3 border-b border-gray-200 bg-gray-50 flex-wrap">
        <button className={`border-2 border-blue-500 ${rot==="L2"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`} onClick={()=>handleRotChange("L2")}>L2</button>
        <button className={`border-2 border-blue-500 ${rot==="L1"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`} onClick={()=>handleRotChange("L1")}>L1</button>
        <button className={`border-2 border-blue-500 ${rot==="L6"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`} onClick={()=>handleRotChange("L6")}>L6</button>
        <button className={`border-2 border-blue-500 ${rot==="L5"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`} onClick={()=>handleRotChange("L5")}>L5</button>
        <button className={`border-2 border-blue-500 ${rot==="L4"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`} onClick={()=>handleRotChange("L4")}>L4</button>
        <button className={`border-2 border-blue-500 ${rot==="L3"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`} onClick={()=>handleRotChange("L3")}>L3</button>
      </div>

      {simulationMode && (
        <>
          {/* SubHeader with Angabe/Annahme buttons */}
          <div className="flex justify-center gap-5 p-4 border-b border-gray-200 bg-blue-50">
            <button 
              className={`border-2 border-blue-500 ${gamePhase==="angabe"?"bg-blue-500 text-white":"bg-white text-blue-500"} ${(gamePhase==="annahme" || gamePhase==="zuspiel_bereit" || gamePhase==="abwehr")?"opacity-50 cursor-not-allowed":"cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"} px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 min-w-[120px]`} 
              onClick={() => {
                if (gamePhase !== "annahme" && gamePhase !== "zuspiel_bereit" && gamePhase !== "abwehr") {
                  setGamePhase("angabe");
                  setMode("service");
                  setShowActionButtons(true);
                  setIsZuspielReady(false);
                  setGlowingPlayers([]);
                  setPreviousPositions({});
                  setShowPath(false);
                }
              }}
              disabled={gamePhase === "annahme" || gamePhase === "zuspiel_bereit" || gamePhase === "abwehr"}
            >
              Angabe
            </button>
            <button 
              className={`border-2 border-blue-500 ${gamePhase==="annahme"?"bg-blue-500 text-white":"bg-white text-blue-500"} ${(gamePhase==="angabe" || gamePhase==="zuspiel_bereit" || gamePhase==="abwehr")?"opacity-50 cursor-not-allowed":"cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"} px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 min-w-[120px]`} 
              onClick={() => {
                if (gamePhase !== "angabe" && gamePhase !== "zuspiel_bereit" && gamePhase !== "abwehr") {
                  setGamePhase("annahme");
                  setMode("receive");
                  setShowActionButtons(true);
                  setIsZuspielReady(false);
                  setGlowingPlayers([]);
                  setPreviousPositions({});
                  setShowPath(false);
                }
              }}
              disabled={gamePhase === "angabe" || gamePhase === "zuspiel_bereit" || gamePhase === "abwehr"}
            >
              Annahme
            </button>
          </div>

          {/* Action Buttons */}
          {showActionButtons && (
            <div className="flex justify-center gap-3 p-3 bg-blue-100 border-b border-gray-200">
              {gamePhase === "angabe" && (
                <button 
                  className="border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:text-white hover:-translate-y-px text-sm min-w-[140px]" 
                  onClick={() => {
                    setPreviousPositions(getCurrentPositions());
                    setShowPath(true);
                    setMode("base");
                    setGamePhase("abwehr");
                  }}
                >
                  Aufschlag machen
                </button>
              )}
              {gamePhase === "annahme" && (
                <button 
                  className="border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:text-white hover:-translate-y-px text-sm min-w-[140px]"
                  onClick={() => {
                    setPreviousPositions(getCurrentPositions());
                    setShowPath(true);
                    
                    // Calculate front row players BEFORE setting state
                    const frontRow = calculateFrontRowPlayers();
                    console.log("Setting glowing players to:", frontRow);
                    
                    // Transition to zuspiel_bereit state
                    setGamePhase("zuspiel_bereit");
                    setIsZuspielReady(true);
                    setGlowingPlayers(frontRow);
                  }}
                >
                  angenommen
                </button>
              )}
              {gamePhase === "zuspiel_bereit" && (
                <>
                  <button 
                    className="border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:text-white hover:-translate-y-px text-sm min-w-[160px]"
                    onClick={() => {
                      setPreviousPositions(getCurrentPositions());
                      setShowPath(true);
                      setMode("base");
                      setGamePhase("abwehr");
                      setIsZuspielReady(false);
                      setGlowingPlayers([]);
                    }}
                  >
                    zugespielt und geschlagen
                  </button>
                  <button 
                    className="border border-red-600 text-red-600 bg-white px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-red-600 hover:text-white hover:-translate-y-px text-sm min-w-[140px]"
                    onClick={() => {
                      setPreviousPositions(getCurrentPositions());
                      setShowPath(true);
                      setMode("receive");
                      setGamePhase("annahme");
                      setIsZuspielReady(false);
                      setGlowingPlayers([]);
                    }}
                  >
                    den Punkt verloren
                  </button>
                </>
              )}
              {gamePhase === "abwehr" && (
                <>
                  <button 
                    className="border border-blue-600 text-blue-600 bg-white px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:text-white hover:-translate-y-px text-sm min-w-[140px]"
                    onClick={() => {
                      setPreviousPositions(getCurrentPositions());
                      setShowPath(true);
                      
                      // Calculate front row players BEFORE setting state
                      const frontRow = calculateFrontRowPlayers();
                      console.log("Setting glowing players to:", frontRow);
                      
                      // Transition back to zuspiel_bereit state - keep receive mode for zuspiel positions
                      setMode("receive");
                      setGamePhase("zuspiel_bereit");
                      setIsZuspielReady(true);
                      setGlowingPlayers(frontRow);
                    }}
                  >
                    angenommen
                  </button>
                  <button 
                    className="border border-red-600 text-red-600 bg-white px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 hover:bg-red-600 hover:text-white hover:-translate-y-px text-sm min-w-[140px]"
                    onClick={() => {
                      setPreviousPositions(getCurrentPositions());
                      setShowPath(true);
                      setMode("receive");
                      setGamePhase("annahme");
                      setIsZuspielReady(false);
                      setGlowingPlayers([]);
                    }}
                  >
                    Abwehr verkackt
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {!simulationMode && (
        <div className="flex justify-center gap-2 p-3 pt-4 border-b border-gray-200 bg-gray-50 flex-wrap">
          <button className={`border-2 border-blue-500 ${mode==="actual"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`}  onClick={()=>handleModeChange("actual")}>Actual</button>
          <button className={`border-2 border-blue-500 ${mode==="service"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`} onClick={()=>handleModeChange("service")}>Service</button>
          <button className={`border-2 border-blue-500 ${mode==="receive"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`} onClick={()=>handleModeChange("receive")}>Serve Receive</button>
          <button className={`border-2 border-blue-500 ${mode==="base"?"bg-blue-500 text-white":"bg-white text-blue-500"} px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-200 hover:-translate-y-px hover:shadow-md`}    onClick={()=>handleModeChange("base")}>Base (Defense)</button>
        </div>
      )}

      <div className="py-4 px-5 flex justify-center items-center bg-gradient-to-b from-blue-100 to-blue-200 min-h-[500px] max-h-[calc(100vh-320px)] overflow-hidden relative">
        {/* State message cards */}
        {gamePhase === "zuspiel_bereit" && (
          <div className="absolute top-5 left-[90%] transform -translate-x-1/2 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl py-3 px-6 shadow-lg z-50 animate-slide-in-top flex items-center gap-3 border-2 border-white border-opacity-30">
            <div className="text-3xl animate-pulse-icon">⚡</div>
            <div className="font-bold text-lg tracking-wide text-center">Zuspiel bereit!</div>
          </div>
        )}
        {gamePhase === "abwehr" && (
          <div className="absolute top-5 left-[90%] transform -translate-x-1/2 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl py-3 px-6 shadow-lg z-50 animate-slide-in-top flex items-center gap-3 border-2 border-white border-opacity-30">
            <div className="text-3xl animate-pulse-icon">🛡️</div>
            <div className="font-bold text-lg tracking-wide text-center">Für Abwehr bereit sein</div>
          </div>
        )}
        {gamePhase === "annahme" && showActionButtons && (
          <div className="absolute top-5 left-[90%] transform -translate-x-1/2 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl py-3 px-6 shadow-lg z-50 animate-slide-in-top flex items-center gap-3 border-2 border-white border-opacity-30">
            <div className="text-3xl animate-pulse-icon">📥</div>
            <div className="font-bold text-lg tracking-wide text-center">Für die Annahme bereit sein</div>
          </div>
        )}

        <div className="w-[min(700px,90vw)] h-[min(550px,calc(100vh-380px),calc(90vw*0.76))] bg-gradient-to-b from-blue-300 to-blue-400 border-6 border-blue-700 rounded-xl relative shadow-xl overflow-hidden">
          <div className="absolute left-0 right-0 top-1/2 h-2 bg-red-600 transform -translate-y-1/2 z-10 shadow-lg shadow-red-600/35"></div>


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
            <Dot 
              key={role} 
              role={role} 
              x={x} 
              y={y} 
              onDrag={handleDrag}
              isGlowing={gamePhase === "zuspiel_bereit" ? role !== "S" : glowingPlayers.includes(role)}
            />
          ))}
        </div>
      </div>
      
      <button className="fixed right-5 bottom-5 bg-blue-500 text-white border-none py-3 px-4 rounded-lg text-xs cursor-pointer z-[1000] font-semibold shadow-lg shadow-blue-500/30 transition-all duration-200 hover:bg-blue-600 hover:-translate-y-px hover:shadow-xl hover:shadow-blue-500/40" onClick={exportPositions}>Export JSON</button>
    </div>
  );
}

export default App;