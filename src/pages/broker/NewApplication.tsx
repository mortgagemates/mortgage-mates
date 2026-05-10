import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Zap } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import BrokerLayout from '../../components/BrokerLayout';
import { generateApplicationId, generateApplicationUrl, simulatePdfExtraction } from '../../utils/helpers';

interface UploadedFile {
  name: string;
  size: number;
}

function DropZone({
  label, file, onFile,
}: {
  label: string; file: UploadedFile | null; onFile: (f: UploadedFile) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type === 'application/pdf') onFile({ name: f.name, size: f.size });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile({ name: f.name, size: f.size });
  };

  return (
    <div>
      <p className="label">{label}</p>
      {file ? (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 border-dashed rounded-xl">
          <CheckCircle size={20} className="text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-800 truncate">{file.name}</p>
            <p className="text-xs text-emerald-600">{(file.size / 1024).toFixed(1)} KB · PDF</p>
          </div>
          <button
            className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
            type="button"
            onClick={() => inputRef.current?.click()}
          >
            Replace
          </button>
          <input ref={inputRef} type="file" accept=".pdf" hidden onChange={handleFile} />
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Upload size={24} className={`mb-3 ${dragging ? 'text-blue-500' : 'text-slate-400'}`} />
          <p className="text-sm font-medium text-slate-600 mb-1">
            Drop PDF here or <span className="text-blue-600">browse</span>
          </p>
          <p className="text-xs text-slate-400">PDF files only, max 10 MB</p>
          <input ref={inputRef} type="file" accept=".pdf" hidden onChange={handleFile} />
        </div>
      )}
    </div>
  );
}

export default function NewApplication() {
  const navigate = useNavigate();
  const { currentBroker, saveApplication } = useApp();
  const [appName, setAppName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [commitment, setCommitment] = useState<UploadedFile | null>(null);
  const [credit, setCredit] = useState<UploadedFile | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');

  if (!currentBroker) return null;

  const canExtract = commitment && credit && appName && clientName && clientEmail;

  const handleCreate = async () => {
    if (!canExtract) {
      setError('Please fill all fields and upload both PDFs.');
      return;
    }
    setError('');
    setExtracting(true);

    await new Promise(r => setTimeout(r, 2000));

    const id = generateApplicationId();
    const now = new Date().toISOString();
    const extracted = simulatePdfExtraction(commitment!.name, credit!.name);

    const app = {
      id,
      brokerId: currentBroker.id,
      applicationName: appName,
      clientName,
      clientEmail,
      status: 'pending' as const,
      progress: 30,
      createdAt: now,
      updatedAt: now,
      commitmentLetterName: commitment!.name,
      creditApplicationName: credit!.name,
      extractedData: extracted,
      intakeFormData: {},
      uniqueUrl: generateApplicationUrl(id),
      signatureStatus: 'not-requested' as const,
    };

    saveApplication(app);
    setExtracting(false);
    navigate(`/broker/applications/${id}`, { state: { justCreated: true } });
  };

  return (
    <BrokerLayout>
      <div className="p-8 max-w-2xl">
        <button
          onClick={() => navigate('/broker/applications')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Applications
        </button>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">New Application</h1>
        <p className="text-slate-500 text-sm mb-8">Upload the mortgage documents to extract key fields automatically.</p>

        <div className="space-y-6">
          {/* Basic info */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Application Details</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Application Name</label>
                <input
                  className="input"
                  placeholder="e.g. Smith Property Purchase"
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Client Full Name</label>
                  <input
                    className="input"
                    placeholder="John Smith"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Client Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="client@email.com"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900 mb-1">Document Upload</h2>
            <p className="text-xs text-slate-400 mb-5">
              Our AI will extract key mortgage data from these PDFs automatically
            </p>
            <div className="space-y-4">
              <DropZone label="Commitment Letter (PDF)" file={commitment} onFile={setCommitment} />
              <DropZone label="Credit Application (PDF)" file={credit} onFile={setCredit} />
            </div>
          </div>

          {/* Info */}
          {commitment && credit && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <Zap size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Ready to extract</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Both documents are uploaded. Click "Extract & Create" to automatically pull key fields from your PDFs.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/broker/applications')}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!canExtract || extracting}
              className="btn-primary flex-1"
            >
              {extracting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Extracting data…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Extract &amp; Create Application
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </BrokerLayout>
  );
}
