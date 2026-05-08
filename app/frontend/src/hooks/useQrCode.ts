import { useState, useRef, useCallback } from 'react';
import { api } from '../services/api';

export type InputType = 'url' | 'plaintext';

export interface Toast {
  message: string;
  type: 'success' | 'info';
}

export function useQrCode() {
  const [inputType, setInputType] = useState<InputType>('url');
  const [content, setContent] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: Toast['type']) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const download = useCallback(async () => {
    if (!content.trim() || downloading) return;
    setDownloading(true);
    try {
      const result = await api.upsert(content, inputType);
      if (result.success && result.data) {
        showToast(`ดาวน์โหลดสำเร็จ! มีการดาวน์โหลดไปแล้ว ${result.data.download_count} ครั้ง`, 'success');
        const canvas = qrRef.current?.querySelector('canvas');
        if (canvas) {
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = 'qrcode.png';
          link.click();
        }
      }
    } catch {
      showToast('ดาวน์โหลดล้มเหลว กรุณาลองใหม่', 'info');
    } finally {
      setDownloading(false);
    }
  }, [content, inputType, downloading, showToast]);

  return { inputType, setInputType, content, setContent, downloading, toast, download, qrRef };
}
