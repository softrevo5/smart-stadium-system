'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StadiumMap from '../components/StadiumMap';
import IncidentCommand from '../components/IncidentCommand';
import TransitSustainability from '../components/TransitSustainability';
import AnalyticsPanel from '../components/AnalyticsPanel';
import AIAssistant from '../components/AIAssistant';
import { INITIAL_STADIUM_STATE, StadiumState, Incident, GateStatus } from '../lib/mockData';
import { Shield, Sparkles, Info } from 'lucide-react';

export default function Home() {
  const [role, setRole] = useState<string>('fan');
  const [stadiumState, setStadiumState] = useState<StadiumState>(INITIAL_STADIUM_STATE);
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [systemMessage, setSystemMessage] = useState<string>('');

  // Live simulation ticks (run every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setStadiumState(prev => {
        // Tweak gate congestion and wait times slightly
        const updatedGates = prev.gates.map(gate => {
          const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
          const newWait = Math.max(1, gate.estimatedWait + change);
          
          // Re-evaluate congestion label based on wait
          let newCongestion: 'low' | 'medium' | 'high' = 'low';
          if (newWait > 12) newCongestion = 'high';
          else if (newWait > 5) newCongestion = 'medium';

          return {
            ...gate,
            estimatedWait: newWait,
            flowRate: Math.max(20, gate.flowRate + (Math.floor(Math.random() * 11) - 5)),
            congestion: newCongestion
          };
        });

        // Tweak concessions wait times
        const updatedConcessions = prev.concessions.map(conc => {
          const change = Math.floor(Math.random() * 3) - 1;
          const newWait = Math.max(1, conc.estimatedWait + change);
          return {
            ...conc,
            estimatedWait: newWait,
            queueSize: Math.max(1, conc.queueSize + (Math.floor(Math.random() * 5) - 2))
          };
        });

        // Increment green stats
        const solarChange = Math.floor(Math.random() * 11) - 5; // -5 to +5 kW fluctuation
        const newSolar = Math.max(380, prev.solarPowerOutput + solarChange);
        const newWater = prev.waterSaved + Math.floor(Math.random() * 8) + 2; // +2 to 9 gallons saved

        return {
          ...prev,
          gates: updatedGates,
          concessions: updatedConcessions,
          solarPowerOutput: newSolar,
          waterSaved: newWater
        };
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectGate = (gate: GateStatus) => {
    setSelectedGateId(gate.id);
  };

  const handleUpdateIncidents = (updatedIncidents: Incident[]) => {
    setStadiumState(prev => ({
      ...prev,
      incidents: updatedIncidents
    }));
  };

  const triggerSystemMessage = (msg: string) => {
    setSystemMessage(msg);
    // Clear system message shortly after so it can be re-triggered
    setTimeout(() => setSystemMessage(''), 1000);
  };

  // Filter out resolved incidents count
  const activeIncidentCount = stadiumState.incidents.filter(i => i.status !== 'resolved').length;

  return (
    <div style={appContainerStyle}>
      <Header
        role={role}
        setRole={setRole}
        attendanceCount={stadiumState.currentCapacity}
        maxAttendance={stadiumState.totalAttendance}
        incidentCount={activeIncidentCount}
      />

      <main style={mainContentStyle} className="dashboard-grid">
        {/* LEFT COLUMN: Map and analytics depending on role */}
        <div style={leftColStyle}>
          
          {/* Banner notification for accessibility and safety */}
          <div style={infoBannerStyle} role="region" aria-label="Stadium Banner Notifications">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {role === 'fan' ? (
                  '🏟️ Spectator Guide: Reusable plastic bottles (<750ml) permitted. Use hydration stations!'
                ) : (
                  `🛡️ Operations Desk: Shift active. Dispatch is synced with local emergency services.`
                )}
              </span>
            </div>
            <span style={liveIndicatorStyle}>
              <span className="ping-indicator" style={{ color: 'var(--color-accent)' }} />
              <span>LIVE SIMULATOR</span>
            </span>
          </div>

          <StadiumMap
            gates={stadiumState.gates}
            onSelectGate={handleSelectGate}
            selectedGateId={selectedGateId}
          />

          {/* Fan Layout - Transit & sustainability */}
          {role === 'fan' && (
            <TransitSustainability stadiumState={stadiumState} />
          )}

          {/* Organizer / Staff Layout - Analytics Panel */}
          {(role === 'organizer' || role === 'staff') && (
            <AnalyticsPanel stadiumState={stadiumState} />
          )}

          {/* Volunteer Layout - Transit info for guiding fans */}
          {role === 'volunteer' && (
            <TransitSustainability stadiumState={stadiumState} />
          )}
        </div>

        {/* RIGHT COLUMN: Incidents / Control Center depending on role */}
        <div style={rightColStyle}>
          {role === 'fan' ? (
            <div className="glass-panel" style={cardGuideStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
                <Sparkles size={18} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Match Day Guide</h3>
              </div>
              <p style={guideTextStyle}>
                This dashboard helps you navigate **MetLife Stadium** during the **FIFA World Cup 2026**. 
              </p>
              <div style={guideItemContainerStyle}>
                <div style={guideItemStyle}>
                  <strong>🚦 Avoid Gate Lines</strong>
                  <p>Click Gates on the map above to view queue wait times. Choose Gates with low congestion.</p>
                </div>
                <div style={guideItemStyle}>
                  <strong>♿ Wheelchair Access</strong>
                  <p>Toggle &quot;Accessibility View&quot; to view step-free entries. Note: Gate C contains stairs only.</p>
                </div>
                <div style={guideItemStyle}>
                  <strong>🚌 Green Travel</strong>
                  <p>Use the Travel Planner below to choose low-carbon transit routes and save CO₂ emissions.</p>
                </div>
              </div>
              <div style={tipStyle}>
                <Info size={14} color="var(--color-primary)" />
                <span>Tip: Click the chat bubble in the bottom right to ask Gemini custom stadium directions.</span>
              </div>
            </div>
          ) : (
            <IncidentCommand
              stadiumState={stadiumState}
              onUpdateIncidents={handleUpdateIncidents}
              onSendSystemMessage={triggerSystemMessage}
            />
          )}
        </div>
      </main>

      {/* Floating Chat Copilot */}
      <AIAssistant
        role={role}
        stadiumState={stadiumState}
        systemMessage={systemMessage}
      />
    </div>
  );
}

// Styling definitions
const appContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
};

const leftColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const rightColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const infoBannerStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '10px',
  padding: '10px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
};

const liveIndicatorStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  color: 'var(--color-text-secondary)',
};

const cardGuideStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const guideTextStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--color-text-secondary)',
  lineHeight: '1.4',
};

const guideItemContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginTop: '8px',
};

const guideItemStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  padding: '10px 12px',
  fontSize: '0.8rem',
};

const tipStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '0.75rem',
  color: 'var(--color-text-secondary)',
  background: 'rgba(0, 240, 255, 0.03)',
  padding: '8px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(0, 240, 255, 0.1)',
  marginTop: '12px',
};
