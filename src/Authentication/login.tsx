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
    <div className='flex justify-center items-center min-h-screen gap-20 bg-[#cfe1f3] relative'>
      <div className='absolute top-10 left-10'>
         <p className='text-4xl font-serif font-bold text-[#1976D5]'>EDUCATION</p>
      </div>
      <div>
        <img className='w-130' src="/children.png" alt="" />
      </div>
          <div className='border rounded-2xl border-gray-400 shadow-xl w-150 h-80 p-10 flex flex-col justify-center items-center bg-white'>
            <h1 className='text-center text-3xl font-bold font-serif mb-3 text-[#1976D5]'>Login</h1>
          <input className='border w-full h-10 rounded p-2' type="email" placeholder="Emailingiz" value={email} onChange={(e) => setEmail(e.target.value)}/>
          <br />
          <input className='border w-full h-10 rounded p-2' type="password" placeholder="Parolingiz" value={password} onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button className="w-50 bg-[#1976D5] text-white text-xl shadow-xl hover:bg-white hover:text-[#1976D5] px-15 py-4 rounded-full" onClick={handleLoginAndRefresh}>
            Login
          </button>
          {error && <p className=''>{error}</p>}
        </div>
    </div>
  );
};

export default Login;
