import { useEffect, useState } from 'react';
import {  Dialog,  DialogActions,  DialogContent,  DialogContentText,  DialogTitle,  Button, Snackbar, Alert } from '@mui/material'; 
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingChanges, setSavingChanges] = useState(false); 
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const BASE_URL = 'https://findcourse.net.uz';
  const UPLOAD_URL = `${BASE_URL}/api/upload`;

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setLoading(false);
        setError("Avtorizatsiya tokeni topilmadi. Iltimos, qayta kiring.");
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/users/mydata`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Serverdan ma'lumot olishda xato." }));
          throw new Error(errorData.message || "Foydalanuvchi ma'lumotlari kelmadi.");
        }

        const json = await res.json();

        if (json.data) {
          const userImagePath = json.data.image;
          let fullImageUrl = '/default-profile.png';

          if (userImagePath) {
            if (userImagePath.startsWith('http://') || userImagePath.startsWith('https://')) {
              fullImageUrl = userImagePath;
            } else {
              fullImageUrl = `${BASE_URL}/api/image/${userImagePath}`;
            }
          }

          setUser({
            firstName: json.data.firstName,
            lastName: json.data.lastName,
            email: json.data.email,
            phone: json.data.phone,
            role: json.data.role,
            image: fullImageUrl,
            id: json.data.id,
          });
          setFormData({
            firstName: json.data.firstName,
            lastName: json.data.lastName,
            phone: json.data.phone,
          });
          setImagePreview(null);
          setSelectedFile(null);
        } else {
          setError("Foydalanuvchi ma'lumotlari bo'sh qaytdi.");
        }
      } catch (err: any) {
        console.error("Ma'lumotlarni olishda xato:", err);
        setError(err.message || "Foydalanuvchi ma'lumotlarini yuklashda kutilmagan xato yuz berdi.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  }

  async function handleSave() {
    if (!user) return;
    setSavingChanges(true);
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      showSnackbar("Avtorizatsiya tokeni topilmadi. Iltimos, qayta kiring.", "error");
      setSavingChanges(false);
      return;
    }

    let newImageFileName: string | null = null;

    if (selectedFile) {
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile); 

      try {
        const uploadRes = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({ message: "Rasm yuklashda xato." }));
          throw new Error(errorData.message || `Rasm yuklashda kutilmagan xato yuz berdi. Status: ${uploadRes.status}`);
        }

        const uploadJson = await uploadRes.json();
        newImageFileName = uploadJson.data; 
        
        if (!newImageFileName) {
            throw new Error("Rasm yuklash muvaffaqiyatli, lekin javobdan fayl nomi/URL topilmadi.");
        }
      } catch (err: any) {
        console.error('Rasm yuklashda xato:', err.message);
        showSnackbar(`Rasm yuklashda xato yuz berdi: ${err.message}`, "error");
        setSavingChanges(false);
        return;
      }
    }

    const userDataToUpdate = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      ...(newImageFileName && { image: newImageFileName }),
    };

    try {
      const res = await fetch(`${BASE_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(userDataToUpdate),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.message || `Profil ma\'lumotlarini tahrirlashda xatolik yuz berdi. Status: ${res.status}`);
      }

      let updatedUserImage = user.image;
      if (newImageFileName) {
        updatedUserImage = `${BASE_URL}/api/image/${newImageFileName}`;
      } else if (json.data && json.data.image) {
        updatedUserImage = json.data.image.startsWith('http') ? json.data.image : `${BASE_URL}/api/image/${json.data.image}`;
      }

      setUser({
        ...user,
        ...formData,
        image: updatedUserImage
      });
      setEditMode(false);
      setSelectedFile(null);
      setImagePreview(null);
      showSnackbar('Ma\'lumotlar muvaffaqiyatli yangilandi!', "success");
    } catch (err: any) {
      console.error('Profil ma\'lumotlarini saqlashda xato:', err.message);
      showSnackbar(err.message, "error");
    } finally {
      setSavingChanges(false);
    }
  }

  const handleClickOpenDeleteConfirm = () => {
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
  };

  async function confirmDeleteAccount() {
    setOpenDeleteConfirm(false); 
    if (!user) return;
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      showSnackbar("Avtorizatsiya tokeni topilmadi. Iltimos, qayta kiring.", "error");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.message || 'Akkauntni ochirishda xatolik yuz berdi');
      }

      showSnackbar("Akkauntingiz muvaffaqiyatli o'chirildi.", "success");
      localStorage.removeItem('accessToken');
      setUser(null);
      window.location.href = '/';
    } catch (err: any) {
      console.error('Xatolik:', err.message);
      showSnackbar(err.message, "error");
    }
  }

  if (loading) {
    return <h2 className="text-center text-xl mt-10">Yuklanmoqda...</h2>;
  }

  if (error) {
    return <h2 className="text-center text-red-600 text-xl mt-10">Xatolik: {error}</h2>;
  }

  if (!user) {
    return <h2 className="text-center text-gray-500 text-xl mt-10">Foydalanuvchi ma'lumotlari topilmadi.</h2>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container max-w-[1000px] m-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6 relative">
          <div className="flex justify-between items-center mb-6">
            <a href="#" className="text-[#461773] hover:underline flex items-center text-sm md:text-base">
              Bosh sahifaga qaytish
            </a>
            {!editMode && ( 
              <button onClick={() => setEditMode(true)} className="hidden md:block bg-[#461773] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm">
                PROFILNI TAHRIRLASH
              </button>
            )}
          </div>
          
          <h1 className="text-2xl font-semibold text-center mb-6">Mening profilim</h1>

          {editMode ? (
            <div className='flex justify-center items-center gap-10'>
              <div className='overflow-hidden flex flex-col items-center justify-center '>
                <img src={imagePreview || user.image} alt={`${user.firstName} ${user.lastName}`} className="w-24 h-24 rounded-[100%]"/>
                <div className="mb-4">
                 <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleFileChange} className="hidden" />
                <label htmlFor="profileImage" className="cursor-pointer text-[#461773] font-semibold py-2 px-4 rounded transition-colors duration-200">
                  Rasmni o'zgartirish
                </label>
                {selectedFile && (
                  <span className="text-sm text-gray-600 mt-2 truncate max-w-[180px] text-center">{selectedFile.name}</span>
                )}
              </div>
              </div>
              <div className='w-[70%] '>
              <div className="mb-4">
                <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">
                  Ism
                </label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
              </div>
              <div className="mb-4">
                <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">
                  Familiya
                </label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
              </div>
              <div className="mb-4">
                <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                  Telefon
                </label>
                <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                <button onClick={handleSave} className={`w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                    savingChanges ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={savingChanges}>
                  {savingChanges ? "Saqlash..." : "Saqlash"}
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setSelectedFile(null);
                    setImagePreview(null);
                    if (user) {
                      setFormData({
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.phone,
                      });
                    }
                  }}
                  className="w-full sm:w-auto bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={savingChanges}>
                  Bekor qilish
                </button>
              </div>
            </div>
              </div>
          ) : (
          
            <div>
              <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gray-300">
                    <img src={imagePreview || user.image} alt={`${user.firstName} ${user.lastName}`} className="object-cover w-full h-full"/>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow w-full">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Ism</p>
                    <p className="font-medium">{user.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Familiya</p>
                    <p className="font-medium">{user.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Elektron pochta</p>
                    <p className="text-sm font-medium truncate">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Telefon</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Rol</p>
                    <p className="font-medium">{user.role}</p>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex justify-end mt-6">
                <button
                  onClick={handleClickOpenDeleteConfirm} 
                  className="border border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm">
                  AKKAUNTNI O'CHIRISH
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6 md:hidden">
                <button onClick={() => setEditMode(true)} className="w-full sm:w-auto bg-[#461773] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm">
                  PROFILNI TAHRIRLASH
                </button>
                <button onClick={handleClickOpenDeleteConfirm}  className="w-full sm:w-auto border border-red-500 hover:bg-red-500 hover:text-white text-red-500 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm">
                  AKKAUNTNI O'CHIRISH
                </button>
              </div>
            </div>
          )}
          <Dialog
            open={openDeleteConfirm}
            onClose={handleCloseDeleteConfirm}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{"Akkauntni o'chirish"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Akkauntingizni o'chirishni tasdiqlaysizmi? Bu amal qaytarib bo'lmaydi!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDeleteConfirm} color="primary">
                Bekor qilish
              </Button>
              <Button onClick={confirmDeleteAccount} color="secondary" autoFocus>
                O'chirish
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar 
            open={snackbarOpen} 
            autoHideDuration={6000} 
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }} 
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
}