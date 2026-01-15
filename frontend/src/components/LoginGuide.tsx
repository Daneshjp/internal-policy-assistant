import { useState } from 'react';
import { Copy, Check, User, Shield, ClipboardCheck, Wrench, BarChart3 } from 'lucide-react';

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: string;
  icon: any;
  color: string;
  description: string;
}

const testUsers: TestUser[] = [
  {
    email: 'admin@adnoc.ae',
    password: 'admin123',
    name: 'Ahmed Al Mansouri',
    role: 'Admin',
    icon: Shield,
    color: 'purple',
    description: 'Full system access, user management, system configuration',
  },
  {
    email: 'khalid.al.mazrouei@adnoc.ae',
    password: 'demo123',
    name: 'Khalid Al Mazrouei',
    role: 'Team Leader',
    icon: User,
    color: 'blue',
    description: 'Team management, planning, scheduling, analytics',
  },
  {
    email: 'inspector1@adnoc.ae',
    password: 'demo123',
    name: 'Mohammad Al Hosani',
    role: 'Inspector',
    icon: ClipboardCheck,
    color: 'green',
    description: 'Field inspections, report submission, asset viewing',
  },
  {
    email: 'engineer1@adnoc.ae',
    password: 'demo123',
    name: 'Omar Al Ketbi',
    role: 'Engineer',
    icon: Wrench,
    color: 'orange',
    description: 'Work request management, maintenance tracking',
  },
  {
    email: 'rbi.auditor1@adnoc.ae',
    password: 'demo123',
    name: 'Salem Al Dhaheri',
    role: 'RBI Auditor',
    icon: BarChart3,
    color: 'red',
    description: 'Risk-based inspection assessments and audits',
  },
];

const colorClasses = {
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    icon: 'bg-purple-100',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    icon: 'bg-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    icon: 'bg-green-100',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    icon: 'bg-orange-100',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'bg-red-100',
  },
};

export function LoginGuide() {
  const [showGuide, setShowGuide] = useState(false);
  const [copiedField, setCopiedField] = useState<string>('');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  if (!showGuide) {
    return (
      <button
        onClick={() => setShowGuide(true)}
        className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-4"
      >
        Show Test Login Credentials
      </button>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Test Accounts</h3>
        <button
          onClick={() => setShowGuide(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Hide
        </button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {testUsers.map((user) => {
          const colors = colorClasses[user.color as keyof typeof colorClasses];
          const Icon = user.icon;

          return (
            <div
              key={user.email}
              className={`border ${colors.border} ${colors.bg} rounded-lg p-4`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 ${colors.icon} rounded-lg`}>
                  <Icon className={colors.text} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{user.name}</h4>
                    <span className={`text-xs px-2 py-0.5 ${colors.bg} ${colors.text} rounded-full border ${colors.border}`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">{user.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white px-2 py-1 rounded border border-gray-200 truncate">
                        {user.email}
                      </code>
                      <button
                        onClick={() => copyToClipboard(user.email, `${user.email}-email`)}
                        className="p-1.5 hover:bg-white rounded transition-colors"
                        title="Copy email"
                      >
                        {copiedField === `${user.email}-email` ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} className="text-gray-500" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-white px-2 py-1 rounded border border-gray-200">
                        {user.password}
                      </code>
                      <button
                        onClick={() => copyToClipboard(user.password, `${user.email}-password`)}
                        className="p-1.5 hover:bg-white rounded transition-colors"
                        title="Copy password"
                      >
                        {copiedField === `${user.email}-password` ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} className="text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Each role has a guided tour that starts automatically on first login.
          Click the help icon (?) in the header to restart the tour anytime.
        </p>
      </div>
    </div>
  );
}
