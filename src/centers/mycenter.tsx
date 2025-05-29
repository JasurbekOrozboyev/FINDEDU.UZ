import { useEffect, useState } from "react";
import Navbar from "../components/navbar";
import { useNavigate } from "react-router-dom";

interface Center {
  id: number;
  name: string;
  address: string;
  phone?: string;
  image?: string;
}

const MyCentersPage = () => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      setError("Iltimos ro'yhatdan o'ting!");
      setLoading(false);
      return;
    }

    const fetchCenters = async () => {
      try {
        const res = await fetch("https://findcourse.net.uz/api/users/mycenters", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          throw new Error("Sizda markazlar mavjud emas");
        }

        const data = await res.json();
        setCenters(data.data || []);
      } catch (err: any) {
        setError(err.message || "Noma'lum xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [accessToken]);

  const handleDelete = async (id: number) => {
    if (!accessToken) {
      setError("Token topilmadi. Iltimos, tizimga kirishingiz kerak.");
      return;
    }

    if (!window.confirm("Markazni o'chirishni xohlaysizmi?")) return;

    try {
      const res = await fetch(`https://findcourse.net.uz/api/centers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error("Markazni o'chirishda xatolik yuz berdi");

      setCenters((prev) => prev.filter((center) => center.id !== id));
    } catch (err: any) {
      setError(err.message || "Markazni o'chirishda xatolik yuz berdi");
    }
  };

  if (loading) return <h2>Yuklanmoqda...</h2>;
  if (error) return <h2 className="text-center">{error}!</h2>;

  return (
    <div>
      <Navbar />
      <div className="p-6 border">
        <h2 className="text-2xl font-semibold mb-4">Mening markazlarim</h2>
        <button onClick={() => navigate("/createcenter")} className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Yangi markaz qo'shish
        </button>
        {centers.length === 0 ? (
          <p>Sizda hozircha markazlar mavjud emas.</p>
        ) : (
          <ul>
            {centers.map((center) => (
              <li key={center.id} className="mb-4 p-4 rounded flex gap-4 items-center border"
              >
                {center.image && (
                  <img src={center.image} alt={center.name} className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold">{center.name}</h3>
                  <p className="text-gray-700">{center.address}</p>
                  {center.phone && <p>Telefon: {center.phone}</p>}
                </div>
                <button onClick={() => handleDelete(center.id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                  O'chirish
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyCentersPage;
