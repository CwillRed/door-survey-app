import { useState } from 'react';
import { PhotoManager } from './PhotoManager';
import { SurveyCard } from './SurveyCard';
import {
  accessControlExitControlOptions,
  doorIntentOptions,
  doorLocationOptions,
  doorMaterialOptions,
  doorPhotoSlots,
  doorTypeOptions,
  entryControlOptions,
  exitControlOptions,
  frameTypeOptions,
  wanderMonitoringHallPhotoSlots,
  wanderMonitoringTypeOptions,
  yesNoUnknownOptions,
} from '../types';
import type { DoorFormValues } from '../types';

type DoorFormProps = {
  projectName: string;
  mode: 'create' | 'edit';
  initialValues: DoorFormValues;
  onSave: (values: DoorFormValues) => void;
  onSaveAndAddAnother: (values: DoorFormValues) => DoorFormValues;
  saveErrorMessage?: string;
  onClearSaveError: () => void;
  onCancel: () => void;
};

export function DoorForm({
  projectName,
  mode,
  initialValues,
  onSave,
  onSaveAndAddAnother,
  saveErrorMessage,
  onClearSaveError,
  onCancel,
}: DoorFormProps) {
  const [formValues, setFormValues] = useState<DoorFormValues>(initialValues);
  const hasAccessControlIntent = formValues.doorIntent.includes('Access Control');
  const hasWanderMonitoringIntent = formValues.doorIntent.includes('Wander Monitoring');
  const isHallWanderMonitoring = hasWanderMonitoringIntent && formValues.wanderMonitoringType === 'Hall';
  const currentExitControlOptions = hasAccessControlIntent
    ? accessControlExitControlOptions
    : exitControlOptions;
  const requiredPhotoSlots = isHallWanderMonitoring ? wanderMonitoringHallPhotoSlots : doorPhotoSlots;
  const photoDescription = isHallWanderMonitoring
    ? 'Hall-based wander monitoring only requires a hallway photo. Add any extra context shots below as needed.'
    : 'Capture the required opening views, then add as many additional photos as needed.';

  const updateField = <K extends keyof DoorFormValues>(field: K, value: DoorFormValues[K]) => {
    if (saveErrorMessage) {
      onClearSaveError();
    }
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const toggleDoorIntent = (intent: DoorFormValues['doorIntent'][number], isSelected: boolean) => {
    const nextDoorIntent = isSelected
      ? formValues.doorIntent.filter((item) => item !== intent)
      : [...formValues.doorIntent, intent];

    const nextValues: DoorFormValues = {
      ...formValues,
      doorIntent: nextDoorIntent,
    };

    if (!nextDoorIntent.includes('Wander Monitoring')) {
      nextValues.wanderMonitoringType = '';
    }

    if (!nextDoorIntent.includes('Access Control') && nextValues.exitSideControl === 'RTEM / Request to Exit Motion') {
      nextValues.exitSideControl = 'None';
    }

    if (saveErrorMessage) {
      onClearSaveError();
    }

    setFormValues(nextValues);
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-header__eyebrow">ClearPath Connections</p>
        <div>
          <h1>{mode === 'create' ? 'Add Door' : 'Edit Door'}</h1>
          <p className="app-header__subtitle">{projectName || 'Project'} door workflow</p>
        </div>
      </header>

      <div className="form-layout">
        <SurveyCard
          title="Door Details"
          description="Capture opening details in a practical field sequence with the core field conditions first."
        >
          <div className="field-grid">
            <fieldset className="field fieldset field--full">
              <legend>
                Door Type <span className="field__required">(Required)</span>
              </legend>
              <div className="choice-grid choice-grid--wide">
                {doorTypeOptions.map((option) => {
                  const isSelected = formValues.doorType === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      className={`select-pill${isSelected ? ' select-pill--active' : ''}`}
                      onClick={() => updateField('doorType', option)}
                      aria-pressed={isSelected}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <label className="field">
              <span>Door ID / Number</span>
              <input
                type="text"
                value={formValues.doorId}
                onChange={(event) => updateField('doorId', event.target.value)}
                placeholder="Example: 102A"
              />
            </label>

            <label className="field">
              <span>Door Name</span>
              <input
                type="text"
                value={formValues.doorName}
                onChange={(event) => updateField('doorName', event.target.value)}
                placeholder="Example: Main Lobby Entry"
              />
            </label>

            <div className="detail-group field--full">
              <div className="detail-group__header">
                <h3>Door Dimensions</h3>
                <p>Use standard field dimensions when known to reduce extra notes later.</p>
              </div>

              <div className="field-grid field-grid--compact">
                <label className="field">
                  <span>Door Width (inches)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={formValues.doorWidth}
                    onChange={(event) => updateField('doorWidth', event.target.value)}
                    placeholder="36"
                  />
                </label>

                <label className="field">
                  <span>Door Height (inches)</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={formValues.doorHeight}
                    onChange={(event) => updateField('doorHeight', event.target.value)}
                    placeholder="84"
                  />
                </label>
              </div>
            </div>

            <label className="field">
              <span>Door Thickness (inches)</span>
              <input
                type="number"
                inputMode="decimal"
                value={formValues.doorThickness}
                onChange={(event) => updateField('doorThickness', event.target.value)}
                placeholder="1.75"
              />
            </label>

            <label className="field">
              <span>Frame Type</span>
              <select
                value={formValues.frameType}
                onChange={(event) =>
                  updateField('frameType', event.target.value as DoorFormValues['frameType'])
                }
              >
                {frameTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Door Material</span>
              <select
                value={formValues.doorMaterial}
                onChange={(event) =>
                  updateField('doorMaterial', event.target.value as DoorFormValues['doorMaterial'])
                }
              >
                {doorMaterialOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="field fieldset">
              <legend>Door Location</legend>
              <div className="segmented-control">
                {doorLocationOptions.map((option) => (
                  <label key={option} className="segmented-control__option">
                    <input
                      type="radio"
                      name="door-location"
                      checked={formValues.doorLocation === option}
                      onChange={() => updateField('doorLocation', option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="field field--full">
              <span>Area / Location</span>
              <input
                type="text"
                value={formValues.areaLocation}
                onChange={(event) => updateField('areaLocation', event.target.value)}
                placeholder="Wing, floor, or nearby landmark"
              />
            </label>
          </div>
        </SurveyCard>

        <SurveyCard title="Door Intent" description="Choose the main purpose of this opening.">
          <div className="choice-grid">
            {doorIntentOptions.map((intent) => {
              const isSelected = formValues.doorIntent.includes(intent);

              return (
                <button
                  key={intent}
                  type="button"
                  className={`select-pill${isSelected ? ' select-pill--active' : ''}`}
                  onClick={() => toggleDoorIntent(intent, isSelected)}
                  aria-pressed={isSelected}
                >
                  {intent}
                </button>
              );
            })}
          </div>

          {hasWanderMonitoringIntent ? (
            <label className="field field--full">
              <span>Wander Monitoring Type</span>
              <select
                value={formValues.wanderMonitoringType}
                onChange={(event) =>
                  updateField('wanderMonitoringType', event.target.value as DoorFormValues['wanderMonitoringType'])
                }
              >
                <option value="">Select monitoring type</option>
                {wanderMonitoringTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </SurveyCard>

        <SurveyCard
          title="Operation and Rating"
          description="Document the opening rating and intended control behavior from both sides."
        >
          <div className="field-grid">
            <fieldset className="field fieldset field--full">
              <legend>Fire Rated</legend>
              <div className="segmented-control">
                {yesNoUnknownOptions.map((option) => (
                  <label key={option} className="segmented-control__option">
                    <input
                      type="radio"
                      name="fire-rated"
                      checked={formValues.fireRated === option}
                      onChange={() => updateField('fireRated', option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {formValues.fireRated === 'Yes' ? (
              <label className="field">
                <span>Fire Rating Value</span>
                <input
                  type="text"
                  value={formValues.fireRatingValue}
                  onChange={(event) => updateField('fireRatingValue', event.target.value)}
                  placeholder="Example: 45 minutes"
                />
              </label>
            ) : null}

            <label className="field">
              <span>Entry Side Control</span>
              <select
                value={formValues.entrySideControl}
                onChange={(event) =>
                  updateField('entrySideControl', event.target.value as DoorFormValues['entrySideControl'])
                }
              >
                {entryControlOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Exit Side Control</span>
              <select
                value={formValues.exitSideControl}
                onChange={(event) =>
                  updateField('exitSideControl', event.target.value as DoorFormValues['exitSideControl'])
                }
              >
                {currentExitControlOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="field field--full">
              <span>Describe what is supposed to happen at this door</span>
              <textarea
                className="field__dictation"
                rows={7}
                value={formValues.operationDescription}
                onChange={(event) => updateField('operationDescription', event.target.value)}
                placeholder="Use this larger field for the intended opening sequence, user experience, and any practical notes from the site walk."
              />
            </label>
          </div>
        </SurveyCard>

        <SurveyCard
          title="Photos"
          description={photoDescription}
        >
          <PhotoManager
            requiredSlots={requiredPhotoSlots}
            photos={formValues.photos}
            onChange={(photos) => updateField('photos', photos)}
            additionalLabel="Additional Photos"
          />
        </SurveyCard>
      </div>

      <div className="action-bar">
        {saveErrorMessage ? <p className="action-bar__error">{saveErrorMessage}</p> : null}
        {mode === 'create' ? (
          <button
            type="button"
            className="action-button action-button--secondary"
            onClick={() => setFormValues(onSaveAndAddAnother(formValues))}
          >
            Save & Add Another Door
          </button>
        ) : null}
        <button type="button" className="action-button action-button--primary" onClick={() => onSave(formValues)}>
          Save Door
        </button>
        <button type="button" className="action-button action-button--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </main>
  );
}
