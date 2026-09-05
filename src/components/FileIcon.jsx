import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FilePdf,
  FileText,
  FileVideo,
} from '@phosphor-icons/react';

const MAP = {
  'ph-file': File,
  'ph-file-image': FileImage,
  'ph-file-video': FileVideo,
  'ph-file-audio': FileAudio,
  'ph-file-archive': FileArchive,
  'ph-file-pdf': FilePdf,
  'ph-file-text': FileText,
};

export default function FileIcon({ name, type = '', size = 20, className = '' }) {
  const key = (() => {
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext) || type.startsWith('image/'))
      return 'ph-file-image';
    if (['mp4', 'webm', 'mkv'].includes(ext) || type.startsWith('video/')) return 'ph-file-video';
    if (['mp3', 'wav', 'ogg', 'flac'].includes(ext) || type.startsWith('audio/'))
      return 'ph-file-audio';
    if (['zip', 'rar', '7z'].includes(ext)) return 'ph-file-archive';
    if (['pdf'].includes(ext)) return 'ph-file-pdf';
    if (['txt', 'json', 'html', 'css', 'js', 'md'].includes(ext)) return 'ph-file-text';
    return 'ph-file';
  })();
  const Cmp = MAP[key] || File;
  return <Cmp size={size} weight="bold" className={className} aria-hidden="true" />;
}
