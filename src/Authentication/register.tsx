import React, { useState, useEffect } from "react";
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreviewUrl(null);
    }
  }, [selectedFile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const target = e.target as HTMLInputElement;

    if (type === 'file' && target.files && target.files[0]) {
      setSelectedFile(target.files[0]);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setSnackbarMessage(''); 
    setOpenSnackbar(false);

    let imageValueForRegister = formData.image; 

    try {
      if (selectedFile) {
        setSnackbarSeverity('info');
        setOpenSnackbar(true);

        const uploadFormData = new FormData();
        uploadFormData.append('image', selectedFile);
        const uploadResponse = await fetch("https://findcourse.net.uz/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text();
          console.error("Rasm yuklash API xatosi:", errorText);
          setSnackbarMessage("Rasm yuklashda xatolik: " + (errorText || "Noma'lum server xatosi."));
          setSnackbarSeverity('error');
          setOpenSnackbar(true);
          setLoading(false);
          return; 
        }

        const uploadResult = await uploadResponse.json();
        
        if (uploadResult && uploadResult.filename) {
            imageValueForRegister = uploadResult.filename;
        } else if (uploadResult && uploadResult.url) { 
            imageValueForRegister = uploadResult.url; 
        }
        else {
            imageValueForRegister = selectedFile.name;
        }
        
        setSnackbarSeverity('success');
        setOpenSnackbar(true);
      }

      const registerResponse = await fetch(
        "https://findcourse.net.uz/api/users/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, image: imageValueForRegister }),
        }
      );

      if (!registerResponse.ok) {
        const error = await registerResponse.json().catch(() => ({ message: "Ro'yxatdan o'tishda xato yuz berdi." }));
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
    <div className="flex justify-center items-center min-h-screen p-4 sm:p-6 md:p-8 relative"
      style={{ backgroundColor: theme.palette.background.default }}>
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <form className="p-6 sm:p-8 md:p-10 border border-gray-400 rounded-2xl shadow-xl flex flex-col gap-4 mx-auto" onSubmit={handleRegister}
          style={{
            backgroundColor: theme.palette.background.paper,
            borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
          }}>
          <h1 className="text-center text-2xl sm:text-3xl font-bold font-serif mb-3"
            style={{ color: theme.palette.primary.main }}>
            Create Account
          </h1>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4"> 
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
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Image (Optional)
          </label>
          <input
            id="image-upload"
            className="border rounded p-2 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#461773] file:text-white hover:file:bg-[#341154]"
            name="image"
            type="file"
            accept="image/*" 
            onChange={handleChange}
            style={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
            }}
          />
          {selectedFile && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tanlangan rasm: <span className="font-semibold">{selectedFile.name}</span>
            </p>
          )}
          {imagePreviewUrl && (
            <div className="mt-2 flex justify-center">
              <img src={imagePreviewUrl} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full border border-gray-300" />
            </div>
          )}
          <center>
            <button type="submit" disabled={loading} className="w-full sm:w-80 bg-[#461773] text-white text-xl shadow-xl px-10 py-4 rounded-full mt-2"
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
