import { useEffect, useMemo, useState } from 'react';
import { DataRoomForm } from './components/DataRoomForm';
import { DoorForm } from './components/DoorForm';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ProjectForm } from './components/ProjectForm';
import { ProjectsList } from './components/ProjectsList';
import {
  emptyDataRoomForm,
  emptyDoorForm,
  emptyProjectForm,
  emptySalesHandoffChecklist,
  requiredSalesChecklistKeys,
} from './types';
import type {
  DataRoomFormValues,
  DataRoomRecord,
  DoorFormValues,
  DoorRecord,
  PhotoItem,
  ProjectFormValues,
  ProjectRecord,
  ProjectStatus,
  SalesHandoffChecklist,
} from './types';

const STORAGE_KEY = 'doorSurveyAppData';
const sessionPhotoPreviewUrls = new Map<string, string>();

type PersistedAppData = {
  projects: ProjectRecord[];
};

type ScreenState =
  | { name: 'projects-list' }
  | { name: 'project-form'; mode: 'create' | 'edit'; projectId?: string }
  | { name: 'project-dashboard'; projectId: string }
  | {
      name: 'door-form';
      mode: 'create' | 'edit';
      projectId: string;
      doorId?: string;
      seedValues?: DoorFormValues;
    }
  | {
      name: 'data-room-form';
      mode: 'create' | 'edit';
      projectId: string;
      dataRoomId?: string;
    };

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function normalizePhotoItem(item: Partial<PhotoItem> | undefined, includePreview: boolean): PhotoItem {
  const id = typeof item?.id === 'string' ? item.id : createId();
  const name = typeof item?.name === 'string' ? item.name : 'Photo';
  const previewUrl =
    typeof item?.previewUrl === 'string' && item.previewUrl.length > 0
      ? item.previewUrl
      : sessionPhotoPreviewUrls.get(id);

  if (previewUrl) {
    sessionPhotoPreviewUrls.set(id, previewUrl);
  }

  return includePreview && previewUrl ? { id, name, previewUrl } : { id, name };
}

function normalizePhotoCollection(
  photos: DoorFormValues['photos'] | DataRoomFormValues['photos'] | undefined,
  emptyPhotos: DoorFormValues['photos'] | DataRoomFormValues['photos'],
  includePreview = true,
) {
  const required = Object.fromEntries(
    Object.keys(emptyPhotos.required).map((slotId) => {
      const nextItems = Array.isArray(photos?.required?.[slotId]) ? photos.required[slotId] : [];

      return [
        slotId,
        nextItems
          .filter((item) => Boolean(item) && typeof item === 'object')
          .map((item) => normalizePhotoItem(item, includePreview)),
      ];
    }),
  ) as typeof emptyPhotos.required;

  const additional = Array.isArray(photos?.additional)
    ? photos.additional
        .filter((item) => Boolean(item) && typeof item === 'object')
        .map((item) => normalizePhotoItem(item, includePreview))
    : [];

  return {
    required,
    additional,
  };
}

function loadStoredAppData(): PersistedAppData {
  if (typeof window === 'undefined') {
    return { projects: [] };
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  if (!storedValue) {
    return { projects: [] };
  }

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<PersistedAppData>;

    return {
      projects: Array.isArray(parsedValue.projects)
        ? parsedValue.projects.map((project) => ({
            ...project,
            doors: Array.isArray(project.doors)
              ? project.doors.map((door) => normalizeDoorRecord(door))
              : [],
            dataRooms: Array.isArray(project.dataRooms)
              ? project.dataRooms.map((dataRoom) => normalizeDataRoomRecord(dataRoom))
              : [],
          }))
        : [],
    };
  } catch {
    return { projects: [] };
  }
}

