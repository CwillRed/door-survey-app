export type ProjectStatus = 'Sales In Progress' | 'Ready for Design' | 'Design Complete';
export type YesNoUnknown = 'Yes' | 'No' | 'Unknown';
export type DoorIntent = 'Access Control' | 'Delayed Egress' | 'Wander Monitoring' | 'Other';
export type WanderMonitoringType = '' | 'Door' | 'Hall';
export type DoorType = 'Single' | 'Double (Same Direction)' | 'Double (Opposing)' | 'Other';
export type FrameType = 'Metal' | 'Wood' | 'Other';
export type DoorMaterial = 'Metal' | 'Wood' | 'Glass' | 'Other';
export type DoorLocation = 'Interior' | 'Exterior';
export type EntryControlOption =
  | 'None'
  | 'Card Reader'
  | 'Keypad'
  | 'Push Button'
  | 'Free Entry'
  | 'Other';
export type ExitControlOption =
  | 'None'
  | 'Card Reader'
  | 'Keypad'
  | 'Push Button'
  | 'RTEM / Request to Exit Motion'
  | 'Free Exit'
  | 'Other';

export type PhotoSlot = {
  id: string;
  label: string;
};

export type PhotoItem = {
  id: string;
  name: string;
  previewUrl?: string;
};

export type PhotoCollection = {
  required: Record<string, PhotoItem[]>;
  additional: PhotoItem[];
};

export type SalesHandoffChecklist = {
  doorIdsMarked: boolean;
  dataRoomIdsMarked: boolean;
  doorPlanAvailable: boolean;
  photosCaptured: boolean;
  filesOrganized: boolean;
};

export type ProjectFormValues = {
  facilityName: string;
  facilityAddress: string;
  projectNotes: string;
};

export type DoorFormValues = {
  doorType: DoorType;
  doorId: string;
  doorName: string;
  areaLocation: string;
  doorWidth: string;
  doorHeight: string;
  doorThickness: string;
  frameType: FrameType;
  doorMaterial: DoorMaterial;
  doorLocation: DoorLocation;
  doorIntent: DoorIntent[];
  fireRated: YesNoUnknown;
  fireRatingValue: string;
  wanderMonitoringType: WanderMonitoringType;
  entrySideControl: EntryControlOption;
  exitSideControl: ExitControlOption;
  operationDescription: string;
  photos: PhotoCollection;
};

export type DataRoomFormValues = {
  roomName: string;
  location: string;
  powerAvailable: YesNoUnknown;
  fireAlarmAvailable: YesNoUnknown;
  notes: string;
  photos: PhotoCollection;
};

export type DoorRecord = DoorFormValues & {
  id: string;
};

export type DataRoomRecord = DataRoomFormValues & {
  id: string;
};

export type ProjectRecord = ProjectFormValues & {
  id: string;
  status: ProjectStatus;
  salesCompletedDate?: string;
  designCompletedDate?: string;
  returnNotes: string;
  salesHandoffChecklist: SalesHandoffChecklist;
  doors: DoorRecord[];
  dataRooms: DataRoomRecord[];
};

export const doorIntentOptions: DoorIntent[] = [
  'Access Control',
  'Delayed Egress',
  'Wander Monitoring',
  'Other',
];
export const doorTypeOptions: DoorType[] = [
  'Single',
  'Double (Same Direction)',
  'Double (Opposing)',
  'Other',
];
export const frameTypeOptions: FrameType[] = ['Metal', 'Wood', 'Other'];
export const doorMaterialOptions: DoorMaterial[] = ['Metal', 'Wood', 'Glass', 'Other'];
export const doorLocationOptions: DoorLocation[] = ['Interior', 'Exterior'];

export const yesNoUnknownOptions: YesNoUnknown[] = ['Yes', 'No', 'Unknown'];
export const wanderMonitoringTypeOptions: WanderMonitoringType[] = ['Door', 'Hall'];

export const entryControlOptions: EntryControlOption[] = [
  'None',
  'Card Reader',
  'Keypad',
  'Push Button',
  'Free Entry',
  'Other',
];

export const exitControlOptions: ExitControlOption[] = [
  'None',
  'Card Reader',
  'Keypad',
  'Push Button',
  'Free Exit',
  'Other',
];

export const accessControlExitControlOptions: ExitControlOption[] = [
  'None',
  'Card Reader',
  'Keypad',
  'Push Button',
  'RTEM / Request to Exit Motion',
  'Free Exit',
  'Other',
];

export const doorPhotoSlots: PhotoSlot[] = [
  { id: 'entry', label: 'Entry Side Photo' },
  { id: 'exit', label: 'Exit Side Photo' },
  { id: 'hallway', label: 'Hallway Approach' },
  { id: 'frame', label: 'Frame / Label Photo' },
];

export const wanderMonitoringHallPhotoSlots: PhotoSlot[] = [
  { id: 'hallway', label: 'Hallway Photo' },
];

export const dataRoomPhotoSlots: PhotoSlot[] = [
  { id: 'overview', label: 'Overall Room View' },
  { id: 'mounting-wall', label: 'Mounting Wall Area' },
];

export const projectStatusTabs: ProjectStatus[] = [
  'Sales In Progress',
  'Ready for Design',
  'Design Complete',
];

export const requiredSalesChecklistKeys: Array<keyof SalesHandoffChecklist> = [
  'doorIdsMarked',
  'dataRoomIdsMarked',
  'doorPlanAvailable',
];

export const salesChecklistLabels: Record<keyof SalesHandoffChecklist, string> = {
  doorIdsMarked: 'Door IDs are marked on the floor plan',
  dataRoomIdsMarked: 'Data room / headend IDs are marked on the floor plan',
  doorPlanAvailable: 'Door plan is attached or available',
  photosCaptured: 'Photos captured',
  filesOrganized: 'Files uploaded and organized',
};

export const createEmptyPhotos = (slots: PhotoSlot[]): PhotoCollection => ({
  required: Object.fromEntries(slots.map((slot) => [slot.id, []])) as Record<string, PhotoItem[]>,
  additional: [],
});

export const emptySalesHandoffChecklist = (): SalesHandoffChecklist => ({
  doorIdsMarked: false,
  dataRoomIdsMarked: false,
  doorPlanAvailable: false,
  photosCaptured: false,
  filesOrganized: false,
});

export const emptyProjectForm = (): ProjectFormValues => ({
  facilityName: '',
  facilityAddress: '',
  projectNotes: '',
});

export const emptyDoorForm = (): DoorFormValues => ({
  doorType: 'Single',
  doorId: '',
  doorName: '',
  areaLocation: '',
  doorWidth: '',
  doorHeight: '',
  doorThickness: '1.75',
  frameType: 'Metal',
  doorMaterial: 'Metal',
  doorLocation: 'Interior',
  doorIntent: [],
  fireRated: 'Unknown',
  fireRatingValue: '',
  wanderMonitoringType: '',
  entrySideControl: 'None',
  exitSideControl: 'None',
  operationDescription: '',
  photos: createEmptyPhotos(doorPhotoSlots),
});

export const emptyDataRoomForm = (): DataRoomFormValues => ({
  roomName: '',
  location: '',
  powerAvailable: 'Unknown',
  fireAlarmAvailable: 'Unknown',
  notes: '',
  photos: createEmptyPhotos(dataRoomPhotoSlots),
});
