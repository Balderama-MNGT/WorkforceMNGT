import { useState, useMemo, useEffect } from 'react';
import { CheckCircle, AlertTriangle, Timer, Download, Coffee, MapPin } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import SearchBar from '../../components/ui/SearchBar';
import { Select } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Table';
import attendanceData from '../../mock-data/attendance';
import { employeeService } from '../../services/api';
import { formatHours } from '../../services/attendanceService';
import { formatDate, formatTime } from '../../utils/helpers';

const statusVariant = { Present: 'success', Late: 'warning', Absent: 'danger', 'Half Day': 'info', 'On Leave': 'default' };

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  useEffect(() => {
    employeeService.getAll()
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, []);

  const todayStr = '2026-07-25';

  const enriched = useMemo(() => {
    return attendanceData.map(a => {
      const emp = employees.find(e => e.id === a.employeeId);
      return { ...a, firstName: emp?.firstName || '', lastName: emp?.lastName || '', avatar: emp?.avatar, department: emp?.department || '' };
    });
  }, [employees]);

  const todayRecords = useMemo(() => enriched.filter(a => a.date === todayStr), [enriched]);

  const stats = useMemo(() => ({
    present: todayRecords.filter(a => a.status === 'Present').length,
    late: todayRecords.filter(a => a.status === 'Late').length,
    absent: todayRecords.filter(a => a.status === 'Absent').length,
    avgOvertime: todayRecords.length ? (todayRecords.reduce((s, a) => s + (a.overtime || 0), 0) / todayRecords.length).toFixed(1) : '0.0',
  }), [todayRecords]);

  const filtered = useMemo(() => {
    return enriched.filter(a => {
      const name = `${a.firstName} ${a.lastName}`.toLowerCase();
      const matchSearch = !search || name.includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || a.status === statusFilter;
      let matchPeriod = true;
      if (periodFilter === 'Today') matchPeriod = a.date === todayStr;
      else if (periodFilter === 'This Week') {
        const d = new Date(a.date);
        const now = new Date(todayStr);
        const dayOfWeek = now.getDay();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - dayOfWeek);
        matchPeriod = d >= weekStart && d <= now;
      }
      return matchSearch && matchStatus && matchPeriod;
    });
  }, [enriched, search, statusFilter, periodFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time & Attendance</h1>
          <p className="text-[14px] text-gray-500 mt-1">Track employee attendance and working hours</p>
        </div>
        <Button variant="outline" icon={Download}>Export</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Present Today', value: stats.present, icon: CheckCircle, color: 'emerald' },
          { label: 'Late Today', value: stats.late, icon: AlertTriangle, color: 'red' },
          { label: 'Absent Today', value: stats.absent, icon: Coffee, color: 'amber' },
          { label: 'Avg Overtime', value: `${stats.avgOvertime}h`, icon: Timer, color: 'blue' },
        ].map(s => {
          const colorMap = { emerald: 'bg-emerald-50 text-emerald-600', red: 'bg-red-50 text-red-600', amber: 'bg-amber-50 text-amber-600', blue: 'bg-blue-50 text-blue-600' };
          const barMap = { emerald: 'bg-emerald-500', red: 'bg-red-500', amber: 'bg-amber-500', blue: 'bg-blue-500' };
          return (
            <Card key={s.label} className="overflow-hidden" hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[s.color]}`}>
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
              <div className={`h-1 rounded-full mt-4 ${barMap[s.color]}`} />
            </Card>
          );
        })}
      </div>

      {/* Attendance History */}
      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-gray-900">Attendance History</h3>
            <div className="flex items-center gap-3">
              <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search employee..." className="w-64" />
              <Select value={periodFilter} onChange={e => { setPeriodFilter(e.target.value); setCurrentPage(1); }} containerClass="w-36">
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
              </Select>
              <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} containerClass="w-36">
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="On Leave">On Leave</option>
              </Select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Employee', 'Date', 'Clock In', 'Clock Out', 'Regular', 'Overtime', 'Total', 'Status', 'Location'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400 text-sm">No attendance records found</td></tr>
              ) : (
                paginated.map((a, i) => (
                  <tr key={a.id || i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={a.firstName} lastName={a.lastName} size="sm" src={a.avatar} />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{a.firstName} {a.lastName}</p>
                          <p className="text-xs text-gray-500">{a.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{formatDate(a.date)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{a.clockIn ? formatTime(a.clockIn) : '-'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{a.clockOut ? formatTime(a.clockOut) : <span className="text-amber-500 italic">Still in</span>}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">{a.clockIn && a.clockOut ? `${formatHours(a.regularHours)}h` : '-'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{a.overtime > 0 ? `${formatHours(a.overtime)}h` : '-'}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700 font-medium">{a.clockIn && a.clockOut ? `${formatHours(a.totalHours)}h` : '-'}</td>
                    <td className="px-4 py-3.5"><Badge variant={statusVariant[a.status]} dot size="xs">{a.status}</Badge></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {a.location}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 border-t border-gray-100">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
