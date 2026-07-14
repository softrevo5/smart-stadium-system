'use client';

import React, { useState, useMemo } from 'react';
import { GateStatus } from '../lib/types';
import { Info, Eye, EyeOff, ShieldAlert } from 'lucide-react';

interface StadiumMapProps {
  gates: GateStatus[];
  onSelectGate: (gate: GateStatus) => void;
  selectedGateId: string | null;
}

const StadiumMap = React.memo(function StadiumMap({ gates, onSelectGate, selectedGateId }: StadiumMapProps) {
  const [accessMode, setAccessMode] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const getGateColor = (congestion: string) => {
    if (congestion === 'high') return 'var(--color-danger)';
    if (congestion === 'medium') return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const handleGateClick = (gate: GateStatus) => {
    onSelectGate(gate);
  };

  const handleSectionClick = (sectionName: string) => {
    setSelectedSection(sectionName);
  };

  // Memoize static map geometries to prevent re-evaluating complex SVG nodes on 10s state ticks
  const staticMapLayout = useMemo(() => {
    return (
      <>
        {/* Stadium outer aura */}
        <ellipse cx="250" cy="200" rx="220" ry="170" fill="url(#stadiumGlow)" />

        {/* Outer Security Boundary */}
        <ellipse
          cx="250"
          cy="200"
          rx="200"
          ry="150"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="2"
          strokeDasharray="4 8"
        />

        {/* Stadium Structure (Main Outer Wall) */}
        <ellipse
          cx="250"
          cy="200"
          rx="160"
          ry="120"
          fill="rgba(10, 15, 30, 0.8)"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="3"
        />

        {/* Pitches / Field Area */}
        <rect
          x="210"
          y="170"
          width="80"
          height="60"
          rx="4"
          fill="rgba(16, 185, 129, 0.15)"
          stroke="rgba(16, 185, 129, 0.5)"
          strokeWidth="1.5"
        />
        {/* Goal posts/lines */}
        <line x1="210" y1="200" x2="290" y2="200" stroke="rgba(16, 185, 129, 0.2)" />
        <circle cx="250" cy="200" r="15" fill="none" stroke="rgba(16, 185, 129, 0.3)" />

        {/* Seating Sections with Accessibility Keyboard Outlines & Labels */}
        {/* Section 101 - North */}
        <path
          d="M 200 110 A 100 70 0 0 1 300 110 L 280 140 A 60 40 0 0 0 220 140 Z"
          fill={selectedSection === '101' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.03)'}
          stroke={selectedSection === '101' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.15)'}
          strokeWidth="1.5"
          cursor="pointer"
          onClick={() => handleSectionClick('101')}
          tabIndex={0}
          role="button"
          aria-label={`Stadium Seating Section 101. ${selectedSection === '101' ? 'Selected.' : 'Click to route.'}`}
          onKeyDown={(e) => e.key === 'Enter' && handleSectionClick('101')}
          style={{ outline: 'none' }}
        />
        <text x="250" y="125" fill={selectedSection === '101' ? '#ffffff' : 'var(--color-text-secondary)'} fontSize="10" textAnchor="middle" fontWeight="bold" pointerEvents="none">Sec 101</text>

        {/* Section 102 - East */}
        <path
          d="M 370 160 A 130 90 0 0 1 370 240 L 330 225 A 90 60 0 0 0 330 175 Z"
          fill={selectedSection === '102' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.03)'}
          stroke={selectedSection === '102' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.15)'}
          strokeWidth="1.5"
          cursor="pointer"
          onClick={() => handleSectionClick('102')}
          tabIndex={0}
          role="button"
          aria-label={`Stadium Seating Section 102. ${selectedSection === '102' ? 'Selected.' : 'Click to route.'}`}
          onKeyDown={(e) => e.key === 'Enter' && handleSectionClick('102')}
          style={{ outline: 'none' }}
        />
        <text x="350" y="204" fill={selectedSection === '102' ? '#ffffff' : 'var(--color-text-secondary)'} fontSize="10" textAnchor="middle" fontWeight="bold" pointerEvents="none">Sec 102</text>

        {/* Section 103 - South */}
        <path
          d="M 300 290 A 100 70 0 0 1 200 290 L 220 260 A 60 40 0 0 0 280 260 Z"
          fill={selectedSection === '103' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.03)'}
          stroke={selectedSection === '103' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.15)'}
          strokeWidth="1.5"
          cursor="pointer"
          onClick={() => handleSectionClick('103')}
          tabIndex={0}
          role="button"
          aria-label={`Stadium Seating Section 103. ${selectedSection === '103' ? 'Selected.' : 'Click to route.'}`}
          onKeyDown={(e) => e.key === 'Enter' && handleSectionClick('103')}
          style={{ outline: 'none' }}
        />
        <text x="250" y="280" fill={selectedSection === '103' ? '#ffffff' : 'var(--color-text-secondary)'} fontSize="10" textAnchor="middle" fontWeight="bold" pointerEvents="none">Sec 103</text>

        {/* Section 104 - West */}
        <path
          d="M 130 240 A 130 90 0 0 1 130 160 L 170 175 A 90 60 0 0 0 170 225 Z"
          fill={selectedSection === '104' ? 'rgba(0, 240, 255, 0.25)' : 'rgba(255, 255, 255, 0.03)'}
          stroke={selectedSection === '104' ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.15)'}
          strokeWidth="1.5"
          cursor="pointer"
          onClick={() => handleSectionClick('104')}
          tabIndex={0}
          role="button"
          aria-label={`Stadium Seating Section 104. ${selectedSection === '104' ? 'Selected.' : 'Click to route.'}`}
          onKeyDown={(e) => e.key === 'Enter' && handleSectionClick('104')}
          style={{ outline: 'none' }}
        />
        <text x="150" y="204" fill={selectedSection === '104' ? '#ffffff' : 'var(--color-text-secondary)'} fontSize="10" textAnchor="middle" fontWeight="bold" pointerEvents="none">Sec 104</text>

        {/* Dynamic Wayfinding Line (if gate and section are chosen) */}
        {selectedGateId && selectedSection && (
          <path
            d={
              selectedGateId === 'gate-a' && selectedSection === '101' ? 'M 250 50 Q 250 80 250 110' :
              selectedGateId === 'gate-a' && selectedSection === '102' ? 'M 250 50 C 310 50 350 120 350 170' :
              selectedGateId === 'gate-b' && selectedSection === '102' ? 'M 440 200 Q 380 200 350 200' :
              selectedGateId === 'gate-b' && selectedSection === '103' ? 'M 440 200 C 440 270 330 280 270 280' :
              selectedGateId === 'gate-c' && selectedSection === '103' ? 'M 250 350 Q 250 310 250 285' :
              selectedGateId === 'gate-d' && selectedSection === '104' ? 'M 60 200 Q 110 200 140 200' :
              // Fallback direct spline
              `M ${selectedGateId === 'gate-a' ? '250 50' : selectedGateId === 'gate-b' ? '440 200' : selectedGateId === 'gate-c' ? '250 350' : '60 200'} L ${selectedSection === '101' ? '250 125' : selectedSection === '102' ? '350 204' : selectedSection === '103' ? '250 280' : '150 204'}`
            }
            fill="none"
            stroke="url(#wayfindingLine)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="6 4"
            className="wayfinding-glow"
            style={{ filter: 'drop-shadow(0px 0px 5px rgba(0,240,255,0.7))' }}
          />
        )}
      </>
    );
  }, [selectedSection, selectedGateId]);

  return (
    <section className="glass-panel" style={containerStyle} aria-labelledby="map-title">
      <div style={headerStyle}>
        <div>
          <h2 id="map-title" style={titleStyle}>🏟️ Interactive Wayfinding Map</h2>
          <p style={descStyle}>Click a Gate or Section to generate AI directions and queue wait estimates.</p>
        </div>
        <button
          onClick={() => setAccessMode(!accessMode)}
          style={accessMode ? activeAccessBtnStyle : accessBtnStyle}
          aria-pressed={accessMode}
          title="Highlight step-free ramps, elevators and warn of staircases"
        >
          {accessMode ? <EyeOff size={16} /> : <Eye size={16} />}
          <span>{accessMode ? 'Disable ADA Highlighting' : 'Accessibility View'}</span>
        </button>
      </div>

      <div className="map-view-container" style={mapWrapperStyle}>
        <svg
          viewBox="0 0 500 400"
          style={svgStyle}
          role="img"
          aria-label="Interactive Stadium Map showing Gates A through D, and seating Sections 100 to 200."
        >
          <defs>
            <radialGradient id="stadiumGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0, 240, 255, 0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="wayfindingLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="100%" stopColor="var(--color-accent)" />
            </linearGradient>
          </defs>

          {/* Render static elements from useMemo */}
          {staticMapLayout}

          {/* GATE INDICATORS */}
          {/* Gate A (North) */}
          <g
            cursor="pointer"
            onClick={() => handleGateClick(gates[0])}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleGateClick(gates[0])}
            aria-label="Gate A Status"
          >
            <circle
              cx="250"
              cy="50"
              r={selectedGateId === 'gate-a' ? '18' : '14'}
              fill={selectedGateId === 'gate-a' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0,0,0,0.6)'}
              stroke={accessMode ? '#00f0ff' : getGateColor(gates[0].congestion)}
              strokeWidth="3"
            />
            {accessMode && <circle cx="250" cy="50" r="6" fill="#00f0ff" />}
            <text x="250" y="54" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">A</text>
          </g>

          {/* Gate B (East) */}
          <g
            cursor="pointer"
            onClick={() => handleGateClick(gates[1])}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleGateClick(gates[1])}
            aria-label="Gate B Status"
          >
            <circle
              cx="440"
              cy="200"
              r={selectedGateId === 'gate-b' ? '18' : '14'}
              fill={selectedGateId === 'gate-b' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0,0,0,0.6)'}
              stroke={accessMode ? '#00f0ff' : getGateColor(gates[1].congestion)}
              strokeWidth="3"
            />
            {accessMode && <circle cx="440" cy="200" r="6" fill="#00f0ff" />}
            <text x="440" y="204" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">B</text>
          </g>

          {/* Gate C (South) */}
          <g
            cursor="pointer"
            onClick={() => handleGateClick(gates[2])}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleGateClick(gates[2])}
            aria-label="Gate C Status"
          >
            <circle
              cx="250"
              cy="350"
              r={selectedGateId === 'gate-c' ? '18' : '14'}
              fill={selectedGateId === 'gate-c' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0,0,0,0.6)'}
              stroke={accessMode ? 'rgba(239, 68, 68, 0.3)' : getGateColor(gates[2].congestion)}
              strokeWidth="3"
            />
            {accessMode && (
              <text x="250" y="342" fill="var(--color-danger)" fontSize="10" textAnchor="middle" fontWeight="bold">⚠️</text>
            )}
            <text x="250" y="354" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">C</text>
          </g>

          {/* Gate D (West) */}
          <g
            cursor="pointer"
            onClick={() => handleGateClick(gates[3])}
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleGateClick(gates[3])}
            aria-label="Gate D Status"
          >
            <circle
              cx="60"
              cy="200"
              r={selectedGateId === 'gate-d' ? '18' : '14'}
              fill={selectedGateId === 'gate-d' ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0,0,0,0.6)'}
              stroke={accessMode ? '#00f0ff' : getGateColor(gates[3].congestion)}
              strokeWidth="3"
            />
            {accessMode && <circle cx="60" cy="200" r="6" fill="#00f0ff" />}
            <text x="60" y="204" fill="#ffffff" fontSize="10" textAnchor="middle" fontWeight="bold">D</text>
          </g>

          {/* Compass / Key */}
          <text x="50" y="50" fill="var(--color-text-muted)" fontSize="12" fontWeight="bold">N</text>
          <line x1="50" y1="55" x2="50" y2="70" stroke="var(--color-text-muted)" strokeWidth="1" />
          <polygon points="47,60 50,53 53,60" fill="var(--color-text-muted)" />
        </svg>
      </div>

      {/* Selected Node Details Box */}
      <div style={infoGridStyle}>
        {selectedGateId ? (
          (() => {
            const gate = gates.find(g => g.id === selectedGateId);
            if (!gate) return null;
            return (
              <div style={gateCardStyle}>
                <div style={cardHeaderStyle}>
                  <h3 style={cardTitleStyle}>📍 Selected: {gate.name}</h3>
                  <span style={{
                    ...badgeStyle,
                    backgroundColor: gate.congestion === 'high' ? 'var(--color-danger-bg)' : gate.congestion === 'medium' ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
                    color: gate.congestion === 'high' ? 'var(--color-danger)' : gate.congestion === 'medium' ? 'var(--color-warning)' : 'var(--color-success)'
                  }}>
                    {gate.congestion.toUpperCase()} TRAFFIC
                  </span>
                </div>
                
                <div style={cardGridStyle}>
                  <div>
                    <span style={labelLightStyle}>Estimated Wait:</span>
                    <p style={valueStyle}>{gate.estimatedWait} minutes</p>
                  </div>
                  <div>
                    <span style={labelLightStyle}>Flow Rate:</span>
                    <p style={valueStyle}>{gate.flowRate} fans/min</p>
                  </div>
                  <div>
                    <span style={labelLightStyle}>Step-Free Ramps:</span>
                    <p style={valueStyle}>{gate.accessibleRamps ? '✅ Available' : '❌ Stairs Only'}</p>
                  </div>
                </div>

                {accessMode && !gate.accessibleRamps && (
                  <div style={alertBoxStyle}>
                    <ShieldAlert size={16} />
                    <span><strong>Accessibility Notice:</strong> Gate C does not support step-free access. Use Gate B or D for elevator/ramp entries.</span>
                  </div>
                )}
                {gate.notes && <p style={notesStyle}>💡 <em>{gate.notes}</em></p>}
              </div>
            );
          })()
        ) : (
          <div style={noSelectionStyle}>
            <Info size={20} color="var(--color-text-muted)" />
            <span>Select a gate (A, B, C, D) on the map to inspect live queues.</span>
          </div>
        )}

        {selectedSection && (
          <div style={sectionCardStyle}>
            <h3 style={cardTitleStyle}>🧭 Route to Section {selectedSection}</h3>
            {selectedGateId ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Active path plotted from **{gates.find(g => g.id === selectedGateId)?.name.split(' ')[0]}** to **Section {selectedSection}**. Ask the AI Assistant for step-by-step navigation instructions.
              </p>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                Section selected. Now select an entry gate to display the custom wayfinding path.
              </p>
            )}
            <button onClick={() => setSelectedSection(null)} style={clearSecBtnStyle}>Clear Destination</button>
          </div>
        )}
      </div>
    </section>
  );
});

