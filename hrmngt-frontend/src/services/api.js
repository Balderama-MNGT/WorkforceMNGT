import { employees } from '../mock-data/employees';
import { attendance } from '../mock-data/attendance';
import { leaves } from '../mock-data/leaves';
import { shiftDefinitions, shiftSchedules } from '../mock-data/shifts';
import { timesheets } from '../mock-data/timesheets';
import { notifications } from '../mock-data/notifications';
import {
  attendanceTrend,
  departmentProductivity,
  leaveTrend,
  overtimeSummary,
  punctualityScore,
  payrollDiscrepancy,
} from '../mock-data/analytics';
import { settings } from '../mock-data/settings';


export const employeeService = {
  getAll: async () => {
    return [...employees];
  },
  getById: async (id) => {
    return employees.find((e) => e.id === id) || null;
  },
  create: async (data) => {
    const newEmployee = {
      ...data,
      id: data.id || `EMP${String(employees.length + 1).padStart(3, '0')}`,
      rosterAdded: data.rosterAdded !== undefined ? data.rosterAdded : false,
      faceRegistered: data.faceRegistered !== undefined ? data.faceRegistered : false,
      faceImage: data.faceImage || null,
      faceRegisteredAt: data.faceRegisteredAt || null,
    };
    employees.push(newEmployee);
    return { ...newEmployee };
  },
  addRegisteredEmployee: async (id) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return null;
    employee.rosterAdded = true;
    return { ...employee };
  },
  // Associates a captured face image with an employee's unique Employee ID.
  // Frontend-only mock: the image data URL is kept in the in-memory employee
  // record so the later Laravel implementation can swap this for real
  // biometric storage/processing without changing the calling workflow.
  registerFace: async (id, faceImageDataUrl) => {
    const employee = employees.find((e) => e.id === id);
    if (!employee) return null;
    if (!faceImageDataUrl) return null;
    employee.faceRegistered = true;
    employee.faceImage = faceImageDataUrl;
    employee.faceRegisteredAt = new Date().toISOString();
    return { ...employee };
  },
  update: async (id, data) => {
    return { ...data, id };
  },
  delete: async (id) => {
    return true;
  },
};

export const attendanceService = {
  getAll: async () => {
    return [...attendance];
  },
  getById: async (id) => {
    return attendance.find((a) => a.id === id) || null;
  },
  getByEmployeeId: async (employeeId) => {
    return attendance.filter((a) => a.employeeId === employeeId);
  },
  getByDate: async (date) => {
    return attendance.filter((a) => a.date === date);
  },
  create: async (data) => {
    const record = {
      ...data,
      id: data.id || `ATT${String(attendance.length + 1).padStart(3, '0')}`,
    };
    attendance.push(record);
    return { ...record };
  },
  update: async (id, data) => {
    const index = attendance.findIndex((a) => a.id === id);
    if (index === -1) return null;
    attendance[index] = { ...attendance[index], ...data, id };
    return { ...attendance[index] };
  },
  delete: async (id) => {
    const index = attendance.findIndex((a) => a.id === id);
    if (index === -1) return false;
    attendance.splice(index, 1);
    return true;
  },
};

export const leaveService = {
  getAll: async () => {
    return [...leaves];
  },
  getById: async (id) => {
    return leaves.find((l) => l.id === id) || null;
  },
  getByEmployeeId: async (employeeId) => {
    return leaves.filter((l) => l.employeeId === employeeId);
  },
  create: async (data) => {
    return {
      ...data,
      id: `LVE${String(leaves.length + 1).padStart(3, '0')}`,
    };
  },
  update: async (id, data) => {
    return { ...data, id };
  },
  updateStatus: async (id, status, approvedBy) => {
    const leave = leaves.find((l) => l.id === id);
    if (!leave) return null;
    return { ...leave, status, approvedBy, id };
  },
  delete: async (id) => {
    return true;
  },
};

export const shiftService = {
  getAllShifts: async () => {
    return [...shiftDefinitions];
  },
  getSchedules: async () => {
    return [...shiftSchedules];
  },
  getScheduleByEmployeeId: async (employeeId) => {
    return shiftSchedules.filter((s) => s.employeeId === employeeId);
  },
  createSchedule: async (data) => {
    return {
      ...data,
      id: `SCH${String(shiftSchedules.length + 1).padStart(3, '0')}`,
    };
  },
  updateSchedule: async (id, data) => {
    return { ...data, id };
  },
  deleteSchedule: async (id) => {
    return true;
  },
};

export const timesheetService = {
  getAll: async () => {
    return [...timesheets];
  },
  getById: async (id) => {
    return timesheets.find((t) => t.id === id) || null;
  },
  getByEmployeeId: async (employeeId) => {
    return timesheets.filter((t) => t.employeeId === employeeId);
  },
  create: async (data) => {
    return {
      ...data,
      id: `TS${String(timesheets.length + 1).padStart(3, '0')}`,
    };
  },
  update: async (id, data) => {
    return { ...data, id };
  },
  updateStatus: async (id, status) => {
    const ts = timesheets.find((t) => t.id === id);
    if (!ts) return null;
    return { ...ts, status, id };
  },
  delete: async (id) => {
    return true;
  },
};

export const notificationService = {
  getAll: async () => {
    return [...notifications];
  },
  getById: async (id) => {
    return notifications.find((n) => n.id === id) || null;
  },
  getByEmployeeId: async (employeeId) => {
    return notifications.filter((n) => n.employeeId === employeeId);
  },
  markAsRead: async (id) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification) return null;
    return { ...notification, read: true };
  },
  markAllAsRead: async () => {
    return notifications.map((n) => ({ ...n, read: true }));
  },
  getUnreadCount: async () => {
    return notifications.filter((n) => !n.read).length;
  },
};

export const analyticsService = {
  getAttendanceTrend: async () => {
    return [...attendanceTrend];
  },
  getDepartmentProductivity: async () => {
    return [...departmentProductivity];
  },
  getLeaveTrend: async () => {
    return [...leaveTrend];
  },
  getOvertimeSummary: async () => {
    return [...overtimeSummary];
  },
  getPunctualityScore: async () => {
    return [...punctualityScore];
  },
  getPayrollDiscrepancy: async () => {
    return [...payrollDiscrepancy];
  },
  getAll: async () => {
    return {
      attendanceTrend: [...attendanceTrend],
      departmentProductivity: [...departmentProductivity],
      leaveTrend: [...leaveTrend],
      overtimeSummary: [...overtimeSummary],
      punctualityScore: [...punctualityScore],
      payrollDiscrepancy: [...payrollDiscrepancy],
    };
  },
};

export const settingsService = {
  get: async () => {
    return JSON.parse(JSON.stringify(settings));
  },
  update: async (data) => {
    return JSON.parse(JSON.stringify({ ...settings, ...data }));
  },
};
