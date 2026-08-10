import { useState } from 'react';
import {
  Settings as SettingsIcon, User, Building, Palette, Bell, Shield,
  Monitor, Save, Camera, Globe, Clock, Mail, MessageSquare,
  Smartphone, Lock, Eye, EyeOff, Key, AlertTriangle, Check
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input, { Select, Textarea } from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import settingsData from '../../mock-data/settings';
import companyData from '../../mock-data/company';
import { useToast } from '../../context/ToastContext';
import { useRole } from '../../context/RoleContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, LANGUAGE_OPTIONS } from '../../context/LanguageContext';

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

const NAV_ITEMS = [
  { id: 'company', key: 'settings.company', icon: Building },
  { id: 'profile', key: 'settings.profile', icon: User },
  { id: 'appearance', key: 'settings.appearance', icon: Palette },
  { id: 'notifications', key: 'settings.notifications', icon: Bell },
  { id: 'security', key: 'settings.security', icon: Shield },
  { id: 'system', key: 'settings.system', icon: Monitor },
];

function CompanySection() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: companyData.name,
    street: companyData.address.street,
    city: companyData.address.city,
    province: companyData.address.province,
    zipCode: companyData.address.zipCode,
    country: companyData.address.country,
    phone: companyData.phone,
    email: companyData.email,
    website: companyData.website,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success('Company information updated', 'Company details have been saved successfully.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Company Details</CardTitle>
            <CardDescription>Manage your company information and contact details</CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Company Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            icon={Building}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            icon={Mail}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            icon={Mail}
          />
          <Input
            label="Website"
            value={form.website}
            onChange={(e) => handleChange('website', e.target.value)}
            icon={Globe}
          />
        </div>

        <div className="mt-5">
          <Textarea
            label="Street Address"
            value={form.street}
            onChange={(e) => handleChange('street', e.target.value)}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
          <Input
            label="City"
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
          <Input
            label="Province"
            value={form.province}
            onChange={(e) => handleChange('province', e.target.value)}
          />
          <Input
            label="Zip Code"
            value={form.zipCode}
            onChange={(e) => handleChange('zipCode', e.target.value)}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button icon={Save} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Company Overview</CardTitle>
            <CardDescription>Read-only company information</CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Industry</label>
            <div className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 text-gray-700">
              {companyData.industry}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Founded</label>
            <div className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 text-gray-700">
              {companyData.founded}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Employee Count</label>
            <div className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 text-gray-700">
              {companyData.employeeCount} employees
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Departments</label>
            <div className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 text-gray-700">
              {companyData.departments} departments
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Locations</label>
          <div className="space-y-2">
            {companyData.locationsList.map((loc, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 text-gray-700"
              >
                <Building className="w-4 h-4 text-gray-400 shrink-0" />
                {loc}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProfileSection() {
  const { toast } = useToast();
  const { currentRole } = useRole();
  const [form, setForm] = useState({
    name: settingsData.profile.name,
    email: settingsData.profile.email,
    phone: settingsData.profile.phone,
    timezone: settingsData.profile.timezone,
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success('Profile updated', 'Your profile settings have been saved.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>Update your profile picture</CardDescription>
          </div>
        </CardHeader>

        <div className="flex items-center gap-6">
          <Avatar
            src={settingsData.profile.avatar}
            firstName={settingsData.profile.name.split(' ')[0]}
            lastName={settingsData.profile.name.split(' ')[1]}
            size="2xl"
          />
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" icon={Camera}>
              Change Photo
            </Button>
            <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Manage your personal details</CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            icon={User}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            icon={Mail}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            icon={Smartphone}
          />
          <Select
            label="Timezone"
            value={form.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
          >
            <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
            <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
            <option value="America/New_York">America/New_York (GMT-5)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
            <option value="Europe/London">Europe/London (GMT+0)</option>
          </Select>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Role</label>
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-2.5 text-sm rounded-xl border border-gray-100 bg-gray-50 text-gray-700 flex-1">
              {settingsData.profile.role}
            </div>
            <Badge variant="primary">{currentRole}</Badge>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button icon={Save} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

function AppearanceSection() {
  const { toast } = useToast();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();

  const themes = [
    { id: 'light', label: 'Light', bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
    { id: 'dark', label: 'Dark', bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700' },
    { id: 'system', label: 'System', bg: 'bg-gradient-to-br from-white to-gray-100', text: 'text-gray-900', border: 'border-gray-200' },
  ];

  const fontSizes = [
    { id: 'small', label: 'Small', text: 'text-xs' },
    { id: 'medium', label: 'Medium', text: 'text-sm' },
    { id: 'large', label: 'Large', text: 'text-base' },
  ];

  const handleSave = () => {
    toast.success('Appearance updated', 'Your appearance preferences have been saved.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Theme</CardTitle>
            <CardDescription>Select your preferred color theme</CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-3 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative rounded-xl border-2 p-4 transition-all duration-200 ${
                theme === t.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {theme === t.id && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <div className={`w-full h-20 rounded-lg ${t.bg} ${t.border} border mb-3 flex items-center justify-center`}>
                <div className="space-y-1">
                  <div className={`h-1.5 w-8 rounded ${t.text} opacity-20 bg-current`} />
                  <div className={`h-1.5 w-12 rounded ${t.text} opacity-30 bg-current`} />
                  <div className={`h-1.5 w-6 rounded ${t.text} opacity-20 bg-current`} />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">{t.label}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Font Size</CardTitle>
            <CardDescription>Adjust the text size across the application</CardDescription>
          </div>
        </CardHeader>

        <div className="flex gap-3">
          {fontSizes.map((fs) => (
            <button
              key={fs.id}
              onClick={() => setFontSize(fs.id)}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-center transition-all duration-200 ${
                fontSize === fs.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className={`font-medium ${fs.text}`}>{fs.label}</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button icon={Save} onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState({
    email: settingsData.notifications.emailAlerts,
    push: settingsData.notifications.pushNotifications,
    sms: settingsData.notifications.smsAlerts,
    leave: settingsData.notifications.leaveRequestAlerts,
    shift: settingsData.notifications.shiftChangeAlerts,
    attendance: settingsData.notifications.attendanceAlerts,
  });

  const toggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast.success('Notifications updated', 'Your notification preferences have been saved.');
  };

  const notificationItems = [
    { key: 'email', label: 'Email Notifications', description: 'Receive email alerts for important updates', icon: Mail },
    { key: 'push', label: 'Push Notifications', description: 'Get push notifications in your browser', icon: Bell },
    { key: 'sms', label: 'SMS Notifications', description: 'Receive text message alerts', icon: MessageSquare },
    { key: 'leave', label: 'Leave Request Notifications', description: 'Get notified about leave request approvals and rejections', icon: Clock },
    { key: 'shift', label: 'Shift Change Notifications', description: 'Alerts when your shift schedule changes', icon: Clock },
    { key: 'attendance', label: 'Attendance Alerts', description: 'Notifications for attendance check-in/out reminders', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Notification Channels</CardTitle>
            <CardDescription>Choose how you want to be notified</CardDescription>
          </div>
        </CardHeader>

        <div className="divide-y divide-gray-100">
          {notificationItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </div>
              <ToggleSwitch enabled={prefs[item.key]} onToggle={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button icon={Save} onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function SecuritySection() {
  const { toast } = useToast();
  const [twoFactor, setTwoFactor] = useState(settingsData.security.twoFactorEnabled);
  const [sessionTimeout, setSessionTimeout] = useState(String(settingsData.security.sessionTimeout));
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const sessions = [
    {
      id: 1,
      device: 'Chrome on Windows',
      location: 'Taguig City, Philippines',
      ip: '192.168.1.***',
      lastActive: 'Active now',
      current: true,
    },
    {
      id: 2,
      device: 'Safari on iPhone',
      location: 'Taguig City, Philippines',
      ip: '10.0.0.***',
      lastActive: '2 hours ago',
      current: false,
    },
  ];

  const handlePassChange = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleSavePassword = () => {
    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error('Missing fields', 'Please fill in all password fields.');
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      toast.error('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    toast.success('Password changed', 'Your password has been updated successfully.');
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  const handleSaveSecurity = () => {
    toast.success('Security settings updated', 'Your security preferences have been saved.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Two-Factor Authentication</CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </div>
        </CardHeader>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${twoFactor ? 'bg-emerald-50' : 'bg-gray-50'}`}>
              <Shield className={`w-5 h-5 ${twoFactor ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {twoFactor ? 'Two-Factor Authentication is Enabled' : 'Two-Factor Authentication is Disabled'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {twoFactor
                  ? 'Your account is protected with an additional verification step.'
                  : 'Enable 2FA to secure your account with a verification code.'}
              </p>
            </div>
          </div>
          <ToggleSwitch enabled={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password regularly to keep your account secure</CardDescription>
          </div>
          <Badge variant={settingsData.security.passwordStrength === 'Strong' ? 'success' : 'warning'} dot>
            {settingsData.security.passwordStrength}
          </Badge>
        </CardHeader>

        <div className="space-y-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showCurrentPass ? 'text' : 'password'}
                value={passwords.current}
                onChange={(e) => handlePassChange('current', e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 pr-10 text-sm rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showNewPass ? 'text' : 'password'}
                value={passwords.newPass}
                onChange={(e) => handlePassChange('newPass', e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 pr-10 text-sm rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPass ? 'text' : 'password'}
                value={passwords.confirm}
                onChange={(e) => handlePassChange('confirm', e.target.value)}
                className="w-full px-3.5 py-2.5 pl-10 pr-10 text-sm rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button icon={Lock} onClick={handleSavePassword}>
            Update Password
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Session Settings</CardTitle>
            <CardDescription>Manage your session timeout and active sessions</CardDescription>
          </div>
        </CardHeader>

        <Select
          label="Session Timeout"
          value={sessionTimeout}
          onChange={(e) => setSessionTimeout(e.target.value)}
          containerClass="max-w-xs"
        >
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="240">4 hours</option>
        </Select>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Devices currently signed in to your account</CardDescription>
          </div>
        </CardHeader>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${
                session.current ? 'border-blue-200 bg-blue-50/50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  session.current ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Monitor className={`w-5 h-5 ${session.current ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{session.device}</p>
                    {session.current && (
                      <Badge variant="success" size="xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {session.location} &middot; {session.ip} &middot; {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button icon={Save} onClick={handleSaveSecurity}>
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}

function SystemSection() {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [prefs, setPrefs] = useState({
    dateFormat: settingsData.system.dateFormat,
    timeFormat: settingsData.system.timeFormat,
    timezone: settingsData.profile.timezone,
    autoSave: true,
  });

  const handleChange = (field, value) => {
    setPrefs((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast.success('System preferences updated', 'Your system settings have been saved.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Regional Settings</CardTitle>
            <CardDescription>Configure language, date, and time formats</CardDescription>
          </div>
        </CardHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>{opt.label}</option>
            ))}
          </Select>

          <Select
            label="Date Format"
            value={prefs.dateFormat}
            onChange={(e) => handleChange('dateFormat', e.target.value)}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD MMM YYYY">DD MMM YYYY</option>
          </Select>

          <Select
            label="Time Format"
            value={prefs.timeFormat}
            onChange={(e) => handleChange('timeFormat', e.target.value)}
          >
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </Select>

          <Select
            label="Timezone"
            value={prefs.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
          >
            <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
            <option value="Asia/Singapore">Asia/Singapore (GMT+8)</option>
            <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
            <option value="America/New_York">America/New_York (GMT-5)</option>
            <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
            <option value="Europe/London">Europe/London (GMT+0)</option>
          </Select>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Application Preferences</CardTitle>
            <CardDescription>General system behavior settings</CardDescription>
          </div>
        </CardHeader>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
              <Save className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-Save</p>
              <p className="text-xs text-gray-500 mt-0.5">Automatically save changes as you make them</p>
            </div>
          </div>
          <ToggleSwitch enabled={prefs.autoSave} onToggle={() => handleChange('autoSave', !prefs.autoSave)} />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button icon={Save} onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company');
  const { t } = useLanguage();

  const renderSection = () => {
    switch (activeTab) {
      case 'company':
        return <CompanySection />;
      case 'profile':
        return <ProfileSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'security':
        return <SecuritySection />;
      case 'system':
        return <SystemSection />;
      default:
        return <CompanySection />;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className="text-[14px] text-gray-500 mt-1">{t('settings.subtitle')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 shrink-0">
          <Card padding={false}>
            <nav className="p-2">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-4.5 h-4.5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  {t(item.key)}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        <div className="flex-1 min-w-0">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
