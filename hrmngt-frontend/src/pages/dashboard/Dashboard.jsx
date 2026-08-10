import {
  Users, CheckCircle, CalendarOff, Clock, TrendingUp,
  Calendar, Briefcase, Check, X, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart,
} from 'recharts';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import KpiCard from '../../components/dashboard/KpiCard';
import ChartCard from '../../components/dashboard/ChartCard';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../utils/helpers';

const COLORS = {
  blue: '#3B82F6', emerald: '#10B981', amber: '#F59E0B',
  red: '#EF4444', purple: '#8B5CF6', sky: '#0EA5E9',
  indigo: '#6366F1', rose: '#F43F5E', teal: '#14B8A6',
};

const departmentColors = {
  Engineering: COLORS.blue,
  Marketing: COLORS.purple,
  Finance: COLORS.emerald,
  HR: COLORS.sky,
  Sales: COLORS.amber,
  Operations: COLORS.teal,
  IT: COLORS.indigo,
  Legal: COLORS.rose,
};

const kpiData = [
  { labelKey: 'dashboard.totalEmployees', value: '25', icon: Users, change: '+2', changeType: 'increase', accent: 'blue' },
  { labelKey: 'dashboard.presentToday', value: '21', icon: CheckCircle, change: '+1', changeType: 'increase', accent: 'emerald' },
  { labelKey: 'dashboard.onLeave', value: '3', icon: CalendarOff, change: '+1', changeType: 'increase', accent: 'amber' },
  { labelKey: 'dashboard.lateEmployees', value: '2', icon: Clock, change: '-1', changeType: 'decrease', accent: 'red' },
  { labelKey: 'dashboard.attendanceRate', value: '92.5%', icon: TrendingUp, change: '+1.2%', changeType: 'increase', accent: 'purple' },
];

const attendanceOverviewData = [
  { day: 'Mon', present: 22, late: 2, absent: 1 },
  { day: 'Tue', present: 20, late: 3, absent: 2 },
  { day: 'Wed', present: 23, late: 1, absent: 1 },
  { day: 'Thu', present: 21, late: 2, absent: 2 },
  { day: 'Fri', present: 19, late: 3, absent: 3 },
  { day: 'Sat', present: 15, late: 1, absent: 1 },
  { day: 'Sun', present: 8, late: 0, absent: 0 },
];

const leaveStatisticsData = [
  { name: 'Vacation', value: 40, color: COLORS.blue },
  { name: 'Sick', value: 25, color: COLORS.emerald },
  { name: 'Emergency', value: 15, color: COLORS.amber },
  { name: 'Special', value: 5, color: COLORS.teal },
];

const weeklyAttendanceData = [
  { week: 'W1', percentage: 88 }, { week: 'W2', percentage: 91 },
  { week: 'W3', percentage: 89 }, { week: 'W4', percentage: 93 },
  { week: 'W5', percentage: 90 }, { week: 'W6', percentage: 92 },
  { week: 'W7', percentage: 87 }, { week: 'W8', percentage: 94 },
  { week: 'W9', percentage: 91 }, { week: 'W10', percentage: 93 },
  { week: 'W11', percentage: 90 }, { week: 'W12', percentage: 92 },
];

const productivityData = [
  { department: 'Engineering', score: 92 },
  { department: 'Marketing', score: 88 },
  { department: 'Finance', score: 95 },
  { department: 'HR', score: 90 },
  { department: 'Sales', score: 85 },
  { department: 'Operations', score: 87 },
  { department: 'IT', score: 93 },
  { department: 'Legal', score: 91 },
];

const pendingLeaveRequests = [
  { id: 'LVE007', name: 'Patricia Garcia', type: 'Vacation', dates: 'Aug 01 - Aug 05', days: 5, reason: 'Family reunion in Batangas' },
  { id: 'LVE009', name: 'Isabelle Tan', type: 'Vacation', dates: 'Aug 10 - Aug 14', days: 5, reason: 'Trip to Japan with friends' },
  { id: 'LVE011', name: 'Ricardo Cruz', type: 'Vacation', dates: 'Aug 18 - Aug 22', days: 5, reason: 'Family vacation to Palawan' },
  { id: 'LVE015', name: 'Kevin Diaz', type: 'Vacation', dates: 'Jul 28 - Jul 29', days: 2, reason: 'Personal matters to attend to' },
  { id: 'LVE019', name: 'Samantha Rivera', type: 'Vacation', dates: 'Aug 15 - Aug 15', days: 1, reason: 'Birthday celebration with family' },
];

const todaySchedule = [
  { employee: 'Juan Dela Cruz', shift: 'Flexible Shift', time: '08:00 - 17:00', status: 'Present' },
  { employee: 'Angela Santos', shift: 'Flexible Shift', time: '08:00 - 17:00', status: 'Present' },
  { employee: 'Rachel Aquino', shift: 'Morning Shift', time: '06:00 - 14:00', status: 'Present' },
  { employee: 'Benedict Castro', shift: 'Morning Shift', time: '06:00 - 14:00', status: 'Present' },
  { employee: 'Daniel Lim', shift: 'Flexible Shift', time: '08:00 - 17:00', status: 'On Leave' },
  { employee: 'Carlo Mendoza', shift: 'Flexible Shift', time: '08:00 - 17:00', status: 'Present' },
  { employee: 'Mia Gonzales', shift: 'Flexible Shift', time: '09:00 - 14:00', status: 'Present' },
];

