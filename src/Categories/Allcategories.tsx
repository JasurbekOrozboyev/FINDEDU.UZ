import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { jwtDecode } from 'jwt-decode';
import {
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from '@mui/material';

Modal.setAppElement('#root');

interface Resource {
  id: number;
  userId: number;
  categoryId: number;
  name: string;
  description: string;
  media: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
    image: string;
  };
}

interface Category {
  id: number;
  name: string;
  image: string;
}

interface DecodedToken {
  id: number;
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeResourceFilter, setActiveResourceFilter] = useState<"all" | "my">("all");
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [resourceToDeleteId, setResourceToDeleteId] = useState<number | null>(null);
  const [newResource, setNewResource] = useState({
    name: '',
    description: '',
    media: '',
    image: '',
    categoryId: 0,
  });

  const accessToken = localStorage.getItem('accessToken');

  const showAlert = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  useEffect(() => {
    if (accessToken) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(accessToken);
        setCurrentUserId(decodedToken.id);
      } catch (e) {
        console.error("Error decoding token:", e);
        setCurrentUserId(null);
      }
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (categories.length === 0) {
          const categoriesRes = await fetch("https://findcourse.net.uz/api/categories");
          if (!categoriesRes.ok) {
            throw new Error(`Kategoriyalar yuklashda xato: ${categoriesRes.status} ${categoriesRes.statusText}`);
          }
          const categoriesJson: { data: Category[] } = await categoriesRes.json();
          setCategories(categoriesJson.data || []);
        }

        let resourcesUrl = "https://findcourse.net.uz/api/resources";
        if (activeResourceFilter === "my" && currentUserId) {
          resourcesUrl += `?userId=${currentUserId}`;
        }

        const resourcesRes = await fetch(resourcesUrl);
        if (!resourcesRes.ok) {
          throw new Error(`Resurslar yuklashda xato: ${resourcesRes.status} ${resourcesRes.statusText}`);
        }
        const resourcesJson: { data: Resource[] } = await resourcesRes.json();

        const resourcesWithCategories = resourcesJson.data.map(resource => {
          const relatedCategory = categories.find(
            cat => cat.id === resource.categoryId
          );
          return {
            ...resource,
            category: relatedCategory
          };
        });
        setAllResources(resourcesWithCategories || []);

      } catch (err: any) {
        setError(err.message || "Ma'lumotlarni yuklashda noma'lum xatolik yuz berdi.");
        setAllResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, activeResourceFilter, currentUserId, categories.length]);

  const handleAddResource = async () => {
    if (!newResource.name || !newResource.description || !newResource.media || !newResource.categoryId) {
      showAlert("Iltimos, barcha maydonlarni to'ldiring va kategoriyani tanlang.", "warning");
      return;
    }

    if (!accessToken) {
      showAlert("Resurs qo'shish uchun tizimga kirishingiz kerak.", "error");
      return;
    }

    try {
      const response = await fetch('https://findcourse.net.uz/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(newResource),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Resurs yaratishda xatolik yuz berdi.');
      }

      const { data } = await response.json();
      const category = categories.find((c) => c.id === data.categoryId);
      setAllResources((prevResources) => [...prevResources, { ...data, category, userId: currentUserId || 0 }]);
      setModalIsOpen(false);
      setNewResource({ name: '', description: '', media: '', image: '', categoryId: 0 });
      showAlert("Resurs muvaffaqiyatli qo'shildi!", "success");
    } catch (err: any) {
      showAlert('Xatolik: ' + err.message, "error");
    }
  };

  const handleDeleteResource = (id: number) => {
    setResourceToDeleteId(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmDialogOpen(false); 

    if (resourceToDeleteId === null) {
      return;
    }

    if (!accessToken) {
      showAlert("Resursni o'chirish uchun tizimga kirishingiz kerak.", "error");
      setResourceToDeleteId(null);
      return;
    }

    try {
      const response = await fetch(`https://findcourse.net.uz/api/resources/${resourceToDeleteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Resursni o'chirishda xatolik yuz berdi.");
      }

      setAllResources((prevResources) => prevResources.filter((r) => r.id !== resourceToDeleteId));
      showAlert("Resurs muvaffaqiyatli o'chirildi.", "success");
    } catch (err: any) {
      showAlert('Xatolik: ' + err.message, "error");
    } finally {
      setResourceToDeleteId(null); 
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialogOpen(false);
    setResourceToDeleteId(null);
  };

  const handleResourceFilterClick = (filterType: "all" | "my") => {
    setActiveResourceFilter(filterType);
    setSelectedCategory(null);
    setSearchTerm("");
  };

  const handleCategoryClick = (category: Category | null) => {
    setSelectedCategory(category);
    setSearchTerm("");
    setActiveResourceFilter("all");
  };

  const filteredResources = allResources.filter((res) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    const matchesSelectedCategory = selectedCategory
      ? res.categoryId === selectedCategory.id
      : true;

    const matchesUser = activeResourceFilter === "my"
      ? res.userId === currentUserId
      : true;

    const matchesSearchTerm =
      res.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      res.description.toLowerCase().includes(lowerCaseSearchTerm) ||
      (res.category ? res.category.name.toLowerCase().includes(lowerCaseSearchTerm) : false);

    return matchesSelectedCategory && matchesUser && matchesSearchTerm;
  });


  return (
    <div className="container mx-auto mt-10 px-4 py-8 min-h-screen rounded-lg shadow-xl">
      <h1 className="text-4xl font-bold text-center mb-8 font-serif">Resurslar</h1>
      <div className="flex flex-col justify-center items-center mb-6 gap-3">
        <input type="text" placeholder="Resurs nomi, tavsifi yoki kategoriya bo'yicha qidirish..." className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2  text-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <center>
          <button onClick={() => setModalIsOpen(true)} className="max-w-50 ml-4 px-6 py-3 bg-[#461773] text-white font-semibold rounded-lg shadow-md hover:bg-[#533e67] transition duration-300 focus:outline-none focus:ring-2 ">
            Resurs qo'shish
          </button>
        </center>
      </div>
      {loading && (
        <div className="flex justify-center items-center my-6">
          <div className="w-12 h-12 border-4 border-[#000000] border-dashed rounded-full animate-spin"></div>
          <p className="ml-4 text-xl text-gray-700">Ma'lumotlar yuklanmoqda...</p>
        </div>
      )}
      {error && (
        <h2 className="text-center text-red-500">
          Xatolik: {error}
        </h2>
      )}

      {!loading && !error && (
        <div>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div
              className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
                activeResourceFilter === "all" && selectedCategory === null
                  ? "bg-[#e6f2ff] border-[#461773]"
                  : "border-gray-300 bg-white"
              } flex flex-col items-center justify-center p-3 w-32 h-32 text-center`}
              onClick={() => handleResourceFilterClick("all")}>
              <p className="font-semibold text-gray-800 text-sm">Barcha resurslar</p>
            </div>
            <div
              className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
                activeResourceFilter === "my"
                  ? "bg-[#e6f2ff] border-[#461773]"
                  : "border-gray-300 bg-white"
              } flex flex-col items-center justify-center p-3 w-32 h-32 text-center`}
              onClick={() => handleResourceFilterClick("my")}>
              <div className="w-16 h-16 flex items-center justify-center mb-2 mx-auto">
              </div>
              <p className="font-semibold text-gray-800 text-sm">Mening resurslarim</p>
            </div>

            {categories.map((category) => (
              <div key={category.id}
                className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  selectedCategory?.id === category.id && activeResourceFilter === "all"
                    ? "bg-[#e6f2ff] border-[#461773]"
                    : "border-gray-300 bg-white"
                } flex flex-col items-center justify-center p-3 w-32 h-32`}
                onClick={() => handleCategoryClick(category)}>
                <img src={category.image} alt={category.name} className="w-full h-24 object-cover" />
                <div className="p-2 text-center font-semibold text-gray-800 text-sm">
                  {category.name}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
                  <img src={resource.image} alt={resource.name} className="h-40 w-full object-cover rounded-md mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.name}</h3>
                  {resource.category && (
                    <p className="text-sm text-gray-500 mb-2">
                      Kategoriya: <span className="font-semibold text-[#461773]">{resource.category.name}</span>
                    </p>
                  )}
                  <p className="text-base text-gray-700 mb-4 line-clamp-3">
                    {resource.description}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-sm text-gray-600">Oldindan ko'rish</span>
                    <div className='flex flex-wrap gap-2'>
                      {currentUserId && resource.userId === currentUserId && (
                        <button onClick={() => handleDeleteResource(resource.id)} className=" bg-red-500  text-white px-5 py-2 text-sm rounded-full font-semibold hover:bg-red-700 transition duration-300">
                          O'chirish
                        </button>)}
                      <a href={resource.media} target="_blank" rel="noopener noreferrer" className="bg-[#461773] text-white px-5 py-2 text-sm rounded-full font-semibold  transition duration-300">
                        Yuklab olish
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <h2 className="text-2xl font-semibold">
                  Hozircha resurs yo'q!
                </h2>
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} className="w-120  bg-white p-8 rounded-lg shadow-xl mt-10 relative" overlayClassName="fixed bg-black/30 backdrop-blur-sm inset-0 bg-opacity-50 flex justify-center items-start">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Yangi resurs qo'shish</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleAddResource(); }}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nomi:</label>
            <input type="text" id="name" placeholder="Resurs nomi" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D5]" value={newResource.name} onChange={(e) => setNewResource({ ...newResource, name: e.target.value })} required />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Tavsifi:</label>
            <textarea id="description" placeholder="Resurs tavsifi" className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D5] h-24 resize-none" value={newResource.description} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} required />
          </div>
          <div className="mb-4">
            <label htmlFor="media" className="block text-gray-700 text-sm font-bold mb-2">Media havolasi (URL):</label>
            <input type="url" id="media" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D5]" value={newResource.media} onChange={(e) => setNewResource({ ...newResource, media: e.target.value })} required />
          </div>
          <div className="mb-4">
            <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">Rasm havolasi (URL):</label>
            <input type="url" id="image" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D5]" value={newResource.image} onChange={(e) => setNewResource({ ...newResource, image: e.target.value })} />
          </div>
          <div className="mb-6">
            <label htmlFor="categoryId" className="block text-gray-700 text-sm font-bold mb-2">Kategoriya:</label>
            <select id="categoryId" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1976D5]" value={newResource.categoryId} onChange={(e) => setNewResource({ ...newResource, categoryId: parseInt(e.target.value) || 0 })} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalIsOpen(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition duration-300">
              Bekor qilish
            </button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-300">
              Qo'shish
            </button>
          </div>
        </form>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description">
        <DialogTitle id="confirm-dialog-title">{"Resursni o'chirishni tasdiqlaysizmi?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Siz ushbu resursni butunlay o'chirishni istayapsizmi? Bu amalni qaytarib bo'lmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Bekor qilish
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            O'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CategoriesPage;