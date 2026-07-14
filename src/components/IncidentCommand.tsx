'use client';

import React, { useState } from 'react';
import { Incident, StadiumState } from '../lib/types';
import { Send, AlertTriangle, CheckCircle, RefreshCw, Cpu, Plus, HeartHandshake } from 'lucide-react';

interface IncidentCommandProps {
  stadiumState: StadiumState;
  onUpdateIncidents: (incidents: Incident[]) => void;
  onSendSystemMessage: (msg: string) => void;
}

const IncidentCommand = React.memo(function IncidentCommand({ stadiumState, onUpdateIncidents, onSendSystemMessage }: IncidentCommandProps) {
  const [loadingIncidentId, setLoadingIncidentId] = useState<string | null>(null);
  
  // Incident form state
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newLoc, setNewLoc] = useState<string>('');
  const [newSev, setNewSev] = useState<'low' | 'medium' | 'high'>('low');
  const [newCat, setNewCat] = useState<'safety' | 'technical' | 'crowd' | 'medical'>('safety');
  const [newDesc, setNewDesc] = useState<string>('');

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'high': return 'var(--color-danger)';
      case 'medium': return 'var(--color-warning)';
      default: return 'var(--color-info)';
    }
  };

  const handleResolveWithAI = async (incident: Incident) => {
    setLoadingIncidentId(incident.id);
    try {
      // Trigger a direct call to the api/gemini endpoint
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'organizer',
          stadiumState,
          messages: [{
            role: 'user',
            content: `INSTRUCTIONS: Please write an immediate, step-by-step dispatch action plan for this incident:
            Category: ${incident.category}
            Incident: ${incident.title}
            Location: ${incident.location}
            Severity: ${incident.severity}
            Description: ${incident.description}
            
            Keep the response structured and specific to stadium operations.`
          }]
        })
      });

      const data = await response.json();
      
      if (data.content) {
        // Update incident with action plan and change status to dispatching
        const updated = stadiumState.incidents.map(i => {
          if (i.id === incident.id) {
            return {
              ...i,
              status: 'dispatching' as const,
              aiActionPlan: data.content
            };
          }
          return i;
        });
        onUpdateIncidents(updated);
        onSendSystemMessage(`GenAI dispatched instructions for incident: ${incident.title}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIncidentId(null);
    }
  };

  const handleCloseIncident = (id: string) => {
    const updated = stadiumState.incidents.map(i => {
      if (i.id === id) {
        return { ...i, status: 'resolved' as const };
      }
      return i;
    });
    onUpdateIncidents(updated);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newLoc || !newDesc) return;

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: newTitle,
      location: newLoc,
      severity: newSev,
      status: 'reported',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: newDesc,
      category: newCat
    };

    onUpdateIncidents([newIncident, ...stadiumState.incidents]);
    onSendSystemMessage(`New incident reported: "${newTitle}" at ${newLoc}.`);
    
    // Clear form
    setNewTitle('');
    setNewLoc('');
    setNewSev('low');
    setNewCat('safety');
    setNewDesc('');
    setShowAddForm(false);
  };

  return (
    <section className="glass-panel" style={panelStyle} aria-labelledby="inc-title">
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} color="var(--color-accent)" />
          <h2 id="inc-title" style={titleStyle}>🚨 Incident Command Desk</h2>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          style={addBtnStyle}
          aria-expanded={showAddForm}
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Cancel Report' : 'Report Incident'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreateIncident} style={formStyle} aria-label="Report New Incident Form">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Report Stadium Incident</h3>
          <div style={inputGroupStyle}>
            <input 
              type="text" 
              placeholder="Incident Title (e.g. Power Failure)" 
              value={newTitle} 
              onChange={e => setNewTitle(e.target.value)} 
              required 
              style={inputStyle}
            />
            <input 
              type="text" 
              placeholder="Location (e.g. Section 112)" 
              value={newLoc} 
              onChange={e => setNewLoc(e.target.value)} 
              required 
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <select value={newSev} onChange={e => setNewSev(e.target.value as 'low' | 'medium' | 'high')} style={inputStyle}>
              <option value="low">Low Severity</option>
              <option value="medium">Medium Severity</option>
              <option value="high">High Severity</option>
            </select>
            <select value={newCat} onChange={e => setNewCat(e.target.value as 'safety' | 'technical' | 'crowd' | 'medical')} style={inputStyle}>
              <option value="safety">Safety / Spills</option>
              <option value="technical">Technical / Network</option>
              <option value="crowd">Crowd Control</option>
              <option value="medical">Medical emergency</option>
            </select>
          </div>
          <textarea 
            placeholder="Detailed description of the issue..." 
            value={newDesc} 
            onChange={e => setNewDesc(e.target.value)} 
            required 
            rows={3} 
            style={{ ...inputStyle, resize: 'none' }}
          />
          <button type="submit" style={submitBtnStyle}>
            <Send size={14} />
            <span>Dispatch to Queue</span>
          </button>
        </form>
      )}

      <div style={incidentListStyle}>
        {stadiumState.incidents.length === 0 ? (
          <div style={emptyStateStyle}>
            <CheckCircle size={24} color="var(--color-success)" />
            <span>All zones clear. No active operations tickets.</span>
          </div>
        ) : (
          stadiumState.incidents.map(inc => (
            <div 
              key={inc.id} 
              style={{ 
                ...incidentCardStyle, 
                borderColor: inc.status === 'resolved' ? 'rgba(16, 185, 129, 0.2)' : getSeverityColor(inc.severity) 
              }}
            >
              <div style={cardHeaderStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    ...indicatorDotStyle, 
                    backgroundColor: getSeverityColor(inc.severity),
                    boxShadow: `0 0 8px ${getSeverityColor(inc.severity)}`
                  }} />
                  <h4 style={cardTitleStyle}>{inc.title}</h4>
                </div>
                <span style={timeStyle}>{inc.timestamp}</span>
              </div>

              <div style={detailsStyle}>
                <p>📍 <strong>Location:</strong> {inc.location}</p>
                <p style={{ marginTop: '4px', color: 'var(--color-text-secondary)' }}>{inc.description}</p>
              </div>

              <div style={badgeRowStyle}>
                <span style={catBadgeStyle}>{inc.category.toUpperCase()}</span>
                <span style={{ 
                  ...statusBadgeStyle, 
                  color: inc.status === 'resolved' ? 'var(--color-success)' : inc.status === 'dispatching' ? 'var(--color-info)' : 'var(--color-warning)',
                  backgroundColor: inc.status === 'resolved' ? 'var(--color-success-bg)' : inc.status === 'dispatching' ? 'var(--color-info-bg)' : 'var(--color-warning-bg)'
                }}>
                  {inc.status.toUpperCase()}
                </span>
              </div>

              {inc.aiActionPlan && (
                <div style={aiPlanContainerStyle}>
                  <div style={aiTitleStyle}>
                    <Cpu size={14} />
                    <span>Gemini Dispatch Action Plan:</span>
                  </div>
                  <div style={planContentStyle}>
                    {inc.aiActionPlan.split('\n').map((line, idx) => (
                      <p key={idx} style={{ marginBottom: '4px' }}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              <div style={actionRowStyle}>
                {inc.status === 'reported' && (
                  <button 
                    onClick={() => handleResolveWithAI(inc)}
                    style={aiResolveBtnStyle}
                    disabled={loadingIncidentId !== null}
                    aria-label={`Solve ${inc.title} with Generative AI Dispatch`}
                  >
                    {loadingIncidentId === inc.id ? (
                      <RefreshCw size={14} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Cpu size={14} />
                    )}
                    <span>{loadingIncidentId === inc.id ? 'Analyzing Plan...' : 'Solve with GenAI Dispatch'}</span>
                  </button>
                )}
                {inc.status !== 'resolved' && (
                  <button 
                    onClick={() => handleCloseIncident(inc.id)}
                    style={resolveBtnStyle}
                    aria-label={`Mark ${inc.title} as resolved`}
                  >
                    <CheckCircle size={14} />
                    <span>Mark Handled</span>
                  </button>
                )}
                {inc.status === 'resolved' && (
                  <div style={resolvedNoticeStyle}>
                    <HeartHandshake size={14} />
                    <span>Operations Completed</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
});

// Styling objects
const panelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 700,
};

const addBtnStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--color-text-primary)',
  borderRadius: '8px',
  padding: '6px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 600,
};

const formStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '10px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  background: 'rgba(5, 7, 18, 0.6)',
  border: '1px solid var(--border-subtle)',
  borderRadius: '6px',
  padding: '8px 12px',
  color: '#ffffff',
  fontSize: '0.85rem',
  outline: 'none',
};

const submitBtnStyle: React.CSSProperties = {
  alignSelf: 'flex-end',
  background: 'var(--color-primary)',
  color: '#000000',
  border: 'none',
  padding: '8px 16px',
  borderRadius: '6px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.8rem',
};

const incidentListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  maxHeight: '450px',
  overflowY: 'auto',
  paddingRight: '4px',
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  padding: '30px',
  textAlign: 'center',
  color: 'var(--color-text-secondary)',
  fontSize: '0.85rem',
  border: '1px dashed var(--border-subtle)',
  borderRadius: '10px',
};

const incidentCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.015)',
  border: '1px solid',
  borderRadius: '8px',
  padding: '14px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  position: 'relative',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const indicatorDotStyle: React.CSSProperties = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  display: 'inline-block',
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 600,
};

const timeStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-text-muted)',
};

const detailsStyle: React.CSSProperties = {
  fontSize: '0.8rem',
};

const badgeRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const catBadgeStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 700,
  padding: '2px 6px',
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '4px',
  color: 'var(--color-text-secondary)',
  border: '1px solid var(--border-subtle)',
};

const statusBadgeStyle: React.CSSProperties = {
  fontSize: '0.65rem',
  fontWeight: 700,
  padding: '2px 6px',
  borderRadius: '4px',
};

const aiPlanContainerStyle: React.CSSProperties = {
  background: 'rgba(112, 0, 255, 0.05)',
  border: '1px solid rgba(112, 0, 255, 0.15)',
  borderRadius: '6px',
  padding: '10px 12px',
};

const aiTitleStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'rgba(0, 240, 255, 0.9)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '6px',
};

const planContentStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-text-secondary)',
  lineHeight: '1.4',
};

const actionRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  marginTop: '4px',
};

const aiResolveBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(112, 0, 255, 0.15))',
  border: '1px solid rgba(0, 240, 255, 0.3)',
  borderRadius: '6px',
  color: 'var(--color-primary)',
  padding: '6px 12px',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'all 0.2s ease',
};

const resolveBtnStyle: React.CSSProperties = {
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '6px',
  color: 'var(--color-success)',
  padding: '6px 12px',
  fontSize: '0.75rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const resolvedNoticeStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--color-success)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 0',
  fontWeight: 600,
};

export default IncidentCommand;
