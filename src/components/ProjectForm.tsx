import { useState } from 'react';
import { SurveyCard } from './SurveyCard';
import type { ProjectFormValues } from '../types';

type ProjectFormProps = {
  mode: 'create' | 'edit';
  initialValues: ProjectFormValues;
  onSave: (values: ProjectFormValues) => void;
  onCancel: () => void;
};

export function ProjectForm({ mode, initialValues, onSave, onCancel }: ProjectFormProps) {
  const [formValues, setFormValues] = useState<ProjectFormValues>(initialValues);

  const updateField = <K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-header__eyebrow">ClearPath Connections</p>
        <div>
          <h1>{mode === 'create' ? 'New Project' : 'Edit Project'}</h1>
          <p className="app-header__subtitle">Project setup</p>
        </div>
      </header>

      <SurveyCard
        title="Project Details"
        description="Capture the core facility information before adding doors and supporting spaces."
      >
        <div className="field-grid field-grid--project">
          <label className="field">
            <span>Facility Name</span>
            <input
              type="text"
              value={formValues.facilityName}
              onChange={(event) => updateField('facilityName', event.target.value)}
              placeholder="Enter facility name"
            />
          </label>

          <label className="field">
            <span>Facility Address</span>
            <input
              type="text"
              value={formValues.facilityAddress}
              onChange={(event) => updateField('facilityAddress', event.target.value)}
              placeholder="Street, city, state"
            />
          </label>

          <label className="field">
            <span>Project Notes</span>
            <textarea
              rows={5}
              value={formValues.projectNotes}
              onChange={(event) => updateField('projectNotes', event.target.value)}
              placeholder="Add any overall project notes, scope reminders, or site context"
            />
          </label>
        </div>
      </SurveyCard>

      <div className="action-bar">
        <button type="button" className="action-button action-button--primary" onClick={() => onSave(formValues)}>
          Save Project
        </button>
        <button type="button" className="action-button action-button--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </main>
  );
}
