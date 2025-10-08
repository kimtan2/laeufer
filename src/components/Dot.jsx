import React, { useState, useRef, useCallback } from 'react';
import { ROLE_META } from '../data/positions.js';
import { PLAYERS } from '../data/players.js';

function Dot({ role, x, y, onDrag }) {
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
    
    const court = document.querySelector('.court');
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
      className={`dot ${meta.cls} ${dragState.isDragging ? 'dragging' : ''}`} 
      style={{ left:`${x}%`, top:`${y}%` }}
      onMouseDown={handleMouseDown}
    >
      <div className="role">{PLAYERS[role]}</div>
      <div className="tag">{role}</div>
    </div>
  );
}

export default Dot;