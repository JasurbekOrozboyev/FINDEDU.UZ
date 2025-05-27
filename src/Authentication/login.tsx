import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Login {
  accessToken: string;
  refreshToken: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLoginAndRefresh = async () => {
    navigate('/'); 
    setError('');
   

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
        throw new Error('Login xatoligi: ' + loginRes.status);
      }

      const loginData: any = await loginRes.json();
      console.log('LOGIN RESPONSE:', loginData);

      if (!loginData.refreshToken) {
        throw new Error('refreshToken topilmadi login javobida');
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
        throw new Error('Refresh token xatoligi: ' + refreshRes.status);
      }

      const refreshData: any = await refreshRes.json();
      console.log('REFRESH RESPONSE:', refreshData);

      if (!refreshData.accessToken) {
        throw new Error('Yangi accessToken topilmadi');
      }

      localStorage.setItem('accessToken', refreshData.accessToken);

      if (refreshData.refreshToken) {
        localStorage.setItem('refreshToken', refreshData.refreshToken);
      }

    } catch (err) {
      setError((err as Error).message || 'Xatolik yuz berdi');
    }
  };

  return (
    <div >
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Emailingiz"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
       
      />
      <br />

      <input
        type="password"
        placeholder="Parolingiz"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />

      <button onClick={handleLoginAndRefresh}>
        Kirish
      </button>

      {error && <p className=''>{error}</p>}
    </div>
  );
};

export default Login;
