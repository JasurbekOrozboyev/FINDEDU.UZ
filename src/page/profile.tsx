import { useEffect, useState } from 'react';
import Navbar from '../components/navbar';

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  image: string;
  id: string;
}

export default function UserProfile() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) return;

    fetch('https://findcourse.net.uz/api/users/mydata', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Foydalanuvchi ma'lumotlarini kelmadi");
        }
        return res.json();
      })
      .then((json) => {
        if (json.data) {
          setUser({
            firstName: json.data.firstName,
            lastName: json.data.lastName,
            email: json.data.email,
            phone: json.data.phone,
            role: json.data.role,
            image: json.data.image,
            id: json.data.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  if (!user) {
    return <h2 className='text-center'>yuklanmoqda...</h2>;
  }

  return (
    <div className="mx-auto text-gray-700">
        <Navbar/>
        <div className='mt-10 m-auto max-w-200'>
            <h1 className='font-bold text-2xl'>Menign profilim</h1>
      <div className="flex items-center gap-4 mb-4">
        <img src={user.image} alt="#" className="w-20 h-20 rounded-full object-cover border"/>
        <div>
          <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
        </div>
      </div>
      <div className="space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Telefon:</strong> {user.phone}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>
      <div>
        <button>Edit</button>
      </div>
        </div>
    </div>
  );
}
