import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Mail, Lock, Moon, Sun, LogOut, Check, X, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { signOut, updateEmail, updatePassword } from '../lib/authService';

type Panel = null | 'email' | 'password';

const DARK_STORAGE_KEY = 'darkMode';

function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(DARK_STORAGE_KEY, String(next));
    } catch (_) {}
    setDark(next);
  };
  return [dark, toggle];
}

export function UserMenu() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [dark, toggleDark] = useDarkMode();

  const [emailValue, setEmailValue] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPanel(null);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const initial = (user?.email?.[0] ?? '?').toUpperCase();

  const openPanel = (p: Panel) => {
    setPanel(p);
    setEmailMsg(null);
    setPasswordMsg(null);
    setEmailValue('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEmailSave = async () => {
    if (!emailValue.trim() || !emailValue.includes('@')) {
      setEmailMsg({ ok: false, text: 'Please enter a valid email address.' });
      return;
    }
    setEmailLoading(true);
    const { error } = await updateEmail(emailValue.trim());
    setEmailLoading(false);
    if (error) {
      setEmailMsg({ ok: false, text: error });
    } else {
      setEmailMsg({ ok: true, text: 'Confirmation email sent – check your inbox.' });
    }
  };

  const handlePasswordSave = async () => {
    if (!newPassword || newPassword.length < 8) {
      setPasswordMsg({ ok: false, text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: 'Passwords do not match.' });
      return;
    }
    setPasswordLoading(true);
    const { error } = await updatePassword(newPassword);
    setPasswordLoading(false);
    if (error) {
      setPasswordMsg({ ok: false, text: error });
    } else {
      setPasswordMsg({ ok: true, text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(o => !o); setPanel(null); }}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 shadow-sm hover:shadow transition-all"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initial}
        </span>
        <span className="hidden sm:block text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[140px] truncate">
          {user?.email}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-600 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user?.email}</p>
          </div>

          {/* Main menu items */}
          {panel === null && (
            <div className="py-1">
              <MenuItem icon={<Mail className="w-4 h-4" />} label="Change email" onClick={() => openPanel('email')} />
              <MenuItem icon={<Lock className="w-4 h-4" />} label="Change password" onClick={() => openPanel('password')} />
              <button
                onClick={toggleDark}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                {dark
                  ? <Sun className="w-4 h-4 text-amber-500" />
                  : <Moon className="w-4 h-4 text-slate-500" />
                }
                <span>{dark ? 'Light mode' : 'Dark mode'}</span>
                <span className={`ml-auto w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${dark ? 'bg-blue-500' : 'bg-slate-200'}`}>
                  <span className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-4' : 'translate-x-0'}`} />
                </span>
              </button>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}

          {/* Change email panel */}
          {panel === 'email' && (
            <div className="p-4 space-y-3">
              <PanelHeader title="Change email" onBack={() => openPanel(null)} />
              <input
                type="email"
                value={emailValue}
                onChange={e => setEmailValue(e.target.value)}
                placeholder="New email address"
                className="w-full px-3 py-2 text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
              />
              {emailMsg && (
                <p className={`text-xs flex items-center gap-1.5 ${emailMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {emailMsg.ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {emailMsg.text}
                </p>
              )}
              <button
                onClick={handleEmailSave}
                disabled={emailLoading}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                {emailLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save new email
              </button>
            </div>
          )}

          {/* Change password panel */}
          {panel === 'password' && (
            <div className="p-4 space-y-3">
              <PanelHeader title="Change password" onBack={() => openPanel(null)} />
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password (min 8 chars)"
                className="w-full px-3 py-2 text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
              />
              {passwordMsg && (
                <p className={`text-xs flex items-center gap-1.5 ${passwordMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMsg.ok ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                  {passwordMsg.text}
                </p>
              )}
              <button
                onClick={handlePasswordSave}
                disabled={passwordLoading}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 text-white text-sm font-semibold rounded-xl transition-all"
              >
                {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save new password
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
    >
      <span className="text-slate-500 dark:text-slate-400">{icon}</span>
      {label}
    </button>
  );
}

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
        <X className="w-4 h-4" />
      </button>
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
    </div>
  );
}
