import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Snackbar, Alert} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { jwtDecode } from 'jwt-decode';

interface Major {
  id: number;
  name: string;
}

interface Region {
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

interface UserLikedItem {
  id: number;
  userId: number;
  centerId: number;
  createdAt: string;
  updatedAt: string;
}

interface UserLikesResponseData {
  likes?: UserLikedItem[];
}

interface DecodedToken {
  id: number;
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
  const [likedCenterIds, setLikedCenterIds] = useState<Set<number>>(new Set());
  const [userLikedItemsMap, setUserLikedItemsMap] = useState<Map<number, number>>(new Map());
  const [currentUserId, setCurrentUserId] = useState<number | null>(null); 
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const BASE_URL = 'https://findcourse.net.uz';
  const accessToken = localStorage.getItem("accessToken");


  const showAlert = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
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


  const fetchUserLikes = useCallback(async () => {
    if (!accessToken) {
      setCurrentUserId(null);
      return;
    }

    try {
      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      setCurrentUserId(decodedToken.id); 

      const res = await fetch(`${BASE_URL}/api/users/mydata`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        console.error("Yoqtirilgan markazlarni yuklashda xato:", res.statusText);
        setLikedCenterIds(new Set());
        setUserLikedItemsMap(new Map());
        return;
      }

      const responseBody: { data: UserLikesResponseData } = await res.json();
      const likes = responseBody.data.likes || [];

      const newLikedCenterIds = new Set<number>();
      const newUserLikedItemsMap = new Map<number, number>();
      likes.forEach(item => {
        newLikedCenterIds.add(item.centerId);
        newUserLikedItemsMap.set(item.centerId, item.id);
      });
      setLikedCenterIds(newLikedCenterIds);
      setUserLikedItemsMap(newUserLikedItemsMap);

    } catch (err) {
      console.error("Foydalanuvchi yoqtirishlarini yuklashda xato:", err);
      setLikedCenterIds(new Set());
      setUserLikedItemsMap(new Map());
      setCurrentUserId(null);
    }
  }, [accessToken, BASE_URL]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const centersResponse = await fetch(`${BASE_URL}/api/centers`);
        if (!centersResponse.ok)
          throw new Error("Markazlarni olishda xatolik yuz berdi");
        const centersData = await centersResponse.json();
        setCenters(centersData.data);

        const regionsResponse = await fetch(`${BASE_URL}/api/regions/search`);
        if (!regionsResponse.ok)
          throw new Error("Regionlarni olishda xatolik yuz berdi");
        const regionsData = await regionsResponse.json();
        setRegions(regionsData.data);

        const majorsResponse = await fetch(`${BASE_URL}/api/major`);
        if (!majorsResponse.ok)
          throw new Error("Yo'nalishlarni olishda xatolik yuz berdi");
        const majorsData = await majorsResponse.json();
        setMajors(majorsData.data);

        await fetchUserLikes();

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [BASE_URL, fetchUserLikes]);

