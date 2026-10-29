import React, { useState } from 'react';
import { ClipboardList, PlusCircle, CheckCircle2, XCircle, Camera, Check, ShieldCheck } from 'lucide-react';

export interface FieldLogEntry {
  id: string;
  date: string;
  observer: string;
  notes: string;
  rubricDryness: 0 | 1 | 2 | 3;
  alertConfirmed: boolean;
  photoUrl?: string;
  photoLabel: string;
}

const INITIAL_LOGS: FieldLogEntry[] = [
  {
    id: 'log-1',
    date: '2026-10-18',
    observer: 'R. Sharma (Field Forester)',
    notes: 'Soil core sampled at 45cm depth; high compaction and dry crumbling granular structure.',
    rubricDryness: 2,
    alertConfirmed: true,
    photoLabel: 'Root Core Sample (Sector 4A)',
  },
  {
    id: 'log-2',
    date: '2026-09-24',
    observer: 'A. Patel (Junior Ranger)',
    notes: 'Ground moisture probe reported 18% but physical auger showed moist clay below needle litter.',
    rubricDryness: 1,
    alertConfirmed: false,
    photoLabel: 'Surface Litter Moisture Check',
  },
  {
    id: 'log-3',
    date: '2026-08-30',
    observer: 'M. Chen (Eco-Hydrologist)',
    notes: 'Routine calibration check following heavy rain. Soil saturated; capacitance reading verified with TDR.',
    rubricDryness: 0,
    alertConfirmed: false,
    photoLabel: 'Sensor Node 1 Ground Anchor',
  },
];

const RUBRIC_LABELS: Record<number, { text: string; color: string }> = {
  0: { text: '0 - Saturated / Field Capacity', color: 'text-[#2ECC71]' },
  1: { text: '1 - Normal Moisture Equilibrium', color: 'text-[#B6F36A]' },
  2: { text: '2 - Moderate Root Zone Stress', color: 'text-[#F5B841]' },
  3: { text: '3 - Severe Moisture Wilt', color: 'text-[#E5533D]' },
};

