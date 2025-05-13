import toast from 'react-hot-toast';

const showToast = (fn, ...args) => {
  toast.dismiss();
  return fn(...args);
};

export const showSuccess = (message, options) => showToast(toast.success, message, options);
export const showError = (message, options) => showToast(toast.error, message, options);
export const showInfo = (message, options) => showToast(toast, message, options); 