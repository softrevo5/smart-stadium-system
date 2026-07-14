'use client';

import React from 'react';
import { User, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  role: string;
  setRole: (role: string) => void;
  attendanceCount: number;
  maxAttendance: number;
  incidentCount: number;
}

export default function Header({ role, setRole, attendanceCount, maxAttendance, incidentCount }: HeaderProps) {

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  return (
    <header className="header-container" style={headerStyle}>
      <div className="header-brand" style={brandStyle}>
        <div className="logo-glow" style={logoGlowStyle}></div>
        <h1 style={titleStyle} className="glow-text-primary">
          🏆 METLIFE STADIUM <span style={subTitleStyle}>FIFA 2026</span>
        </h1>
        <div style={tagStyle}>SMART STADIUM SYSTEM</div>
      </div>

      <div className="header-metrics" style={metricsContainerStyle}>
        <div style={metricStyle} title="Simulated Active Attendees">
          <Activity size={16} color="var(--color-primary)" />
          <span>Attendance: <strong>{attendanceCount.toLocaleString()}</strong> / {maxAttendance.toLocaleString()}</span>
        </div>
        {role === 'organizer' && (
          <div style={{ ...metricStyle, borderColor: incidentCount > 0 ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)' }} title="Active Incidents Queue">
            <AlertTriangle size={16} color={incidentCount > 0 ? 'var(--color-danger)' : 'var(--color-success)'} />
            <span>Incidents: <strong style={{ color: incidentCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>{incidentCount}</strong></span>
          </div>
        )}
        <div style={metricStyle} title="System Status: Fully Operational">
          <ShieldCheck size={16} color="var(--color-success)" />
          <span>Status: <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>ONLINE</span></span>
        </div>
      </div>

      <div className="header-actions" style={actionsStyle}>
        <div style={roleWrapperStyle}>
          <label htmlFor="role-select" style={labelStyle}>
            <User size={14} color="var(--color-text-secondary)" />
            <span>View Role:</span>
          </label>
          <select
            id="role-select"
            value={role}
            onChange={handleRoleChange}
            style={selectStyle}
            aria-label="Switch User Dashboard Role"
          >
            <option value="fan">Spectator / Fan</option>
            <option value="organizer">Operations Organizer</option>
            <option value="volunteer">Volunteer Support</option>
            <option value="staff">Venue Operations Staff</option>
          </select>
        </div>
      </div>
    </header>
  );
}

// Inline CSS styles (no Tailwind) to maintain absolute layout and performance control
const headerStyle: React.CSSProperties = {
  height: 'var(--header-height)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  background: 'rgba(7, 10, 22, 0.8)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid var(--border-subtle)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  width: '100%',
};

const brandStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

const logoGlowStyle: React.CSSProperties = {
  position: 'absolute',
  top: '-10px',
  left: '-10px',
  width: '60px',
  height: '40px',
  background: 'radial-gradient(circle, rgba(0, 240, 255, 0.2) 0%, transparent 70%)',
  filter: 'blur(10px)',
  zIndex: -1,
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 800,
  letterSpacing: '0.05em',
  color: 'var(--color-primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const subTitleStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#ffffff',
  background: 'linear-gradient(135deg, var(--color-secondary), var(--color-accent))',
  padding: '2px 8px',
  borderRadius: '4px',
  fontWeight: 700,
  marginLeft: '4px',
};

const tagStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.2em',
  fontWeight: 600,
  marginTop: '2px',
};

const metricsContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
};

// Responsive hiding handled in globals.css or simple styling
const metricStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--border-subtle)',
  fontSize: '0.8rem',
  color: 'var(--color-text-secondary)',
};

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
};

const roleWrapperStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '8px',
  padding: '4px 10px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontWeight: 500,
};

const selectStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-title)',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
  paddingRight: '4px',
};
