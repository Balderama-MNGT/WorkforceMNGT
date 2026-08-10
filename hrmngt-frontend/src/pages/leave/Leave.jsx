import { useState, useMemo, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, FileText, Eye, Plus, Users } from 'lucide-react';
import Card from '../../components/ui/Card';
import KpiCard from '../../components/dashboard/KpiCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import SearchBar from '../../components/ui/SearchBar';
import Input, { Select, Textarea } from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Table';
import leavesData from '../../mock-data/leaves';
import { employeeService } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';
import { useRole } from '../../context/RoleContext';

const statusVariant = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
};

const leaveTypeVariant = {
  Vacation: 'primary',
  Sick: 'danger',
  Emergency: 'warning',
  Special: 'purple',
  'Half Day': 'default',
};

const allTabs = ['All Requests', 'Pending Approvals'];
const leaveTypes = ['Vacation', 'Sick', 'Emergency', 'Special'];

const ROWS_PER_PAGE = 8;

export default function Leave() {
  const [employees, setEmployees] = useState([]);
  const { toast } = useToast();
  const { currentRole } = useRole();

  useEffect(() => {
    employeeService.getAll()
      .then(setEmployees)
      .catch(() => setEmployees([]));
  }, []);

  const currentUser = employees[0] || {};
  const isEmployee = currentRole === 'Employee';
  const tabs = isEmployee ? ['My Requests'] : allTabs;
  const [activeTab, setActiveTab] = useState(isEmployee ? 'My Requests' : 'All Requests');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [leaves, setLeaves] = useState(leavesData);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [approveComment, setApproveComment] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ leaveType: 'Vacation', startDate: '', endDate: '', reason: '' });
  const [applyErrors, setApplyErrors] = useState({});

  const statuses = ['All', 'Pending', 'Approved', 'Rejected'];
  const types = ['All', ...leaveTypes];

  const filtered = useMemo(() => {
    return leaves.filter((l) => {
      if (activeTab === 'My Requests' && l.employeeId !== currentUser.id) return false;
      if (activeTab === 'Pending Approvals' && l.status !== 'Pending') return false;
      const matchSearch = !search || l.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || l.status === statusFilter;
      const matchType = typeFilter === 'All' || l.leaveType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [leaves, activeTab, search, statusFilter, typeFilter, currentUser.id]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const pendingCount = useMemo(() => leaves.filter((l) => l.status === 'Pending').length, [leaves]);

  const summaryMetrics = useMemo(() => {
    const approved = leaves.filter((l) => l.status === 'Approved');
    return {
      pending: pendingCount,
      approved: approved.length,
      onLeave: new Set(approved.map((l) => l.employeeId)).size,
      total: leaves.length,
    };
  }, [leaves, pendingCount]);

  const handleApprove = (leave) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leave.id
          ? { ...l, status: 'Approved', approvedBy: `${currentUser.firstName} ${currentUser.lastName}`, comments: approveComment || 'Approved.' }
          : l
      )
    );
    setApproveComment('');
    setIsDetailOpen(false);
    toast.success('Leave Approved', `Leave request for ${leave.employeeName} has been approved.`);
  };

  const handleReject = (leave) => {
    setLeaves((prev) =>
      prev.map((l) =>
        l.id === leave.id
          ? { ...l, status: 'Rejected', approvedBy: `${currentUser.firstName} ${currentUser.lastName}`, comments: rejectComment || 'Rejected.' }
          : l
      )
    );
    setRejectComment('');
    setIsDetailOpen(false);
    toast.error('Leave Rejected', `Leave request for ${leave.employeeName} has been rejected.`);
  };

  const openDetail = (leave) => {
    setSelectedLeave(leave);
    setApproveComment('');
    setRejectComment('');
    setIsDetailOpen(true);
  };

  const validateApply = () => {
    const errs = {};
    if (!applyForm.startDate) errs.startDate = 'Start date is required';
    if (!applyForm.endDate) errs.endDate = 'End date is required';
    if (applyForm.startDate && applyForm.endDate && applyForm.startDate > applyForm.endDate) {
      errs.endDate = 'End date must be after start date';
    }
    if (!applyForm.reason.trim()) errs.reason = 'Reason is required';
    setApplyErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleApplyLeave = () => {
    if (!validateApply()) return;
    const newLeave = {
      id: `LVE${String(leaves.length + 1).padStart(3, '0')}`,
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      leaveType: applyForm.leaveType,
      startDate: applyForm.startDate,
      endDate: applyForm.endDate,
      reason: applyForm.reason.trim(),
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0],
      approvedBy: null,
      comments: '',
      documents: [],
    };
    setLeaves((prev) => [newLeave, ...prev]);
    setApplyForm({ leaveType: 'Vacation', startDate: '', endDate: '', reason: '' });
    setApplyErrors({});
    setIsApplyOpen(false);
    toast.success('Leave Applied', 'Your leave request has been submitted for approval.');
  };

  const tabCounts = useMemo(() => ({
    'My Requests': leaves.filter((l) => l.employeeId === currentUser.id).length,
    'All Requests': leaves.length,
    'Pending Approvals': pendingCount,
  }), [leaves, currentUser.id, pendingCount]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage employee leave requests and balances</p>
        </div>
        {isEmployee && (
          <Button icon={Plus} onClick={() => setIsApplyOpen(true)}>
            Apply Leave
          </Button>
        )}
      </div>

      {/* Leave Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard label="Pending Requests" value={summaryMetrics.pending} icon={Clock} accent="amber" />
        <KpiCard label="Approved Requests" value={summaryMetrics.approved} icon={CheckCircle} accent="emerald" />
        <KpiCard label="Employees on Leave" value={summaryMetrics.onLeave} icon={Users} accent="blue" />
        <KpiCard label="Total Leave Requests" value={summaryMetrics.total} icon={FileText} accent="purple" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); setSearch(''); setStatusFilter('All'); setTypeFilter('All'); }}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
              {tabCounts[tab] > 0 && (
                <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tabCounts[tab]}
                </span>
              )}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar
          value={search}
          onChange={(v) => { setSearch(v); setCurrentPage(1); }}
          placeholder="Search by employee name..."
          className="flex-1 min-w-[240px]"
        />
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} containerClass="w-40">
          {statuses.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </Select>
        <Select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }} containerClass="w-44">
          {types.map((t) => (
            <option key={t} value={t}>{t === 'All' ? 'All Leave Types' : t}</option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Employee', 'Leave Type', 'Duration', 'Reason', 'Status', 'Applied Date', 'Approved By', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                    No leave requests found matching your filters.
                  </td>
                </tr>
              ) : (
                paginated.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          firstName={leave.employeeName.split(' ')[0]}
                          lastName={leave.employeeName.split(' ').slice(1).join(' ')}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{leave.employeeName}</p>
                          <p className="text-xs text-gray-500">{leave.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={leaveTypeVariant[leave.leaveType] || 'default'} size="xs">
                        {leave.leaveType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(leave.startDate)} {leave.startDate !== leave.endDate && `– ${formatDate(leave.endDate)}`}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 max-w-[200px] truncate">{leave.reason}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariant[leave.status]} dot size="xs">{leave.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{formatDate(leave.appliedDate)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{leave.approvedBy || '-'}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => openDetail(leave)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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

      {/* Leave Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Leave Request Details" size="lg">
        {selectedLeave && (
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="flex items-center gap-4">
              <Avatar
                firstName={selectedLeave.employeeName.split(' ')[0]}
                lastName={selectedLeave.employeeName.split(' ').slice(1).join(' ')}
                size="xl"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedLeave.employeeName}</h3>
                <p className="text-gray-500">{selectedLeave.employeeId}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={leaveTypeVariant[selectedLeave.leaveType] || 'default'}>{selectedLeave.leaveType}</Badge>
                  <Badge variant={statusVariant[selectedLeave.status]} dot>{selectedLeave.status}</Badge>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {formatDate(selectedLeave.startDate)} {selectedLeave.startDate !== selectedLeave.endDate && `– ${formatDate(selectedLeave.endDate)}`}
              </span>
            </div>

            {/* Reason */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Reason</p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{selectedLeave.reason}</p>
            </div>

            {/* Documents */}
            {selectedLeave.documents.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Attached Documents</p>
                <div className="flex flex-wrap gap-2">
                  {selectedLeave.documents.map((doc) => (
                    <div key={doc} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval Timeline */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Approval Timeline</p>
              <div className="flex items-center gap-0">
                {[
                  { label: 'Applied', date: selectedLeave.appliedDate, done: true },
                  { label: 'Reviewed', date: selectedLeave.approvedBy ? selectedLeave.appliedDate : null, done: !!selectedLeave.approvedBy },
                  { label: selectedLeave.status === 'Rejected' ? 'Rejected' : 'Approved', date: selectedLeave.approvedBy ? selectedLeave.appliedDate : null, done: selectedLeave.status !== 'Pending' },
                ].map((step, i) => (
                  <div key={step.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.done ? 'bg-emerald-100' : 'bg-gray-100'
                      }`}>
                        {step.done ? (
                          selectedLeave.status === 'Rejected' && i === 2 ? (
                            <XCircle className="w-4 h-4 text-red-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          )
                        ) : (
                          <Clock className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <p className={`text-xs font-medium mt-1.5 ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      {step.date && <p className="text-xs text-gray-400">{formatDate(step.date)}</p>}
                    </div>
                    {i < 2 && (
                      <div className={`flex-1 h-0.5 mx-2 rounded-full ${step.done ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            {selectedLeave.comments && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Comments</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-700">{selectedLeave.comments}</p>
                  {selectedLeave.approvedBy && (
                    <p className="text-xs text-gray-400 mt-2">— {selectedLeave.approvedBy}</p>
                  )}
                </div>
              </div>
            )}

            {/* Approve/Reject Actions for Pending (HR tab) */}
            {activeTab === 'Pending Approvals' && selectedLeave.status === 'Pending' && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <Textarea
                  label="Comments (optional)"
                  placeholder="Add a comment for this action..."
                  rows={2}
                  value={approveComment}
                  onChange={(e) => setApproveComment(e.target.value)}
                />
                <div className="flex justify-end gap-3">
                  <Button
                    variant="danger"
                    icon={XCircle}
                    onClick={() => {
                      setRejectComment(approveComment);
                      handleReject(selectedLeave);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    icon={CheckCircle}
                    onClick={() => handleApprove(selectedLeave)}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Apply Leave Modal */}
      <Modal isOpen={isApplyOpen} onClose={() => { setIsApplyOpen(false); setApplyErrors({}); }} title="Apply for Leave" size="md">
        <div className="space-y-4">
          <Select
            label="Leave Type"
            value={applyForm.leaveType}
            onChange={(e) => setApplyForm((f) => ({ ...f, leaveType: e.target.value }))}
          >
            {leaveTypes.map((t) => (
              <option key={t} value={t}>{t} Leave</option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              required
              value={applyForm.startDate}
              onChange={(e) => setApplyForm((f) => ({ ...f, startDate: e.target.value }))}
              error={applyErrors.startDate}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={applyForm.endDate}
              onChange={(e) => setApplyForm((f) => ({ ...f, endDate: e.target.value }))}
              error={applyErrors.endDate}
            />
          </div>
          <Textarea
            label="Reason"
            required
            placeholder="Reason for leave..."
            rows={3}
            value={applyForm.reason}
            onChange={(e) => setApplyForm((f) => ({ ...f, reason: e.target.value }))}
            error={applyErrors.reason}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => { setIsApplyOpen(false); setApplyErrors({}); }}>
              Cancel
            </Button>
            <Button icon={CheckCircle} onClick={handleApplyLeave}>
              Submit Request
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
