'use client';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CloudUpload,
  Copy,
  ExternalLink,
  LoaderCircle,
  Download,
  Eye,
  FileText,
  GripVertical,
  Heart,
  Image as ImageIcon,
  KeyRound,
  LockKeyhole,
  MapPin,
  MessageSquareText,
  Palette,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, DragEvent, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import styles from './new-gallery.module.css';

type UploadItem = {
  id: string;
  file: File;
  preview: string;
};

type FormState = {
  title: string;
  client: string;
  shootDate: string;
  location: string;
  notes: string;
  galleryStyle: 'editorial' | 'masonry' | 'grid';
  accentColor: string;
  expiry: string;
  watermark: boolean;
  introTitle: string;
  introText: string;
  password: string;
  downloads: 'none' | 'single' | 'favorites' | 'all';
  favorites: boolean;
};

const steps = [
  { label: 'Basisgegevens', icon: ImageIcon },
  { label: "Foto's uploaden", icon: CloudUpload },
  { label: 'Instellingen', icon: Palette },
  { label: 'Introductiepagina', icon: FileText },
  { label: 'Toegang', icon: KeyRound },
  { label: 'Downloads', icon: Download },
  { label: 'Favorieten', icon: Heart },
  { label: 'Publiceren', icon: ShieldCheck },
];

const initialForm: FormState = {
  title: '',
  client: '',
  shootDate: '',
  location: '',
  notes: '',
  galleryStyle: 'editorial',
  accentColor: '#d97045',
  expiry: '3-months',
  watermark: false,
  introTitle: 'Welkom in jullie galerij',
  introText: 'Bedankt dat ik deze mooie herinneringen voor jullie mocht vastleggen. Veel kijkplezier!',
  password: '',
  downloads: 'all',
  favorites: true,
};

