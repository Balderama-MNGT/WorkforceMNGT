import { calculateTimesheetFields } from '../services/attendanceService';

const rawAttendance = [
  { id: "ATT001", employeeId: "EMP001", date: "2026-07-14", clockIn: "08:30", clockOut: "17:40", status: "Present", overtime: 0.5, location: "Office", notes: "" },
  { id: "ATT002", employeeId: "EMP001", date: "2026-07-15", clockIn: null, clockOut: null, status: "On Leave", overtime: 0, location: "Office", notes: "Approved leave" },
  { id: "ATT003", employeeId: "EMP001", date: "2026-07-16", clockIn: "08:48", clockOut: "17:30", status: "Present", overtime: 0, location: "Office", notes: "" },
  { id: "ATT004", employeeId: "EMP001", date: "2026-07-17", clockIn: "08:32", clockOut: "18:15", status: "Present", overtime: 1.5, location: "Office", notes: "" },
  { id: "ATT005", employeeId: "EMP001", date: "2026-07-18", clockIn: "08:44", clockOut: "17:30", status: "Present", overtime: 0, location: "Office", notes: "" },
  { id: "ATT006", employeeId: "EMP001", date: "2026-07-21", clockIn: "08:37", clockOut: "17:35", status: "Present", overtime: 0.5, location: "Office", notes: "" },
  { id: "ATT007", employeeId: "EMP001", date: "2026-07-22", clockIn: "08:50", clockOut: "17:30", status: "Present", overtime: 0, location: "Office", notes: "" },
  { id: "ATT008", employeeId: "EMP001", date: "2026-07-23", clockIn: "08:29", clockOut: "17:28", status: "Present", overtime: 0, location: "Office", notes: "" },
  { id: "ATT009", employeeId: "EMP001", date: "2026-07-24", clockIn: "08:41", clockOut: "17:32", status: "Present", overtime: 0, location: "Office", notes: "" },
  { id: "ATT010", employeeId: "EMP001", date: "2026-07-25", clockIn: "08:33", clockOut: null, status: "Present", overtime: 0, location: "Office", notes: "Still clocked in" }
];

// Overtime, regular hours, and total hours are derived automatically from the
// official 8:00 AM - 5:00 PM schedule (1-hour unpaid lunch) rather than stored
// as raw values.
export const attendance = rawAttendance.map((r) => {
  const computed = r.clockIn && r.clockOut
    ? calculateTimesheetFields(r.clockIn, r.clockOut)
    : { regularHours: 0, overtimeHours: 0, totalHours: 0, breakHours: 0 };
  return {
    ...r,
    regularHours: computed.regularHours,
    overtime: computed.overtimeHours,
    totalHours: computed.totalHours,
    breakHours: computed.breakHours,
  };
});

export default attendance;