function persistProjects(projects: ProjectRecord[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const nextData: PersistedAppData = {
    projects: projects.map((project) => ({
      ...project,
      doors: project.doors.map((door) => ({
        ...door,
        photos: normalizePhotoCollection(door.photos, emptyDoorForm().photos, false),
      })),
      dataRooms: project.dataRooms.map((dataRoom) => ({
        ...dataRoom,
        photos: normalizePhotoCollection(dataRoom.photos, emptyDataRoomForm().photos, false),
      })),
    })),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
}

function normalizeDoorForm(values: DoorFormValues): DoorFormValues {
  return {
    ...emptyDoorForm(),
    ...values,
    doorIntent: Array.isArray(values.doorIntent) ? values.doorIntent : [],
    photos: normalizePhotoCollection(values.photos, emptyDoorForm().photos),
  };
}

function normalizeDataRoomForm(values: DataRoomFormValues): DataRoomFormValues {
  return {
    ...emptyDataRoomForm(),
    ...values,
    photos: normalizePhotoCollection(values.photos, emptyDataRoomForm().photos),
  };
}

function normalizeDoorRecord(door: DoorRecord): DoorRecord {
  return {
    id: door.id,
    ...normalizeDoorForm(door),
  };
}

function normalizeDataRoomRecord(dataRoom: DataRoomRecord): DataRoomRecord {
  return {
    id: dataRoom.id,
    ...normalizeDataRoomForm(dataRoom),
  };
}

export default function App() {
  const [projects, setProjects] = useState<ProjectRecord[]>(() => loadStoredAppData().projects);
  const [screen, setScreen] = useState<ScreenState>({ name: 'projects-list' });
  const [activeStatus, setActiveStatus] = useState<ProjectStatus>('Sales In Progress');
  const [searchQuery, setSearchQuery] = useState('');
  const [returnNoteDraft, setReturnNoteDraft] = useState('');
  const [returnNoteError, setReturnNoteError] = useState('');
  const [doorSaveError, setDoorSaveError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      persistProjects(projects);
    } catch (error) {
      console.error('Failed to persist Door Survey App data to localStorage.', error);
    }
  }, [projects]);

  const activeProject = useMemo(() => {
    if (!('projectId' in screen)) {
      return undefined;
    }

    return projects.find((project) => project.id === screen.projectId);
  }, [projects, screen]);

  const visibleProjects = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesStatus = project.status === activeStatus;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        project.facilityName.toLowerCase().includes(normalizedQuery) ||
        project.facilityAddress.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, projects, searchQuery]);

  const saveProject = (values: ProjectFormValues, projectId?: string) => {
    let resolvedProjectId = projectId;

    setProjects((current) => {
      if (projectId) {
        return current.map((project) =>
          project.id === projectId ? { ...project, ...values } : project,
        );
      }

      resolvedProjectId = createId();

      return [
        ...current,
        {
          id: resolvedProjectId,
          status: 'Sales In Progress',
          returnNotes: '',
          salesHandoffChecklist: emptySalesHandoffChecklist(),
          doors: [],
          dataRooms: [],
          ...values,
        },
      ];
    });

    if (resolvedProjectId) {
      setScreen({ name: 'project-dashboard', projectId: resolvedProjectId });
      setActiveStatus('Sales In Progress');
    }
  };

  const saveDoor = (projectId: string, values: DoorFormValues, doorId?: string) => {
    try {
      const normalizedValues = normalizeDoorForm(values);
      const nextProjects = projects.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        if (doorId) {
          return {
            ...project,
            doors: project.doors.map((door) =>
              door.id === doorId ? { ...door, ...normalizedValues } : door,
            ),
          };
        }

        return {
          ...project,
          doors: [...project.doors, { id: createId(), ...normalizedValues }],
        };
      });

      persistProjects(nextProjects);
      setProjects(nextProjects);
      setDoorSaveError('');
      setScreen({ name: 'project-dashboard', projectId });
    } catch (error) {
      console.error('Failed to save door record.', error, { projectId, doorId, values });
      setDoorSaveError(
        'Unable to save this door right now. Please try again. Your current form entries are still on screen.',
      );
    }
  };

  const saveDoorAndContinue = (projectId: string, values: DoorFormValues) => {
    try {
      const normalizedValues = normalizeDoorForm(values);
      const nextProjects = projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              doors: [...project.doors, { id: createId(), ...normalizedValues }],
            }
          : project,
      );

      persistProjects(nextProjects);
      setProjects(nextProjects);
      setDoorSaveError('');

      return emptyDoorForm();
    } catch (error) {
      console.error('Failed to save door record for add-another flow.', error, {
        projectId,
        values,
      });
      setDoorSaveError(
        'Unable to save this door right now. Please try again. Your current form entries are still on screen.',
      );

      return values;
    }
  };

  const duplicateDoor = (projectId: string, doorId: string) => {
    const project = projects.find((item) => item.id === projectId);
    const sourceDoor = project?.doors.find((door) => door.id === doorId);

    if (!sourceDoor) {
      return;
    }

    const duplicatedDoor: DoorFormValues = {
      ...sourceDoor,
      doorId: '',
      doorName: '',
      photos: emptyDoorForm().photos,
    };

    setScreen({
      name: 'door-form',
      mode: 'create',
      projectId,
      seedValues: duplicatedDoor,
    });
  };

  const saveDataRoom = (projectId: string, values: DataRoomFormValues, dataRoomId?: string) => {
    const normalizedValues = normalizeDataRoomForm(values);

    setProjects((current) =>
      current.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        if (dataRoomId) {
          return {
            ...project,
            dataRooms: project.dataRooms.map((room) =>
              room.id === dataRoomId ? { ...room, ...normalizedValues } : room,
            ),
          };
        }

        return {
          ...project,
          dataRooms: [...project.dataRooms, { id: createId(), ...normalizedValues }],
        };
      }),
    );

    setScreen({ name: 'project-dashboard', projectId });
  };

  const updateChecklist = (
    projectId: string,
    field: keyof SalesHandoffChecklist,
    value: boolean,
  ) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              salesHandoffChecklist: {
                ...project.salesHandoffChecklist,
                [field]: value,
              },
            }
          : project,
      ),
    );
  };

  const advanceProjectStatus = (projectId: string) => {
    const today = formatDate(new Date());
    const project = projects.find((item) => item.id === projectId);

    if (
      project?.status === 'Sales In Progress' &&
      !requiredSalesChecklistKeys.every((key) => project.salesHandoffChecklist[key])
    ) {
      window.alert('Complete all required sales handoff checklist items before marking Sales Complete.');
      return;
    }

    setProjects((current) =>
      current.map((project) => {
        if (project.id !== projectId) {
          return project;
        }

        if (project.status === 'Sales In Progress') {
          return {
            ...project,
            status: 'Ready for Design',
            salesCompletedDate: today,
          };
        }

        if (project.status === 'Ready for Design') {
          return {
            ...project,
            status: 'Design Complete',
            designCompletedDate: today,
          };
        }

        return project;
      }),
    );

    if (project?.status === 'Sales In Progress') {
      setActiveStatus('Ready for Design');
      setScreen({ name: 'projects-list' });
    }
    if (project?.status === 'Ready for Design') {
      setActiveStatus('Design Complete');
      setScreen({ name: 'projects-list' });
    }
  };

  const sendBackToSales = (projectId: string) => {
    const trimmedNote = returnNoteDraft.trim();

    if (!trimmedNote) {
      setReturnNoteError('Please enter a reason for sending this project back to Sales.');
      return;
    }

    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              status: 'Sales In Progress',
              returnNotes: trimmedNote,
            }
          : project,
      ),
    );

    setReturnNoteError('');
    setReturnNoteDraft('');
    setActiveStatus('Sales In Progress');
  };

  const reopenForDesign = (projectId: string) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === projectId
          ? {
              ...project,
              status: 'Ready for Design',
            }
          : project,
      ),
    );

    setReturnNoteError('');
    setActiveStatus('Ready for Design');
  };

  if (screen.name === 'projects-list') {
    return (
      <ProjectsList
        projects={visibleProjects}
        activeStatus={activeStatus}
        searchQuery={searchQuery}
        onStatusChange={setActiveStatus}
        onSearchChange={setSearchQuery}
        onNewProject={() => setScreen({ name: 'project-form', mode: 'create' })}
        onOpenProject={(projectId) => setScreen({ name: 'project-dashboard', projectId })}
        onEditProject={(projectId) => setScreen({ name: 'project-form', mode: 'edit', projectId })}
      />
    );
  }

  if (screen.name === 'project-form') {
    const projectToEdit = screen.projectId
      ? projects.find((project) => project.id === screen.projectId)
      : undefined;

    return (
      <ProjectForm
        mode={screen.mode}
        initialValues={projectToEdit ?? emptyProjectForm()}
        onSave={(values) => saveProject(values, screen.projectId)}
        onCancel={() =>
          screen.projectId
            ? setScreen({ name: 'project-dashboard', projectId: screen.projectId })
            : setScreen({ name: 'projects-list' })
        }
      />
    );
  }

  if (screen.name === 'project-dashboard' && activeProject) {
    return (
      <ProjectDashboard
        project={activeProject}
        onBack={() => setScreen({ name: 'projects-list' })}
        onEditProject={() =>
          setScreen({ name: 'project-form', mode: 'edit', projectId: activeProject.id })
        }
        onAddDoor={() => {
          setDoorSaveError('');
          setScreen({ name: 'door-form', mode: 'create', projectId: activeProject.id });
        }}
        onAddDataRoom={() =>
          setScreen({ name: 'data-room-form', mode: 'create', projectId: activeProject.id })
        }
        onCompleteProject={() => advanceProjectStatus(activeProject.id)}
        returnNoteDraft={returnNoteDraft}
        returnNoteError={returnNoteError}
        onReturnNoteChange={(value) => {
          setReturnNoteDraft(value);
          if (returnNoteError) {
            setReturnNoteError('');
          }
        }}
        onSendBackToSales={() => sendBackToSales(activeProject.id)}
        onReopenForDesign={() => reopenForDesign(activeProject.id)}
        onChecklistChange={(field, value) => updateChecklist(activeProject.id, field, value)}
        onEditDoor={(doorId) => {
          setDoorSaveError('');
          setScreen({ name: 'door-form', mode: 'edit', projectId: activeProject.id, doorId });
        }}
        onDuplicateDoor={(doorId) => {
          setDoorSaveError('');
          duplicateDoor(activeProject.id, doorId);
        }}
        onDeleteDoor={(doorId) =>
          setProjects((current) =>
            current.map((project) =>
              project.id === activeProject.id
                ? { ...project, doors: project.doors.filter((door) => door.id !== doorId) }
                : project,
            ),
          )
        }
        onEditDataRoom={(dataRoomId) =>
          setScreen({
            name: 'data-room-form',
            mode: 'edit',
            projectId: activeProject.id,
            dataRoomId,
          })
        }
        onDeleteDataRoom={(dataRoomId) =>
          setProjects((current) =>
            current.map((project) =>
              project.id === activeProject.id
                ? {
                    ...project,
                    dataRooms: project.dataRooms.filter((room) => room.id !== dataRoomId),
                  }
                : project,
            ),
          )
        }
      />
    );
  }

  if (screen.name === 'door-form' && activeProject) {
    const doorToEdit = screen.doorId
      ? activeProject.doors.find((door) => door.id === screen.doorId)
      : undefined;

    return (
      <DoorForm
        projectName={activeProject.facilityName}
        mode={screen.mode}
        initialValues={doorToEdit ?? screen.seedValues ?? emptyDoorForm()}
        onSave={(values) => saveDoor(activeProject.id, values, screen.doorId)}
        onSaveAndAddAnother={(values) => saveDoorAndContinue(activeProject.id, values)}
        saveErrorMessage={doorSaveError}
        onClearSaveError={() => setDoorSaveError('')}
        onCancel={() => {
          setDoorSaveError('');
          setScreen({ name: 'project-dashboard', projectId: activeProject.id });
        }}
      />
    );
  }

  if (screen.name === 'data-room-form' && activeProject) {
    const dataRoomToEdit = screen.dataRoomId
      ? activeProject.dataRooms.find((room) => room.id === screen.dataRoomId)
      : undefined;

    return (
      <DataRoomForm
        projectName={activeProject.facilityName}
        mode={screen.mode}
        initialValues={dataRoomToEdit ?? emptyDataRoomForm()}
        onSave={(values) => saveDataRoom(activeProject.id, values, screen.dataRoomId)}
        onCancel={() => setScreen({ name: 'project-dashboard', projectId: activeProject.id })}
      />
    );
  }

  return (
    <ProjectsList
      projects={visibleProjects}
      activeStatus={activeStatus}
      searchQuery={searchQuery}
      onStatusChange={setActiveStatus}
      onSearchChange={setSearchQuery}
      onNewProject={() => setScreen({ name: 'project-form', mode: 'create' })}
      onOpenProject={(projectId) => setScreen({ name: 'project-dashboard', projectId })}
      onEditProject={(projectId) => setScreen({ name: 'project-form', mode: 'edit', projectId })}
    />
  );
}
