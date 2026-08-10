import { attendance } from './attendance';

const empNames = {
  EMP001: "Juan Dela Cruz", EMP002: "Angela Santos", EMP003: "Miguel Reyes",
  EMP004: "Patricia Garcia", EMP005: "Carlo Mendoza", EMP006: "Isabelle Tan",
  EMP007: "Daniel Lim", EMP008: "Rachel Aquino", EMP009: "Jerome Villanueva",
  EMP010: "Ricardo Cruz", EMP017: "Mia Gonzales", EMP018: "Kevin Diaz",
  EMP019: "Nina Pascual", EMP022: "Luis Gomez", EMP023: "Hannah Lopez",
  EMP024: "Marcus Santiago", EMP025: "Chloe Torres"
};

const empDepts = {
  EMP001: "Engineering", EMP002: "Marketing", EMP003: "Finance",
  EMP004: "HR", EMP005: "Sales", EMP006: "Engineering",
  EMP007: "Operations", EMP008: "IT", EMP009: "Legal",
  EMP010: "Engineering", EMP017: "Marketing", EMP018: "Engineering",
  EMP019: "Finance", EMP022: "Operations", EMP023: "Marketing",
  EMP024: "IT", EMP025: "Finance"
};

const weeks = [
  { weekStart: "2026-06-29", weekEnd: "2026-07-05" },
  { weekStart: "2026-07-06", weekEnd: "2026-07-12" },
  { weekStart: "2026-07-13", weekEnd: "2026-07-19" },
  { weekStart: "2026-07-20", weekEnd: "2026-07-26" }
];

let id = 1;
export const timesheets = [];

const empIds = ["EMP001","EMP002","EMP003","EMP004","EMP005","EMP006","EMP007","EMP008",
  "EMP009","EMP010","EMP017","EMP018","EMP019","EMP022","EMP023","EMP024","EMP025"];

for (const empId of empIds) {
  for (let wi = 0; wi < weeks.length; wi++) {
    const w = weeks[wi];
    const status = wi === 3 ? "Draft" : wi === 2 ? "Submitted" : "Approved";

    // Aggregate the calculated daily hours from the attendance clock-in/clock-out records.
    // Employees with no clock-in/clock-out data in a week get a zero-hour timesheet.
    const weekRecords = attendance.filter(
      (a) => a.employeeId === empId && a.clockIn && a.clockOut && a.date >= w.weekStart && a.date <= w.weekEnd
    );

    const regularHours = weekRecords.reduce((s, r) => s + (r.regularHours || 0), 0);
    const overtimeHours = weekRecords.reduce((s, r) => s + (r.overtime || 0), 0);
    const breakHours = weekRecords.reduce((s, r) => s + (r.breakHours || 0), 0);
    const totalHours = weekRecords.reduce((s, r) => s + (r.totalHours || 0), 0);

    timesheets.push({
      id: `TS${String(id).padStart(3, "0")}`,
      employeeId: empId,
      employeeName: empNames[empId],
      department: empDepts[empId],
      date: w.weekEnd,
      weekStart: w.weekStart,
      weekEnd: w.weekEnd,
      regularHours: Math.round(regularHours * 10) / 10,
      overtimeHours: Math.round(overtimeHours * 10) / 10,
      breakHours: Math.round(breakHours * 10) / 10,
      totalHours: Math.round(totalHours * 10) / 10,
      status,
      submittedDate: wi < 3 ? w.weekEnd : null,
      approvedBy: status === "Approved" ? "Camille Ramos" : null,
      notes: ""
    });
    id++;
  }
}

export default timesheets;
