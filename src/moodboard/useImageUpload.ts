import { useCallback, useState } from 'react';

type UploadState = 'idle' | 'uploading' | 'error';

export const useImageUpload = () => {
  const [status, setStatus] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string> => {
    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    let url: string;
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text() || 'Upload failed');
      }

      const data = await res.json();
      url = data?.url;
      if (typeof url !== 'string') {
        throw new Error('Invalid upload response');
      }
    } catch (err: any) {
      // Dev fallback: if API is missing locally, use object URL so the feature still works.
      const shouldFallback = err?.message?.includes('Upload failed') || err?.message?.includes('404');
      if (import.meta.env.DEV && shouldFallback) {
        url = URL.createObjectURL(file);
      } else {
        setStatus('error');
        const message = err?.message || 'Upload failed';
        setError(message);
        throw new Error(message);
      }
    }

    setStatus('idle');
    return url;
  }, []);

  return { upload, status, error };
};

export type UseImageUploadReturn = ReturnType<typeof useImageUpload>;
