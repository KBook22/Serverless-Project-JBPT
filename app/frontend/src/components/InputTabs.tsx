import type { InputType } from '../hooks/useQrCode';

interface Props {
  inputType: InputType;
  setInputType: (t: InputType) => void;
  content: string;
  setContent: (v: string) => void;
}

export function InputTabs({ inputType, setInputType, content, setContent }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
        {(['url', 'plaintext'] as InputType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setInputType(tab); setContent(''); }}
            className={`flex-1 py-2.5 px-4 rounded-md text-base font-medium transition-colors cursor-pointer ${
              inputType === tab
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab === 'url' ? 'URL' : 'ข้อความ'}
          </button>
        ))}
      </div>

      <input
        type={inputType === 'url' ? 'url' : 'text'}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={inputType === 'url' ? 'ใส่ URL' : 'ใส่ข้อความ'}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-5 py-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
      />

      {inputType === 'url' && (
        <p className="text-gray-500 text-sm">เช่น https://example.com/</p>
      )}
      {inputType === 'plaintext'&&(
        <p className='text-gray-500 text-sm'>เช่น ทดสอบข้อความธรรมดา</p>
      )}
    </div>
  );
}
