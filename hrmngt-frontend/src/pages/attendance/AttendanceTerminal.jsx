import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, ScanFace, LogIn, LogOut, CheckCircle2, Loader2,
  ChevronRight, ArrowLeft, UserCheck, Clock, CalendarDays,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import FaceRecognitionModal from '../../components/attendance/FaceRecognitionModal';
import { employeeService, attendanceService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate, formatTime } from '../../utils/helpers';
import {
  toDateKey,
  toTimeString,
  calculateAttendanceStatus,
  calculateTimesheetFields,
} from '../../services/attendanceService';
import { ATTENDANCE_CONFIG } from '../../utils/attendanceConfig';

export default function AttendanceTerminal() {
  const { toast } = useToast();

  const [phase, setPhase] = useState('idle');
  const [employeeId, setEmployeeId] = useState('');
  const [employee, setEmployee] = useState(null);
  const [todayRecord, setTodayRecord] = useState(null);
  const [action, setAction] = useState(null);
  const [recordedType, setRecordedType] = useState(null);
  const [recordedAt, setRecordedAt] = useState(null);
  const [showVerification, setShowVerification] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const resetTimer = useRef(null);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearInterval(clock);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const resetToIdle = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setPhase('idle');
    setEmployeeId('');
    setEmployee(null);
    setTodayRecord(null);
    setAction(null);
    setRecordedType(null);
    setRecordedAt(null);
  };

  const scheduleReset = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(resetToIdle, 5000);
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    const id = employeeId.trim().toUpperCase();
    if (!id) return;

    setPhase('checking');
    try {
      const employees = await employeeService.getAll();
      const found = employees.find((emp) => emp.id === id);

      if (!found) {
        toast.error('Employee not found', `No employee matches ID "${id}". Please try again.`);
        resetToIdle();
        return;
      }

      let today = null;
      try {
        const records = await attendanceService.getByEmployeeId(id);
        today = records.find((r) => r.date === toDateKey()) || null;
      } catch {
        today = null;
      }

      setEmployee(found);
      setTodayRecord(today);

      if (!today || !today.clockIn) {
        setAction('clock-in');
      } else if (today.clockIn && !today.clockOut) {
        setAction('clock-out');
      } else {
        setAction(null);
        setPhase('completed');
        scheduleReset();
        return;
      }

      setPhase('confirm');
    } catch {
      toast.error('Verification failed', 'Could not verify your employee ID. Please try again.');
      resetToIdle();
    }
  };

  const handleConfirm = async () => {
    if (!employee || !action) return;

    setPhase('recording');
    try {
      const time = toTimeString(new Date());

      if (action === 'clock-in') {
        const created = await attendanceService.create({
          employeeId: employee.id,
          date: toDateKey(),
          clockIn: time,
          status: calculateAttendanceStatus(time),
          location: ATTENDANCE_CONFIG.location,
        });
        setTodayRecord(created);
      } else {
        const fields = calculateTimesheetFields(todayRecord.clockIn, time);
        await attendanceService.update(todayRecord.id, {
          clockOut: time,
          regularHours: fields.regularHours,
          overtime: fields.overtimeHours,
          totalHours: fields.totalHours,
          breakHours: fields.breakHours,
        });
      }

      setRecordedType(action);
      setRecordedAt(time);
      setPhase('success');
      toast.success(
        action === 'clock-in' ? 'Clocked in' : 'Clocked out',
        `${employee.firstName} ${employee.lastName} ${action === 'clock-in' ? 'clocked in' : 'clocked out'} at ${formatTime(time)}.`
      );
      scheduleReset();
    } catch (err) {
      const message = err?.response?.data?.message;
      setPhase('confirm');
      toast.error('Attendance not recorded', message || 'Something went wrong. Please try again.');
    }
  };

  const handleVerificationComplete = () => {
    setShowVerification(false);
    handleConfirm();
  };

  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B1F3A] via-[#0E2747] to-[#0B1F3A] flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 lg:px-10 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-[15px] leading-tight tracking-tight">WorkForce Pro</h1>
            <p className="text-blue-300/60 text-[11px] font-medium">Attendance Terminal</p>
          </div>
        </div>
        <Link
          to="/attendance"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-200/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </header>

      {/* Live clock */}
      <div className="text-center px-4">
        <p className="text-5xl sm:text-6xl font-bold text-white tabular-nums tracking-tight drop-shadow-lg">{timeString}</p>
        <p className="text-blue-200/70 text-base sm:text-lg mt-2 font-medium">{dateString}</p>
      </div>

      {/* Center content */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {phase === 'idle' && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center">
                  <ScanFace className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mt-4">Welcome to the Attendance Terminal</h2>
                <p className="text-gray-500 mt-1.5">Please identify yourself to record your attendance</p>
              </div>

              <form onSubmit={handleContinue} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="employee-id" className="block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <input
                    id="employee-id"
                    type="text"
                    autoFocus
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    placeholder="EMP001"
                    className="mt-2 w-full h-14 px-5 text-lg font-semibold tracking-wider uppercase rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-gray-900 placeholder:text-gray-300"
                  />
                </div>
                <Button type="submit" size="lg" className="w-full" icon={ChevronRight}>
                  Continue
                </Button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Ask your HR administrator for your Employee ID if you don't know it.
              </p>
            </div>
          )}

          {phase === 'checking' && (
            <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-lg font-semibold text-gray-900 mt-5">Verifying employee...</p>
              <p className="text-sm text-gray-400 mt-1">Looking up attendance records for {employeeId}</p>
            </div>
          )}

          {phase === 'recording' && (
            <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-lg font-semibold text-gray-900 mt-5">
                Recording {action === 'clock-in' ? 'clock in' : 'clock out'}...
              </p>
              <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
            </div>
          )}

          {phase === 'confirm' && employee && (
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar firstName={employee.firstName} lastName={employee.lastName} size="lg" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{employee.id}</p>
                    <h2 className="text-xl font-bold text-gray-900 truncate">{employee.firstName} {employee.lastName}</h2>
                    <p className="text-sm text-gray-500 truncate">{employee.position} · {employee.department}</p>
                  </div>
                </div>
                <Badge variant={action === 'clock-out' ? 'danger' : 'primary'} size="md">
                  <span className="flex items-center gap-1.5">
                    {action === 'clock-in' ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                    {action === 'clock-in' ? 'Clock In' : 'Clock Out'}
                  </span>
                </Badge>
              </div>

              <div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action === 'clock-in' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    {action === 'clock-in' ? (
                      <LogIn className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <LogOut className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {action === 'clock-in'
                        ? 'You are about to clock in'
                        : `You are about to clock out (clocked in at ${formatTime(todayRecord.clockIn)})`}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      Current time: <span className="font-medium text-gray-700 tabular-nums">{formatTime(toTimeString(new Date()))}</span>
                      <span className="mx-1.5 text-gray-300">·</span>
                      {formatDate(toDateKey())}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  icon={ScanFace}
                  onClick={() => setShowVerification(true)}
                >
                  Scan Face
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  variant={action === 'clock-out' ? 'danger' : 'primary'}
                  icon={action === 'clock-in' ? LogIn : LogOut}
                  onClick={handleConfirm}
                >
                  Confirm {action === 'clock-in' ? 'Clock In' : 'Clock Out'}
                </Button>
              </div>
              <button
                onClick={resetToIdle}
                className="mt-5 w-full text-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel and go back
              </button>
            </div>
          )}

          {phase === 'success' && employee && (
            <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-5">Attendance Recorded Successfully</h2>
              <p className="text-gray-500 mt-1.5">
                Thank you, {employee.firstName}! Have a great day.
              </p>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Employee</p>
                  <p className="text-base font-semibold text-gray-900 mt-1">{employee.firstName} {employee.lastName}</p>
                  <p className="text-sm text-gray-500">{employee.id}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {recordedType === 'clock-in' ? 'Clock In Time' : 'Clock Out Time'}
                  </p>
                  <p className="text-base font-semibold text-gray-900 mt-1 tabular-nums">{formatTime(recordedAt)}</p>
                  <p className="text-sm text-gray-500">{formatDate(toDateKey())}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-7 flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4" />
                Returning to the terminal in a moment...
              </p>
            </div>
          )}

          {phase === 'completed' && employee && (
            <div className="bg-white rounded-3xl shadow-2xl p-10 text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 flex items-center justify-center">
                <UserCheck className="w-10 h-10 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-5">Attendance Already Recorded</h2>
              <p className="text-gray-500 mt-1.5">
                {employee.firstName} {employee.lastName} has already clocked in and out for today.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-gray-50 px-6 py-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  {formatTime(todayRecord.clockIn)}
                </span>
                <span className="text-gray-300">→</span>
                <span className="flex items-center gap-1.5">
                  <LogOut className="w-4 h-4 text-amber-600" />
                  {formatTime(todayRecord.clockOut)}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-7 flex items-center justify-center gap-1.5">
                <Clock className="w-4 h-4" />
                Returning to the terminal in a moment...
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="pb-5 text-center">
        <p className="text-blue-300/40 text-xs">
          <span className="flex items-center justify-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {ATTENDANCE_CONFIG.location} · Shift starts {formatTime(ATTENDANCE_CONFIG.startTime)}
          </span>
        </p>
      </footer>

      <FaceRecognitionModal
        isOpen={showVerification}
        employeeName={employee ? `${employee.firstName} ${employee.lastName}` : ''}
        onComplete={handleVerificationComplete}
        onClose={() => setShowVerification(false)}
      />
    </div>
  );
}
