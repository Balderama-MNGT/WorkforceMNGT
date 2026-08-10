import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, ScanFace, CheckCircle2, RefreshCw, Camera } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input, { Select } from '../../components/ui/Input';
import FaceCaptureModal from '../../components/employees/FaceCaptureModal';
import { employeeService } from '../../services/api';
import { DEPARTMENTS, EMPLOYMENT_TYPES, POSITIONS } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+\d][\d\s\-()]{6,}$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&._-]{8,}$/;

const generateNextEmployeeId = (employees) => {
  const maxNum = employees.reduce((max, e) => {
    const match = String(e.id || '').match(/(\d+)/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 0);
  return `EMP${String(maxNum + 1).padStart(3, '0')}`;
};

const createEmptyForm = (suggestedId = '') => ({
  employeeId: suggestedId,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  employmentType: 'Full-time',
  dateHired: '',
  password: '',
  faceRegistered: false,
  faceImage: null,
});

export default function EmployeeRegistration() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [existingEmployees, setExistingEmployees] = useState([]);
  const [formData, setFormData] = useState(createEmptyForm());
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);

  const setField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  useEffect(() => {
    let active = true;
    employeeService.getAll().then((data) => {
      if (!active) return;
      setExistingEmployees(data);
      setFormData((prev) => ({
        ...prev,
        employeeId: prev.employeeId || generateNextEmployeeId(data),
      }));
    });
    return () => { active = false; };
  }, []);

  const existingEmails = useCallback(
    () => new Set(existingEmployees.map((e) => e.email.trim().toLowerCase())),
    [existingEmployees]
  );

  const validate = () => {
    const errs = {};
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!formData.firstName.trim()) errs.firstName = 'First name is required.';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required.';

    if (!email) {
      errs.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(email)) {
      errs.email = 'Please enter a valid email address.';
    } else if (existingEmails().has(email.toLowerCase())) {
      errs.email = 'An employee with this email already exists.';
    }

    if (!phone) {
      errs.phone = 'Phone number is required.';
    } else if (!PHONE_REGEX.test(phone)) {
      errs.phone = 'Please enter a valid phone number.';
    }

    if (!formData.department) errs.department = 'Department is required.';
    if (!formData.position.trim()) errs.position = 'Position is required.';
    if (!formData.employmentType) errs.employmentType = 'Employment type is required.';
    if (!formData.dateHired) errs.dateHired = 'Date hired is required.';

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (!PASSWORD_REGEX.test(formData.password)) {
      errs.password = 'Password must be at least 8 characters and include a letter and a number.';
    }

    if (!formData.faceRegistered || !formData.faceImage) {
      errs.faceRegistered = 'Face registration is required before creating the account.';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = (list = existingEmployees) => {
    const nextId = generateNextEmployeeId(list);
    setFormData(createEmptyForm(nextId));
    setFormErrors({});
  };

  const handleFaceCapture = (dataUrl) => {
    setFormData((prev) => ({ ...prev, faceImage: dataUrl, faceRegistered: true }));
    setFormErrors((prev) => ({ ...prev, faceRegistered: undefined }));
    setIsFaceModalOpen(false);
    toast.success('Face Registered', 'Face photo captured and linked to this employee ID.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const newEmployee = {
        id: formData.employeeId.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        position: formData.position.trim(),
        employmentType: formData.employmentType,
        status: 'Active',
        hireDate: formData.dateHired,
        salary: 0,
        manager: '',
        avatar: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        assignedShift: '',
        skills: [],
        password: formData.password,
        faceRegistered: formData.faceRegistered,
        faceImage: formData.faceImage,
      };
      const created = await employeeService.create(newEmployee);
      setExistingEmployees((prev) => [...prev, created]);

      toast.success('Employee Account Created', 'Employee account created successfully. Assign a schedule for this employee from Shift & Schedule.');
      resetForm([...existingEmployees, created]);
    } catch {
      toast.error('Error', 'Failed to create employee account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Registration</h1>
          <p className="text-[14px] text-gray-500 mt-1">Register a new employee account</p>
        </div>
        <Button variant="outline" icon={ArrowLeft} onClick={() => navigate('/employees')}>
          Back to Employees
        </Button>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">Employee Information</h3>
                <p className="text-[13px] text-gray-500">Fill in the employee's basic information and account details.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Employee ID"
              required
              value={formData.employeeId}
              disabled
              className="bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <Input
              label="First Name"
              required
              value={formData.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
              error={formErrors.firstName}
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              required
              value={formData.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
              error={formErrors.lastName}
              placeholder="Enter last name"
            />
            <Input
              label="Email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setField('email', e.target.value)}
              error={formErrors.email}
              placeholder="email@company.com"
            />
            <Input
              label="Phone Number"
              required
              value={formData.phone}
              onChange={(e) => setField('phone', e.target.value)}
              error={formErrors.phone}
              placeholder="+63 9XX XXX XXXX"
            />
            <Select
              label="Department"
              required
              value={formData.department}
              onChange={(e) => setField('department', e.target.value)}
              error={formErrors.department}
            >
              <option value="">Select Department</option>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </Select>
            <Select
              label="Position"
              required
              value={formData.position}
              onChange={(e) => setField('position', e.target.value)}
              error={formErrors.position}
            >
              <option value="">Select Position</option>
              {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Select
              label="Employment Type"
              required
              value={formData.employmentType}
              onChange={(e) => setField('employmentType', e.target.value)}
              error={formErrors.employmentType}
            >
              {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Input
              label="Date Hired"
              type="date"
              required
              value={formData.dateHired}
              onChange={(e) => setField('dateHired', e.target.value)}
              error={formErrors.dateHired}
            />
            <Input
              label="Account Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setField('password', e.target.value)}
              error={formErrors.password}
              placeholder="At least 8 characters"
            />
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-xs text-gray-500">
              Password must be at least 8 characters and include at least one letter and one number.
            </p>
          </div>

          {/* Face Registration */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <ScanFace className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">
                  Face Registration <span className="text-red-500">*</span>
                </h3>
                <p className="text-[13px] text-gray-500">Capture a face photo linked to this employee's ID for future attendance verification.</p>
              </div>
            </div>

            <div className={`flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border bg-gray-50 px-4 py-4 ${formErrors.faceRegistered ? 'border-red-300' : 'border-gray-100'}`}>
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center shrink-0">
                {formData.faceImage ? (
                  <img src={formData.faceImage} alt="Registered face preview" className="w-full h-full object-cover" />
                ) : (
                  <ScanFace className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {formData.faceRegistered ? (
                    <Badge variant="success" dot size="sm">
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Registered</span>
                    </Badge>
                  ) : (
                    <Badge variant="default" dot size="sm">Not Registered</Badge>
                  )}
                  <span className="text-xs text-gray-400">Linked to {formData.employeeId || 'this employee ID'}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Required before the account can be created. This prototype capture is for workflow purposes only and is not a secure biometric authentication system.
                </p>
                {formErrors.faceRegistered && (
                  <p className="text-xs text-red-500 mt-1.5">{formErrors.faceRegistered}</p>
                )}
              </div>
              <Button
                type="button"
                variant={formData.faceRegistered ? 'outline' : 'primary'}
                size="sm"
                icon={formData.faceRegistered ? RefreshCw : Camera}
                onClick={() => setIsFaceModalOpen(true)}
                className="shrink-0"
              >
                {formData.faceRegistered ? 'Retake Photo' : 'Register Face'}
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => navigate('/employees')}>
              Cancel
            </Button>
            <Button
              type="submit"
              icon={submitting ? null : UserPlus}
              loading={submitting}
              disabled={!formData.faceRegistered}
              title={!formData.faceRegistered ? 'Register the employee\'s face before creating the account' : undefined}
            >
              Create Employee Account
            </Button>
          </div>
        </form>
      </Card>

      <FaceCaptureModal
        isOpen={isFaceModalOpen}
        employeeId={formData.employeeId}
        employeeName={`${formData.firstName} ${formData.lastName}`.trim()}
        onCapture={handleFaceCapture}
        onClose={() => setIsFaceModalOpen(false)}
      />
    </div>
  );
}
