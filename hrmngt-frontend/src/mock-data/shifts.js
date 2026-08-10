export const shiftDefinitions = [
  { id: "SHIFT001", name: "Morning Shift", startTime: "06:00", endTime: "14:00", color: "#22C55E" },
  { id: "SHIFT002", name: "Afternoon Shift", startTime: "14:00", endTime: "22:00", color: "#F59E0B" },
  { id: "SHIFT003", name: "Night Shift", startTime: "22:00", endTime: "06:00", color: "#8B5CF6" },
  { id: "SHIFT004", name: "Flexible Shift", startTime: "08:00", endTime: "17:00", color: "#3B82F6" }
];

const empNames = {
  EMP001: "Juan Dela Cruz", EMP002: "Angela Santos", EMP003: "Miguel Reyes",
  EMP004: "Patricia Garcia", EMP005: "Carlo Mendoza", EMP006: "Isabelle Tan",
  EMP007: "Daniel Lim", EMP008: "Rachel Aquino", EMP009: "Jerome Villanueva",
  EMP010: "Ricardo Cruz", EMP011: "Victoria Fernandez", EMP012: "Fernando Bautista",
  EMP013: "Camille Ramos", EMP014: "Adrian Soriano", EMP015: "Grace Ong",
  EMP016: "Benedict Castro", EMP017: "Mia Gonzales", EMP018: "Kevin Diaz",
  EMP019: "Nina Pascual", EMP020: "Rafael Mercado", EMP021: "Samantha Rivera",
  EMP022: "Luis Gomez", EMP023: "Hannah Lopez", EMP024: "Marcus Santiago",
  EMP025: "Chloe Torres"
};

const statuses = ["Completed", "Completed", "Completed", "Completed", "Scheduled", "Swapped"];
const dates = [
  "2026-07-01","2026-07-02","2026-07-03","2026-07-04","2026-07-07",
  "2026-07-08","2026-07-09","2026-07-10","2026-07-11","2026-07-14",
  "2026-07-15","2026-07-16","2026-07-17","2026-07-18","2026-07-21",
  "2026-07-22","2026-07-23","2026-07-24","2026-07-25"
];

const shiftAssignments = {
  EMP001: "SHIFT004", EMP002: "SHIFT004", EMP003: "SHIFT004", EMP004: "SHIFT004",
  EMP005: "SHIFT004", EMP006: "SHIFT004", EMP007: "SHIFT004", EMP008: "SHIFT001",
  EMP009: "SHIFT004", EMP010: "SHIFT004", EMP011: "SHIFT004", EMP012: "SHIFT004",
  EMP013: "SHIFT004", EMP014: "SHIFT004", EMP015: "SHIFT004", EMP016: "SHIFT001",
  EMP017: "SHIFT004", EMP018: "SHIFT004", EMP019: "SHIFT004", EMP020: "SHIFT004",
  EMP021: "SHIFT004", EMP022: "SHIFT004", EMP023: "SHIFT004", EMP024: "SHIFT004",
  EMP025: "SHIFT004"
};

const cancelledOverrides = {
  "EMP001|2026-07-15": "Cancelled",
  "EMP007|2026-07-07": "Cancelled", "EMP007|2026-07-08": "Cancelled",
  "EMP007|2026-07-09": "Cancelled", "EMP007|2026-07-10": "Cancelled",
  "EMP007|2026-07-11": "Cancelled",
  "EMP002|2026-07-09": "Cancelled", "EMP002|2026-07-11": "Cancelled",
  "EMP003|2026-07-10": "Cancelled",
  "EMP020|2026-07-02": "Cancelled", "EMP020|2026-07-04": "Cancelled",
  "EMP020|2026-07-07": "Swapped", "EMP020|2026-07-08": "Cancelled",
  "EMP020|2026-07-09": "Cancelled",
  "EMP009|2026-07-11": "Cancelled",
  "EMP017|2026-07-04": "Cancelled"
};

let id = 1;
export const shiftSchedules = [];

const empIds = [
  "EMP001","EMP002","EMP003","EMP004","EMP005","EMP006","EMP007","EMP008",
  "EMP009","EMP010","EMP011","EMP012","EMP013","EMP014","EMP015","EMP016",
  "EMP017","EMP018","EMP019","EMP020","EMP021","EMP022","EMP023","EMP024","EMP025"
];

for (const empId of empIds) {
  const relevantDates = empId === "EMP017"
    ? dates.filter((_, i) => i % 2 === 0)
    : dates;
  for (const date of relevantDates) {
    const key = `${empId}|${date}`;
    const status = cancelledOverrides[key] || statuses[id % statuses.length];
    shiftSchedules.push({
      id: `SCH${String(id).padStart(3, "0")}`,
      employeeId: empId,
      employeeName: empNames[empId],
      shiftId: shiftAssignments[empId],
      date,
      status,
    });
    id++;
    if (id > 90) break;
  }
  if (id > 90) break;
}

export default { shiftDefinitions, shiftSchedules };
