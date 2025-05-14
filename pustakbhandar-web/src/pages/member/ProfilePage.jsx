import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const PASSWORD_TOAST_ID = 'password-error-toast';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const ProfilePage = () => {
  const { getAuthHeaders } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState(null);
  const [totalOrders, setTotalOrders] = useState(0);
  const [discountsEarned, setDiscountsEarned] = useState(0);
  const [pwErrorInToast, setPwErrorInToast] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchDiscounts();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/profile`, { headers });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.data);
        setForm({ name: data.data.name || data.data.fullName || '', email: data.data.email || '' });
      } else {
        setError('Failed to load profile.');
      }
    } catch (err) {
      setError('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/orders`, { headers });
      const data = await res.json();
      if (res.ok) {
        const orders = Array.isArray(data) ? data : (data.data || []);
        setTotalOrders(orders.length);
      } else {
        setTotalOrders(0);
      }
    } catch (err) {
      setTotalOrders(0);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/discounts`, { headers });
      const data = await res.json();
      if (res.ok) {
        const discounts = Array.isArray(data) ? data : (data.data || []);
        const stackableCount = discounts.filter(d => d.type === 'stackable' && d.eligible).length;
        setDiscountsEarned(stackableCount);
      } else {
        setDiscountsEarned(0);
      }
    } catch (err) {
      setDiscountsEarned(0);
    }
  };

  // --- Update Profile ---
  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateProfile = () => {
    if (!form.name || form.name.length > 100) return 'Name is required (max 100 chars).';
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) return 'Valid email is required.';
    return null;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setFormError(null);
    const validation = validateProfile();
    if (validation) {
      setFormError(validation);
      return;
    }
    setFormLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/members/profile`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email }),
      });
      if (res.ok) {
        toast.success('Profile updated!');
        fetchProfile();
      } else {
        const data = await res.json();
        setFormError(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setFormError('Failed to update profile.');
    } finally {
      setFormLoading(false);
    }
  };

  // --- Change Password ---
  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const validatePassword = () => {
    const { newPassword, confirmPassword } = pwForm;
    if (!newPassword || newPassword.length < 8) return 'New password must be at least 8 characters.';
    if (!/[A-Z]/.test(newPassword)) return 'New password must include an uppercase letter.';
    if (!/[0-9]/.test(newPassword)) return 'New password must include a number.';
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword)) return 'New password must include a special character.';
    if (newPassword !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(null);
    setPwErrorInToast(false);
    const validation = validatePassword();
    if (validation) {
      setPwError(validation);
      toast.dismiss(PASSWORD_TOAST_ID);
      toast.error(validation, { id: PASSWORD_TOAST_ID });
      setPwErrorInToast(true);
      return;
    }
    setPwLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      if (res.ok) {
        toast.dismiss(PASSWORD_TOAST_ID);
        toast.success('Password changed!');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json();
        let errorMsg = 'Failed to change password.';
        if (data && data.length && data[0].description) {
          errorMsg = data[0].description;
        } else if (data && data.message) {
          errorMsg = data.message;
        }
        setPwError(errorMsg);
        toast.dismiss(PASSWORD_TOAST_ID);
        toast.error(errorMsg, { id: PASSWORD_TOAST_ID });
        setPwErrorInToast(true);
      }
    } catch (err) {
      setPwError('Failed to change password.');
      toast.dismiss(PASSWORD_TOAST_ID);
      toast.error('Failed to change password.', { id: PASSWORD_TOAST_ID });
      setPwErrorInToast(true);
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-[#6B7280]">Loading profile...</div></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="text-red-500">{error}</div></div>;
  }

  return (
    <div className="space-y-10">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-[#232946] mb-4">Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[#6B7280] text-sm">Name</div>
            <div className="font-medium text-[#232946]">{profile.name || profile.fullName}</div>
          </div>
          <div>
            <div className="text-[#6B7280] text-sm">Email</div>
            <div className="font-medium text-[#232946]">{profile.email}</div>
          </div>
          <div>
            <div className="text-[#6B7280] text-sm">Join Date</div>
            <div className="font-medium text-[#232946]">{formatDate(profile.joinDate || profile.createdAt)}</div>
          </div>
          <div>
            <div className="text-[#6B7280] text-sm">Total Orders</div>
            <div className="font-medium text-[#232946]">{totalOrders}</div>
          </div>
          <div className="sm:col-span-2">
            <div className="text-[#6B7280] text-sm">Discounts Earned</div>
            <div className="font-medium text-[#232946]">
              {discountsEarned === 0
                ? 'No Stackable Discounts Earned'
                : discountsEarned === 1
                  ? '1 Stackable Discount (10%)'
                  : `${discountsEarned} Stackable Discounts (10% each)`}
            </div>
          </div>
        </div>
      </div>

      {/* Update Profile Form */}
      <form onSubmit={handleProfileUpdate} className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-[#232946] mb-4">Update Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#232946] mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleFormChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F8EFC]"
              maxLength={100}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#232946] mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleFormChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F8EFC]"
              required
            />
          </div>
          {formError && <div className="text-red-500 text-sm">{formError}</div>}
          <button
            type="submit"
            className="bg-[#3F8EFC] text-white px-4 py-2 rounded-lg hover:bg-[#2D7AE0] transition"
            disabled={formLoading}
          >
            {formLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </div>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-[#232946] mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#232946] mb-1">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={pwForm.currentPassword}
              onChange={handlePwChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F8EFC]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#232946] mb-1">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={pwForm.newPassword}
              onChange={handlePwChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F8EFC]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#232946] mb-1">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={pwForm.confirmPassword}
              onChange={handlePwChange}
              className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3F8EFC]"
              required
            />
          </div>
          {pwError && !pwErrorInToast && <div className="text-red-500 text-sm">{pwError}</div>}
          <button
            type="submit"
            className="bg-[#3F8EFC] text-white px-4 py-2 rounded-lg hover:bg-[#2D7AE0] transition"
            disabled={pwLoading}
          >
            {pwLoading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage; 