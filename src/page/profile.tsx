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
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

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
        if (!res.ok) throw new Error("Foydalanuvchi ma'lumotlari kelmadi");
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
          setFormData({
            firstName: json.data.firstName,
            lastName: json.data.lastName,
            phone: json.data.phone,
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleSave() {
    if (!user) return;
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;

    const dataToSend = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
    };

    fetch(`https://findcourse.net.uz/api/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(dataToSend),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(json?.message || 'Tahrirlashda xatolik yuz berdi');
        }
        return json;
      })
      .then(() => {
        setUser({ ...user, ...formData });
        setEditMode(false);
        alert('Ma\'lumotlar muvaffaqiyatli yangilandi!');
      })
      .catch((err) => {
        console.error('Xatolik:', err.message);
        alert(err.message);
      });
  }
  function handleDelete() {
  if (!user) return;
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return;

  if (!confirm("Akkauntingizni o'chirilsinmi? Bu amal qaytarib bo'lmaydi!")) return;

  fetch(`https://findcourse.net.uz/api/users/${user.id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(async (res) => {
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || 'Akkauntni o‘chirishda xatolik yuz berdi');
      }
      return res.json();
    })
    .then(() => {
      alert("'Akkauntingiz muvaffaqiyatli o'chirildi.");
      localStorage.removeItem('accessToken');
      setUser(null);
      window.location.href = '/';
    })
    .catch((err) => {
      console.error('Xatolik:', err.message);
      alert(err.message);
    });
}

  if (!user) {
    return <h2 className="text-center">Yuklanmoqda...</h2>;
  }

  return (
    <div className="mx-auto text-gray-700">
      <Navbar />
      <div className="mt-10 m-auto max-w-250 h-100 p-10 rounded shadow-2xl flex items-center gap-20 relative bg-white">
        <button onClick={() => setEditMode(true)} className="mt-4 bg-[#1976D5] text-white px-6 py-2 rounded absolute right-5 top-0" >
          Edit Profile
        </button>
        <button onClick={handleDelete} className="border border-red-600 text-red-600 mt-6 px-6 py-2 rounded absolute bottom-5">
          Akkauntni delete
        </button>
        <div className="flex items-center gap-6 mb-6">
          <img src={user.image} alt={user.lastName} className="w-20 h-20 rounded-full object-cover border"/>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="block font-semibold mb-1">First Name</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border px-3 py-2 rounded"/>
            </div>
            <div>
              <label className="block font-semibold mb-1">Last Name</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border px-3 py-2 rounded"/>
            </div>
            
            <div>
              <label className="block font-semibold mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full border px-3 py-2 rounded"/>
            </div>

            <div className="flex gap-4">
              <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Saqlash
              </button>
              <button onClick={() => setEditMode(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
                Bekor qilish
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 w-full">
        <h1 className="font-bold text-3xl font-serif mb-2">Mening profilim</h1>
            <div className='grid grid-cols-2 gap-5'>
            <h2 className="text-xl"><strong>First Name</strong> <br />{user.firstName}</h2>
            <h2 className="text-xl"><strong>Last Name</strong><br /> {user.lastName}</h2>
             <h2 className="text-xl"><strong>Email:</strong><br /> {user.email}</h2>
              <h2 className="text-xl"><strong>Telefon:</strong> <br />{user.phone}</h2>
          </div>
            <div className=''>
             
            </div>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}
      </div>
    </div>
  );
}
