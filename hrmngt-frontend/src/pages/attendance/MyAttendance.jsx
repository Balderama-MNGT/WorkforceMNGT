import { useMemo, useState } from 'react';
import {
  CheckCircle, AlertTriangle, TrendingUp,
  CalendarDays, MapPin, Filter,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import KpiCard from '../../components/dashboard/KpiCard';
import LiveClock from '../../components/attendance/LiveClock';
import { attendance } from '../../mock-data/attendance';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatTime } from '../../utils/helpers';
import { formatHours } from '../../services/attendanceService';

const statusVariant = {
  Present: 'success', Late: 'warning', Absent: 'danger',
  'Half Day': 'info', 'On Leave': 'default',
};

export default function MyAttendance() {
  const { user } = useAuth();
  const employeeId = user?.id || 'EMP001';

  const records = attendance.filter((a) => a.employeeId === employeeId);
  const [periodFilter, setPeriodFilter] = useState('All');

  const myAttendance = useMemo(
    () => [...records].sort((a, b) => b.date.localeCompare(a.date)),
    [records]
  );

  const filtered = useMemo(() => {
    if (periodFilter === 'All') return myAttendance;
    const today = new Date();
    return myAttendance.filter((a) => {
      const d = new Date(a.date);
      if (periodFilter === 'This Week') {
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        return d >= weekStart && d <= today;
      }
      if (periodFilter === 'This Month') {
        return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
      }
      return true;
    });
  }, [myAttendance, periodFilter]);

  const presentCount = filtered.filter((a) => a.status === 'Present').length;
  const lateCount = filtered.filter((a) => a.status === 'Late').length;
  const totalWorkingDays = filtered.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = filtered.length ? Math.round((totalWorkingDays / filtered.length) * 100) : 0;

  const totalHoursWorked = useMemo(() => {
    return filtered.reduce((sum, a) => sum + (a.totalHours || 0), 0);
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-[14px] text-gray-500 mt-1">Track your attendance and working hours</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{formatDate(new Date().toISOString())}</span>
          </div>
          <LiveClock />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <KpiCard label="Days Present" value={presentCount} icon={CheckCircle} accent="emerald" />
        <KpiCard label="Days Late" value={lateCount} icon={AlertTriangle} accent="amber" />
        <KpiCard label="Attendance Rate" value={`${attendanceRate}%`} icon={TrendingUp} accent="blue" />
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[13px] font-medium text-gray-400">Total Hours Worked</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatHours(totalHoursWorked)}h</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-[13px] font-medium text-gray-400">Total Working Days</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalWorkingDays} days</p>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[560px] flex flex-col overflow-hidden">
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-[15px] font-semibold text-gray-900">Attendance History</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {['All', 'This Week', 'This Month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setPeriodFilter(period)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    periodFilter === period
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                {['Date', 'Day', 'Clock In', 'Clock Out', 'Regular Hours', 'Overtime', 'Total Hours', 'Status', 'Location'].map((h) => (
                  <th key={h} className="sticky top-0 z-10 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">
                    No attendance records found
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const dayName = new Date(a.date).toLocaleDateString('en-US', { weekday: 'short' });
                  const inProgress = a.clockIn && !a.clockOut;
                  const finalized = a.clockIn && a.clockOut;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">{formatDate(a.date)}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{dayName}</td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {a.clockIn ? formatTime(a.clockIn) : <span className="text-gray-400">Not Clocked In</span>}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {a.clockOut ? (
                          formatTime(a.clockOut)
                        ) : inProgress ? (
                          <span className="text-amber-500 italic">In Progress</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                        {finalized ? (
                          `${formatHours(a.regularHours)}h`
                        ) : inProgress ? (
                          <span className="text-amber-500 italic">In Progress</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {finalized ? (
                          a.overtime > 0 ? (
                            <span className="text-blue-600 font-medium">+{formatHours(a.overtime)}h</span>
                          ) : (
                            <span className="text-gray-400">No Overtime</span>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-semibold">
                        {finalized ? (
                          `${formatHours(a.totalHours)}h`
                        ) : inProgress ? (
                          <span className="text-amber-500 italic">In Progress</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={statusVariant[a.status]} dot size="xs">{a.status}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {a.location}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
