import { SurveyCard } from './SurveyCard';
import { projectStatusTabs } from '../types';
import type { ProjectRecord, ProjectStatus } from '../types';

type ProjectsListProps = {
  projects: ProjectRecord[];
  activeStatus: ProjectStatus;
  searchQuery: string;
  onStatusChange: (status: ProjectStatus) => void;
  onSearchChange: (value: string) => void;
  onNewProject: () => void;
  onOpenProject: (projectId: string) => void;
  onEditProject: (projectId: string) => void;
};

export function ProjectsList({
  projects,
  activeStatus,
  searchQuery,
  onStatusChange,
  onSearchChange,
  onNewProject,
  onOpenProject,
  onEditProject,
}: ProjectsListProps) {
  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-header__eyebrow">ClearPath Connections</p>
        <div>
          <h1>Door Survey App</h1>
          <p className="app-header__subtitle">Project workflow</p>
        </div>
      </header>

      <div className="screen-toolbar">
        <label className="field field--search">
          <span>Search Projects</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by facility name or address"
          />
        </label>

        <button type="button" className="action-button action-button--primary" onClick={onNewProject}>
          New Project
        </button>
      </div>

      <div className="tab-bar screen-actions--top" role="tablist" aria-label="Project status tabs">
        {projectStatusTabs.map((status) => {
          const isActive = status === activeStatus;

          return (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`select-pill${isActive ? ' select-pill--active' : ''}`}
              onClick={() => onStatusChange(status)}
            >
              {status}
            </button>
          );
        })}
      </div>

      <SurveyCard
        title="Projects"
        description="Start a new facility survey or reopen an existing project to continue documenting doors and headend spaces."
      >
        {projects.length === 0 ? (
          <div className="empty-state">
            <strong>No projects yet</strong>
            <p>Create your first project to begin the survey workflow.</p>
          </div>
        ) : (
          <div className="item-list">
            {projects.map((project) => (
              <article key={project.id} className="item-row">
                <div className="item-row__content">
                  <h3>{project.facilityName || 'Untitled Project'}</h3>
                  <p>{project.facilityAddress || 'No address entered yet'}</p>
                  <div className="item-meta">
                    <span>{project.status}</span>
                    <span>
                      Sales: {project.salesCompletedDate ? project.salesCompletedDate : 'Not complete'}
                    </span>
                    <span>
                      Design: {project.designCompletedDate ? project.designCompletedDate : 'Not complete'}
                    </span>
                    <span>{project.doors.length} doors</span>
                    <span>{project.dataRooms.length} data rooms / headends</span>
                  </div>
                </div>

                <div className="inline-actions">
                  <button
                    type="button"
                    className="action-button action-button--primary"
                    onClick={() => onOpenProject(project.id)}
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    className="action-button action-button--secondary"
                    onClick={() => onEditProject(project.id)}
                  >
                    Edit
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </SurveyCard>
    </main>
  );
}
