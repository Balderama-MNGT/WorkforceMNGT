import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Grid3X3, List, Mail, Phone, MapPin,
  Building, Briefcase, Calendar, Clock, Eye, Edit,
  Upload, Plus, Users, ChevronDown,
  CheckCircle, CalendarOff, UserX, Loader2, ScanFace
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Input, { Select, Textarea } from '../../components/ui/Input';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Table';
import EmptyState from '../../components/ui/EmptyState';
import { employeeService } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { DEPARTMENTS, POSITIONS, EMPLOYMENT_TYPES, EMPLOYMENT_STATUSES } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const statusVariant = { Active: 'success', 'On Leave': 'warning', Inactive: 'danger' };

const genders = ['Male', 'Female'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Employees() {
  const { toast } = useToast();
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [allRegistered, setAllRegistered] = useState([]);
  const [selectedRegistered, setSelectedRegistered] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setAllRegistered(data);
      setEmployeesData(data.filter((e) => e.rosterAdded !== false));
    } catch {
      toast.error('Error', 'Failed to load employees.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const registeredCandidates = useMemo(
    () => allRegistered.filter((e) => e.rosterAdded === false),
    [allRegistered]
  );

  const filteredCandidates = registeredCandidates;

  const departments = useMemo(() => ['All', ...new Set(employeesData.map(e => e.department))], [employeesData]);
  const types = ['All', 'Full-time', 'Part-time', 'Contract'];
  const statuses = ['All', 'Active', 'On Leave', 'Inactive'];

  const editPositionOptions = useMemo(() => {
    const current = formData.position;
    return current && !POSITIONS.includes(current) ? [...POSITIONS, current] : POSITIONS;
  }, [formData.position]);

  const stats = useMemo(() => ({
    total: employeesData.length,
    active: employeesData.filter(e => e.status === 'Active').length,
    onLeave: employeesData.filter(e => e.status === 'On Leave').length,
    inactive: employeesData.filter(e => e.status === 'Inactive').length,
  }), [employeesData]);

  const filtered = useMemo(() => {
    return employeesData.filter(e => {
      const matchSearch = !search ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        e.email.toLowerCase().includes(search.toLowerCase()) ||
        e.position.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter === 'All' || e.department === deptFilter;
      const matchStatus = statusFilter === 'All' || e.status === statusFilter;
      const matchType = typeFilter === 'All' || e.employmentType === typeFilter;
      return matchSearch && matchDept && matchStatus && matchType;
    });
  }, [employeesData, search, deptFilter, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / 12);
  const paginated = filtered.slice((currentPage - 1) * 12, currentPage * 12);

  const openView = (emp) => { setSelectedEmployee(emp); setIsViewOpen(true); };
  const openEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      ...emp,
      phone: emp.phone || emp.contactNumber || '',
      hireDate: emp.hireDate || emp.dateHired || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const openAdd = () => {
    setEditingEmployee(null);
    setSelectedRegistered(null);
    setDropdownOpen(false);
    setFormData({ registeredEmployeeId: '' });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const selectRegistered = (emp) => {
    setSelectedRegistered(emp);
    setFormData((prev) => ({ ...prev, registeredEmployeeId: emp.id }));
    setFormErrors((prev) => ({ ...prev, registeredEmployee: undefined }));
    setDropdownOpen(false);
  };

  const handleImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      toast.info('Import', `"${file.name}" selected. Employee import is not available in this demo.`);
    }
    e.target.value = '';
  };

  const validate = () => {
    const errs = {};

    if (editingEmployee) {
      if (!formData.firstName) errs.firstName = 'Required';
      if (!formData.lastName) errs.lastName = 'Required';
      if (!formData.email) {
        errs.email = 'Required';
      } else if (!EMAIL_REGEX.test(formData.email)) {
        errs.email = 'Please enter a valid email address.';
      }
      if (!formData.phone) errs.phone = 'Required';
      if (!formData.department) errs.department = 'Required';
      if (!formData.position) errs.position = 'Required';
    } else if (!formData.registeredEmployeeId) {
      errs.registeredEmployee = 'Please select a registered employee.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (!editingEmployee) {
      try {
        const added = await employeeService.addRegisteredEmployee(formData.registeredEmployeeId);
        setAllRegistered((prev) => prev.map((e) => (e.id === added.id ? added : e)));
        setEmployeesData((prev) => [added, ...prev]);
        toast.success('Employee Added', 'Employee added successfully.');
        setIsFormOpen(false);
      } catch {
        toast.error('Error', 'Failed to add employee. Please try again.');
      }
      return;
    }

    try {
      await employeeService.update(editingEmployee.id, formData);
      toast.success('Employee Updated', `${formData.firstName} ${formData.lastName}'s details were saved.`);
      await fetchEmployees();
      setIsFormOpen(false);
    } catch {
      toast.error('Error', 'Operation failed. Please try again.');
    }
  };

  const statCards = [
    { label: 'Total Employees', value: stats.total, icon: Users, color: 'blue' },
    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'emerald' },
    { label: 'On Leave', value: stats.onLeave, icon: CalendarOff, color: 'amber' },
    { label: 'Inactive', value: stats.inactive, icon: UserX, color: 'red' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  };
  const barMap = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage your workforce efficiently</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={Plus} size="md" onClick={openAdd}>Add Employee</Button>
          <Button variant="outline" icon={Upload} size="md" onClick={() => fileInputRef.current?.click()}>Import</Button>
          <input ref={fileInputRef} type="file" accept=".csv,.json" className="hidden" onChange={handleImportFile} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
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

      {/* Filters */}
      <Card padding={false}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setCurrentPage(1); }} placeholder="Search by name, position, or email..." className="flex-1 min-w-[240px]" />
            <Select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }} containerClass="w-44">
              {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
            </Select>
            <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} containerClass="w-36">
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </Select>
            <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} containerClass="w-36">
              {types.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t}</option>)}
            </Select>
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('table')} className={`p-2.5 transition-colors ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}>
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No employees found" description="Try adjusting your search or filters" />
        ) : viewMode === 'grid' ? (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginated.map(emp => (
                <Card key={emp.id} hover className="group">
                  <div className="flex items-start justify-between mb-3">
                    <Avatar firstName={emp.firstName} lastName={emp.lastName} size="lg" />
                    <Badge variant={statusVariant[emp.status]} dot size="xs">{emp.status}</Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</h3>
                  <p className="text-xs text-gray-400">{emp.id}</p>
                  <p className="text-sm text-gray-500 mt-0.5 mb-2">{emp.position}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge variant="primary" size="xs">{emp.department}</Badge>
                    <Badge variant={emp.faceRegistered ? 'success' : 'default'} size="xs">
                      <span className="flex items-center gap-1"><ScanFace className="w-3 h-3" /> {emp.faceRegistered ? 'Face Registered' : 'Face Not Registered'}</span>
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Mail className="w-3.5 h-3.5" /> {emp.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone className="w-3.5 h-3.5" /> {emp.phone}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5" /> {emp.assignedShift || 'No shift assigned'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(emp.hireDate)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Button size="xs" variant="ghost" icon={Eye} onClick={() => openView(emp)}>View</Button>
                    <Button size="xs" variant="ghost" icon={Edit} onClick={() => openEdit(emp)}>Edit</Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {['Employee ID', 'Employee', 'Department', 'Position', 'Employment Type', 'Assigned Shift', 'Account Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-500">{emp.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar firstName={emp.firstName} lastName={emp.lastName} size="sm" />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-gray-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{emp.department}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{emp.position}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{emp.employmentType}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{emp.assignedShift || '—'}</td>
                    <td className="px-4 py-3.5"><Badge variant={statusVariant[emp.status]} dot size="xs">{emp.status}</Badge></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openView(emp)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(emp)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors"><Edit className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && !loading && (
          <div className="px-4 border-t border-gray-100">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingEmployee ? 'Edit Employee' : 'Add Employee'} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {editingEmployee ? (
            <>
              <Input label="Employee ID" value={formData.id || ''} disabled />
              <Input label="First Name" required value={formData.firstName || ''} onChange={e => setFormData({ ...formData, firstName: e.target.value })} error={formErrors.firstName} placeholder="Enter first name" />
              <Input label="Middle Name" value={formData.middleName || ''} onChange={e => setFormData({ ...formData, middleName: e.target.value })} placeholder="Enter middle name" />
              <Input label="Last Name" required value={formData.lastName || ''} onChange={e => setFormData({ ...formData, lastName: e.target.value })} error={formErrors.lastName} placeholder="Enter last name" />
              <Input label="Email" type="email" required value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} error={formErrors.email} placeholder="email@company.com" />
              <Input label="Phone Number" required value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} error={formErrors.phone} placeholder="+63 9XX XXX XXXX" />
              <Input label="Date of Birth" type="date" value={formData.dateOfBirth || ''} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} />
              <Select label="Gender" value={formData.gender || ''} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                <option value="">Select gender</option>
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </Select>
              <Select label="Department" required value={formData.department || ''} onChange={e => setFormData({ ...formData, department: e.target.value })} error={formErrors.department}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select label="Position" required value={formData.position || ''} onChange={e => setFormData({ ...formData, position: e.target.value })} error={formErrors.position}>
                <option value="">Select Position</option>
                {editPositionOptions.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
              <Select label="Employment Type" required value={formData.employmentType || ''} onChange={e => setFormData({ ...formData, employmentType: e.target.value })}>
                <option value="">Select type</option>
                {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Input label="Date Hired" type="date" value={formData.hireDate || ''} onChange={e => setFormData({ ...formData, hireDate: e.target.value })} />
              <Select label="Status" value={formData.status || ''} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="">Select status</option>
                {EMPLOYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              <div className="md:col-span-2">
                <Textarea label="Address" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Enter full address" rows={2} />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-2">
                <div ref={dropdownRef} className="relative">
                  <label className="text-[13px] font-medium text-gray-700">
                    Select Registered Employee
                    <span className="text-red-500 ml-0.5">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className={`mt-1.5 w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm rounded-xl border bg-white transition-all duration-200 hover:border-gray-300 text-left ${formErrors.registeredEmployee ? 'border-red-300' : 'border-gray-200'} ${selectedRegistered ? 'text-gray-900' : 'text-gray-400'}`}
                  >
                    <span className="truncate">
                      {selectedRegistered
                        ? `${selectedRegistered.id} - ${selectedRegistered.firstName} ${selectedRegistered.lastName}`
                        : 'Select Registered Employee'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-20 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                      <ul className="max-h-48 overflow-y-auto py-1">
                        {filteredCandidates.length > 0 ? (
                          filteredCandidates.map((emp) => (
                            <li key={emp.id}>
                              <button
                                type="button"
                                onClick={() => selectRegistered(emp)}
                                className="w-full px-3.5 py-2.5 text-sm text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex items-center justify-between gap-2"
                              >
                                <span className="truncate">{emp.id} - {emp.firstName} {emp.lastName}</span>
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="px-3.5 py-3 text-sm text-gray-500">
                            No registered employees found. Register employees through Employee Registration first.
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                {formErrors.registeredEmployee && (
                  <p className="text-xs text-red-500 font-medium mt-1.5">{formErrors.registeredEmployee}</p>
                )}
              </div>

              {selectedRegistered && (
                <>
                  <div className="md:col-span-2 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
                    <p className="text-xs text-gray-500">
                      Employee details are pulled from the registered employee's record and are read-only.
                    </p>
                  </div>
                  <Input label="Employee ID" value={selectedRegistered.id} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                  <Input label="First Name" value={selectedRegistered.firstName} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                  <Input label="Last Name" value={selectedRegistered.lastName} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                  <Input label="Email" value={selectedRegistered.email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                  <Input label="Department" value={selectedRegistered.department} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                  <Input label="Position" value={selectedRegistered.position} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                  <Input label="Employment Type" value={selectedRegistered.employmentType} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                  <Input label="Date Hired" value={selectedRegistered.hireDate} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                </>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>{editingEmployee ? 'Save Changes' : 'Add Employee'}</Button>
        </div>
      </Modal>

      {/* View Profile Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Employee Profile" size="lg">
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar firstName={selectedEmployee.firstName} lastName={selectedEmployee.lastName} size="2xl" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                <p className="text-xs text-gray-400">{selectedEmployee.id}</p>
                <p className="text-gray-500 mt-0.5">{selectedEmployee.position}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant={statusVariant[selectedEmployee.status]} dot>{selectedEmployee.status}</Badge>
                  <Badge variant="primary">{selectedEmployee.department}</Badge>
                  <Badge variant={selectedEmployee.faceRegistered ? 'success' : 'default'}>
                    <span className="flex items-center gap-1"><ScanFace className="w-3.5 h-3.5" /> {selectedEmployee.faceRegistered ? 'Face Registered' : 'Face Not Registered'}</span>
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="w-4 h-4 text-gray-400" />{selectedEmployee.email}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4 text-gray-400" />{selectedEmployee.phone || selectedEmployee.contactNumber}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400" />{selectedEmployee.address}</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Employment Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Building className="w-4 h-4 text-gray-400" />{selectedEmployee.department}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Briefcase className="w-4 h-4 text-gray-400" />{selectedEmployee.employmentType}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Clock className="w-4 h-4 text-gray-400" />{selectedEmployee.assignedShift || 'No shift assigned'}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4 text-gray-400" />Hired {formatDate(selectedEmployee.hireDate)}</div>
                </div>
              </div>
            </div>
            {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedEmployee.skills.map((skill, i) => (
                    <Badge key={i} variant="info" size="sm">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
