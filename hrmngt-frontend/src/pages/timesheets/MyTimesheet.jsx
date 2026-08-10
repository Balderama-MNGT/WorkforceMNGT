import { useMemo, useState } from 'react';
import { CalendarDays, Clock3, Timer, Coffee, Filter, Send } from 'lucide-react';
import { useTimesheets, submitTimesheet } from '../../hooks/useTimesheets';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import KpiCard from '../../components/dashboard/KpiCard';
import { formatDate } from '../../utils/helpers';

const statusVariant = {
  Draft: 'default',
  Submitted: 'warning',
  Approved: 'success',
  Rejected: 'danger',
};

const hours = (value) => `${Number(value || 0).toFixed(1)}h`;

export default function MyTimesheet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const employeeId = user?.id || 'EMP001';
  const [period, setPeriod] = useState('All');
  const data = useTimesheets();

  const records = useMemo(
    () => data
      .filter((t) => t.employeeId === employeeId)
      .sort((a, b) => b.weekEnd.localeCompare(a.weekEnd)),
    [data, employeeId]
  );

  const filtered = period === 'All' ? records : records.slice(0, period === 'Latest' ? 1 : 2);
  const latest = records[0];

  const handleSubmit = () => {
    if (!latest || latest.status !== 'Draft') return;
    const submitted = submitTimesheet(latest.id);
    if (submitted) {
      toast.success('Timesheet Submitted', 'Timesheet submitted successfully for HR review.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Timesheet</h1>
          <p className="text-[14px] text-gray-500 mt-1">Review your weekly working hours and timesheet status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{formatDate(new Date().toISOString())}</span>
          </div>
          {latest?.status === 'Draft' && (
            <Button variant="primary" size="md" icon={Send} onClick={handleSubmit}>Submit Timesheet</Button>
          )}
        </div>
      </div>

      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiCard label="Regular Hours" value={hours(latest.regularHours)} icon={Clock3} accent="blue" />
          <KpiCard label="Overtime" value={hours(latest.overtimeHours)} icon={Timer} accent="purple" />
          <KpiCard label="Break Hours" value={hours(latest.breakHours)} icon={Coffee} accent="amber" />
          <KpiCard label="Total Hours" value={hours(latest.totalHours)} icon={Clock3} accent="emerald" />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900">Timesheet History</h3>
            <p className="text-xs text-gray-400 mt-1">Only your timesheets are shown.</p>
          </div>
          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-gray-400 mr-1" />
            {['All', 'Latest', 'Recent'].map((item) => (
              <button
                key={item}
                onClick={() => setPeriod(item)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg ${
                  period === item ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Week', 'Regular Hours', 'Overtime', 'Break', 'Total Hours', 'Status'].map((head) => (
                  <th key={head} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">No timesheet records found.</td></tr>
              ) : filtered.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-4 text-sm font-medium text-gray-900">
                    {formatDate(row.weekStart)} – {formatDate(row.weekEnd)}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">{hours(row.regularHours)}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{hours(row.overtimeHours)}</td>
                  <td className="px-5 py-4 text-sm text-gray-700">{hours(row.breakHours)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">{hours(row.totalHours)}</td>
                  <td className="px-5 py-4">
                    <Badge variant={statusVariant[row.status] || 'default'} dot size="xs">{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
