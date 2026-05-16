import { useQrCode } from '../hooks/useQrCode';
import { InputTabs } from './InputTabs';
import { QrPreview } from './QrPreview';

export function QrGenerator() {
  const { inputType, setInputType, content, setContent, downloading, toast, download, qrRef } = useQrCode();

  return (
    <div className="min-h-screen bg-green-400 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl rounded-2xl border border-gray-700 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-12 bg-gray-900 border-b border-gray-700 md:border-b-0 md:border-r">
            <h1 className="text-white text-3xl font-semibold mb-8">สร้าง QR Code</h1>
            <InputTabs
              inputType={inputType}
              setInputType={setInputType}
              content={content}
              setContent={setContent}
            />
          </div>

          <div className="p-12 bg-gray-950 flex items-center justify-center">
            <QrPreview
              content={content}
              qrRef={qrRef}
              downloading={downloading}
              toast={toast}
              onDownload={download}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
