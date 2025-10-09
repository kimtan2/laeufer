import React, { useState, useRef, useCallback } from 'react';
import { ROLE_META } from '../data/positions.js';
import { PLAYERS } from '../data/players.js';

function Dot({ role, x, y, onDrag, isGlowing = false }) {
  const meta = ROLE_META[role];
  const dragRef = useRef(null);
  const [dragState, setDragState] = useState({ isDragging: false, startX: 0, startY: 0 });

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: x,
      initialY: y
    });
  }, [x, y]);

  const handleMouseMove = useCallback((e) => {
    if (!dragState.isDragging) return;
    
    const court = document.querySelector('.bg-gradient-to-b.from-blue-300');
    if (!court) return;
    
    const courtRect = court.getBoundingClientRect();
    
    const newX = ((e.clientX - courtRect.left) / courtRect.width) * 100;
    const newY = ((e.clientY - courtRect.top) / courtRect.height) * 100;
    
    // Constrain to court bounds
    const constrainedX = Math.max(0, Math.min(100, newX));
    const constrainedY = Math.max(0, Math.min(100, newY));
    
    onDrag(role, constrainedX, constrainedY);
  }, [dragState.isDragging, role, onDrag]);

  const handleMouseUp = useCallback(() => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  }, []);

  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={dragRef}
      className={`absolute w-16 h-16 rounded-full flex flex-col items-center justify-center font-black text-white tracking-wide border-4 border-white border-opacity-65 shadow-lg z-20 select-none cursor-move position-transition ${meta.cls} ${dragState.isDragging ? 'dragging z-50 shadow-2xl' : ''} ${isGlowing ? 'glowing' : ''}`} 
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="text-lg leading-none">{PLAYERS[role]}</div>
      <div className="text-xs mt-1 px-2 py-0.5 rounded-full bg-black bg-opacity-25">{role}</div>
    </div>
  );
}

export default Dot;