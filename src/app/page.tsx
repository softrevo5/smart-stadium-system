'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Header from '../components/Header';
import StadiumMap from '../components/StadiumMap';
import IncidentCommand from '../components/IncidentCommand';
import TransitSustainability from '../components/TransitSustainability';
import AnalyticsPanel from '../components/AnalyticsPanel';
import AIAssistant from '../components/AIAssistant';
import { StadiumState, Incident, GateStatus } from '../lib/types';
import { INITIAL_STADIUM_STATE, SCENARIOS } from '../lib/stadiumConfig';
import { Shield, Sparkles, Info } from 'lucide-react';

export default function Home() {
  const [role, setRole] = useState<string>('fan');
  const [stadiumState, setStadiumState] = useState<StadiumState>(SCENARIOS.arrival.state);
  const [selectedGateId, setSelectedGateId] = useState<string | null>(null);
  const [systemMessage, setSystemMessage] = useState<string>('');
  const [activeScenario, setActiveScenario] = useState<string>('arrival');
  interface WeatherData {
    tempF: number;
    description: string;
    precipitation: number;
    cloudCover: number;
  }

  const [weather, setWeather] = useState<WeatherData | null>(null);

  const stadiumStateRef = useRef<StadiumState>(stadiumState);
  const weatherRef = useRef<WeatherData | null>(null);

  useEffect(() => {
    stadiumStateRef.current = stadiumState;
  }, [stadiumState]);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  // Fetch real-time weather data for MetLife Stadium (East Rutherford, NJ)
  useEffect(() => {
    let isMounted = true;
    async function fetchWeather() {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=40.8128&longitude=-74.0743&current=temperature_2m,precipitation,weather_code,cloud_cover'
        );
        const data = await res.json();
        if (data && data.current && isMounted) {
          const tempC = data.current.temperature_2m;
          const tempF = Math.round((tempC * 9) / 5 + 32);
          const precip = data.current.precipitation || 0;
          const cloud = data.current.cloud_cover || 0;
          const code = data.current.weather_code || 0;

          let desc = 'Clear Sky';
          if (code >= 1 && code <= 3) desc = 'Partly Cloudy';
          else if (code === 45 || code === 48) desc = 'Foggy';
          else if (code >= 51 && code <= 55) desc = 'Light Drizzle';
          else if (code >= 61 && code <= 65) desc = 'Rainy';
          else if (code >= 71 && code <= 77) desc = 'Snowy';
          else if (code >= 80 && code <= 82) desc = 'Rain Showers';
          else if (code >= 95) desc = 'Thunderstorms';

          const weatherData = {
            tempF,
            description: desc,
            precipitation: precip,
            cloudCover: cloud
          };
          setWeather(weatherData);

          // Drive initial stadium state metrics using the live weather!
          setStadiumState(prev => {
            const baseSolar = 520;
            const newSolar = Math.round(baseSolar * ((100 - cloud) / 100));
            const hasRain = precip > 0;
            const updatedGates = prev.gates.map(gate => {
              if (hasRain) {
                return {
                  ...gate,
                  estimatedWait: gate.estimatedWait + 3,
                  notes: gate.notes ? `${gate.notes}. ⚠️ Rain delays active.` : '⚠️ Rain delays active.'
                };
              }
              return gate;
            });

            return {
              ...prev,
              solarPowerOutput: newSolar,
              gates: updatedGates
            };
          });
        }
      } catch (err) {
        console.error('Failed to fetch real MetLife weather data:', err);
      }
    }
    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, []);

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

        // Increment green stats dynamically using real weather data references
        const currentCloudCover = weatherRef.current ? weatherRef.current.cloudCover : 15;
        const currentPrecip = weatherRef.current ? weatherRef.current.precipitation : 0;
        
        const solarChange = Math.floor(Math.random() * 11) - 5; // -5 to +5 kW fluctuation
        const baseSolar = Math.round(520 * ((100 - currentCloudCover) / 100));
        const newSolar = Math.max(10, Math.min(650, baseSolar + solarChange));
        
        // Boost water saved from rainwater harvesting if raining
        const waterChange = currentPrecip > 0 
          ? (Math.floor(Math.random() * 50) + 30) 
          : (Math.floor(Math.random() * 8) + 2);
        const newWater = prev.waterSaved + waterChange;

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

  const handleSelectGate = useCallback((gate: GateStatus) => {
    setSelectedGateId(gate.id);
  }, []);

  const handleUpdateIncidents = useCallback((updatedIncidents: Incident[]) => {
    setStadiumState(prev => ({
      ...prev,
      incidents: updatedIncidents
    }));
  }, []);

  const triggerSystemMessage = useCallback((msg: string) => {
    setSystemMessage(msg);
    // Clear system message shortly after so it can be re-triggered
    setTimeout(() => setSystemMessage(''), 1000);
  }, []);

  const handleSwitchScenario = useCallback((scenarioKey: string) => {
    setActiveScenario(scenarioKey);
    const selected = SCENARIOS[scenarioKey];
    if (selected) {
      let state = { ...selected.state };
      if (weatherRef.current) {
        // Overlay live weather variables onto scenario selection
        const cloud = weatherRef.current.cloudCover;
        const precip = weatherRef.current.precipitation;
        state.solarPowerOutput = Math.round(520 * ((100 - cloud) / 100));
        if (precip > 0) {
          state.gates = state.gates.map(gate => ({
            ...gate,
            estimatedWait: gate.estimatedWait + 3,
            notes: gate.notes ? `${gate.notes}. ⚠️ Rain delays active.` : '⚠️ Rain delays active.'
          }));
        }
      }
      setStadiumState(state);
      triggerSystemMessage(`Switched stadium mode to: ${selected.name}.`);
    }
  }, [triggerSystemMessage]);


  // Memoize derived count to avoid recalculation on every render
  const activeIncidentCount = useMemo(
    () => stadiumState.incidents.filter(i => i.status !== 'resolved').length,
    [stadiumState.incidents]
  );

  return (
    <div style={appContainerStyle}>
      <Header
        role={role}
        setRole={setRole}
        attendanceCount={stadiumState.currentCapacity}
        maxAttendance={stadiumState.totalAttendance}
        incidentCount={activeIncidentCount}
        weather={weather}
      />

      {/* Match Day Scenario Simulation Controller */}
      <div style={scenarioBarStyle} className="glass-panel" role="region" aria-label="Simulation Scenario Control Panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
          <Sparkles size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em' }}>TOURNAMENT MATCH SIMULATOR:</span>
        </div>
        <div style={scenarioButtonsContainerStyle}>
          {Object.entries(SCENARIOS).map(([key, scenario]) => (
            <button
              key={key}
              data-testid={`scenario-btn-${key}`}
              onClick={() => handleSwitchScenario(key)}
              style={activeScenario === key ? activeScenarioBtnStyle : scenarioBtnStyle}
              title={scenario.description}
              aria-pressed={activeScenario === key}
              aria-label={`Scenario: ${scenario.name} — ${scenario.description}`}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      <main style={mainContentStyle} className="dashboard-grid">
        {/* LEFT COLUMN: Map and analytics depending on role */}
        <div style={leftColStyle}>
          
          {/* Banner notification for accessibility and safety */}
          <div style={infoBannerStyle} role="region" aria-label="Stadium Banner Notifications">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {stadiumState.timeUntilMatch.includes('EVACUATION') ? (
                  <span style={{ color: 'var(--color-danger)' }}>⚠️ EMERGENCY EVACUATION ACTIVE: Directing all fans to nearest exit paths!</span>
                ) : role === 'fan' ? (
                  '🏟️ Spectator Guide: Reusable plastic bottles (<750ml) permitted. Use hydration stations!'
                ) : (
                  `🛡️ Operations Desk: Shift active. Dispatch is synced with local emergency services.`
                )}
              </span>
            </div>
            {weather && (
              <div style={weatherWidgetStyle} title="Live weather at MetLife Stadium (East Rutherford, NJ)">
                <span>📍 MetLife weather: <strong>{weather.tempF}°F</strong> ({weather.description})</span>
              </div>
            )}
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
        stadiumStateRef={stadiumStateRef}
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

const scenarioBarStyle: React.CSSProperties = {
  margin: '16px auto 0 auto',
  width: 'calc(100% - 48px)',
  maxWidth: 'var(--container-max)',
  padding: '12px 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px',
  borderRadius: '12px',
};

const scenarioButtonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const scenarioBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--color-text-secondary)',
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '0.8rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const activeScenarioBtnStyle: React.CSSProperties = {
  ...scenarioBtnStyle,
  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(112, 0, 255, 0.15))',
  border: '1px solid rgba(0, 240, 255, 0.4)',
  color: 'var(--color-primary)',
  boxShadow: '0 0 10px rgba(0, 240, 255, 0.1)',
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
};

// Shared column layout style (left and right columns are structurally identical)
const colStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
};

const leftColStyle = colStyle;
const rightColStyle = colStyle;

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

const weatherWidgetStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  padding: '3px 8px',
  fontSize: '0.75rem',
  color: 'var(--color-success)',
  fontWeight: 600,
};

