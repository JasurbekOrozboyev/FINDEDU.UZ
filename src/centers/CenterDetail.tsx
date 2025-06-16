import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

export interface Major {
  id: number;
  name: string;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  centerId: number;
}

export interface CommentUser {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  role?: string;
  image?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: number;
  text: string;
  star: number;
  userId: number;
  centerId: number;
  createdAt: string;
  updatedAt: string;
  user?: CommentUser;
}

export interface Center {
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
  comments?: Comment[];
}

const CenterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [center, setCenter] = useState<Center | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(null);
  const [showReseptionModal, setShowReseptionModal] = useState(false);
  const [reseptionName, setReseptionName] = useState("");
  const [reseptionPhone, setReseptionPhone] = useState("");
  const [reseptionFilialId, setReseptionFilialId] = useState<number | ''>('');
  const [reseptionMajor, setReseptionMajor] = useState<number | ''>('');
  const [reseptionDate, setReseptionDate] = useState<string>('');
  const [reseptionTime, setReseptionTime] = useState<string>('');
  const [reseptionSubmitError, setReseptionSubmitError] = useState("");
  const [reseptionSubmitting, setReseptionSubmitting] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branchesError, setBranchesError] = useState("");

  const navigate = useNavigate();

  const Home = () => {
    navigate('/');
  };

  const getUserIdFromToken = (token: string): number | null => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      return payload.id || null;
    } catch (e) {
      console.error("Tokenni olishda xato:", e);
      return null;
    }
  };

  const fetchCenter = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://findcourse.net.uz/api/centers/${id}`);
      if (!res.ok) throw new Error("Markaz haqida ma'lumot olishda xato");
      const data = await res.json();
      setCenter(data.data);
      setError("");
    } catch (err: any) {
      setError(err.message);
      setCenter(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setBranchesLoading(true);
      const res = await fetch(`https://findcourse.net.uz/api/filials?sortBy=name&sortOrder=ASC&centerId=${id}`);
      if (!res.ok) throw new Error("Filiallar haqida ma'lumot olishda xatolik");
      const data = await res.json();
      setBranches(data.data);
      setBranchesError("");
    } catch (err: any) {
      setBranchesError(err.message);
      setBranches([]);
    } finally {
      setBranchesLoading(false);
    }
  };

  useEffect(() => {
    fetchCenter();
    fetchBranches();
    const token = localStorage.getItem("accessToken");
    if (token) {
      setCurrentUserId(getUserIdFromToken(token));
    }
  }, [id]);

  const getImageUrl = (imagePath: string): string => {
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `https://findcourse.net.uz/api/image/${imagePath}`;
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      setSubmitError("Iltimos, sharh matnini kiriting");
      return;
    }
    setSubmitError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setSubmitError("Siz ro'yxatdan o'tishingiz kerak.");
        setSubmitting(false);
        return;
      }

      const res = await fetch("https://findcourse.net.uz/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: commentText,
          centerId: Number(id),
          star: 5,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Izoh yuborilmagan. Ro'yxatdan o'tish kerak.");
      }

      setCommentText("");
      await fetchCenter();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
    setSubmitError("");
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
    setSubmitError("");
  };

  const handleEditComment = async () => {
    if (!editingText.trim()) {
      setSubmitError("Iltimos, sharh matnini kiriting");
      return;
    }
    setSubmitError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setSubmitError("Siz ro'yxatdan o'tishingiz kerak.");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`https://findcourse.net.uz/api/comments/${editingCommentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: editingText }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Izoh tahrirlanmadi.");
      }

      setEditingCommentId(null);
      setEditingText("");
      await fetchCenter();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (commentId: number) => {
    setCommentToDeleteId(commentId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (commentToDeleteId === null) return;

    setSubmitError("");
    setSubmitting(true);
    setShowDeleteConfirm(false);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setSubmitError("Siz avtorizatsiya qilishingiz kerak.");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`https://findcourse.net.uz/api/comments/${commentToDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Izoh o'chirilmadi.");
      }

      await fetchCenter();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
      setCommentToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setCommentToDeleteId(null);
  };

  const handleSubmitReseption = async () => {
    const isLoggedIn = !!localStorage.getItem("accessToken");

    if (reseptionMajor === '' || isNaN(Number(reseptionMajor))) {
      setReseptionSubmitError("Iltimos, yo'nalishni tanlang.");
      return;
    }
    if (!reseptionDate) {
      setReseptionSubmitError("Iltimos, sanani tanlang.");
      return;
    }
    if (!reseptionTime) {
      setReseptionSubmitError("Iltimos, vaqtni tanlang.");
      return;
    }

    if (!isLoggedIn) {
      if (!reseptionName.trim()) {
        setReseptionSubmitError("Iltimos, ismingizni kiriting.");
        return;
      }
      if (!reseptionPhone.trim()) {
        setReseptionSubmitError("Iltimos, telefon raqamingizni kiriting.");
        return;
      }
      if (reseptionFilialId === '' || isNaN(Number(reseptionFilialId))) {
        setReseptionSubmitError("Iltimos, filialni tanlang.");
        return;
      }
    } else {
        if (reseptionFilialId === '' || isNaN(Number(reseptionFilialId))) {
            setReseptionSubmitError("Iltimos, filialni tanlang.");
            return;
        }
    }


    setReseptionSubmitError("");
    setReseptionSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");

      const formattedVisitDate = `${reseptionDate} ${reseptionTime}:00`;

      const requestBody: {
        majorId: number;
        centerId: number;
        filialId: number; 
        visitDate: string;
        name?: string;
        phone?: string;
      } = {
        majorId: Number(reseptionMajor),
        centerId: Number(id),
        filialId: Number(reseptionFilialId), 
        visitDate: formattedVisitDate,
      };

      if (!isLoggedIn) {
        requestBody.name = reseptionName;
        requestBody.phone = reseptionPhone;
      }

      console.log("Request Body:", requestBody);

      const res = await fetch("https://findcourse.net.uz/api/reseption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(isLoggedIn && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.json();
        let errorMessage = errorData.message || "Darsga ro'yxatdan o'tishda xatolik yuz berdi.";

        if (typeof errorData.message === 'object') {
            if (errorData.message.visitDate) {
                errorMessage = `Sana va vaqt xatosi: ${errorData.message.visitDate.join(', ')}`;
            } else if (errorData.message.filialId) {
                errorMessage = `Filialni tanlashda xato: ${errorData.message.filialId.join(', ')}`;
            } else if (errorData.message.name) {
                errorMessage = `Ismni kiritish xatosi: ${errorData.message.name.join(', ')}`;
            } else if (errorData.message.majorId) {
                errorMessage = `Yo'nalishni tanlashda xato: ${errorData.message.majorId.join(', ')}`;
            }
        } else if (typeof errorData.message === 'string') {
             errorMessage = errorData.message;
        }

        if (res.status === 404) {
            errorMessage = "Markaz topilmadi. Ehtimol, ID noto'g'ri. " + errorMessage;
        }
        throw new Error(errorMessage);
      }

      setShowReseptionModal(false);
      setReseptionName("");
      setReseptionPhone("");
      setReseptionFilialId(''); 
      setReseptionMajor('');
      setReseptionDate('');
      setReseptionTime('');

    } catch (err: any) {
      console.error("Ro'yxatdan o'tish uchun ariza yuborishda xato:", err);
      setReseptionSubmitError(err.message);
    } finally {
      setReseptionSubmitting(false);
    }
  };

  if (loading || branchesLoading) return <h2 className="text-center text-xl mt-10">Loading...</h2>;
  if (error) return <h2 className="text-center text-xl mt-10">Xato: {error}</h2>;
  if (branchesError) return <h2 className="text-center text-xl mt-10">Filiallarni yuklashda xato: {branchesError}</h2>;
  if (!center) return <h2 className="text-center text-xl mt-10">Markaz topilmadi.</h2>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-[1200px] mx-auto bg-white rounded-lg shadow-xl p-8 mt-10 mb-10 md:grid md:grid-cols-2 md:gap-8">
        <div>
          <button onClick={Home} className="text-[#461773] hover:underline mb-4 inline-flex items-center">
            Bosh sahifaga qaytish
          </button>
          <img className="w-full h-auto object-cover rounded-lg mb-4" src={getImageUrl(center.image)} alt={center.name}/>
          <p className="mt-4 font-bold text-xl text-[#461773]">Kurs haqida</p>
          <p className="text-gray-700">
            {center.majors.map((m: Major) => m.name).join(", ")}
          </p>
          {center.user && (
            <p className="mb-2 mt-3 font-bold font-serif text-gray-800">
              <strong>Rahbar:</strong> {center.user.firstName} {center.user.lastName}
            </p>
          )}
          <button onClick={() => setShowReseptionModal(true)} className="py-2 px-4 bg-[#461773] text-white rounded-md transition duration-150 ease-in-out mt-4">
            Darsga yozilish
          </button>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold mb-4 text-gray-900">
            {center.name}
          </h1>
          <p className="text-gray-700 mb-2">
            <strong>Manzil:</strong> {center.address}
          </p>
          <p className="text-gray-700 mb-2">
            <strong>Telefon:</strong> {center.phone}
          </p>
          <p className="text-gray-700 mb-4">
            <strong>Mintaqa:</strong> {center.region.name}
          </p>
          {center.description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg shadow-inner">
              <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                Tavsif
              </h2>
              <p className="text-gray-700">{center.description}</p>
            </div>
          )}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Sharhlar ({center.comments?.length ?? 0})
            </h2>
            <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <textarea placeholder="Sharh yozing..." value={commentText} onChange={(e) => setCommentText(e.target.value)} disabled={submitting} rows={3} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"/>
              {submitError && <p className="text-red-500 mt-2 text-sm">{submitError}</p>}
              <button onClick={handleSubmitComment} disabled={submitting} className="mt-3 px-6 py-2 bg-[#461773] text-white font-medium rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                {submitting ? "Yuborish..." : "Fikr-mulohaza yuboring"}
              </button>
            </div>

            {center.comments && center.comments.length > 0 ? (
              <ul className="space-y-4">
                {center.comments.slice().reverse().map((comment) => (
                  <li key={comment.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <p className="font-bold text-lg text-[#461773]">
                      {comment.user
                        ? `${comment.user.firstName ?? ""} ${comment.user.lastName ?? ""}`
                        : "Anonim foydalanuvchi"}
                    </p>
                    {editingCommentId === comment.id ? (
                      <div>
                        <textarea rows={3} className="w-full border border-gray-300 rounded-md p-2 mt-2 focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out" value={editingText} onChange={(e) => setEditingText(e.target.value)} disabled={submitting}/>
                        {submitError && <p className="text-red-500 mt-1 text-sm">{submitError}</p>}
                        <div className="mt-3 space-x-2">
                          <button onClick={handleEditComment} disabled={submitting} className="px-4 py-2 bg-green-500 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                            Saqlash
                          </button>
                          <button onClick={handleCancelEdit} disabled={submitting} className="px-4 py-2 bg-gray-400 text-gray-800 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                            Bekor qilish
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-800">{comment.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                        {currentUserId === comment.userId && (
                          <div className="mt-2 space-x-3 flex justify-end">
                            <button onClick={() => handleStartEdit(comment)} className="text-[#461773] font-medium transition duration-150 ease-in-out">
                              Tahrirlash
                            </button>
                            <button onClick={() => handleDeleteClick(comment.id)} className="text-red-500 font-medium transition duration-150 ease-in-out">
                              O'chirish
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">Hozircha sharhlar yo'q. Fikr-mulohazalarni birinchi bo'lib qoldiring!</p>
            )}
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4">Sharhni o'chirish</h3>
            <p className="mb-6 text-gray-700">Siz haqiqatan ham ushbu sharhni o'chirishni xohlaysizmi?</p>
            <div className="flex justify-center space-x-4">
              <button onClick={confirmDelete} disabled={submitting} className="px-5 py-2 bg-red-500 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed">
                Ha, o'chirish
              </button>
              <button onClick={cancelDelete} disabled={submitting} className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                Yo'q, bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {showReseptionModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-xl w-full animate-fade-in relative">
            <div className="bg-purple-700 text-white p-4 rounded-t-lg -mx-6 -mt-6 mb-6 flex justify-between items-center">
              <h3 className="text-xl font-bold">Darsga ro'yxatdan o'tish</h3>
              <button
                onClick={() => {
                    setShowReseptionModal(false);
                    setReseptionSubmitError("");
                    setReseptionFilialId(''); 
                    setReseptionMajor('');
                    setReseptionDate('');
                    setReseptionTime('');
                    setReseptionName("");
                    setReseptionPhone("");
                }}
                className="text-white hover:text-gray-200">
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmitReseption(); }}>
              {!currentUserId && (
                <>
                  <div className="mb-4">
                    <label htmlFor="reseptionName" className="block text-gray-700 text-sm font-semibold mb-2">
                      Sizning ismingiz
                    </label>
                    <input type="text" id="reseptionName" value={reseptionName} onChange={(e) => setReseptionName(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" placeholder="Ismingizni kiriting" required disabled={reseptionSubmitting}/>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="reseptionPhone" className="block text-gray-700 text-sm font-semibold mb-2">
                      Sizning telefoningiz
                    </label>
                    <input type="tel" id="reseptionPhone" value={reseptionPhone} onChange={(e) => setReseptionPhone(e.target.value)} className="w-full border border-gray-300 rounded-md p-3" placeholder="Telefon raqamingizni kiriting" required disabled={reseptionSubmitting}/>
                  </div>
                </>
              )}
              <div className="mb-4">
                <label htmlFor="reseptionFilialId" className="block text-gray-700 text-sm font-semibold mb-2">
                  Filialni tanlang
                </label>
                <select id="reseptionFilialId"  value={reseptionFilialId} onChange={(e) => setReseptionFilialId(Number(e.target.value))}  className="w-full border border-gray-300 rounded-md p-3 bg-white" required  disabled={reseptionSubmitting || branchesLoading}>
                  <option value="">Filialni tanlang</option>
                  {branchesLoading ? (
                    <option value="" disabled>Yuklanmoqda...</option>
                  ) : branches.length > 0 ? (
                    branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Filiallar topilmadi</option>
                  )}
                </select>
                {reseptionFilialId && branches.length > 0 && (
                    <p className="text-gray-500 text-xs mt-1">
                        {branches.find(b => b.id === reseptionFilialId)?.address}
                    </p>
                )}
              </div>
              <div className="mb-4">
                <label htmlFor="reseptionMajor" className="block text-gray-700 text-sm font-semibold mb-2">
                  Yo'nalishni tanlang
                </label>
                <select id="reseptionMajor" value={reseptionMajor} onChange={(e) => setReseptionMajor(Number(e.target.value))} className="w-full border border-gray-300 rounded-md p-3 bg-white" required disabled={reseptionSubmitting}>
                  <option value="">Yo'nalishni tanlang</option>
                  {center.majors.map((major) => (
                    <option key={major.id} value={major.id}>
                      {major.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="reseptionDate" className="block text-gray-700 text-sm font-semibold mb-2">
                    Sanani tanlang
                  </label>
                  <input type="date" id="reseptionDate" value={reseptionDate} onChange={(e) => setReseptionDate(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" placeholder="sana" required disabled={reseptionSubmitting}/>
                </div>
                <div>
                  <label htmlFor="reseptionTime" className="block text-gray-700 text-sm font-semibold mb-2">
                    Vaqtni tanlang
                  </label>
                  <input type="time" id="reseptionTime" value={reseptionTime} onChange={(e) => setReseptionTime(e.target.value)} className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500" required disabled={reseptionSubmitting}/>
                </div>
              </div>

              {reseptionSubmitError && <p className="text-red-500 mb-4 text-sm text-center">{reseptionSubmitError}</p>}

              <div className="flex justify-end space-x-3 mt-8">
                <button type="button"
                  onClick={() => {
                    setShowReseptionModal(false);
                    setReseptionSubmitError("");
                    setReseptionFilialId('');
                    setReseptionMajor('');
                    setReseptionDate('');
                    setReseptionTime('');
                    setReseptionName("");
                    setReseptionPhone("");
                  }}
                  className="px-6 py-2 text-gray-800 rounded-md hover:bg-gray-200 transition duration-150 ease-in-out border border-gray-300"
                  disabled={reseptionSubmitting}>
                  Bekor qilish
                </button>
                <button type="submit" disabled={reseptionSubmitting} className="px-6 py-2 bg-purple-700 text-white rounded-md hover:bg-purple-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out">
                  {reseptionSubmitting ? "Tasdiqlash..." : "Navbatga yozilish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterDetail;