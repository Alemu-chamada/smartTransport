import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Menu, X, Bell, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { authApi } from '../features/auth/services';
import { userApi } from '../features/user/services';
import { notificationApi, type Notification } from '../features/notification/services';
import { Input } from '../shared/ui/Input';
import { Logo } from '../shared/ui/Logo';

type OTPAction = 'change_email' | 'change_phone' | 'change_password' | null;

export function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpAction, setOtpAction] = useState<OTPAction>(null);
  const [otp, setOtp] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingData, setPendingData] = useState<{
    new_email?: string;
    new_phone?: string;
    new_password?: string;
  } | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editNameForm, setEditNameForm] = useState({
    first_name: '',
    last_name: ''
  });
  const [changeEmailForm, setChangeEmailForm] = useState({ new_email: '' });
  const [changePhoneForm, setChangePhoneForm] = useState({ new_phone: '' });
  const [changePasswordForm, setChangePasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, updateUser } = useAuth();
  
  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const data = await notificationApi.getMyNotifications();
          setNotifications(data.notifications);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      }
    };
    fetchNotifications();
  }, [user]);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  // Initialize edit forms with user data when user changes
  useEffect(() => {
    if (user) {
      setEditNameForm({
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      });
    }
  }, [user]);
  
  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };
  
  // Close dropdown/menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setShowAccount(false);
        setShowNotifications(false);
        setIsEditingName(false);
        setIsChangingEmail(false);
        setIsChangingPhone(false);
        setIsChangingPassword(false);
        setShowDeleteConfirm(false);
        setShowOtpForm(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/');
      setDropdownOpen(false);
    }
  };
  
  const [formMessage, setFormMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    try {
      setLoading(true);
      const updateResponse = await userApi.updateMe(editNameForm);
      updateUser(updateResponse.user);
      setFormMessage({ text: 'Name updated successfully!', type: 'success' });
      setTimeout(() => { setIsEditingName(false); setFormMessage(null); }, 1200);
    } catch (error: any) {
      console.error('Error updating name:', error);
      setFormMessage({ text: error?.data?.message || 'Failed to update name. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendChangeEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    try {
      setLoading(true);
      await authApi.sendChangeEmailOtp(changeEmailForm);
      setPendingData(changeEmailForm);
      setOtpAction('change_email');
      setShowOtpForm(true);
      setFormMessage(null);
    } catch (error: any) {
      console.error('Error sending OTP for email change:', error);
      setFormMessage({ text: error?.data?.message || 'Failed to send OTP. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendChangePhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    try {
      setLoading(true);
      await authApi.sendChangePhoneOtp(changePhoneForm);
      setPendingData(changePhoneForm);
      setOtpAction('change_phone');
      setShowOtpForm(true);
      setFormMessage(null);
    } catch (error: any) {
      console.error('Error sending OTP for phone change:', error);
      setFormMessage({ text: error?.data?.message || 'Failed to send OTP. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendChangePasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    if (changePasswordForm.new_password !== changePasswordForm.confirm_password) {
      setFormMessage({ text: 'Passwords do not match!', type: 'error' });
      return;
    }
    if (changePasswordForm.new_password.length < 8) {
      setFormMessage({ text: 'New password must be at least 8 characters.', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      await authApi.sendChangePasswordOtp({
        old_password: changePasswordForm.old_password,
        new_password: changePasswordForm.new_password
      });
      setPendingData({ new_password: changePasswordForm.new_password });
      setOtpAction('change_password');
      setShowOtpForm(true);
      setFormMessage(null);
    } catch (error: any) {
      console.error('Error sending OTP for password change:', error);
      setFormMessage({ text: error?.data?.message || 'Failed to send OTP. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormMessage(null);
    try {
      setLoading(true);

      // The OTP was always sent to the user's CURRENT registered email.
      // Pass that as the lookup contact for all change_* purposes so the
      // backend can find the correct OTP record.
      const verifyData: any = {
        otp,
        purpose: otpAction,
        new_email: pendingData?.new_email,
        new_phone: pendingData?.new_phone,
        new_password: pendingData?.new_password,
        // Always use current email as lookup — backend stored OTP against it
        email: user?.email,
      };

      const verifyResponse = await authApi.verifyOtp(verifyData);

      if ('user' in verifyResponse && verifyResponse.user) {
        updateUser(verifyResponse.user);
      }

      setFormMessage({ text: 'Account updated successfully!', type: 'success' });

      // Brief pause so user sees the success message, then close everything
      setTimeout(() => {
        setShowOtpForm(false);
        setShowAccount(false);
        setOtp('');
        setOtpAction(null);
        setPendingData(null);
        setIsChangingEmail(false);
        setIsChangingPhone(false);
        setIsChangingPassword(false);
        setChangeEmailForm({ new_email: '' });
        setChangePhoneForm({ new_phone: '' });
        setChangePasswordForm({ old_password: '', new_password: '', confirm_password: '' });
        setFormMessage(null);
      }, 1500);
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      setFormMessage({ text: error?.data?.message || 'Invalid or expired OTP. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { label: 'Home', path: '/dashboard' },
    { label: 'Trip', path: '/trip' },
    { label: 'My Bookings', path: '/my-bookings' },
    { label: 'Community', path: '/community' },
    { label: 'Nearby Services', path: '/nearby' },
    ...(user?.role === 'system_admin' ? [{ label: 'Admin', path: '/admin/dashboard' }] : []),
  ];

  return (
    <nav
      className="sticky top-0 z-30 backdrop-blur-xl border-b"
      style={{
        backgroundColor: 'rgba(255, 249, 250, 0.92)',
        borderColor: 'rgba(0, 22, 33, 0.08)',
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Logo />

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/admin/dashboard' && location.pathname.startsWith('/admin')) ||
                  (item.path !== '/dashboard' && item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      color: isActive ? '#FF4103' : '#001621',
                      backgroundColor: isActive ? 'rgba(255, 65, 3, 0.07)' : 'transparent',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,22,33,0.05)';
                    }}
                    onMouseLeave={e => {
                      if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                style={{ color: '#001621' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,22,33,0.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >
                <Bell className="h-5 w-5" />
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-[#FF4103] rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-80 max-h-[400px] overflow-y-auto bg-card rounded-xl shadow-lg border border-border z-50"
                  >
                    <div className="p-4 border-b border-border">
                      <h3 className="font-bold text-foreground">Notifications</h3>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                          className={`p-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted ${
                            !notification.is_read ? 'bg-muted/50' : ''
                          }`}
                        >
                          <div className="font-medium text-foreground">{notification.title}</div>
                          {notification.content && (
                            <div className="text-sm text-muted-foreground mt-1">{notification.content}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
                style={{ color: '#001621' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,22,33,0.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #FF4103 0%, #FFBE0B 100%)' }}>
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold" style={{ color: '#001621' }}>{user?.full_name || 'User'}</span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                  >
                    <button
                      onClick={() => { setDropdownOpen(false); setShowAccount(true); }}
                      className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-muted transition-colors text-foreground"
                    >
                      <User className="h-4 w-4" />
                      <span>Account</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 flex items-center gap-2 text-left hover:bg-muted transition-colors text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showAccount && !showOtpForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-foreground">Account Details</h3>
                        </div>
                        <button onClick={() => {
                          setShowAccount(false);
                          setIsEditingName(false);
                          setIsChangingEmail(false);
                          setIsChangingPhone(false);
                          setIsChangingPassword(false);
                          setFormMessage(null);
                        }} className="text-muted-foreground hover:text-foreground">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Inline message banner */}
                      {formMessage && (
                        <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
                          formMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {formMessage.text}
                        </div>
                      )}

                      {/* Account Info */}
                      {!isEditingName && !isChangingEmail && !isChangingPhone && !isChangingPassword && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Name</p>
                              <p className="text-foreground font-medium">{user?.full_name || '—'}</p>
                            </div>
                            <button
                              onClick={() => { setIsEditingName(true); setFormMessage(null); }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Email</p>
                              <p className="text-foreground font-medium">{user?.email || '—'}</p>
                            </div>
                            <button
                              onClick={() => { setIsChangingEmail(true); setFormMessage(null); }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Phone</p>
                              <p className="text-foreground font-medium">{user?.phone || '—'}</p>
                            </div>
                            <button
                              onClick={() => { setIsChangingPhone(true); setFormMessage(null); }}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Role</p>
                              <p className="text-foreground font-medium">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => { setIsChangingPassword(true); setFormMessage(null); }}
                            className="w-full mt-4 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                          >
                            Change Password
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete Account
                          </button>
                        </div>
                      )}

                      {/* Edit Name Form */}
                      {isEditingName && (
                        <form className="space-y-4" onSubmit={handleUpdateName}>
                          <Input
                            label="First Name"
                            type="text"
                            name="first_name"
                            value={editNameForm.first_name}
                            onChange={(e) => setEditNameForm({ ...editNameForm, first_name: e.target.value })}
                            placeholder="First name"
                          />
                          <Input
                            label="Last Name"
                            type="text"
                            name="last_name"
                            value={editNameForm.last_name}
                            onChange={(e) => setEditNameForm({ ...editNameForm, last_name: e.target.value })}
                            placeholder="Last name"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (user) {
                                  setEditNameForm({
                                    first_name: user.first_name || '',
                                    last_name: user.last_name || ''
                                  });
                                }
                                setIsEditingName(false);
                              }}
                              className="flex-1 px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                              disabled={loading}
                            >
                              {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Change Email Form */}
                      {isChangingEmail && (
                        <form className="space-y-4" onSubmit={handleSendChangeEmailOtp}>
                          <Input
                            label="New Email"
                            type="email"
                            name="new_email"
                            value={changeEmailForm.new_email}
                            onChange={(e) => setChangeEmailForm({ ...changeEmailForm, new_email: e.target.value })}
                            placeholder="new@example.com"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsChangingEmail(false);
                                setChangeEmailForm({ new_email: '' });
                              }}
                              className="flex-1 px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                              disabled={loading}
                            >
                              {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Change Phone Form */}
                      {isChangingPhone && (
                        <form className="space-y-4" onSubmit={handleSendChangePhoneOtp}>
                          <Input
                            label="New Phone"
                            type="tel"
                            name="new_phone"
                            value={changePhoneForm.new_phone}
                            onChange={(e) => setChangePhoneForm({ ...changePhoneForm, new_phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsChangingPhone(false);
                                setChangePhoneForm({ new_phone: '' });
                              }}
                              className="flex-1 px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                              disabled={loading}
                            >
                              {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Change Password Form */}
                      {isChangingPassword && (
                        <form className="space-y-4" onSubmit={handleSendChangePasswordOtp}>
                          <Input
                            label="Old Password"
                            type="password"
                            name="old_password"
                            value={changePasswordForm.old_password}
                            onChange={(e) => setChangePasswordForm({ ...changePasswordForm, old_password: e.target.value })}
                            placeholder="Enter old password"
                          />
                          <Input
                            label="New Password"
                            type="password"
                            name="new_password"
                            value={changePasswordForm.new_password}
                            onChange={(e) => setChangePasswordForm({ ...changePasswordForm, new_password: e.target.value })}
                            placeholder="Enter new password"
                          />
                          <Input
                            label="Confirm New Password"
                            type="password"
                            name="confirm_password"
                            value={changePasswordForm.confirm_password}
                            onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirm_password: e.target.value })}
                            placeholder="Confirm new password"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsChangingPassword(false);
                                setChangePasswordForm({
                                  old_password: '',
                                  new_password: '',
                                  confirm_password: ''
                                });
                              }}
                              className="flex-1 px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                              disabled={loading}
                            >
                              {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showOtpForm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-foreground">Verify OTP</h3>
                        <button onClick={() => {
                          setShowOtpForm(false);
                          setOtp('');
                          setOtpAction(null);
                          setPendingData(null);
                          setFormMessage(null);
                        }} className="text-muted-foreground hover:text-foreground">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="text-muted-foreground mb-3 text-sm">
                        A verification code was sent to your registered email
                        {user?.email ? <strong> ({user.email})</strong> : ''}.
                        Enter it below to confirm the change.
                      </p>

                      {/* Inline message */}
                      {formMessage && (
                        <div className={`mb-3 px-4 py-3 rounded-xl text-sm font-medium ${
                          formMessage.type === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {formMessage.text}
                        </div>
                      )}

                      <form className="space-y-4" onSubmit={handleOtpSubmit}>
                        <Input
                          label="One-Time Password"
                          type="text"
                          value={otp}
                          onChange={(e) => { setOtp(e.target.value); setFormMessage(null); }}
                          required
                          maxLength={6}
                          placeholder="000000"
                        />
                        <div className="flex gap-2 mt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setShowOtpForm(false);
                              setOtp('');
                              setOtpAction(null);
                              setPendingData(null);
                              setFormMessage(null);
                            }}
                            className="flex-1 px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                            disabled={loading || otp.length < 6}
                          >
                            {loading ? 'Verifying…' : 'Verify OTP'}
                          </button>
                        </div>
                        {/* Resend OTP */}
                        <button
                          type="button"
                          className="w-full text-xs text-muted-foreground hover:text-foreground text-center mt-1 transition-colors"
                          disabled={loading}
                          onClick={async () => {
                            setFormMessage(null);
                            try {
                              if (otpAction === 'change_email' && pendingData?.new_email) {
                                await authApi.sendChangeEmailOtp({ new_email: pendingData.new_email });
                              } else if (otpAction === 'change_phone' && pendingData?.new_phone) {
                                await authApi.sendChangePhoneOtp({ new_phone: pendingData.new_phone });
                              } else if (otpAction === 'change_password' && pendingData?.new_password) {
                                await authApi.sendChangePasswordOtp({
                                  old_password: changePasswordForm.old_password,
                                  new_password: pendingData.new_password,
                                });
                              }
                              setFormMessage({ text: 'A new OTP has been sent to your email.', type: 'success' });
                            } catch (err: any) {
                              setFormMessage({ text: err?.data?.message || 'Failed to resend OTP.', type: 'error' });
                            }
                          }}
                        >
                          Didn't receive it? Resend OTP
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showDeleteConfirm && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-96 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-red-600">Delete Account</h3>
                        <button onClick={() => setShowDeleteConfirm(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="text-muted-foreground mb-6">
                        Are you sure you want to delete your account? This action cannot be undone.
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 px-4 py-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await userApi.deleteMe();
                              logout();
                              navigate('/');
                            } catch (error) {
                              console.error('Error deleting account:', error);
                              alert('Failed to delete account. Please try again.');
                            } finally {
                              setShowDeleteConfirm(false);
                              setShowAccount(false);
                            }
                          }}
                          className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? 'Deleting...' : 'Delete Account'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="md:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: '#001621' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,22,33,0.05)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
            style={{ backgroundColor: 'rgba(255,249,250,0.97)', borderColor: 'rgba(0,22,33,0.08)' }}
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/admin/dashboard' && location.pathname.startsWith('/admin')) ||
                  (item.path !== '/dashboard' && item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                    style={{
                      color: isActive ? '#FF4103' : '#001621',
                      backgroundColor: isActive ? 'rgba(255, 65, 3, 0.07)' : 'transparent',
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-2 rounded-xl text-left transition-colors text-sm font-semibold"
                style={{ color: '#001621' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,22,33,0.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