export default function NewGalleryPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [coverId, setCoverId] = useState<string | null>(null);
  const uploadsRef = useRef<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState('');
  const [publishedLink, setPublishedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [dragOverPhotoId, setDragOverPhotoId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeStep = useMemo(() => steps[step - 1], [step]);
  const ActiveStepIcon = activeStep.icon;
  const completion = Math.round((step / steps.length) * 100);

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  useEffect(() => {
    return () => uploadsRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
  }, []);

  useEffect(() => {
    setCoverId((current) => {
      if (current && uploads.some((item) => item.id === current)) return current;
      return uploads[0]?.id ?? null;
    });
  }, [uploads]);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const addFiles = (files: FileList | File[]) => {
    const valid = Array.from(files).filter((file) => file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name));
    const rejected = Array.from(files).length - valid.length;

    if (!valid.length) {
      setError('Kies JPG- of JPEG-bestanden. Andere bestandstypes worden niet toegevoegd.');
      return;
    }

    setUploads((current) => {
      const known = new Set(current.map((item) => `${item.file.name}-${item.file.size}-${item.file.lastModified}`));
      const fresh = valid
        .filter((file) => !known.has(`${file.name}-${file.size}-${file.lastModified}`))
        .map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          preview: URL.createObjectURL(file),
        }));
      return [...current, ...fresh];
    });

    setError(rejected ? `${rejected} bestand(en) overgeslagen. Alleen JPG/JPEG is toegestaan.` : '');
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = '';
  };

  const removeUpload = (id: string) => {
    setUploads((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.id !== id);
    });
  };

  const reorderUpload = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setUploads((current) => {
      const sourceIndex = current.findIndex((item) => item.id === sourceId);
      const targetIndex = current.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const moveUpload = (index: number, direction: -1 | 1) => {
    setUploads((current) => {
      const next = [...current];
      const destination = index + direction;
      if (destination < 0 || destination >= next.length) return current;
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };


  const moveUploadToPosition = (id: string, position: number) => {
    setUploads((current) => {
      if (!current.length) return current;
      const sourceIndex = current.findIndex((item) => item.id === id);
      if (sourceIndex < 0) return current;
      const targetIndex = Math.max(0, Math.min(current.length - 1, Math.round(position) - 1));
      if (sourceIndex === targetIndex) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  const validateStep = () => {
    if (step === 1 && (!form.title.trim() || !form.client.trim() || !form.shootDate)) {
      setError('Vul minstens de galerijnaam, klant en datum van de shoot in.');
      return false;
    }
    if (step === 2 && uploads.length === 0) {
      setError('Voeg minstens één JPG-foto toe om verder te gaan.');
      return false;
    }
    if (step === 5 && form.password.trim().length < 6) {
      setError('Kies een wachtwoord van minstens 6 tekens.');
      return false;
    }
    setError('');
    return true;
  };

  const requestWithTimeout = async (input: RequestInfo | URL, init: RequestInit, timeoutMs = 120000) => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      window.clearTimeout(timeout);
    }
  };


  const readApiResponse = async <T extends Record<string, unknown>>(response: Response): Promise<T> => {
    const raw = await response.text();
    if (!raw.trim()) {
      throw new Error(
        response.ok
          ? 'De server gaf geen bevestiging terug. Controleer de terminal en probeer opnieuw.'
          : `De server stopte zonder foutbericht (HTTP ${response.status}). Controleer de terminal voor meer details.`,
      );
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      const compact = raw.replace(/\s+/g, ' ').trim().slice(0, 220);
      throw new Error(
        `De server gaf geen geldig antwoord terug (HTTP ${response.status}). ${compact || 'Controleer de terminal voor meer details.'}`,
      );
    }
  };

  const publishGallery = async () => {
    if (!validateStep()) return;
    setIsPublishing(true);
    setPublishProgress('Galerij voorbereiden…');
    setError('');

    try {
      const createResponse = await requestWithTimeout('/api/photography/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', form, photoCount: uploads.length }),
      }, 30000);
      const createResult = await readApiResponse<{ galleryId?: string; url?: string; error?: string }>(createResponse);
      if (!createResponse.ok) throw new Error(createResult.error || 'De galerij kon niet voorbereid worden.');
      if (!createResult.galleryId) throw new Error('De server gaf geen galerij-id terug. Publiceren is gestopt.');

      for (let index = 0; index < uploads.length; index += 1) {
        const item = uploads[index];
        setPublishProgress(`Foto ${index + 1} van ${uploads.length} uploaden…`);
        const photoPayload = new FormData();
        photoPayload.set('action', 'upload');
        photoPayload.set('galleryId', createResult.galleryId);
        photoPayload.set('sortOrder', String(index));
        photoPayload.set('isCover', String(item.id === coverId || (!coverId && index === 0)));
        photoPayload.set('photo', item.file, item.file.name);

        const uploadResponse = await requestWithTimeout('/api/photography/galleries', {
          method: 'POST',
          body: photoPayload,
        }, 180000);
        const uploadResult = await readApiResponse<{ ok?: boolean; error?: string }>(uploadResponse);
        if (!uploadResponse.ok) throw new Error(uploadResult.error || `Foto ${index + 1} kon niet geüpload worden.`);
      }

      setPublishProgress('Galerij publiceren…');
      const finalizeResponse = await requestWithTimeout('/api/photography/galleries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'finalize', galleryId: createResult.galleryId }),
      }, 30000);
      const finalizeResult = await readApiResponse<{ url?: string; error?: string }>(finalizeResponse);
      if (!finalizeResponse.ok) throw new Error(finalizeResult.error || 'De galerij kon niet gepubliceerd worden.');

      setPublishedLink(finalizeResult.url || createResult.url || "");
      setPublishProgress('');
    } catch (publishError) {
      const message = publishError instanceof DOMException && publishError.name === 'AbortError'
        ? "De upload duurde te lang en werd onderbroken. Probeer opnieuw of upload minder foto's tegelijk."
        : publishError instanceof Error
          ? publishError.message
          : 'De galerij kon niet gepubliceerd worden.';
      setError(message);
      setPublishProgress('');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyPublishedLink = async () => {
    await navigator.clipboard.writeText(publishedLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(8, current + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className={styles.pageShell}>
      <div className={styles.ambientOne} />
      <div className={styles.ambientTwo} />

      <section className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.brand}>
            <span className={styles.brandMonogram}>SG</span>
            <span className={styles.brandCopy}><strong>SaGo</strong><small>Photography</small></span>
          </div>

          <div className={styles.progressSummary}>
            <div><span>Galerij aanmaken</span><strong>{completion}%</strong></div>
            <span className={styles.progressTrack}><span style={{ width: `${completion}%` }} /></span>
          </div>

          <nav className={styles.stepper} aria-label="Stappen galerij aanmaken">
            {steps.map((item, index) => {
              const number = index + 1;
              const isActive = number === step;
              const isDone = number < step;
              return (
                <button
                  type="button"
                  key={item.label}
                  className={`${styles.stepItem} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}
                  onClick={() => number <= step && setStep(number)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className={styles.stepRail} aria-hidden="true" />
                  <span className={styles.stepNumber}>{isDone ? <Check size={15} /> : number}</span>
                  <span className={styles.stepCopy}>
                    <strong>{item.label}</strong>
                    {isActive && <small>Nu bezig</small>}
                  </span>
                </button>
              );
            })}
          </nav>

          <div className={styles.sidebarTip}>
            <Sparkles size={18} />
            <p><strong>Alles wordt tussentijds bewaard</strong><span>Je kunt later verdergaan met deze galerij.</span></p>
          </div>
        </aside>

        <section className={styles.contentCard}>
          <header className={styles.header}>
            <div className={styles.titleBlock}>
              <div className={styles.titleIcon}><ActiveStepIcon size={29} strokeWidth={1.7} /></div>
              <div>
                <span className={styles.eyebrow}>Stap {step} van 8 · {activeStep.label}</span>
                <h1>Nieuwe galerij</h1>
                <p>{stepDescription(step)}</p>
              </div>
            </div>
            <button type="button" className={styles.closeButton} onClick={() => history.back()} aria-label="Sluiten"><X size={21} /></button>
          </header>

          {error && <div className={styles.errorBanner} role="alert"><span>!</span>{error}</div>}

          <div className={styles.formArea}>
            {step === 1 && <BasicDetails form={form} updateField={updateField} />}
            {step === 2 && (
              <UploadStep
                uploads={uploads}
                isDragging={isDragging}
                inputRef={inputRef}
                setIsDragging={setIsDragging}
                handleDrop={handleDrop}
                handleFileInput={handleFileInput}
                removeUpload={removeUpload}
                moveUpload={moveUpload}
                moveUploadToPosition={moveUploadToPosition}
                coverId={coverId}
                setCoverId={setCoverId}
                reorderUpload={reorderUpload}
                draggedPhotoId={draggedPhotoId}
                dragOverPhotoId={dragOverPhotoId}
                setDraggedPhotoId={setDraggedPhotoId}
                setDragOverPhotoId={setDragOverPhotoId}
              />
            )}
            {step === 3 && <SettingsStep form={form} updateField={updateField} />}
            {step === 4 && <IntroStep form={form} updateField={updateField} uploads={uploads} coverId={coverId} />}
            {step === 5 && <AccessStep form={form} updateField={updateField} />}
            {step === 6 && <DownloadsStep form={form} updateField={updateField} />}
            {step === 7 && <FavoritesStep form={form} updateField={updateField} />}
            {step === 8 && <PublishStep form={form} uploads={uploads} coverId={coverId} setCoverId={setCoverId} moveUpload={moveUpload} moveUploadToPosition={moveUploadToPosition} reorderUpload={reorderUpload} draggedPhotoId={draggedPhotoId} setDraggedPhotoId={setDraggedPhotoId} dragOverPhotoId={dragOverPhotoId} setDragOverPhotoId={setDragOverPhotoId} />}
          </div>

          <footer className={styles.actions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => step === 1 ? history.back() : setStep((current) => Math.max(1, current - 1))}
            >
              <ArrowLeft size={18} /> {step === 1 ? 'Annuleren' : 'Vorige'}
            </button>
            <div className={styles.actionHint}>{step < 8 ? 'Je gegevens blijven bewaard' : 'Controleer alles vóór publicatie'}</div>
            <button type="button" className={styles.primaryButton} disabled={isPublishing} onClick={step === 8 ? publishGallery : goNext}>
              {isPublishing ? <><LoaderCircle className={styles.spin} size={18} /> {publishProgress || 'Publiceren…'}</> : <>{step === 8 ? 'Galerij publiceren' : 'Volgende'} <ArrowRight size={19} /></>}
            </button>
          </footer>
        </section>
      </section>
          {publishedLink && (
            <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPublishedLink('')}>
              <section className={styles.successModal} role="dialog" aria-modal="true" aria-labelledby="publish-success-title">
                <button type="button" className={styles.modalClose} onClick={() => setPublishedLink('')} aria-label="Venster sluiten"><X size={20} /></button>
                <div className={styles.successMark}><Check size={32} /></div>
                <span className={styles.modalEyebrow}>Galerij gepubliceerd</span>
                <h2 id="publish-success-title">Klaar om te delen met {form.client || 'de familie'}</h2>
                <p>De galerij is aangemaakt. Kopieer onderstaande persoonlijke link en stuur ze samen met het wachtwoord naar de familie.</p>
                <div className={styles.sharePanel}>
                  <span>Persoonlijke galerijlink</span>
                  <div><input readOnly value={publishedLink} /><button type="button" onClick={copyPublishedLink}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? 'Gekopieerd' : 'Kopiëren'}</button></div>
                </div>
                <div className={styles.passwordReminder}><KeyRound size={18} /><div><span>Wachtwoord voor de familie</span><strong>{form.password}</strong></div></div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.modalSecondary} onClick={copyPublishedLink}><Copy size={17} /> Link kopiëren</button>
                  <a className={styles.modalPrimary} href={publishedLink} target="_blank" rel="noreferrer">Galerij bekijken <ExternalLink size={17} /></a>
                </div>
              </section>
            </div>
          )}
    </main>
  );
}

function BasicDetails({ form, updateField }: { form: FormState; updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void }) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeading}><div><span>01</span><h2>Over deze fotoshoot</h2></div><p>Deze informatie wordt gebruikt in je admin en op de introductiepagina.</p></div>
      <div className={styles.fieldsGrid}>
        <Field icon={<ImageIcon />} label="Galerijnaam" required hint="Een herkenbare interne naam">
          <input value={form.title} onChange={(e) => updateField('title', e.target.value)} placeholder="Bijv. Familie Peeters – Lenteshoot 2026" />
        </Field>
        <Field icon={<UserRound />} label="Klant of familie" required hint="Wordt zichtbaar in de galerij">
          <input value={form.client} onChange={(e) => updateField('client', e.target.value)} placeholder="Naam van de klant of familie" />
        </Field>
        <Field icon={<CalendarDays />} label="Datum van de shoot" required>
          <input type="date" value={form.shootDate} onChange={(e) => updateField('shootDate', e.target.value)} />
        </Field>
        <Field icon={<MapPin />} label="Locatie">
          <input value={form.location} onChange={(e) => updateField('location', e.target.value)} placeholder="Bijv. Domein Bokrijk, Lommel" />
        </Field>
        <Field icon={<MessageSquareText />} label="Opmerkingen" hint="Alleen zichtbaar voor jou" wide>
          <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} placeholder="Extra opmerkingen over deze shoot..." rows={4} />
        </Field>
      </div>
    </div>
  );
}

function UploadStep(props: {
  uploads: UploadItem[];
  isDragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  setIsDragging: (value: boolean) => void;
  handleDrop: (event: DragEvent<HTMLDivElement>) => void;
  handleFileInput: (event: ChangeEvent<HTMLInputElement>) => void;
  removeUpload: (id: string) => void;
  moveUpload: (index: number, direction: -1 | 1) => void;
  moveUploadToPosition: (id: string, position: number) => void;
  coverId: string | null;
  setCoverId: (id: string) => void;
  reorderUpload: (sourceId: string, targetId: string) => void;
  draggedPhotoId: string | null;
  dragOverPhotoId: string | null;
  setDraggedPhotoId: (id: string | null) => void;
  setDragOverPhotoId: (id: string | null) => void;
}) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeading}><div><span>02</span><h2>Voeg je afgewerkte JPG-foto&apos;s toe</h2></div><p>Sleep bestanden of een volledige selectie rechtstreeks vanuit Finder naar het vlak.</p></div>
      <input ref={props.inputRef} className={styles.hiddenInput} type="file" accept="image/jpeg,.jpg,.jpeg" multiple onChange={props.handleFileInput} />
      <div
        className={`${styles.dropZone} ${props.isDragging ? styles.dropZoneActive : ''}`}
        onDragEnter={(event) => { event.preventDefault(); props.setIsDragging(true); }}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; props.setIsDragging(true); }}
        onDragLeave={(event) => { event.preventDefault(); if (event.currentTarget === event.target) props.setIsDragging(false); }}
        onDrop={props.handleDrop}
        onClick={() => props.inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && props.inputRef.current?.click()}
      >
        <span className={styles.uploadIcon}><UploadCloud size={34} /></span>
        <h3>{props.isDragging ? 'Laat los om toe te voegen' : "Sleep je foto's hierheen"}</h3>
        <p>of klik om bestanden te kiezen</p>
        <button type="button" className={styles.browseButton} onClick={(event) => { event.stopPropagation(); props.inputRef.current?.click(); }}>Selecteer JPG-bestanden</button>
        <small>JPG/JPEG • meerdere bestanden tegelijk • volgorde blijft behouden</small>
      </div>

      {props.uploads.length > 0 && (
        <div className={styles.uploadedArea}>
          <div className={styles.uploadSummary}><div><strong>{props.uploads.length} foto&apos;s toegevoegd</strong><span>{formatBytes(props.uploads.reduce((sum, item) => sum + item.file.size, 0))} · Pas het volgnummer aan, sleep de kaarten of gebruik de pijlen</span></div><button type="button" onClick={() => props.inputRef.current?.click()}>+ Meer toevoegen</button></div>
          <div className={styles.photoGrid}>
            {props.uploads.map((item, index) => (
              <article
                className={`${styles.photoCard} ${props.draggedPhotoId === item.id ? styles.photoCardDragging : ''} ${props.dragOverPhotoId === item.id && props.draggedPhotoId !== item.id ? styles.photoCardDropTarget : ''}`}
                key={item.id}
                onDragEnter={(event) => {
                  event.preventDefault();
                  if (props.draggedPhotoId && props.draggedPhotoId !== item.id && props.dragOverPhotoId !== item.id) {
                    props.setDragOverPhotoId(item.id);
                  }
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceId = props.draggedPhotoId || event.dataTransfer.getData('text/plain');
                  if (sourceId) props.reorderUpload(sourceId, item.id);
                  props.setDraggedPhotoId(null);
                  props.setDragOverPhotoId(null);
                }}
              >
                <div className={styles.photoPreview}>
                  <OrderInput value={index + 1} max={props.uploads.length} onCommit={(position) => props.moveUploadToPosition(item.id, position)} className={styles.orderInputOverlay} />
                  <Image src={item.preview} alt={item.file.name} fill unoptimized sizes="180px" />
                  {props.coverId === item.id && <span className={styles.coverBadge}>Omslag</span>}
                  <button type="button" className={styles.removePhoto} onClick={(event) => { event.stopPropagation(); props.removeUpload(item.id); }} aria-label={`${item.file.name} verwijderen`}><Trash2 size={16} /></button>
                </div>
                <div className={styles.photoMeta}>
                  <span
                    className={styles.dragHandle}
                    title="Sleep om de volgorde te wijzigen"
                    draggable
                    onDragStart={(event) => {
                      event.stopPropagation();
                      props.setDraggedPhotoId(item.id);
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', item.id);
                      const ghost = document.createElement('div');
                      ghost.style.width = '1px';
                      ghost.style.height = '1px';
                      ghost.style.opacity = '0';
                      document.body.appendChild(ghost);
                      event.dataTransfer.setDragImage(ghost, 0, 0);
                      requestAnimationFrame(() => ghost.remove());
                    }}
                    onDragEnd={() => { props.setDraggedPhotoId(null); props.setDragOverPhotoId(null); }}
                  ><GripVertical size={16} /></span>
                  <span title={item.file.name}>{item.file.name}</span>
                  <div className={styles.photoActions}>
                    {props.coverId !== item.id && (
                      <button type="button" className={styles.coverAction} onClick={(event) => { event.stopPropagation(); props.setCoverId(item.id); }} title="Instellen als omslagfoto">Omslag</button>
                    )}
                    <button type="button" disabled={index === 0} onClick={(event) => { event.stopPropagation(); props.moveUpload(index, -1); }} aria-label="Naar links">←</button>
                    <button type="button" disabled={index === props.uploads.length - 1} onClick={(event) => { event.stopPropagation(); props.moveUpload(index, 1); }} aria-label="Naar rechts">→</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsStep({ form, updateField }: StepProps) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeading}><div><span>03</span><h2>Galerijweergave</h2></div><p>Je kunt deze keuzes later altijd nog aanpassen.</p></div>
      <div className={styles.choiceGrid}>
        {[
          ['editorial', 'Redactioneel', 'Afwisselende formaten zoals een luxe fotoboek.'],
          ['masonry', 'Masonry', 'Natuurlijke verhoudingen in een vloeiend raster.'],
          ['grid', 'Strak raster', 'Rustige, gelijke tegels met veel overzicht.'],
        ].map(([value, title, text]) => (
          <button key={value} type="button" className={`${styles.choiceCard} ${form.galleryStyle === value ? styles.choiceActive : ''}`} onClick={() => updateField('galleryStyle', value as FormState['galleryStyle'])}>
            <span className={styles.layoutPreview} data-layout={value}><i /><i /><i /><i /></span><strong>{title}</strong><small>{text}</small>{form.galleryStyle === value && <Check size={18} />}
          </button>
        ))}
      </div>
      <div className={styles.settingsGrid}>
        <Field icon={<Palette />} label="Accentkleur">
          <div className={styles.colorControl}><input type="color" value={form.accentColor} onChange={(e) => updateField('accentColor', e.target.value)} /><input value={form.accentColor} onChange={(e) => updateField('accentColor', e.target.value)} /></div>
        </Field>
        <Field icon={<CalendarDays />} label="Beschikbaarheid">
          <Select value={form.expiry} onChange={(value) => updateField('expiry', value)} options={[['1-month', '1 maand'], ['3-months', '3 maanden'], ['6-months', '6 maanden'], ['12-months', '12 maanden'], ['never', 'Geen vervaldatum']]} />
        </Field>
        <Toggle title="Watermerk op webfoto's" description="Originelen blijven altijd zonder watermerk." checked={form.watermark} onChange={(value) => updateField('watermark', value)} />
      </div>
    </div>
  );
}

function IntroStep({ form, updateField, uploads, coverId }: StepProps & { uploads: UploadItem[]; coverId: string | null }) {
  const cover = uploads.find((item) => item.id === coverId)?.preview ?? uploads[0]?.preview;
  return (
    <div className={styles.introLayout}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeading}><div><span>04</span><h2>Persoonlijke introductie</h2></div><p>Bekijk meteen hoe de volledige galerij bij de familie zal overkomen.</p></div>
        <div className={styles.stackFields}>
          <Field icon={<FileText />} label="Titel"><input value={form.introTitle} onChange={(e) => updateField('introTitle', e.target.value)} /></Field>
          <Field icon={<MessageSquareText />} label="Welkomsttekst"><textarea rows={6} value={form.introText} onChange={(e) => updateField('introText', e.target.value)} /></Field>
        </div>
      </div>
      <div className={styles.fullPreview}>
        <div className={styles.previewToolbar}><div><Eye size={16} /><strong>Live voorbeeld van de volledige galerij</strong></div><span>{uploads.length} foto{uploads.length === 1 ? '' : "'s"}</span></div>
        <div className={styles.previewBrowser}>
          <div className={styles.browserBar}><i/><i/><i/><span>studiosago.be/galerij/{slugify(form.title || 'familie')}</span></div>
          <div className={styles.galleryHero} style={cover ? { backgroundImage: `linear-gradient(rgba(10,30,50,.12),rgba(10,30,50,.66)), url("${cover}")` } : undefined}>
            <small>{formatDate(form.shootDate)}{form.location ? ` · ${form.location}` : ''}</small><h3>{form.introTitle}</h3><p>{form.introText}</p><button type="button">Bekijk jullie foto&apos;s ↓</button>
          </div>
          <div className={styles.galleryPreviewBody}>
            <div className={styles.galleryIntro}><span>SaGo Photography</span><h4>{form.title || 'Jullie galerij'}</h4><p>{form.client || 'Familie'} · {formatDate(form.shootDate)}</p></div>
            <div className={`${styles.previewPhotoGrid} ${styles[`preview_${form.galleryStyle}`]}`}>
              {uploads.slice(0, 9).map((item, index) => <div key={item.id} className={styles.previewPhoto} data-index={index}><Image src={item.preview} alt="Galerijvoorbeeld" fill unoptimized sizes="220px" /></div>)}
              {uploads.length === 0 && Array.from({length:6}).map((_,index)=><div key={index} className={styles.previewPlaceholder}/>) }
            </div>
            <div className={styles.previewFooter}><Heart size={15}/> Met zorg vastgelegd door SaGo Photography</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccessStep({ form, updateField }: StepProps) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeading}><div><span>05</span><h2>Veilige toegang</h2></div><p>De galerij wordt niet opgenomen in Google en is alleen bereikbaar via de unieke link.</p></div>
      <div className={styles.securityCard}><span><LockKeyhole size={24} /></span><div><strong>Privégalerij</strong><p>Alle foto&apos;s worden afgeschermd en de klant heeft een wachtwoord nodig.</p></div><ShieldCheck size={26} /></div>
      <div className={styles.stackFields}>
        <Field icon={<KeyRound />} label="Wachtwoord" required hint="Minstens 6 tekens"><input type="text" value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Kies een veilig maar makkelijk deelbaar wachtwoord" /></Field>
        <div className={styles.generatedLink}><span>Voorbeeldlink</span><code>studiosago.be/galerij/{slugify(form.title || 'familie-peeters')}</code></div>
      </div>
    </div>
  );
}

function DownloadsStep({ form, updateField }: StepProps) {
  const options: Array<[FormState['downloads'], string, string]> = [
    ['none', 'Geen downloads', 'De klant kan de foto’s alleen bekijken.'],
    ['single', 'Afzonderlijke foto’s', 'Elke foto kan apart worden gedownload.'],
    ['favorites', 'Alleen favorieten', 'Alleen de gekozen selectie kan worden gedownload.'],
    ['all', 'Individueel + volledige galerij', 'De meest complete downloadoptie.'],
  ];
  return <OptionStep number="06" title="Downloadmogelijkheden" description="Bepaal wat deze klant mag downloaden." value={form.downloads} options={options} onChange={(value) => updateField('downloads', value as FormState['downloads'])} />;
}

function FavoritesStep({ form, updateField }: StepProps) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeading}><div><span>07</span><h2>Favorieten</h2></div><p>Laat klanten foto&apos;s markeren voor een album, afdruk of persoonlijke selectie.</p></div>
      <Toggle title="Favorieten inschakelen" description="Klanten zien een subtiel hartje bij elke foto." checked={form.favorites} onChange={(value) => updateField('favorites', value)} large />
      {form.favorites && <div className={styles.featureList}><span><Heart size={18} /> Eén persoonlijke favorietenlijst</span><span><Check size={18} /> Resultaten zichtbaar in admin</span><span><Download size={18} /> Selectie apart downloadbaar</span></div>}
    </div>
  );
}

function PublishStep({
  form,
  uploads,
  coverId,
  setCoverId,
  moveUpload,
  moveUploadToPosition,
  reorderUpload,
  draggedPhotoId,
  setDraggedPhotoId,
  dragOverPhotoId,
  setDragOverPhotoId,
}: {
  form: FormState;
  uploads: UploadItem[];
  coverId: string | null;
  setCoverId: (id: string) => void;
  moveUpload: (index: number, direction: -1 | 1) => void;
  moveUploadToPosition: (id: string, position: number) => void;
  reorderUpload: (sourceId: string, targetId: string) => void;
  draggedPhotoId: string | null;
  setDraggedPhotoId: (id: string | null) => void;
  dragOverPhotoId: string | null;
  setDragOverPhotoId: (id: string | null) => void;
}) {
  const rows = [
    ['Galerij', form.title], ['Klant', form.client], ['Datum', formatDate(form.shootDate)], ['Foto’s', `${uploads.length} JPG-bestanden`], ['Weergave', form.galleryStyle], ['Downloads', form.downloads], ['Favorieten', form.favorites ? 'Ingeschakeld' : 'Uitgeschakeld'], ['Beveiliging', 'Wachtwoord + niet indexeren'],
  ];

  return (
    <div className={styles.publishStack}>
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeading}><div><span>08</span><h2>Klaar om te publiceren</h2></div><p>Controleer de belangrijkste instellingen voor je de galerij aanmaakt.</p></div>
        <div className={styles.publishHero}><span><Check size={27} /></span><div><strong>Alles staat klaar</strong><p>Na publicatie kun je de link en het wachtwoord meteen kopiëren.</p></div></div>
        <dl className={styles.summaryList}>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Niet ingevuld'}</dd></div>)}</dl>
      </div>

      <div className={styles.sectionCard}>
        <div className={styles.sectionHeading}>
          <div><span>↕</span><h2>Definitieve fotovolgorde</h2></div>
          <p>Vul een nieuw volgnummer in, sleep via het greepicoon of gebruik de pijlen. Deze volgorde wordt exact gepubliceerd.</p>
        </div>
        <div className={styles.publishPhotoGrid}>
          {uploads.map((item, index) => (
            <article
              key={item.id}
              className={`${styles.publishPhotoCard} ${draggedPhotoId === item.id ? styles.publishPhotoDragging : ''} ${dragOverPhotoId === item.id ? styles.publishPhotoTarget : ''}`}
              onDragEnter={(event) => {
                event.preventDefault();
                if (draggedPhotoId && draggedPhotoId !== item.id && dragOverPhotoId !== item.id) setDragOverPhotoId(item.id);
              }}
              onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedPhotoId) reorderUpload(draggedPhotoId, item.id);
                setDraggedPhotoId(null);
                setDragOverPhotoId(null);
              }}
            >
              <div className={styles.publishPhotoImage}>
                <Image src={item.preview} alt={`Foto ${index + 1}`} fill unoptimized sizes="180px" />
                <OrderInput value={index + 1} max={uploads.length} onCommit={(position) => moveUploadToPosition(item.id, position)} className={styles.publishOrderInput} />
                {coverId === item.id && <span className={styles.publishCoverBadge}>Omslag</span>}
              </div>
              <div className={styles.publishPhotoControls}>
                <span
                  className={styles.publishDragHandle}
                  draggable
                  title="Sleep om de volgorde te wijzigen"
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', item.id);
                    setDraggedPhotoId(item.id);
                    const ghost = document.createElement('div');
                    ghost.style.width = '1px';
                    ghost.style.height = '1px';
                    ghost.style.opacity = '0';
                    document.body.appendChild(ghost);
                    event.dataTransfer.setDragImage(ghost, 0, 0);
                    requestAnimationFrame(() => ghost.remove());
                  }}
                  onDragEnd={() => { setDraggedPhotoId(null); setDragOverPhotoId(null); }}
                ><GripVertical size={17} /></span>
                <button type="button" disabled={index === 0} onClick={() => moveUpload(index, -1)} aria-label="Foto naar links">←</button>
                <button type="button" disabled={index === uploads.length - 1} onClick={() => moveUpload(index, 1)} aria-label="Foto naar rechts">→</button>
                {coverId !== item.id && <button type="button" className={styles.publishCoverButton} onClick={() => setCoverId(item.id)}>Als omslag</button>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}


function OrderInput({ value, max, onCommit, className }: { value: number; max: number; onCommit: (position: number) => void; className: string }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    const safe = Number.isFinite(parsed) ? Math.max(1, Math.min(max, parsed)) : value;
    setDraft(String(safe));
    onCommit(safe);
  };

  return (
    <label className={className} title={`Huidige positie ${value}. Vul een nummer van 1 tot ${max} in.`}>
      <span className={styles.orderInputLabel}>Nr.</span>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={draft}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        aria-label={`Volgnummer van foto ${value}`}
      />
    </label>
  );
}

function OptionStep({ number, title, description, value, options, onChange }: { number: string; title: string; description: string; value: string; options: Array<[string, string, string]>; onChange: (value: string) => void }) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.sectionHeading}><div><span>{number}</span><h2>{title}</h2></div><p>{description}</p></div>
      <div className={styles.optionList}>{options.map(([optionValue, optionTitle, optionText]) => <button type="button" key={optionValue} className={`${styles.optionRow} ${value === optionValue ? styles.optionSelected : ''}`} onClick={() => onChange(optionValue)}><span className={styles.radio}>{value === optionValue && <i />}</span><div><strong>{optionTitle}</strong><small>{optionText}</small></div>{value === optionValue && <Check size={19} />}</button>)}</div>
    </div>
  );
}

function Field({ icon, label, required, hint, wide, children }: { icon: ReactNode; label: ReactNode; required?: boolean; hint?: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <span className={styles.fieldTop}><span className={styles.fieldIcon}>{icon}</span><span><strong>{label}{required && <b>*</b>}</strong>{hint && <small>{hint}</small>}</span></span>
      <span className={styles.inputWrap}>{children}</span>
    </label>
  );
}

type StepProps = { form: FormState; updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void };

function Toggle({ title, description, checked, onChange, large }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void; large?: boolean }) {
  return <button type="button" className={`${styles.toggleRow} ${large ? styles.toggleLarge : ''}`} onClick={() => onChange(!checked)}><div><strong>{title}</strong><small>{description}</small></div><span className={`${styles.switch} ${checked ? styles.switchOn : ''}`}><i /></span></button>;
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<[string, string]> }) {
  return <span className={styles.selectWrap}><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}</select><ChevronDown size={18} /></span>;
}

function stepDescription(step: number) {
  return [
    'Geef de galerij een herkenbare naam en vul de gegevens van de shoot in.',
    'Voeg je afgewerkte JPG-bestanden toe en controleer de volgorde.',
    'Kies hoe de galerij eruitziet en hoe lang ze beschikbaar blijft.',
    'Schrijf een persoonlijke boodschap voor de klant.',
    'Beveilig de galerij met een unieke link en wachtwoord.',
    'Bepaal welke bestanden de klant mag downloaden.',
    'Laat klanten hun favoriete beelden verzamelen.',
    'Controleer alles en maak de galerij beschikbaar.',
  ][step - 1];
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function formatDate(value: string) {
  if (!value) return 'Datum nog niet gekozen';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function slugify(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
