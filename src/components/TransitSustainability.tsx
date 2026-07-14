'use client';

import React, { useState } from 'react';
import { StadiumState } from '../lib/types';
import { REAL_TRANSIT_OPTIONS } from '../lib/stadiumConfig';
import { Leaf, Sparkles } from 'lucide-react';

interface TransitProps {
  stadiumState: StadiumState;
}

const TransitSustainability = React.memo(function TransitSustainability({ stadiumState }: TransitProps) {
  const [selectedTransit, setSelectedTransit] = useState<string>('metro');
  const [distanceKm, setDistanceKm] = useState<number>(15);

  const activeTransit = REAL_TRANSIT_OPTIONS.find(t => t.id === selectedTransit) || REAL_TRANSIT_OPTIONS[0];

  // Calculate carbon offset based on distance
  // Baseline car emission: ~0.18 kg CO2 per km
  // Transit saving multiplier: e.g. Metro saves 80% compared to car
  const calculateTotalSaved = () => {
    return (distanceKm * activeTransit.carbonSavedKg / 10).toFixed(1);
  };

  return (
    <section className="glass-panel" style={panelStyle} aria-labelledby="eco-title">
      <div style={titleContainerStyle}>
        <Leaf size={20} color="var(--color-success)" />
        <h2 id="eco-title" style={titleStyle}>🌱 Transit & Sustainability</h2>
      </div>

      <div style={twoColStyle}>
        {/* Transit Planner */}
        <div style={colStyle}>
          <h3 style={sectionTitleStyle}>🚀 Green Travel Planner</h3>
          
          <div style={formGroupStyle}>
            <label htmlFor="transit-select" style={labelStyle}>Choose Eco-Transit Route:</label>
            <select 
              id="transit-select" 
              value={selectedTransit} 
              onChange={e => setSelectedTransit(e.target.value)}
              style={selectStyle}
            >
              {REAL_TRANSIT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {opt.name} ({opt.ecoRating} Option)
                </option>
              ))}
            </select>
          </div>

          <div style={formGroupStyle}>
            <label htmlFor="distance-input" style={labelStyle}>
              Approx. Distance to Arena: <strong>{distanceKm} km</strong>
            </label>
            <input 
              id="distance-input"
              type="range" 
              min={5} 
              max={80} 
              value={distanceKm} 
              onChange={e => setDistanceKm(Number(e.target.value))}
              style={rangeStyle}
            />
          </div>

          <div style={transitCardStyle}>
            <div style={cardHeaderStyle}>
              <h4 style={cardTitleStyle}>{activeTransit.name}</h4>
              <span style={ecoBadgeStyle}>{activeTransit.ecoRating}</span>
            </div>
            <div style={transitStatsStyle}>
              <div>
                <span style={labelLightStyle}>Travel Time:</span>
                <p style={valueStyle}>{activeTransit.timeMin} mins</p>
              </div>
              <div>
                <span style={labelLightStyle}>Fare/Cost:</span>
                <p style={valueStyle}>{activeTransit.cost}</p>
              </div>
              <div>
                <span style={labelLightStyle}>Estimated Status:</span>
                <p style={{ ...valueStyle, color: 'var(--color-success)', fontSize: '0.8rem' }}>{activeTransit.status}</p>
              </div>
            </div>

            <div style={offsetBoxStyle}>
              <Leaf size={16} color="var(--color-success)" />
              <span>CO₂ Offset: <strong>{calculateTotalSaved()} kg CO₂</strong> saved vs. personal car</span>
            </div>
          </div>
        </div>

        {/* Stadium Sustainability Stats */}
        <div style={colStyle}>
          <h3 style={sectionTitleStyle}>🔋 Arena Eco Metrics</h3>

          <div style={gridStatsStyle}>
            <div style={metricCardStyle}>
              <span style={labelLightStyle}>Solar Microgrid</span>
              <p style={metricValueStyle}>{stadiumState.solarPowerOutput} <span style={unitStyle}>kW</span></p>
              <div style={progressBarContainerStyle}>
                <div style={{ ...progressBarFillStyle, width: '42%', backgroundColor: 'var(--color-primary)' }} />
              </div>
              <span style={metricFootStyle}>Supplying 34% total peak load</span>
            </div>

            <div style={metricCardStyle}>
              <span style={labelLightStyle}>Waste Diversion</span>
              <p style={metricValueStyle}>{stadiumState.wasteDiversion}%</p>
              <div style={progressBarContainerStyle}>
                <div style={{ ...progressBarFillStyle, width: `${stadiumState.wasteDiversion}%`, backgroundColor: 'var(--color-success)' }} />
              </div>
              <span style={metricFootStyle}>Compost & recycled streams</span>
            </div>

            <div style={metricCardStyle}>
              <span style={labelLightStyle}>Water Conserved</span>
              <p style={metricValueStyle}>{stadiumState.waterSaved.toLocaleString()} <span style={unitStyle}>Gal</span></p>
              <div style={progressBarContainerStyle}>
                <div style={{ ...progressBarFillStyle, width: '75%', backgroundColor: 'var(--color-info)' }} />
              </div>
              <span style={metricFootStyle}>Rainwater capture & low-flow systems</span>
            </div>
          </div>

          <div style={greenFoodStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
              <Sparkles size={14} />
              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>Concessions Eco-Item Recommendation:</span>
            </div>
            <p style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--color-text-secondary)' }}>
              Visit <strong>Azteca Tacos & Empanadas</strong> and try the <strong>Plant-based Chorizo Tacos</strong>. Made from locally sourced, regenerative ingredients, saving 1.2kg of waste per meal!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

// Styling definitions
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

const twoColStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '24px',
};

const colStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 600,
  borderBottom: '1px solid var(--border-subtle)',
  paddingBottom: '6px',
  color: 'var(--color-text-primary)',
};

const formGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  color: 'var(--color-text-secondary)',
};

const selectStyle: React.CSSProperties = {
  background: 'rgba(5, 7, 18, 0.6)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '6px',
  padding: '8px 12px',
  color: '#ffffff',
  fontSize: '0.85rem',
  outline: 'none',
  cursor: 'pointer',
};

const rangeStyle: React.CSSProperties = {
  width: '100%',
  accentColor: 'var(--color-primary)',
  background: 'rgba(255,255,255,0.1)',
  height: '6px',
  borderRadius: '3px',
  outline: 'none',
  cursor: 'pointer',
};

const transitCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.015)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: 600,
};

const ecoBadgeStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 700,
  padding: '2px 6px',
  background: 'var(--color-success-bg)',
  color: 'var(--color-success)',
  borderRadius: '4px',
};

const transitStatsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '12px',
};

const labelLightStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  color: 'var(--color-text-secondary)',
};

const valueStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 700,
  marginTop: '2px',
  color: '#ffffff',
};

const offsetBoxStyle: React.CSSProperties = {
  background: 'var(--color-success-bg)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  color: 'var(--color-success)',
  borderRadius: '6px',
  padding: '8px 10px',
  fontSize: '0.75rem',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const gridStatsStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: '12px',
};

const metricCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.015)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
};

const metricValueStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 800,
  color: '#ffffff',
  marginTop: '4px',
};

const unitStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
};

const progressBarContainerStyle: React.CSSProperties = {
  height: '4px',
  background: 'rgba(255,255,255,0.08)',
  borderRadius: '2px',
  marginTop: '8px',
  overflow: 'hidden',
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  borderRadius: '2px',
};

const metricFootStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  color: 'var(--color-text-muted)',
  marginTop: '6px',
};

const greenFoodStyle: React.CSSProperties = {
  background: 'rgba(0, 240, 255, 0.03)',
  border: '1px solid rgba(0, 240, 255, 0.1)',
  borderRadius: '8px',
  padding: '12px',
  marginTop: '8px',
};

export default TransitSustainability;