const leaveTypeBadge = (type) => {
  const map = { Vacation: 'primary', Sick: 'success', Emergency: 'warning', Special: 'purple' };
  return map[type] || 'default';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
        <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs text-gray-600">
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
            {entry.name}: {entry.value}{entry.name === 'percentage' ? '%' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { t } = useLanguage();

  const visibleLeaveRequests = pendingLeaveRequests.slice(0, 5);
  const visibleSchedule = todaySchedule.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-sm text-gray-400 mt-1.5">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{formatDate(new Date().toISOString())}</span>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {kpiData.map((card) => (
          <KpiCard key={card.labelKey} {...card} label={t(card.labelKey)} changeLabel={t('dashboard.vsLastWeek')} noBar />
        ))}
      </div>

      {/* Row 2: Charts - Attendance Overview + Leave Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('dashboard.attendanceOverview')} badge={t('dashboard.thisWeek')} badgeVariant="primary">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceOverviewData} barGap={3} barCategoryGap="22%" margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ paddingTop: 16, fontSize: 12 }} />
                <Bar dataKey="present" name="Present" fill={COLORS.emerald} radius={[6, 6, 0, 0]} />
                <Bar dataKey="late" name="Late" fill={COLORS.amber} radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill={COLORS.red} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title={t('dashboard.leaveStatistics')} badge={t('dashboard.allTypes')} badgeVariant="info">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveStatisticsData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leaveStatisticsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3">
                          <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
                          <p className="text-xs text-gray-600">{payload[0].value}% of all leaves</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(value) => <span className="text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 3: Charts - Weekly Trend + Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title={t('dashboard.weeklyTrend')} badge={t('dashboard.overall')} badgeVariant="success">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyAttendanceData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="percentage" name="percentage" stroke={COLORS.blue} strokeWidth={2.5} fill="url(#attendanceGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title={t('dashboard.productivity')} badge={t('dashboard.byDepartment')} badgeVariant="purple">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData} layout="vertical" barSize={16} barCategoryGap={10} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis type="category" dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569' }} width={110} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="score" name="score" radius={[0, 6, 6, 0]}>
                  {productivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={departmentColors[entry.department] || COLORS.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Row 4: Pending Leave Requests (2fr) + Today's Schedule (1fr) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Pending Leave Requests - wider */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[560px]">
          <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-3 flex-shrink-0">
            <h3 className="text-base font-semibold text-gray-900 tracking-tight">{t('dashboard.pendingLeave')}</h3>
            <div className="flex items-center gap-3">
              {visibleLeaveRequests.length < pendingLeaveRequests.length && (
                <Link
                  to="/leave"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t('dashboard.viewAll')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <Badge variant="warning" size="sm">{pendingLeaveRequests.length} {t('dashboard.pending')}</Badge>
            </div>
          </div>
          <div className="divide-y divide-gray-100/70 flex-1 overflow-y-auto overflow-x-hidden">
            {visibleLeaveRequests.map((request) => (
              <div key={request.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar firstName={request.name.split(' ')[0]} lastName={request.name.split(' ')[1]} size="sm" className="mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-gray-900 truncate">{request.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={leaveTypeBadge(request.type)} size="xs">{request.type}</Badge>
                        <span className="text-xs text-gray-400">{request.days}d</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{request.dates}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{request.reason}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 ml-11">
                  <Button variant="success" size="xs" icon={Check}>{t('dashboard.approve')}</Button>
                  <Button variant="dangerOutline" size="xs" icon={X}>{t('dashboard.reject')}</Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Schedule - narrower */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[560px]">
          <div className="flex items-center justify-between gap-3 px-6 pt-6 pb-3 flex-shrink-0">
            <h3 className="text-base font-semibold text-gray-900 tracking-tight">{t('dashboard.todaySchedule')}</h3>
            <div className="flex items-center gap-3">
              {visibleSchedule.length < todaySchedule.length && (
                <Link
                  to="/shifts"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {t('dashboard.viewAll')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <Badge variant="primary" size="sm">{todaySchedule.length} {t('dashboard.assigned')}</Badge>
            </div>
          </div>
          <div className="divide-y divide-gray-100/70 flex-1 overflow-y-auto overflow-x-hidden">
            {visibleSchedule.map((entry, idx) => (
              <div key={idx} className="px-6 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${entry.status === 'On Leave' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                  {entry.status === 'On Leave' ? (
                    <CalendarOff className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{entry.employee}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{entry.shift} &middot; {entry.time}</p>
                </div>
                <Badge variant={entry.status === 'On Leave' ? 'warning' : 'success'} size="xs">
                  {entry.status === 'On Leave' ? t('dashboard.onLeaveShort') : t('dashboard.present')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
