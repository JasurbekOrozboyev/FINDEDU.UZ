import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { type AlertProps } from '@mui/material/Alert'; 
import { useTheme } from '@mui/material/styles'; 

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "CEO" | "USER";
  image: string; 
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false); 
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info'); 

  const navigate = useNavigate();
  const theme = useTheme(); 

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'file') {
        console.warn("Fayl inputi to'liq qo'llab-quvvatlanmaydi. Faqat file type ishlatiladi.");
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSnackbarMessage(''); 
    setOpenSnackbar(false); 

    try {
      const registerResponse = await fetch(
        "https://findcourse.net.uz/api/users/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!registerResponse.ok) {
        const error = await registerResponse.json().catch(() => ({ message: "'Ro'yxatdan o'tishda xato yuz berdi." }));
        setSnackbarMessage("Ro'yxatdan o'tishda xatolik: " + (error.message || "Muammo yuz berdi"));
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }

      const otpResponse = await fetch(
        "https://findcourse.net.uz/api/users/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      if (!otpResponse.ok) {
        const otpError = await otpResponse.json().catch(() => ({ message: "OTP yuborishda noma'lum xato yuz berdi." }));
        setSnackbarMessage("OTP yuborishda xatolik: " + (otpError.message || "Muammo yuz berdi"));
        setSnackbarSeverity('error');
        setOpenSnackbar(true);
        return;
      }

      setSnackbarMessage("Ro'yxatdan o'tish muvaffaqiyatli! Emailingizga kelgan kodni kiriting.");
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      setTimeout(() => {
        navigate(`/verifyOtpPage?email=${encodeURIComponent(formData.email)}`);
      }, 1500); 

    } catch (error: any) {
      setSnackbarMessage("Tarmoqda muammo yuz berdi, iltimos keyinroq qayta urinib ko'ring.");
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen gap-20 relative"
      style={{ backgroundColor: theme.palette.background.default }}>
      <div>
        <form className="w-[600px] h-auto p-10 border border-gray-400 rounded-2xl shadow-xl flex flex-col gap-4 mx-auto" onSubmit={handleRegister}
          style={{
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
          }}>
          <h1 className="text-center text-3xl font-bold font-serif mb-3"
            style={{ color: theme.palette.primary.main }}>
            Create Account
          </h1>
          <div className="flex justify-between items-center gap-4">
            <input className="border rounded p-2 w-full" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required
              style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
              }}/>
            <input className="border rounded p-2 w-full" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required
              style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
              }}/>
          </div>
          <input className="border rounded p-2 w-full" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
              }}/>
          <input className="border rounded p-2 w-full" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required
            style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
              }}/>
          <input className="border rounded p-2 w-full" name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required
            style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
              }}/>
          <select className="border rounded p-2 w-full" name="role" value={formData.role} onChange={handleChange} required 
          style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
            }}>
            <option value="USER" style={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>USER</option>
            <option value="CEO" style={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}>CEO</option>
          </select>
          <input className="border rounded p-2 w-full" name="image" type="text"  placeholder="Image" onChange={handleChange}
            style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
            }}/>
          <center>
            <button type="submit" disabled={loading} className="w-80 bg-[#461773] text-white text-xl shadow-xl px-10 py-4 rounded-full"
              style={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText, 
                filter: theme.palette.mode === 'dark' ? 'brightness(1.2)' : 'brightness(0.9)', 
              }}>
              {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
            </button>
          </center>
        </form>
      </div>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }} >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RegisterPage;