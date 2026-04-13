import { SurveyCard } from './SurveyCard';
import { requiredSalesChecklistKeys, salesChecklistLabels } from '../types';
import type { DataRoomRecord, DoorRecord, ProjectRecord, SalesHandoffChecklist } from '../types';

type ProjectDashboardProps = {
  project: ProjectRecord;
  onBack: () => void;
  onEditProject: () => void;
  onAddDoor: () => void;
  onAddDataRoom: () => void;
  onCompleteProject: () => void;
  returnNoteDraft: string;
  returnNoteError?: string;
  onReturnNoteChange: (value: string) => void;
  onSendBackToSales: () => void;
  onReopenForDesign: () => void;
  onChecklistChange: (field: keyof SalesHandoffChecklist, value: boolean) => void;
  onEditDoor: (doorId: string) => void;
  onDuplicateDoor: (doorId: string) => void;
  onDeleteDoor: (doorId: string) => void;
  onEditDataRoom: (dataRoomId: string) => void;
  onDeleteDataRoom: (dataRoomId: string) => void;
};

function DoorListItem({
  door,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  door: DoorRecord;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const photoCount =
    Object.values(door.photos.required).reduce((count, items) => count + items.length, 0) +
    door.photos.additional.length;

  return (
    <article className="item-row">
      <div className="item-row__content">
        <h3>{door.doorId || door.doorName || 'Untitled Door'}</h3>
        <p>{door.doorName || door.areaLocation || 'No additional door details yet'}</p>
        <div className="item-meta">
          <span>{door.areaLocation || 'Location pending'}</span>
          <span>{door.fireRated === 'Yes' ? door.fireRatingValue || 'Fire rated' : `Fire Rated: ${door.fireRated}`}</span>
          <span>{photoCount} photos</span>
        </div>
      </div>

      <div className="inline-actions">
        <button type="button" className="action-button action-button--secondary" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="action-button action-button--secondary" onClick={onDuplicate}>
          Duplicate Door
        </button>
        <button type="button" className="action-button action-button--ghost" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}

function DataRoomListItem({
  dataRoom,
  onEdit,
  onDelete,
}: {
  dataRoom: DataRoomRecord;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const photoCount =
    Object.values(dataRoom.photos.required).reduce((count, items) => count + items.length, 0) +
    dataRoom.photos.additional.length;

  return (
    <article className="item-row">
      <div className="item-row__content">
        <h3>{dataRoom.roomName || 'Untitled Data Room / Headend'}</h3>
        <p>{dataRoom.location || 'No location entered yet'}</p>
        <div className="item-meta">
          <span>Power: {dataRoom.powerAvailable}</span>
          <span>Fire Alarm Nearby: {dataRoom.fireAlarmAvailable}</span>
          <span>{photoCount} photos</span>
        </div>
      </div>

      <div className="inline-actions">
        <button type="button" className="action-button action-button--secondary" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="action-button action-button--ghost" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}

export function ProjectDashboard({
  project,
  onBack,
  onEditProject,
  onAddDoor,
  onAddDataRoom,
  onCompleteProject,
  returnNoteDraft,
  returnNoteError,
  onReturnNoteChange,
  onSendBackToSales,
  onReopenForDesign,
  onChecklistChange,
  onEditDoor,
  onDuplicateDoor,
  onDeleteDoor,
  onEditDataRoom,
  onDeleteDataRoom,
}: ProjectDashboardProps) {
  const requiredChecklistComplete = requiredSalesChecklistKeys.every(
    (key) => project.salesHandoffChecklist[key],
  );

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-header__eyebrow">ClearPath Connections</p>
        <div>
          <h1>{project.facilityName || 'Project Dashboard'}</h1>
          <p className="app-header__subtitle">Project dashboard</p>
        </div>
      </header>

      <div className="screen-actions screen-actions--top">
        <button type="button" className="action-button action-button--secondary" onClick={onBack}>
          Back to Projects
        </button>
        <button type="button" className="action-button action-button--secondary" onClick={onEditProject}>
          Edit Project
        </button>
      </div>

      <SurveyCard
        title="Project Summary"
        description="Review project details, track current status, and move the job through the handoff workflow."
      >
        <div className="summary-grid">
          <div className="summary-block">
            <span className="summary-block__label">Facility Name</span>
            <strong>{project.facilityName || 'Not entered'}</strong>
          </div>
          <div className="summary-block">
            <span className="summary-block__label">Facility Address</span>
            <strong>{project.facilityAddress || 'Not entered'}</strong>
          </div>
          <div className="summary-block summary-block--full">
            <span className="summary-block__label">Project Notes</span>
            <strong>{project.projectNotes || 'No project notes yet'}</strong>
          </div>
          <div className="summary-block">
            <span className="summary-block__label">Project Status</span>
            <strong>{project.status}</strong>
          </div>
          <div className="summary-block">
            <span className="summary-block__label">Sales Completed Date</span>
            <strong>{project.salesCompletedDate || 'Not completed'}</strong>
          </div>
          <div className="summary-block">
            <span className="summary-block__label">Design Completed Date</span>
            <strong>{project.designCompletedDate || 'Not completed'}</strong>
          </div>
          <div className="summary-block">
            <span className="summary-block__label">Doors</span>
            <strong>{project.doors.length}</strong>
          </div>
          <div className="summary-block">
            <span className="summary-block__label">Data Rooms</span>
            <strong>{project.dataRooms.length}</strong>
          </div>
          <div className="summary-block summary-block--full">
            <span className="summary-block__label">Latest Return Notes</span>
            <strong>{project.returnNotes || 'No return notes recorded'}</strong>
          </div>
        </div>

        <div className="screen-actions">
          <button type="button" className="action-button action-button--primary" onClick={onAddDoor}>
            Add Door
          </button>
          <button type="button" className="action-button action-button--secondary" onClick={onAddDataRoom}>
            Add Data Room / Headend
          </button>
          {project.status === 'Sales In Progress' ? (
            <button
              type="button"
              className="action-button action-button--secondary"
              onClick={onCompleteProject}
              disabled={!requiredChecklistComplete}
            >
              Sales Complete
            </button>
          ) : null}
          {project.status === 'Ready for Design' ? (
            <button
              type="button"
              className="action-button action-button--secondary"
              onClick={onCompleteProject}
            >
              Design Complete
            </button>
          ) : null}
          {project.status === 'Ready for Design' || project.status === 'Design Complete' ? (
            <button
              type="button"
              className="action-button action-button--ghost"
              onClick={onSendBackToSales}
            >
              Send Back to Sales
            </button>
          ) : null}
          {project.status === 'Design Complete' ? (
            <button
              type="button"
              className="action-button action-button--secondary"
              onClick={onReopenForDesign}
            >
              Reopen for Design
            </button>
          ) : null}
        </div>
      </SurveyCard>

      {project.status === 'Ready for Design' || project.status === 'Design Complete' ? (
        <SurveyCard
          title="Return Notes"
          description="Enter a reason if this project needs to be sent back to Sales. The latest note will stay visible on the dashboard."
        >
          <label className="field field--full">
            <span>Return Notes</span>
            <textarea
              rows={4}
              value={returnNoteDraft}
              onChange={(event) => onReturnNoteChange(event.target.value)}
              placeholder="Explain what needs to be corrected or completed before Sales picks this back up."
            />
          </label>
          {returnNoteError ? <p className="checklist-note">{returnNoteError}</p> : null}
        </SurveyCard>
      ) : null}

      {project.status === 'Sales In Progress' ? (
        <SurveyCard
          title="Sales Handoff Checklist"
          description="Required items must be complete before the project can move to Ready for Design."
        >
          <div className="checklist-grid">
            {Object.entries(salesChecklistLabels).map(([key, label]) => {
              const checklistKey = key as keyof SalesHandoffChecklist;
              const isRequired = requiredSalesChecklistKeys.includes(checklistKey);

              return (
                <label key={checklistKey} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={project.salesHandoffChecklist[checklistKey]}
                    onChange={(event) => onChecklistChange(checklistKey, event.target.checked)}
                  />
                  <span>
                    {label}
                    {isRequired ? ' (Required)' : ' (Optional)'}
                  </span>
                </label>
              );
            })}
          </div>
          {!requiredChecklistComplete ? (
            <p className="checklist-note">Complete all required checklist items to enable Sales Complete.</p>
          ) : null}
        </SurveyCard>
      ) : null}

      <SurveyCard title="Saved Doors" description="Manage all door records captured under this project.">
        {project.doors.length === 0 ? (
          <div className="empty-state">
            <strong>No doors saved yet</strong>
            <p>Add a door when you are ready to document an opening.</p>
          </div>
        ) : (
          <div className="item-list">
            {project.doors.map((door) => (
              <DoorListItem
                key={door.id}
                door={door}
                onEdit={() => onEditDoor(door.id)}
                onDuplicate={() => onDuplicateDoor(door.id)}
                onDelete={() => onDeleteDoor(door.id)}
              />
            ))}
          </div>
        )}
      </SurveyCard>

      <SurveyCard
        title="Saved Data Rooms / Headends"
        description="Track supporting control spaces, closets, and headend locations for the project."
      >
        {project.dataRooms.length === 0 ? (
          <div className="empty-state">
            <strong>No data rooms or headends saved yet</strong>
            <p>Add a data room or headend when you identify an associated support space.</p>
          </div>
        ) : (
          <div className="item-list">
            {project.dataRooms.map((dataRoom) => (
              <DataRoomListItem
                key={dataRoom.id}
                dataRoom={dataRoom}
                onEdit={() => onEditDataRoom(dataRoom.id)}
                onDelete={() => onDeleteDataRoom(dataRoom.id)}
              />
            ))}
          </div>
        )}
      </SurveyCard>
    </main>
  );
}
