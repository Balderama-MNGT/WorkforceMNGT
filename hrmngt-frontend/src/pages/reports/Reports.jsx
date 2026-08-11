import { useState, useMemo } from 'react';
import { FileBarChart, FileText, Clock, Calendar, Users, TrendingUp, Download, Eye, RefreshCw, Filter, ChevronDown, Printer, User } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Select } from '../../components/ui/Input';
import SearchBar from '../../components/ui/SearchBar';
import Modal from '../../components/ui/Modal';
import reportsData from '../../mock-data/reports';
import departments from '../../mock-data/departments';
import { formatDate } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const typeConfig = {
  attendance: {
    icon: Clock,
    badge: 'primary',
    label: 'Attendance',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  leave: {
    icon: Calendar,
    badge: 'info',
    label: 'Leave',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  timesheet: {
    icon: FileText,
    badge: 'purple',
    label: 'Timesheet',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  shift: {
    icon: Users,
    badge: 'warning',
    label: 'Shift',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  workforce_analytics: {
    icon: TrendingUp,
    badge: 'success',
    label: 'Workforce Analytics',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
};

const statusConfig = {
  ready: { variant: 'success', label: 'Ready' },
  generating: { variant: 'warning', label: 'Generating' },
  failed: { variant: 'danger', label: 'Failed' },
};

const statusOptions = ['All', 'Ready', 'Generating', 'Failed'];

const categories = [
  { key: 'all', label: 'All Reports' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'leave', label: 'Leave' },
  { key: 'timesheet', label: 'Timesheet' },
  { key: 'shift', label: 'Shift' },
  { key: 'workforce_analytics', label: 'Workforce Analytics' },
];

const reportTypes = [
  'Attendance Report',
  'Leave Report',
  'Timesheet Report',
  'Shift & Schedule Report',
  'Workforce Analytics Report',
  'Overtime Report',
];

const reportTypeKeys = {
  'Attendance Report': 'attendance',
  'Leave Report': 'leave',
  'Timesheet Report': 'timesheet',
  'Shift & Schedule Report': 'shift',
  'Workforce Analytics Report': 'workforce_analytics',
  'Overtime Report': 'timesheet',
};

const departmentOptions = departments.map((d) => d.name).sort();

const mockPreviewData = [
  { employee: 'Juan Dela Cruz', department: 'Engineering', value: '92%' },
  { employee: 'Maria Santos', department: 'Marketing', value: '88%' },
  { employee: 'Jose Reyes', department: 'Finance', value: '95%' },
  { employee: 'Ana Torres', department: 'HR', value: '90%' },
  { employee: 'Pedro Garcia', department: 'Operations', value: '85%' },
];

export default function Reports() {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('all');
  const [reports, setReports] = useState(reportsData);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    reportType: '',
    startDate: '',
    endDate: '',
    department: 'all',
    format: 'pdf',
  });
  const [generateErrors, setGenerateErrors] = useState({});

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (activeCategory !== 'all' && r.type !== activeCategory) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter.toLowerCase()) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      const reportDate = new Date(r.lastGenerated).toISOString().slice(0, 10);
      if (dateFrom && reportDate < dateFrom) return false;
      if (dateTo && reportDate > dateTo) return false;
      return true;
    });
  }, [reports, activeCategory, statusFilter, search, dateFrom, dateTo]);

  const totalReports = reports.length;
  const readyCount = reports.filter((r) => r.status === 'ready').length;
  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return reports.filter((r) => {
      const d = new Date(r.lastGenerated);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [reports]);

  const openPreview = (report) => {
    setPreviewReport(report);
    setIsPreviewOpen(true);
  };

  const handleGenerateChange = (field, value) => {
    setGenerateForm((prev) => ({ ...prev, [field]: value }));
    if (generateErrors[field]) setGenerateErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateGenerate = () => {
    const errors = {};
    if (!generateForm.reportType) errors.reportType = 'Report type is required';
    if (!generateForm.startDate) errors.startDate = 'Start date is required';
    if (!generateForm.endDate) errors.endDate = 'End date is required';
    if (generateForm.startDate && generateForm.endDate && generateForm.endDate < generateForm.startDate) {
      errors.endDate = 'End date cannot be before start date';
    }
    if (!generateForm.format) errors.format = 'Export format is required';
    setGenerateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateSubmit = () => {
    if (!validateGenerate()) return;
    const departmentLabel = generateForm.department === 'all' ? 'All Departments' : generateForm.department;
    const newReport = {
      id: `RPT${String(reports.length + 1).padStart(3, '0')}`,
      name: generateForm.reportType,
      type: reportTypeKeys[generateForm.reportType] || 'attendance',
      description: `${departmentLabel} ${generateForm.reportType.toLowerCase()} covering ${formatDate(generateForm.startDate)} to ${formatDate(generateForm.endDate)}.`,
      lastGenerated: new Date().toISOString(),
      generatedBy: 'System',
      status: 'ready',
      reportType: generateForm.reportType,
      startDate: generateForm.startDate,
      endDate: generateForm.endDate,
      department: generateForm.department,
      exportFormat: generateForm.format,
      generatedDate: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
    toast.success('Report Generated', `Your "${generateForm.reportType}" has been generated.`);
    setGenerateForm({ reportType: '', startDate: '', endDate: '', department: 'all', format: 'pdf' });
    setGenerateErrors({});
    setIsGenerateOpen(false);
  };

  const closeGenerate = () => {
    setIsGenerateOpen(false);
    setGenerateErrors({});
  };

  const handleRegenerate = (report) => {
    setReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, status: 'generating' } : r))
    );
    toast.info('Regenerating', `${report.name} is being regenerated.`);
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? { ...r, status: 'ready', lastGenerated: new Date().toISOString() }
            : r
        )
      );
      toast.success('Report Regenerated', `${report.name} is ready to download.`);
    }, 2000);
  };

  const categoryCounts = useMemo(() => {
    const counts = { all: reports.length };
    reports.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, [reports]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-[14px] text-gray-500 mt-1">Generate and download workforce reports</p>
        </div>
        <Button icon={FileBarChart} onClick={() => setIsGenerateOpen(true)}>
          Generate Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileBarChart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
            </div>
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Download className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ready to Download</p>
              <p className="text-2xl font-bold text-gray-900">{readyCount}</p>
            </div>
          </div>
        </Card>
        <Card hover>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reports This Month</p>
              <p className="text-2xl font-bold text-gray-900">{thisMonthCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeCategory === cat.key ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {cat.label}
              <span
                className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                  activeCategory === cat.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {categoryCounts[cat.key] || 0}
              </span>
              {activeCategory === cat.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search reports..."
          className="flex-1 min-w-[220px]"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="From date"
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300"
          />
          <span className="text-gray-400 text-sm">–</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="To date"
            className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 hover:border-gray-300"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          containerClass="w-40"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
          ))}
        </Select>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredReports.map((report) => {
          const config = typeConfig[report.type];
          const status = statusConfig[report.status];
          const Icon = config.icon;

          return (
            <Card key={report.id} hover className="flex flex-col">
              <CardHeader action={
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
              }>
                <CardTitle className="text-base">{report.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">{report.description}</CardDescription>
              </CardHeader>

              <div className="flex flex-col gap-3 mt-auto pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={config.badge} size="xs">{config.label}</Badge>
                  <Badge variant={status.variant} dot size="xs">{status.label}</Badge>
                </div>

                <div className="flex flex-col gap-1.5 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Generated: <span className="text-gray-700 font-medium">{formatDate(report.lastGenerated)}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Generated by: <span className="text-gray-700 font-medium">{report.generatedBy}</span></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={Eye}
                    onClick={() => openPreview(report)}
                    disabled={report.status !== 'ready'}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={Download}
                    onClick={() => toast.success('Download Started', `${report.name} is being downloaded.`)}
                    disabled={report.status !== 'ready'}
                  >
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    icon={RefreshCw}
                    onClick={() => handleRegenerate(report)}
                  >
                    Regenerate
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <Card className="text-center py-12">
          {reports.length === 0 ? (
            <>
              <FileBarChart className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-700 mt-3 text-sm font-medium">No reports available</p>
              <p className="text-gray-400 mt-1 text-sm">Generate a report to see it here.</p>
              <Button icon={FileBarChart} className="mt-4" onClick={() => setIsGenerateOpen(true)}>
                Generate Report
              </Button>
            </>
          ) : (
            <>
              <Filter className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-gray-700 mt-3 text-sm font-medium">No reports found</p>
              <p className="text-gray-400 mt-1 text-sm">Try changing your search or filters.</p>
            </>
          )}
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={previewReport?.name || 'Report Preview'}
        size="xl"
      >
        {previewReport && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Badge variant={typeConfig[previewReport.type].badge}>
                {typeConfig[previewReport.type].label}
              </Badge>
              <Badge variant={statusConfig[previewReport.status].variant} dot>
                {statusConfig[previewReport.status].label}
              </Badge>
            </div>

            <p className="text-sm text-gray-600">{previewReport.description}</p>

            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Report Preview</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Department</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockPreviewData.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-100/50 transition-colors">
                        <td className="px-3 py-2.5 text-gray-900 font-medium">{row.employee}</td>
                        <td className="px-3 py-2.5 text-gray-600">{row.department}</td>
                        <td className="px-3 py-2.5 text-gray-900 text-right font-semibold">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3 text-center italic">
                This is a preview placeholder. Download the full report for complete data.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Generated by <span className="font-medium">{previewReport.generatedBy}</span> on {formatDate(previewReport.lastGenerated)}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" icon={Printer} onClick={() => window.print()}>
                  Print
                </Button>
                <Button
                  icon={Download}
                  onClick={() => toast.success('Download Started', `${previewReport.name} is being downloaded.`)}
                >
                  Download
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Generate Report Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={closeGenerate}
        title="Generate New Report"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Report Type"
            value={generateForm.reportType}
            onChange={(e) => handleGenerateChange('reportType', e.target.value)}
            error={generateErrors.reportType}
          >
            <option value="">Select a report</option>
            {reportTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={generateForm.startDate}
                onChange={(e) => handleGenerateChange('startDate', e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  generateErrors.startDate ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {generateErrors.startDate && <p className="text-xs text-red-500">{generateErrors.startDate}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={generateForm.endDate}
                onChange={(e) => handleGenerateChange('endDate', e.target.value)}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                  generateErrors.endDate ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {generateErrors.endDate && <p className="text-xs text-red-500">{generateErrors.endDate}</p>}
            </div>
          </div>

          {generateForm.reportType !== 'Workforce Analytics Report' && (
            <Select
              label="Department"
              value={generateForm.department}
              onChange={(e) => handleGenerateChange('department', e.target.value)}
              error={generateErrors.department}
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </Select>
          )}

          <Select
            label="Export Format"
            value={generateForm.format}
            onChange={(e) => handleGenerateChange('format', e.target.value)}
            error={generateErrors.format}
          >
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
          </Select>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={closeGenerate}>Cancel</Button>
            <Button icon={FileBarChart} onClick={handleGenerateSubmit}>Generate</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
