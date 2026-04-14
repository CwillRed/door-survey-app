import type { ChangeEvent } from 'react';
import type { PhotoCollection, PhotoItem, PhotoSlot } from '../types';

type PhotoManagerProps = {
  requiredSlots: PhotoSlot[];
  photos: PhotoCollection;
  onChange: (photos: PhotoCollection) => void;
  additionalLabel: string;
};

const mobileCameraInputProps = {
  type: 'file' as const,
  accept: 'image/*',
  capture: 'environment' as const,
};

function buildPhotoItems(files: FileList | null): PhotoItem[] {
  if (!files) {
    return [];
  }

  return Array.from(files).map((file) => ({
    id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    previewUrl: URL.createObjectURL(file),
  }));
}

function totalPhotoCount(photos: PhotoCollection) {
  return Object.values(photos.required).reduce((count, items) => count + items.length, 0) + photos.additional.length;
}

export function PhotoManager({
  requiredSlots,
  photos,
  onChange,
  additionalLabel,
}: PhotoManagerProps) {
  const additionalPreviewPhotos = photos.additional.filter((photo) => Boolean(photo.previewUrl)).slice(-3);
  const additionalPhotosWithoutPreview = photos.additional.length - additionalPreviewPhotos.length;
  const missingRequiredCount = requiredSlots.filter(
    (slot) => (photos.required[slot.id] ?? []).length === 0,
  ).length;

  const handleRequiredUpload = (slotId: string, event: ChangeEvent<HTMLInputElement>) => {
    const nextPhotos = buildPhotoItems(event.target.files);
    onChange({
      ...photos,
      required: {
        ...photos.required,
        [slotId]: [...(photos.required[slotId] ?? []), ...nextPhotos],
      },
    });
    event.target.value = '';
  };

  const handleAdditionalUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const nextPhotos = buildPhotoItems(event.target.files);
    onChange({
      ...photos,
      additional: [...photos.additional, ...nextPhotos],
    });
    event.target.value = '';
  };

  return (
    <div className="photo-section">
      <div className="photo-section__meta">
        <strong>{totalPhotoCount(photos)} photos</strong>
        <span>
          {missingRequiredCount === 0
            ? 'All required photo views captured.'
            : `${missingRequiredCount} required photo ${missingRequiredCount === 1 ? 'slot is' : 'slots are'} still missing.`}
        </span>
      </div>

      <div className="photo-grid">
        {requiredSlots.map((slot) => {
          const slotPhotos = photos.required[slot.id] ?? [];
          const latestPhoto = slotPhotos[slotPhotos.length - 1];
          const isMissing = slotPhotos.length === 0;

          return (
            <label
              key={slot.id}
              className={`photo-upload photo-upload--required${isMissing ? ' photo-upload--missing' : ' photo-upload--complete'}`}
            >
              <div className="photo-upload__heading">
                <span className="photo-upload__label">{slot.label}</span>
                <span className={`photo-badge${isMissing ? ' photo-badge--missing' : ' photo-badge--complete'}`}>
                  {isMissing ? 'Required' : 'Captured'}
                </span>
              </div>
              <div className="photo-upload__preview">
                {latestPhoto?.previewUrl ? (
                  <img src={latestPhoto.previewUrl} alt={latestPhoto.name} className="photo-upload__image" />
                ) : (
                  <span>
                    {latestPhoto
                      ? 'Previously captured photo. Preview is unavailable outside the active session.'
                      : 'Thumbnail placeholder'}
                  </span>
                )}
              </div>
              <div className="photo-upload__meta">
                <span>{slotPhotos.length} uploaded</span>
                <span>
                  {isMissing
                    ? 'Missing required view'
                    : latestPhoto?.previewUrl
                      ? 'Latest session preview shown above'
                      : 'Slot was previously filled, but no in-session preview is available'}
                </span>
              </div>
              <span className="photo-upload__button">Upload Photo</span>
              <input
                {...mobileCameraInputProps}
                multiple
                onChange={(event) => handleRequiredUpload(slot.id, event)}
              />
            </label>
          );
        })}

        <label className="photo-upload photo-upload--additional">
          <span className="photo-upload__label">{additionalLabel}</span>
          <div className="photo-upload__preview photo-upload__preview--stack">
            {photos.additional.length > 0 ? (
              additionalPreviewPhotos.length > 0 ? (
                <div className="photo-stack">
                  {additionalPreviewPhotos.map((photo) => (
                    <img key={photo.id} src={photo.previewUrl} alt={photo.name} className="photo-upload__image" />
                  ))}
                </div>
              ) : (
                <span>{photos.additional.length} additional photos were captured. Session previews are unavailable.</span>
              )
            ) : (
              <span>Unlimited additional photos</span>
            )}
          </div>
          <div className="photo-upload__meta">
            <span>{photos.additional.length} uploaded</span>
            <span>
              {photos.additional.length === 0
                ? 'Photo previews stay available during the active session only'
                : additionalPhotosWithoutPreview > 0
                  ? `${additionalPhotosWithoutPreview} saved photo ${additionalPhotosWithoutPreview === 1 ? 'preview is' : 'previews are'} unavailable in this session`
                  : 'Recent session previews shown above'}
            </span>
          </div>
          <span className="photo-upload__button">Add Photos</span>
          <input
            {...mobileCameraInputProps}
            multiple
            onChange={handleAdditionalUpload}
          />
        </label>
      </div>
    </div>
  );
}
