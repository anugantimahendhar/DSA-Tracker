import React from 'react';
import { User, Mail, ShieldCheck, Code2, CalendarDays, Fingerprint } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  const items = [
    { icon: <Mail className="w-4 h-4" />, label: 'Email', value: user.email },
    { icon: <ShieldCheck className="w-4 h-4" />, label: 'Role', value: user.role },
    { icon: <Code2 className="w-4 h-4" />, label: 'Default language', value: user.default_language },
    { icon: <CalendarDays className="w-4 h-4" />, label: 'Member since', value: new Date(user.created_at).toLocaleDateString() },
    { icon: <Fingerprint className="w-4 h-4" />, label: 'Profile ID', value: user.id },
  ];
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-6">
      <div className="depth-panel rounded-[28px] p-8 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center shadow-[0_10px_35px_rgba(255,255,255,.12)]"><User className="w-8 h-8" /></div>
        <div><div className="eyebrow">SIGNED-IN PROFILE</div><h1 className="text-3xl font-black mt-2">{user.email}</h1><p className="text-sm text-[#929292] mt-1">Your authenticated account details are loaded immediately after login.</p></div>
      </div>
      <Card><CardHeader><CardTitle>Account Details</CardTitle></CardHeader><CardContent className="grid sm:grid-cols-2 gap-4">{items.map(item => <div key={item.label} className="depth-inset rounded-2xl p-4"><div className="flex items-center gap-2 text-xs text-[#888] uppercase tracking-wider">{item.icon}{item.label}</div><div className="mt-2 font-semibold text-[#f4f4f4] break-all">{item.value}</div></div>)}</CardContent></Card>
    </div>
  );
};
