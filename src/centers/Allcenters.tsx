import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Major {
  id: number;
  name: string;
}

interface Center {
  id: number;
  name: string;
  description?: string;
  address: string;
  phone: string;
  image: string;
  region: {
    id: number;
    name: string;
  };
  majors: Major[];
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface Region {
  id: number;
  name: string;
}

const Allcenters: React.FC = () => {
const navigate = useNavigate();
const [centers, setCenters] = useState<Center[]>([]);
const [regions, setRegions] = useState<Region[]>([]);
const [majors, setMajors] = useState<Major[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [searchTerm, setSearchTerm] = useState("");

const [selectedRegion, setSelectedRegion] = useState<number | null>(null);
const [selectedMajor, setSelectedMajor] = useState<number | null>(null);

const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCenters = async () => {
      try {
        const response = await fetch("https://findcourse.net.uz/api/centers");
        if (!response.ok) throw new Error("Markazlarni olishda xatolik yuz berdi");
        const data = await response.json();
        setCenters(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCenters();
  }, []);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("https://findcourse.net.uz/api/regions/search");
        if (!response.ok) throw new Error("Regionlarni olishda xatolik yuz berdi");
        const data = await response.json();
        setRegions(data.data);
      } catch (err: any) {
        console.error(err.message);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await fetch("https://findcourse.net.uz/api/major");
        if (!response.ok) throw new Error("Yo'nalishlarni olishda xatolik yuz berdi");
        const data = await response.json();
        setMajors(data.data);
      } catch (err: any) {
        console.error(err.message);
      }
    };
    fetchMajors();
  }, []);

  const filteredCenters = centers.filter((center) => {
  const search = searchTerm.toLowerCase();
  const matchesSearch =
    center.name.toLowerCase().startsWith(search) ||
    center.address.toLowerCase().startsWith(search);

  const matchesRegion =
    selectedRegion === null || center.region.id === selectedRegion;

  const matchesMajor =
    selectedMajor === null || center.majors.some((major) => major.id === selectedMajor);

  return matchesSearch && matchesRegion && matchesMajor;
});

  if (loading) return <p>Yuklanmoqda...</p>;
  if (error) return <p>Xatolik: {error}</p>;

  return (
    <div className="p-10 bg-gray-100 min-h-screen relative">

      <div className="flex flex-col md:flex-row justify-center gap-4 max-w-4xl mx-auto mb-6">
        <input
          type="text"
          placeholder="O'quv markaz bo'yicha qidiruv"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 flex-grow"
        />

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1976D5] text-white px-6 py-2 rounded-md hover:bg-[#155a9e]"
        >
          Filtrlarni tanlash
        </button>
      </div>

      {isModalOpen && (
        <div>
          <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm " onClick={() => setIsModalOpen(false)}/>

          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full flex gap-6 p-6">
              <div className="flex-1 max-h-[400px] overflow-y-auto border-r border-gray-300 pr-4">
                <h3 className="text-lg font-semibold mb-4">Hududlar</h3>
                <ul>
                  <li className={`cursor-pointer py-2 px-3 rounded-md mb-1 ${ selectedRegion === null ? "bg-[#1976D5] text-white" : "hover:bg-gray-100"}`}onClick={() => setSelectedRegion(null)}>
                    Barcha hududlar
                  </li>
                  {regions.map((region) => (
                    <li key={region.id} className={`cursor-pointer py-2 px-3 rounded-md mb-1 ${selectedRegion === region.id ? "bg-[#1976D5] text-white" : "hover:bg-gray-100"}`}onClick={() => setSelectedRegion(region.id)}>
                      {region.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-1 max-h-[400px] overflow-y-auto pl-4">
                <h3 className="text-lg font-semibold mb-4">Yo'nalishlar</h3>
                <ul>
                  <li className={`cursor-pointer py-2 px-3 rounded-md mb-1 ${selectedMajor === null ? "bg-[#1976D5] text-white" : "hover:bg-gray-100"}`} onClick={() => setSelectedMajor(null)}>
                    Barcha yo'nalishlar
                  </li>
                  {majors.map((major) => (
                    <li key={major.id} className={`cursor-pointer py-2 px-3 rounded-md mb-1 ${selectedMajor === major.id ? "bg-[#1976D5] text-white" : "hover:bg-gray-100"}`} onClick={() => setSelectedMajor(major.id)}>
                      {major.name}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="absolute top-4 right-4">
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold text-xl" aria-label="Modal yopish">
                  &times;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.length > 0 ? (
          filteredCenters.map((center) => (
            <div  onClick={() => navigate(`/centerdetail/${center.id}`)} key={center.id} className="bg-white rounded-xl shadow-lg p-3">
            <img src="/artel.jpg" alt={center.name} className="w-full h-40 object-cover rounded-md mb-4" />
            <h2 className="text-xl font-semibold text-[#1976D5] mb-2">{center.name}</h2>
            <p className="text-sm text-gray-600"> {center.address}</p>
            <p className="text-sm text-gray-600">{center.phone}</p>
            </div>
            
          ))
        ) : (
          <p className="text-center text-gray-500">Hech qanday markaz topilmadi.</p>
        )}
      </div>
    </div>
  );
};

export default Allcenters;