  const getImageUrl = (imagePath: string): string => {
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${BASE_URL}/api/image/${imagePath}`;
  };

  const filteredCenters = centers.filter((center) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      center.name.toLowerCase().includes(search) ||
      center.address.toLowerCase().includes(search);

    const matchesRegion =
      selectedRegion === null || center.region.id === selectedRegion;

    const matchesMajor =
      selectedMajor === null ||
      center.majors.some((major) => major.id === selectedMajor);

    return matchesSearch && matchesRegion && matchesMajor;
  });

  const handleLikeToggle = async (centerId: number) => {
    if (!accessToken) {
      showAlert("Yoqtirish uchun tizimga kirishingiz kerak!", "warning");
      return;
    }


    const isCurrentlyLiked = likedCenterIds.has(centerId);

    try {
      if (isCurrentlyLiked) {
        const likeId = userLikedItemsMap.get(centerId);
        if (!likeId) {
            console.error("Unlike uchun likeId topilmadi.");
            showAlert("Xatolik: Yoqtirishni o'chirishda muammo yuz berdi.", "error");
            return;
        }

        const res = await fetch(`${BASE_URL}/api/liked/${likeId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Yoqtirishni o'chirishda xatolik yuz berdi.");
        }

        setLikedCenterIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(centerId);
          return newSet;
        });
        setUserLikedItemsMap(prev => {
            const newMap = new Map(prev);
            newMap.delete(centerId);
            return newMap;
        });
        showAlert("Markaz yoqtirilganlardan olib tashlandi.", "info");

      } else {
        const res = await fetch(`${BASE_URL}/api/liked`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ centerId }), 
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Markazni yoqtirishda xatolik yuz berdi.");
        }

        const newLikedItem: UserLikedItem = (await res.json()).data;
        setLikedCenterIds(prev => new Set(prev).add(centerId));
        setUserLikedItemsMap(prev => {
            const newMap = new Map(prev);
            newMap.set(centerId, newLikedItem.id);
            return newMap;
        });
        showAlert("Markaz yoqtirilganlarga qo'shildi!", "success");
      }
    } catch (err: any) {
      showAlert(`Xatolik: ${err.message}`, "error");
    }
  };


  if (loading) return <h2 className="text-center text-xl mt-10">Yuklanmoqda...</h2>;
  if (error) return <h2 className="text-center text-red-500 mt-10">Xatolik: {error}</h2>;

  return (
    <div className="p-10 bg-gray-100 min-h-screen relative">
      <div className="flex flex-col md:flex-row justify-center gap-4 max-w-4xl mx-auto mb-6">
        <input type="text" placeholder="O'quv markaz bo'yicha qidiruv" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border border-gray-300 rounded-md px-4 py-2 flex-grow" />
        <button onClick={() => setIsModalOpen(true)} className="bg-[#461773] text-white px-6 py-2 rounded-md ">
          Filtrlarni tanlash
        </button>
      </div>
      {isModalOpen && (
        <div>
          <div className="fixed inset-0 bg-opacity-40 backdrop-blur-sm z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full flex gap-6 p-6 relative">
              <div className="flex-1 max-h-[400px] overflow-y-auto border-r border-gray-300 pr-4">
                <h3 className="text-lg font-semibold mb-4">Hududlar</h3>
                <ul>
                  <li className={`cursor-pointer py-2 px-3 rounded-md mb-1 ${
                      selectedRegion === null
                        ? "bg-[#461773] text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedRegion(null)}>
                    Barcha hududlar
                  </li>
                  {regions.map((region) => (
                    <li key={region.id} className={`cursor-pointer py-2 px-3 rounded-md mb-1 ${
                        selectedRegion === region.id
                          ? "bg-[#461773] text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedRegion(region.id)}>
                      {region.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 max-h-[400px] overflow-y-auto pl-4">
                <h3 className="text-lg font-semibold mb-4">Yo'nalishlar</h3>
                <ul>
                  <li className={`cursor-pointer py-2 px-3 rounded-md mb-1 ${
                      selectedMajor === null
                        ? "bg-[#461773] text-white"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => setSelectedMajor(null)}>
                    Barcha yo'nalishlar
                  </li>
                  {majors.map((major) => (
                    <li key={major.id} className={`cursor-pointer py-2 px-3 rounded-md mb-1 ${
                        selectedMajor === major.id
                          ? "bg-[#461773] text-white"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setSelectedMajor(major.id)}>
                      {major.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute top-4 right-4">
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold text-xl" aria-label="Modal yopish">
                  x
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCenters.length > 0 ? (
          filteredCenters.map((center) => {
            const imageUrl = getImageUrl(center.image);
            const isLiked = likedCenterIds.has(center.id);
            return (
              <div key={center.id} className="bg-white rounded-xl shadow-lg p-3 relative">
                {accessToken && (
                  <IconButton
                    aria-label="add to favorites"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: isLiked ? 'red' : 'rgba(0,0,0,0.6)',
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      },
                    }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleLikeToggle(center.id);
                    }}
                  >
                    {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                )}

                <div onClick={() => navigate(`/centerdetail/${center.id}`)} className="cursor-pointer">
                  <img src={imageUrl} alt={center.name} className="w-full h-40 object-cover rounded-md mb-4" />
                  <h2 className="text-xl font-semibold text-[#461773] mb-2">
                    {center.name}
                  </h2>
                  <p className="text-sm text-gray-600"> {center.address}</p>
                  <p className="text-sm text-gray-600">{center.phone}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            Hech qanday markaz topilmadi.
          </p>
        )}
      </div>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} variant="filled" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Allcenters;