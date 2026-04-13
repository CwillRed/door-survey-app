import { useState } from 'react';
import { PhotoManager } from './PhotoManager';
import { SurveyCard } from './SurveyCard';
import { dataRoomPhotoSlots, yesNoUnknownOptions } from '../types';
import type { DataRoomFormValues } from '../types';

type DataRoomFormProps = {
  projectName: string;
  mode: 'create' | 'edit';
  initialValues: DataRoomFormValues;
  onSave: (values: DataRoomFormValues) => void;
  onCancel: () => void;
};

export function DataRoomForm({
  projectName,
  mode,
  initialValues,
  onSave,
  onCancel,
}: DataRoomFormProps) {
  const [formValues, setFormValues] = useState<DataRoomFormValues>(initialValues);

  const updateField = <K extends keyof DataRoomFormValues>(field: K, value: DataRoomFormValues[K]) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-header__eyebrow">ClearPath Connections</p>
        <div>
          <h1>{mode === 'create' ? 'Add Data Room / Headend' : 'Edit Data Room / Headend'}</h1>
          <p className="app-header__subtitle">{projectName || 'Project'} support space workflow</p>
        </div>
      </header>

      <div className="form-layout">
        <SurveyCard
          title="Data Room / Headend"
          description="Document the support room, nearby utilities, and any field notes tied to this project."
        >
          <div className="field-grid">
            <label className="field">
              <span>Room Name / ID</span>
              <input
                type="text"
                value={formValues.roomName}
                onChange={(event) => updateField('roomName', event.target.value)}
                placeholder="Example: IDF-1"
              />
            </label>

            <label className="field">
              <span>Location</span>
              <input
                type="text"
                value={formValues.location}
                onChange={(event) => updateField('location', event.target.value)}
                placeholder="Floor, wing, or adjacent department"
              />
            </label>

            <fieldset className="field fieldset field--full">
              <legend>Power Available</legend>
              <div className="segmented-control">
                {yesNoUnknownOptions.map((option) => (
                  <label key={option} className="segmented-control__option">
                    <input
                      type="radio"
                      name="power-available"
                      checked={formValues.powerAvailable === option}
                      onChange={() => updateField('powerAvailable', option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="field fieldset field--full">
              <legend>Fire Alarm Available Nearby</legend>
              <div className="segmented-control">
                {yesNoUnknownOptions.map((option) => (
                  <label key={option} className="segmented-control__option">
                    <input
                      type="radio"
                      name="fire-alarm-available"
                      checked={formValues.fireAlarmAvailable === option}
                      onChange={() => updateField('fireAlarmAvailable', option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="field field--full">
              <span>Notes</span>
              <textarea
                rows={6}
                value={formValues.notes}
                onChange={(event) => updateField('notes', event.target.value)}
                placeholder="Capture equipment notes, observations, constraints, and anything that will matter later."
              />
            </label>
          </div>
        </SurveyCard>

        <SurveyCard title="Photos" description="Upload support room and utility reference photos.">
          <PhotoManager
            requiredSlots={dataRoomPhotoSlots}
            photos={formValues.photos}
            onChange={(photos) => updateField('photos', photos)}
            additionalLabel="Additional Photos"
          />
        </SurveyCard>
      </div>

      <div className="action-bar">
        <button type="button" className="action-button action-button--primary" onClick={() => onSave(formValues)}>
          Save Data Room
        </button>
        <button type="button" className="action-button action-button--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </main>
  );
}
