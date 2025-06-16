import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

interface Center {
  id: number;
  name: string;
  address: string;
  phone?: string;
  image?: string; 
}

const EditCenterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [centerData, setCenterData] = useState<Center | null>(null);
  const [originalCenterData, setOriginalCenterData] = useState<Center | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) {
      return "https://placehold.co/400x200/cccccc/ffffff?text=Rasm+topilmadi";
    }
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `https://findcourse.net.uz/api/image/${imagePath}`;
  };

  useEffect(() => {
    if (!accessToken) {
      setError("Iltimos, tizimga kiring!");
      setLoading(false);
      return;
    }

    const fetchCenterDetails = async () => {
      try {
        const res = await fetch(`https://findcourse.net.uz/api/centers/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Markaz ma'lumotlarini olishda xatolik yuz berdi.");
        }
        const data = await res.json();
        const fetchedData: Center = {
            id: data.data.id,
            name: data.data.name,
            address: data.data.address,
            phone: data.data.phone,
            image: data.data.image,
        };
        setCenterData(fetchedData);
        setOriginalCenterData(fetchedData); 
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCenterDetails();

  }, [id, accessToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCenterData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centerData || !accessToken || !originalCenterData) return;

    setSubmitting(true);
    setError(null);

    const payload: Partial<Omit<Center, 'id'>> = {}; 

    if (centerData.name !== originalCenterData.name) {
      payload.name = centerData.name;
    }
    if (centerData.address !== originalCenterData.address) {
      payload.address = centerData.address;
    }
    if (centerData.phone !== originalCenterData.phone) {
      payload.phone = centerData.phone;
    }
   
    if (Object.keys(payload).length === 0) {
      setError("Hech qanday o'zgarish kiritilmadi.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`https://findcourse.net.uz/api/centers/${id}`, {
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Markazni tahrirlashda xatolik yuz berdi.");
      }

      alert("Markaz muvaffaqiyatli tahrirlandi!");
      setOriginalCenterData(centerData);
      navigate("/mycenters"); 
    } catch (err: any) {
      setError(err.message || "Markazni tahrirlashda xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <h2 className="text-center text-xl mt-10">Yuklanmoqda...</h2>;
  if (error) return <h2 className="text-center text-xl mt-10 text-red-600">{error}</h2>;
  if (!centerData) return <h2 className="text-center text-xl mt-10">Markaz topilmadi.</h2>;

  return (
    <div>
      <div className="p-3 max-w-4xl mx-auto mt-8 bg-white">
        <h2 className="text-3xl font-bold mb-6">Markaz ma'lumotlarini tahrirlash</h2>
        <form onSubmit={handleSubmit} className="space-y-6 flex justify-around items-center">
          <div>
            {centerData.image && (
            <div className="flex justify-center mb-6">
              <img src={getImageUrl(centerData.image)} alt="Markaz rasmi" className="w-120"
              />
            </div>
          )}
          </div>
          <div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Ism:</label>
              <input type="text" id="name" name="name" value={centerData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required/>
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">Manzil:</label>
              <input type="text" id="address" name="address" value={centerData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required/>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefon:</label>
              <input type="text" id="phone" name="phone" value={centerData.phone || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            <button type="submit" disabled={submitting} className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300 ease-in-out">
              {submitting ? "Saqlanmoqda..." : "O'zgarishlarni saqlash"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/mycenters")}
              className="w-full mt-3 px-4 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600 transition duration-300 ease-in-out">
              Bekor qilish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCenterPage;