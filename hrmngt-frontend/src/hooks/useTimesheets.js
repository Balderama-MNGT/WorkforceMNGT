import { useSyncExternalStore } from 'react';
import { timesheets } from '../mock-data/timesheets';

let listeners = new Set();
let snapshot = timesheets.slice();

function emit() {
  snapshot = timesheets.slice();
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

// Session-scoped local store so the employee "My Timesheet" page and the
// HR/Admin timesheet page share the same mock data within the session.
export function useTimesheets() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function submitTimesheet(id) {
  const ts = timesheets.find((t) => t.id === id);
  if (!ts || ts.status !== 'Draft') return null;
  ts.status = 'Submitted';
  ts.submittedDate = new Date().toISOString().slice(0, 10);
  emit();
  return ts;
}

export function approveTimesheet(id, approvedBy) {
  const ts = timesheets.find((t) => t.id === id);
  if (!ts || ts.status !== 'Submitted') return null;
  ts.status = 'Approved';
  ts.approvedBy = approvedBy || null;
  emit();
  return ts;
}

export function rejectTimesheet(id) {
  const ts = timesheets.find((t) => t.id === id);
  if (!ts || ts.status !== 'Submitted') return null;
  ts.status = 'Rejected';
  emit();
  return ts;
}
