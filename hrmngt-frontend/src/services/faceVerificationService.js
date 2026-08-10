export const FACE_VERIFICATION_STEPS = [
  { id: 'camera', label: 'Initializing Camera...', icon: 'camera' },
  { id: 'detect', label: 'Detecting Face...', icon: 'detect' },
  { id: 'scan', label: 'Scanning Facial Features...', icon: 'scan' },
  { id: 'liveness', label: 'Performing Liveness Check...', icon: 'liveness' },
  { id: 'match', label: 'Matching Employee Identity...', icon: 'match' },
  { id: 'verified', label: 'Face Successfully Verified ✅', icon: 'verified' },
];

export function generateConfidenceScore() {
  return Math.min(99, Math.round((95 + Math.random() * 4) * 10) / 10);
}

export function simulateFaceVerification({ signal, onStep, stepDuration = 450 } = {}) {
  return new Promise((resolve) => {
    let currentStep = 0;
    let timeoutId;

    const handleAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', handleAbort);
      resolve(null);
    };

    if (signal) {
      if (signal.aborted) {
        resolve(null);
        return;
      }
      signal.addEventListener('abort', handleAbort, { once: true });
    }

    const complete = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', handleAbort);
      resolve({
        status: 'Verified',
        confidence: generateConfidenceScore(),
        liveness: 'Passed',
        approval: 'Successful',
      });
    };

    const tick = () => {
      onStep?.(currentStep);
      currentStep += 1;
      if (currentStep >= FACE_VERIFICATION_STEPS.length) {
        timeoutId = setTimeout(complete, stepDuration);
      } else {
        timeoutId = setTimeout(tick, stepDuration);
      }
    };

    timeoutId = setTimeout(tick, 0);
  });
}
