import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { User, LogOut, Menu, X, Bell, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { authApi } from '../features/auth/services';
import { userApi } from '../features/user/services';
import { notificationApi, type Notification } from '../features/notification/services';
import { Input } from '../shared/ui/Input';

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
  
  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateResponse = await userApi.updateMe(editNameForm);
      updateUser(updateResponse.user);
      alert('Name updated successfully!');
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChangeEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authApi.sendChangeEmailOtp(changeEmailForm);
      setPendingData(changeEmailForm);
      setOtpAction('change_email');
      setShowOtpForm(true);
    } catch (error) {
      console.error('Error sending OTP for email change:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChangePhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authApi.sendChangePhoneOtp(changePhoneForm);
      setPendingData(changePhoneForm);
      setOtpAction('change_phone');
      setShowOtpForm(true);
    } catch (error) {
      console.error('Error sending OTP for phone change:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChangePasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changePasswordForm.new_password !== changePasswordForm.confirm_password) {
      alert('Passwords do not match!');
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
    } catch (error) {
      console.error('Error sending OTP for password change:', error);
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const verifyData: any = {
        otp,
        purpose: otpAction,
        new_email: pendingData?.new_email,
        new_phone: pendingData?.new_phone,
        new_password: pendingData?.new_password
      };

      // Set the correct lookup contact based on purpose
      if (otpAction === 'change_email') {
        verifyData.email = pendingData?.new_email;
      } else if (otpAction === 'change_phone') {
        verifyData.phone = pendingData?.new_phone;
      } else if (otpAction === 'change_password') {
        verifyData.email = user?.email;
        verifyData.phone = user?.phone;
      } else {
        verifyData.email = user?.email;
        verifyData.phone = user?.phone;
      }

      const verifyResponse = await authApi.verifyOtp(verifyData);

      if ('user' in verifyResponse && verifyResponse.user) {
        updateUser(verifyResponse.user);
      }

      alert('OTP verified! Account updated successfully!');

      // Reset all forms
      setShowOtpForm(false);
      setOtp('');
      setOtpAction(null);
      setPendingData(null);
      setIsChangingEmail(false);
      setIsChangingPhone(false);
      setIsChangingPassword(false);
      setChangeEmailForm({ new_email: '' });
      setChangePhoneForm({ new_phone: '' });
      setChangePasswordForm({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Failed to verify OTP. Please try again.');
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
    ...(user?.role === 'system_admin' ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <nav className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-primary-foreground font-bold text-lg">T</span>
              </div>
              <span className="font-bold text-xl text-foreground hidden sm:block">TMS</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-4 py-2 rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {/* Notification Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-muted transition-colors relative"
              >
                <Bell className="h-5 w-5 text-foreground" />
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm text-foreground">{user?.full_name || 'User'}</span>
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
                        }} className="text-muted-foreground hover:text-foreground">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {/* Account Info */}
                      {!isEditingName && !isChangingEmail && !isChangingPhone && !isChangingPassword && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">Name</p>
                              <p className="text-foreground font-medium">{user?.full_name || '—'}</p>
                            </div>
                            <button
                              onClick={() => setIsEditingName(true)}
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
                              onClick={() => setIsChangingEmail(true)}
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
                              onClick={() => setIsChangingPhone(true)}
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
                            onClick={() => setIsChangingPassword(true)}
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
                        }} className="text-muted-foreground hover:text-foreground">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <p className="text-muted-foreground mb-4">
                        Enter the OTP sent to your {otpAction === 'change_email' ? 'new email' : otpAction === 'change_phone' ? 'new phone' : 'email or phone'} to complete the update.
                      </p>

                      <form className="space-y-4" onSubmit={handleOtpSubmit}>
                        <Input
                          label="One-Time Password"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          required
                          maxLength={6}
                          placeholder="000000"
                        />
                        <div className="flex gap-2 mt-6">
                          <button
                            type="button"
                            onClick={() => {
                              setShowOtpForm(false);
                              setOtp('');
                              setOtpAction(null);
                              setPendingData(null);
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
                            {loading ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        </div>
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

            {user?.role === 'system_admin' && (
              <Link to="/admin/notifications" className="relative p-2 rounded-xl hover:bg-muted transition-colors">
                <Bell className="h-5 w-5 text-foreground" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">3</span>
              </Link>
            )}
          </div>

          <div className="md:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6 text-foreground" /> : <Menu className="h-6 w-6 text-foreground" />}
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
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-2 rounded-xl text-left hover:bg-muted transition-colors text-foreground"
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
