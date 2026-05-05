import type { RefObject } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import type { Toast } from '../hooks/useQrCode';

interface Props {
  content: string;
  qrRef: RefObject<HTMLDivElement | null>;
  downloading: boolean;
  toast: Toast | null;
  onDownload: () => void;
}

export function QrPreview({ content, qrRef, downloading, toast, onDownload }: Props) {
  const hasContent = content.trim().length > 0;

  return (
    <div className="flex flex-col items-center gap-6 relative">
      {toast && (
        <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg text-sm text-white whitespace-nowrap z-10 ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-gray-700'
        }`}>
          {toast.message}
        </div>
      )}

      <div
        ref={qrRef}
        className="bg-white rounded-2xl p-5 flex items-center justify-center"
        style={{ width: 320, height: 320 }}
      >
        {hasContent ? (
          <QRCodeCanvas value={content} size={280} />
        ) : (
          <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-600 flex items-center justify-center text-gray-500 text-sm select-none">
            ตัวอย่าง QR
          </div>
        )}
      </div>

      <button
        onClick={onDownload}
        disabled={!hasContent || downloading}
        className="px-8 py-3 rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {downloading ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด'}
      </button>
    </div>
  );
}