export const FieldCheckLogCard: React.FC = () => {
  const [logs, setLogs] = useState<FieldLogEntry[]>(INITIAL_LOGS);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [formDate, setFormDate] = useState('2026-10-28');
  const [formObserver, setFormObserver] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formRubric, setFormRubric] = useState<0 | 1 | 2 | 3>(2);
  const [formConfirmed, setFormConfirmed] = useState(true);
  const [formPhoto, setFormPhoto] = useState('Core auger extraction 45cm');

  const confirmedCount = logs.filter(l => l.alertConfirmed).length;
  const falseAlarmCount = logs.filter(l => !l.alertConfirmed).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formObserver.trim() || !formNotes.trim()) return;

    const newEntry: FieldLogEntry = {
      id: `log-${Date.now()}`,
      date: formDate,
      observer: formObserver.trim(),
      notes: formNotes.trim(),
      rubricDryness: formRubric,
      alertConfirmed: formConfirmed,
      photoLabel: formPhoto,
    };

    setLogs([newEntry, ...logs]);
    setIsAdding(false);
    setFormObserver('');
    setFormNotes('');
  };

  return (
    <div className="glass-card p-6 border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group hover:border-[#2ECC71]/30 transition-all duration-300">
      <div>
        {/* Header & Confirmed / False Alarm Counts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#8A9A92] uppercase tracking-wider mb-1">
              <ClipboardList size={14} className="text-[#2ECC71]" aria-hidden="true" />
              <span>Ground Truth Validation Record</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Field Check Log & Verification
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2ECC71]/10 border border-[#2ECC71]/30 text-xs font-mono text-[#2ECC71]">
              <CheckCircle2 size={12} />
              <span>{confirmedCount} Confirmed Stress</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#8A9A92]">
              <XCircle size={12} />
              <span>{falseAlarmCount} False Alarms</span>
            </span>
          </div>
        </div>

        {/* Add Field Check Form Toggle */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-xs text-[#8A9A92]">
            Physical forestry survey logs validating or refuting automated stress alerts.
          </p>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2ECC71]/15 hover:bg-[#2ECC71]/25 text-[#B6F36A] border border-[#2ECC71]/30 text-xs font-mono transition-colors shrink-0"
          >
            <PlusCircle size={13} />
            <span>{isAdding ? 'Cancel Entry' : 'Log Ground Survey'}</span>
          </button>
        </div>

        {/* Add Entry Form Modal / Inline Collapsible */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-white/[0.03] border border-white/15 mb-4 space-y-3 font-sans text-xs animate-in fade-in duration-200">
            <div className="font-semibold text-white text-sm mb-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#2ECC71]" />
              <span>New Ground Truth Survey Entry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#8A9A92] block mb-1 font-mono text-[11px]">Survey Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2ECC71]"
                  required
                />
              </div>

              <div>
                <label className="text-[#8A9A92] block mb-1 font-mono text-[11px]">Observer Name & Title</label>
                <input
                  type="text"
                  placeholder="e.g. D. Miller (District Forester)"
                  value={formObserver}
                  onChange={(e) => setFormObserver(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2ECC71]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#8A9A92] block mb-1 font-mono text-[11px]">Dryness Rubric (0 to 3)</label>
                <select
                  value={formRubric}
                  onChange={(e) => setFormRubric(Number(e.target.value) as 0|1|2|3)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2ECC71]"
                >
                  <option value={0}>0 - Saturated / Field Capacity</option>
                  <option value={1}>1 - Normal Field Capacity</option>
                  <option value={2}>2 - Moderate Root Zone Stress</option>
                  <option value={3}>3 - Severe Moisture Wilt</option>
                </select>
              </div>

              <div>
                <label className="text-[#8A9A92] block mb-1 font-mono text-[11px]">Alert Confirmed?</label>
                <div className="flex items-center gap-3 pt-1">
                  <label className="flex items-center gap-1.5 text-white cursor-pointer">
                    <input
                      type="radio"
                      name="confirmed"
                      checked={formConfirmed}
                      onChange={() => setFormConfirmed(true)}
                      className="accent-[#2ECC71]"
                    />
                    <span>Yes (True Stress)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[#8A9A92] cursor-pointer">
                    <input
                      type="radio"
                      name="confirmed"
                      checked={!formConfirmed}
                      onChange={() => setFormConfirmed(false)}
                      className="accent-[#E5533D]"
                    />
                    <span>No (False Alarm)</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[#8A9A92] block mb-1 font-mono text-[11px]">Field Notes & Soil Texture Observations</label>
              <textarea
                rows={2}
                placeholder="Details on soil core condition, foliage chlorosis, or sensor hardware alignment..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2ECC71]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#8A9A92]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#2ECC71] text-[#06120C] font-semibold text-xs hover:bg-[#B6F36A] transition-colors"
              >
                Save Survey Record
              </button>
            </div>
          </form>
        )}

        {/* Existing Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-white/[0.03] text-[#8A9A92] font-mono text-[10px] uppercase border-b border-white/5">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Observer</th>
                <th className="py-2 px-3">Dryness Rubric</th>
                <th className="py-2 px-3">Alert Verified</th>
                <th className="py-2 px-3">Field Notes & Photo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-white whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="py-2.5 px-3 text-[#E5EFE9] whitespace-nowrap font-medium">
                    {log.observer}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                    <span className={RUBRIC_LABELS[log.rubricDryness].color}>
                      {RUBRIC_LABELS[log.rubricDryness].text.split('-')[0].trim()}★
                    </span>
                    <span className="text-[#8A9A92] text-[10px] ml-1">
                      ({RUBRIC_LABELS[log.rubricDryness].text.split('-')[1]?.trim()})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    {log.alertConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2ECC71]">
                        <CheckCircle2 size={12} /> Confirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8A9A92]">
                        <XCircle size={12} /> False Alarm
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-[#8A9A92] max-w-xs">
                    <p className="line-clamp-2 mb-1">{log.notes}</p>
                    <div className="inline-flex items-center gap-1 text-[10px] font-mono text-[#B6F36A] bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                      <Camera size={10} />
                      <span>{log.photoLabel}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#8A9A92]">
        <span>Ground Verification Rate: {Math.round((confirmedCount / (logs.length || 1)) * 100)}%</span>
        <span>Decision-Support Feedback Loop</span>
      </div>
    </div>
  );
};