// styling objects
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 700,
};

const descStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--color-text-secondary)',
  marginTop: '4px',
};

const accessBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--color-text-primary)',
  borderRadius: '8px',
  padding: '6px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 600,
  transition: 'all 0.2s ease',
};

const activeAccessBtnStyle: React.CSSProperties = {
  ...accessBtnStyle,
  background: 'rgba(0, 240, 255, 0.15)',
  borderColor: 'var(--color-primary)',
  color: 'var(--color-primary)',
  boxShadow: '0 0 12px rgba(0, 240, 255, 0.2)',
};

const mapWrapperStyle: React.CSSProperties = {
  background: 'rgba(5, 7, 18, 0.4)',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid var(--border-subtle)',
  display: 'flex',
  justifyContent: 'center',
};

const svgStyle: React.CSSProperties = {
  maxHeight: '340px',
  width: '100%',
};

const infoGridStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const gateCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  padding: '16px',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
  flexWrap: 'wrap',
  gap: '8px',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
};

const badgeStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  fontWeight: 700,
  padding: '3px 8px',
  borderRadius: '4px',
};

const cardGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
  gap: '16px',
};

const labelLightStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-text-secondary)',
};

const valueStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#ffffff',
  marginTop: '4px',
};

const notesStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
  marginTop: '12px',
};

const alertBoxStyle: React.CSSProperties = {
  background: 'var(--color-danger-bg)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: 'var(--color-danger)',
  borderRadius: '6px',
  padding: '10px',
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '12px',
};

const noSelectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '16px',
  borderRadius: '8px',
  background: 'rgba(255,255,255,0.01)',
  border: '1px dashed var(--border-subtle)',
  color: 'var(--color-text-secondary)',
  fontSize: '0.8rem',
};

const sectionCardStyle: React.CSSProperties = {
  background: 'rgba(0, 240, 255, 0.03)',
  border: '1px solid rgba(0, 240, 255, 0.1)',
  borderRadius: '8px',
  padding: '12px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const clearSecBtnStyle: React.CSSProperties = {
  alignSelf: 'flex-start',
  background: 'transparent',
  border: 'none',
  color: 'var(--color-accent)',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  padding: 0,
  textDecoration: 'underline',
};

export default StadiumMap;
