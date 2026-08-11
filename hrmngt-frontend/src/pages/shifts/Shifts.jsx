import { useState, useMemo, useEffect } from 'react';
import {
  CalendarDays, Plus, Clock, Edit, ArrowLeftRight, Check,
  Sun, Sunset, Moon, Zap, Search, FilterX
} from 'lucide-react';
import Card, { CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Input, { Select, Textarea } from '../../components/ui/Input';
import shiftsData from '../../mock-data/shifts';
import { employeeService } from '../../services/api';
import { formatDate, formatTime } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const { shiftDefinitions, shiftSchedules: initialShiftSchedules } = shiftsData;

const shiftIcons = { SHIFT001: Sun, SHIFT002: Sunset, SHIFT003: Moon, SHIFT004: Zap };
const shiftIconColors = {
  SHIFT001: 'text-emerald-600 bg-emerald-50',
  SHIFT002: 'text-amber-600 bg-amber-50',
  SHIFT003: 'text-violet-600 bg-violet-50',
  SHIFT004: 'text-blue-600 bg-blue-50',
};
const shiftBadgeVariant = { SHIFT001: 'success', SHIFT002: 'warning', SHIFT003: 'purple', SHIFT004: 'primary' };
const statusVariant = { Scheduled: 'primary', Completed: 'success', Swapped: 'purple', Cancelled: 'danger' };
const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Swapped', 'Cancelled'];

export default function Shifts() {
  const [employees, setEmployees] = useState([]);
  const { toast } = useToast();
  const [shiftSchedules, setShiftSchedules] = useState(initialShiftSchedules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({ employeeId: '', shiftId: '', date: '', notes: '' });
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    employeeService.getAll()
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, []);

  const allSchedules = useMemo(() => {
    return [...shiftSchedules].sort((a, b) => b.date.localeCompare(a.date));
  }, [shiftSchedules]);

  const stats = useMemo(() => {
    const total = shiftSchedules.length;
    const scheduled = shiftSchedules.filter(s => s.status === 'Scheduled').length;
    const completed = shiftSchedules.filter(s => s.status === 'Completed').length;
    const swapped = shiftSchedules.filter(s => s.status === 'Swapped').length;
    return { total, scheduled, completed, swapped };
  }, [shiftSchedules]);

  const departments = useMemo(() => {
    return [...new Set(employees.map(e => e.department).filter(Boolean))].sort();
  }, [employees]);

  const latestScheduleDate = useMemo(() => {
    return shiftSchedules.reduce((max, s) => (s.date > max ? s.date : max), '');
  }, [shiftSchedules]);

  const todayStats = useMemo(() => {
    const todaySchedules = shiftSchedules.filter(s => s.date === latestScheduleDate);
    const todayEmployeeCount = new Set(todaySchedules.map(s => s.employeeId)).size;
    const byShift = {};
    for (const def of shiftDefinitions) byShift[def.id] = 0;
    for (const s of todaySchedules) {
      if (byShift[s.shiftId] !== undefined) byShift[s.shiftId] += 1;
    }
    return { todayEmployeeCount, byShift };
  }, [shiftSchedules, latestScheduleDate]);

  const filteredSchedules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allSchedules.filter((s) => {
      const emp = employees.find((e) => e.id === s.employeeId);
      if (q) {
        const name = emp ? `${emp.firstName} ${emp.lastName}` : s.employeeName;
        if (!`${name} ${s.employeeId}`.toLowerCase().includes(q)) return false;
      }
      if (departmentFilter && emp?.department !== departmentFilter) return false;
      if (shiftFilter && s.shiftId !== shiftFilter) return false;
      if (dateFilter && s.date !== dateFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      return true;
    });
  }, [allSchedules, employees, searchQuery, departmentFilter, shiftFilter, dateFilter, statusFilter]);

  const hasActiveFilters = Boolean(searchQuery || departmentFilter || shiftFilter || dateFilter || statusFilter);

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('');
    setShiftFilter('');
    setDateFilter('');
    setStatusFilter('');
  };

  const openAdd = () => {
    setEditingSchedule(null);
    setFormData({ employeeId: '', shiftId: '', date: '', notes: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({ employeeId: schedule.employeeId, shiftId: schedule.shiftId, date: schedule.date, notes: '' });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.employeeId) errs.employeeId = 'Required';
    if (!formData.shiftId) errs.shiftId = 'Required';
    if (!formData.date) errs.date = 'Required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const employee = employees.find((e) => e.id === formData.employeeId);
    const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : '';

    if (editingSchedule) {
      const next = shiftSchedules.map((s) =>
        s.id === editingSchedule.id
          ? { ...s, employeeId: formData.employeeId, employeeName, shiftId: formData.shiftId, date: formData.date, notes: formData.notes }
          : s
      );
      initialShiftSchedules.splice(0, initialShiftSchedules.length, ...next);
      setShiftSchedules(next);
      toast.success('Shift Updated', `${employeeName}'s assignment was updated.`);
    } else {
      const newSchedule = {
        id: `SCH${String(shiftSchedules.length + 1).padStart(3, '0')}`,
        employeeId: formData.employeeId,
        employeeName,
        shiftId: formData.shiftId,
        date: formData.date,
        notes: formData.notes,
        status: 'Scheduled',
      };
      const next = [newSchedule, ...shiftSchedules];
      initialShiftSchedules.splice(0, initialShiftSchedules.length, ...next);
      setShiftSchedules(next);
      toast.success('Shift Assigned', `${employeeName} was scheduled for ${formData.date}.`);
    }

    setIsModalOpen(false);
  };

  const statsCards = [
    { label: 'Total Assignments', value: stats.total, icon: CalendarDays, color: 'blue' },
    { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'amber' },
    { label: 'Completed', value: stats.completed, icon: Check, color: 'emerald' },
    { label: 'Swapped', value: stats.swapped, icon: ArrowLeftRight, color: 'purple' },
  ];
  const colorMap = { blue: 'bg-blue-50 text-blue-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', purple: 'bg-purple-50 text-purple-600' };
  const barMap = { blue: 'bg-blue-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', purple: 'bg-purple-500' };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift & Schedule Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Create and manage employee shifts and schedules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map(s => (
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
        ))}
      </div>

      {/* Today's Schedule Summary */}
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Today's Schedule Summary</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{todayStats.todayEmployeeCount}</p>
              <p className="text-xs text-gray-400 mt-0.5">Employees scheduled &middot; {formatDate(latestScheduleDate)}</p>
            </div>
          </div>
          <div className="hidden md:block h-12 w-px bg-gray-100" />
          <div className="flex flex-wrap gap-2.5">
            {shiftDefinitions.map(shift => {
              const Icon = shiftIcons[shift.id] || Clock;
              return (
                <div key={shift.id} className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gray-50 min-w-[150px]">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${shiftIconColors[shift.id]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{shift.name}</p>
                    <p className="text-sm font-bold text-gray-900">{todayStats.byShift[shift.id] || 0} scheduled</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Schedule Management */}
      <Card padding={false} className="h-[560px] flex flex-col overflow-hidden">
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>Assign, review, and manage employee schedules</CardDescription>
            </div>
            <Button icon={Plus} onClick={openAdd}>Assign Schedule</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mt-5">
            <div className="sm:col-span-2">
              <Input icon={Search} placeholder="Search employee name or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            <Select value={shiftFilter} onChange={e => setShiftFilter(e.target.value)}>
              <option value="">All Shift Types</option>
              {shiftDefinitions.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
            <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 mt-4 flex-wrap">
            <p className="text-sm text-gray-500">
              Showing <span className="font-semibold text-gray-700">{filteredSchedules.length}</span> of {allSchedules.length} schedules
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                <FilterX className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {['Employee Name', 'Department', 'Shift Type', 'Date', 'Start Time', 'End Time', 'Schedule Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap sticky top-0 z-10 bg-gray-50 border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredSchedules.map(schedule => {
                const emp = employees.find(e => e.id === schedule.employeeId);
                const shiftDef = shiftDefinitions.find(s => s.id === schedule.shiftId);
                const empName = emp ? `${emp.firstName} ${emp.lastName}` : schedule.employeeName;
                return (
                  <tr key={schedule.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={emp?.firstName || ''} lastName={emp?.lastName || ''} size="sm" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{empName}</p>
                          <p className="text-xs text-gray-500">{schedule.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{emp?.department || '—'}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={shiftBadgeVariant[schedule.shiftId]} size="xs">
                        {shiftDef?.name || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-700 whitespace-nowrap">{formatDate(schedule.date)}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-700 whitespace-nowrap">{shiftDef ? formatTime(shiftDef.startTime) : '—'}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-700 whitespace-nowrap">{shiftDef ? formatTime(shiftDef.endTime) : '—'}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={statusVariant[schedule.status] || 'default'} dot size="xs">{schedule.status}</Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(schedule)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredSchedules.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-gray-500">No schedules found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or assign a new schedule.</p>
            </div>
          )}
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSchedule ? 'Edit Shift Assignment' : 'Add Shift Assignment'} size="md">
        <div className="space-y-4">
          <Select label="Employee" value={formData.employeeId} onChange={e => setFormData({ ...formData, employeeId: e.target.value })} error={formErrors.employeeId}>
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} - {emp.department}</option>
            ))}
          </Select>
          <Select label="Shift Type" value={formData.shiftId} onChange={e => setFormData({ ...formData, shiftId: e.target.value })} error={formErrors.shiftId}>
            <option value="">Select Shift</option>
            {shiftDefinitions.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
            ))}
          </Select>
          <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} error={formErrors.date} />
          <Textarea label="Notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Optional notes about this assignment..." rows={3} />
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editingSchedule ? 'Save Changes' : 'Add Assignment'}</Button>
        </div>
      </Modal>
    </div>
  );
}
