import React, { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { type AlertProps } from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles'; 

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const theme = useTheme(); 

  const handleLoginAndRefresh = async () => {
    setSnackbarMessage('');
    setOpenSnackbar(false);

    try {
      const loginRes = await fetch('https://findcourse.net.uz/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: '*/*',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const errorData = await loginRes.json().catch(() => ({ message: "Login qilishda noma'lum xato yuz berdi." }));
        throw new Error(errorData.message || `Login xatoligi: ${loginRes.status}`);
      }

      const loginData: LoginResponse = await loginRes.json();
      console.log('LOGIN RESPONSE:', loginData);

      if (!loginData.refreshToken) {
        throw new Error('refreshToken');
      }

      localStorage.setItem('accessToken', loginData.accessToken);
      localStorage.setItem('refreshToken', loginData.refreshToken);

      const refreshRes = await fetch('https://findcourse.net.uz/api/users/refreshToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({ refreshToken: loginData.refreshToken }),
      });

      if (!refreshRes.ok) {
        const errorData = await refreshRes.json().catch(() => ({ message: "Token yangilashda xato yuz berdi." }));
        throw new Error(errorData.message || `Refresh token xatoligi: ${refreshRes.status}`);
      }

      const refreshData: LoginResponse = await refreshRes.json();

      localStorage.setItem('accessToken', refreshData.accessToken);

      if (refreshData.refreshToken) {
        localStorage.setItem('refreshToken', refreshData.refreshToken);
      }

      setSnackbarMessage("Muvaffaqiyatli kirdingiz!");
      setSnackbarSeverity('success');
      setOpenSnackbar(true);

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);

    } catch (err) {
      const errorMessage = (err as Error).message;
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      console.error("Login xatosi:", err);
    }
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div
      className='flex justify-center items-center min-h-screen gap-20 relative'
      style={{
        backgroundColor: theme.palette.background.default, 
        color: theme.palette.text.primary,}}>
      <div
        className='border rounded-2xl shadow-xl w-150 h-80 p-10 flex flex-col justify-center items-center ml-2 mr-2'
        style={{
          backgroundColor: theme.palette.background.paper, 
          borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400], 
        }}>
        <h1
          className='text-center text-[#461773] text-3xl font-bold font-serif mb-3'>
          Login
        </h1>
        <TextField label="Emailingiz" variant="outlined" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth margin="normal"/>
        <TextField label="Parolingiz" variant="outlined" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth margin="normal"/>
        <Button
          variant="contained"
          style={{
            backgroundColor: "#461773", 
            color: theme.palette.primary.contrastText, 
            fontSize: '1.25rem',
            padding: '1rem 3rem',
            borderRadius: '9999px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginTop: '1rem'
          }}
          onClick={handleLoginAndRefresh}>
          Login
        </Button>
      </div>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;