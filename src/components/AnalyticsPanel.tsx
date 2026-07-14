'use client';

import React, { useMemo } from 'react';
import { StadiumState } from '../lib/types';
import { BarChart3, Clock, Zap, Trophy, Navigation } from 'lucide-react';

interface AnalyticsProps {
  stadiumState: StadiumState;
}

const AnalyticsPanel = React.memo(function AnalyticsPanel({ stadiumState }: AnalyticsProps) {
  // Memoize data slices to avoid re-renders when parent state changes unrelated fields
  const gatesData = useMemo(() => stadiumState.gates, [stadiumState.gates]);
  const concessionsData = useMemo(() => stadiumState.concessions, [stadiumState.concessions]);

  // Memoize the worst-gate info for dynamic aria-label
  const worstGate = useMemo(
    () => [...gatesData].sort((a, b) => b.estimatedWait - a.estimatedWait)[0],
    [gatesData]
  );
  const worstConcession = useMemo(
    () => [...concessionsData].sort((a, b) => b.estimatedWait - a.estimatedWait)[0],
    [concessionsData]
  );

  // Crowd routing recommendation derived from live gate congestion
  const crowdRecommendation = useMemo(() => {
    const safestGate = [...gatesData].sort((a, b) => a.estimatedWait - b.estimatedWait)[0];
    const highGates = gatesData.filter(g => g.congestion === 'high').map(g => g.name.split(' ')[1]);
    if (highGates.length > 0) {
      return {
        priority: 'high' as const,
        message: `⚠️ Redirect fans from Gate${highGates.length > 1 ? 's' : ''} ${highGates.join(', ')} to ${safestGate.name.split(' ')[1]} (${safestGate.estimatedWait}m wait). Open additional scanning lanes at congested entries.`,
        action: `Dispatch 3 crowd stewards to ${highGates[0]}, activate overflow queue barriers.`
      };
    }
    return {
      priority: 'normal' as const,
      message: `✅ Crowd flow balanced. ${safestGate.name.split(' ')[1]} has lowest wait at ${safestGate.estimatedWait}m. Maintain current staffing.`,
      action: 'No immediate rerouting required.'
    };
  }, [gatesData]);

  return (
    <section className="glass-panel" style={panelStyle} aria-labelledby="analytics-title">
      <div style={titleContainerStyle}>
        <BarChart3 size={20} color="var(--color-primary)" />
        <h2 id="analytics-title" style={titleStyle}>📊 Stadium Operations Analytics</h2>
      </div>

      <div style={chartsGridStyle}>
        {/* Gate Wait Times Chart */}
        <div style={chartCardStyle}>
          <div style={chartHeaderStyle}>
            <Clock size={16} color="var(--color-primary)" />
            <h3 style={chartTitleStyle}>Live Gate Wait Times (Mins)</h3>
          </div>

          <div style={svgWrapperStyle}>
            <svg 
              viewBox="0 0 300 150" 
              style={svgStyle}
              role="img"
              aria-label={`Bar chart: Gate wait times. Highest: ${worstGate?.name} at ${worstGate?.estimatedWait} minutes (${worstGate?.congestion} congestion).`}
            >
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="280" y2="20" stroke="rgba(255, 255, 255, 0.05)" />
              <line x1="40" y1="60" x2="280" y2="60" stroke="rgba(255, 255, 255, 0.05)" />
              <line x1="40" y1="100" x2="280" y2="100" stroke="rgba(255, 255, 255, 0.05)" />
              <line x1="40" y1="120" x2="280" y2="120" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />

              {/* Y Axis labels */}
              <text x="30" y="24" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">20m</text>
              <text x="30" y="64" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">10m</text>
              <text x="30" y="104" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">2m</text>
              <text x="30" y="124" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">0m</text>

              {/* Bars */}
              {gatesData.map((gate, idx) => {
                const barWidth = 32;
                const gap = 24;
                const x = 50 + idx * (barWidth + gap);
                // Math.min/Max to scale values (Max wait is around 20 mins)
                const height = Math.min((gate.estimatedWait / 20) * 100, 100);
                const y = 120 - height;
                
                const barColor = 
                  gate.congestion === 'high' ? 'url(#redGlow)' : 
                  gate.congestion === 'medium' ? 'url(#yellowGlow)' : 
                  'url(#cyanGlow)';

                return (
                  <g key={gate.id}>
                    {/* Glow effect */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      fill={barColor}
                      rx="4"
                    />
                    {/* Value text on top of bar */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 4}
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {gate.estimatedWait}m
                    </text>
                    {/* Gate Label */}
                    <text
                      x={x + barWidth / 2}
                      y="134"
                      fill="var(--color-text-secondary)"
                      fontSize="8"
                      textAnchor="middle"
                    >
                      Gate {gate.name.split(' ')[1]}
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="cyanGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="rgba(0, 240, 255, 0.2)" />
                </linearGradient>
                <linearGradient id="yellowGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="rgba(245, 158, 11, 0.2)" />
                </linearGradient>
                <linearGradient id="redGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="rgba(239, 68, 68, 0.2)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Concessions Queues */}
        <div style={chartCardStyle}>
          <div style={chartHeaderStyle}>
            <Zap size={16} color="var(--color-accent)" />
            <h3 style={chartTitleStyle}>Concessions Wait Times (Mins)</h3>
          </div>

          <div style={svgWrapperStyle}>
            <svg 
              viewBox="0 0 300 150" 
              style={svgStyle}
              role="img"
              aria-label={`Bar chart: Concession wait times. Highest: ${worstConcession?.name} at ${worstConcession?.estimatedWait} minutes.`}
            >
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="280" y2="20" stroke="rgba(255, 255, 255, 0.05)" />
              <line x1="40" y1="60" x2="280" y2="60" stroke="rgba(255, 255, 255, 0.05)" />
              <line x1="40" y1="100" x2="280" y2="100" stroke="rgba(255, 255, 255, 0.05)" />
              <line x1="40" y1="120" x2="280" y2="120" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1" />

              {/* Y Axis labels */}
              <text x="30" y="24" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">25m</text>
              <text x="30" y="64" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">12m</text>
              <text x="30" y="104" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">5m</text>
              <text x="30" y="124" fill="var(--color-text-muted)" fontSize="8" textAnchor="end">0m</text>

              {/* Bars */}
              {concessionsData.map((conc, idx) => {
                const barWidth = 32;
                const gap = 24;
                const x = 50 + idx * (barWidth + gap);
                // Math.min/Max to scale values (Max wait is 25 mins)
                const height = Math.min((conc.estimatedWait / 25) * 100, 100);
                const y = 120 - height;

                return (
                  <g key={conc.id}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      fill="url(#purpleGlow)"
                      rx="4"
                    />
                    <text
                      x={x + barWidth / 2}
                      y={y - 4}
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {conc.estimatedWait}m
                    </text>
                    <text
                      x={x + barWidth / 2}
                      y="134"
                      fill="var(--color-text-secondary)"
                      fontSize="7"
                      textAnchor="middle"
                    >
                      {conc.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7000ff" />
                  <stop offset="100%" stopColor="rgba(112, 0, 255, 0.2)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* AI Crowd Routing Recommendation */}
      <div
        style={{
          ...chartCardStyle,
          borderColor: crowdRecommendation.priority === 'high' ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)',
          background: crowdRecommendation.priority === 'high' ? 'rgba(239,68,68,0.05)' : 'rgba(16,185,129,0.04)'
        }}
        role="region"
        aria-label="AI Crowd Routing Recommendation"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Navigation size={16} color={crowdRecommendation.priority === 'high' ? 'var(--color-danger)' : 'var(--color-success)'} />
          <strong style={{ fontSize: '0.85rem', color: crowdRecommendation.priority === 'high' ? 'var(--color-danger)' : 'var(--color-success)' }}>
            🤖 AI Crowd Routing Advisory
          </strong>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '6px', lineHeight: 1.5 }}>
          {crowdRecommendation.message}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          Recommended action: {crowdRecommendation.action}
        </p>
      </div>

      {/* Tournament Match Schedule */}
      <div style={{ ...chartCardStyle, borderColor: 'rgba(0,240,255,0.2)' }} role="region" aria-label="Match Schedule">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Trophy size={16} color="var(--color-primary)" />
          <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>🏆 FIFA World Cup 2026 — Match Status</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Current Venue Phase</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{stadiumState.timeUntilMatch}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Attendance Filled</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)' }}>
              {Math.round((stadiumState.currentCapacity / stadiumState.totalAttendance) * 100)}% capacity
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Active Incidents</p>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: stadiumState.incidents.filter(i => i.status !== 'resolved').length > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
              {stadiumState.incidents.filter(i => i.status !== 'resolved').length} open
            </p>
          </div>
        </div>
      </div>

      {/* Screen Reader Table Backup for high accessibility */}
      <table style={srTableStyle}>
        <caption>Live Stadium Operation Metrics Data Table</caption>
        <thead>
          <tr>
            <th scope="col">Gate / Concession</th>
            <th scope="col">Estimated Wait Time</th>
            <th scope="col">Traffic Level / Type</th>
          </tr>
        </thead>
        <tbody>
          {gatesData.map(gate => (
            <tr key={gate.id}>
              <td>{gate.name}</td>
              <td>{gate.estimatedWait} minutes</td>
              <td>{gate.congestion} congestion</td>
            </tr>
          ))}
          {concessionsData.map(conc => (
            <tr key={conc.id}>
              <td>{conc.name}</td>
              <td>{conc.estimatedWait} minutes</td>
              <td>{conc.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
});

// styling definitions
const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const titleContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 700,
};

const chartsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '20px',
};

const chartCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.01)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '10px',
  padding: '16px',
};

const chartHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '16px',
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
};

const svgWrapperStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
};

const svgStyle: React.CSSProperties = {
  maxHeight: '180px',
  width: '100%',
};

// Hide table from visual layout but keep for screen readers
const srTableStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  border: '0',
};

export default AnalyticsPanel;
