import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar";
import { useNavigate } from 'react-router-dom';

export interface Major {
  id: number;
  name: string;
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

    const navigate = useNavigate();
    const Home = () => {
    navigate('/'); 
  };

  const fetchCenter = async () => {
    try {
      setLoading(true);
      const res = await fetch(`https://findcourse.net.uz/api/centers/${id}`);
      if (!res.ok) throw new Error("Markaz ma'lumotlarini olishda xatolik");
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

  useEffect(() => {
    fetchCenter();
  }, [id]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      setSubmitError("Iltimos, comment matnini kiriting");
      return;
    }
    setSubmitError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setSubmitError("Siz tizimga kirishingiz kerak.");
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
        throw new Error(errorData.message || "Comment yozishda xatolik.");
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
      setSubmitError("Iltimos, comment matnini kiriting");
      return;
    }
    setSubmitError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setSubmitError("Siz tizimga kirishingiz kerak.");
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
        throw new Error(errorData.message || "Comment tahrirlanmadi");
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

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Commentni o'chirmoqchimisiz?")) return;

    setSubmitError("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setSubmitError("Siz tizimga kirishingiz kerak.");
        setSubmitting(false);
        return;
      }

      const res = await fetch(`https://findcourse.net.uz/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Comment o'chirilmadi");
      }

      await fetchCenter();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
  

  if (loading) return <h2 className="text-center">Yuklanmoqda...</h2>;
  if (error) return <h2 className="text-center">Xatolik: {error}</h2>;
  if (!center) return <h2 className="text-center">Markaz topilmadi.</h2>;

  return (
    <div>
      <Navbar />
      <div className="max-w-[1440px] m-auto rounded shadow-xl grid grid-cols-2 p-5 mt-10">
        <div>
            <button className="text-[#63CDFF]" onClick={Home}>Markazlarga qaytish</button>
          <img className="w-150 mt-2" src="/artel.jpg" alt="#" />
          <p className="mt-3 font-bold text-xl text-[#63CDFF]">Mavjud Kurslar</p>
            {center.majors.map((m: Major) => m.name).join(", ")}
          {center.user && (
            <p className="mb-2 mt-3 font-bold font-serif">
              <strong>Rahbar:</strong> {center.user.firstName} {center.user.lastName}
            </p>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{center.name}</h1>
          <p className="mb-2">
            <strong>Manzil:</strong> {center.address}
          </p>
          <p className="mb-2">
            <strong>Telefon:</strong> {center.phone}
          </p>
          <p className="mb-2">
            <strong>Hudud:</strong> {center.region.name}
          </p>


          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-2">
              Sharhlar({center.comments?.length ?? 0})
            </h2>

            {center.comments && center.comments.length > 0 ? (
              <ul>
                     <div className="mt-6">
              <textarea
                placeholder="Comment yozing..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submitting}
                className="w-full border border-gray-300 rounded-md p-2"
              />
              {submitError && <p className="text-red-500 mt-1">{submitError}</p>}
              <button
                onClick={handleSubmitComment}
                disabled={submitting}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Yuborish
              </button>
            </div>
                {center.comments.slice().reverse().map((comment) => (
                  <li key={comment.id} className="mb-4 border-b border-gray-300 pb-2">
                    <p className="font-semibold text-[#1976D5]">
                      {comment.user
                        ? `${comment.user.firstName ?? ""} ${comment.user.lastName ?? ""}`
                        : "Foydalanuvchi ma'lumotlari mavjud emas"}
                    </p>

                    {editingCommentId === comment.id ? (
                      <>
                        <textarea
                          rows={3}
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          disabled={submitting}
                        />
                        {submitError && <p className="text-red-500 mt-1">{submitError}</p>}
                        <div className="mt-2 space-x-2">
                          <button
                            onClick={handleEditComment}
                            disabled={submitting}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            Saqlash
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={submitting}
                            className="px-3 py-1 bg-gray-400 text-black rounded hover:bg-gray-500 disabled:bg-gray-300"
                          >
                            Bekor qilish
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p>{comment.text}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-1 space-x-2">
                          <button
                            onClick={() => handleStartEdit(comment)}
                            className="text-blue-600 hover:underline"
                          >
                            Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:underline"
                          >
                            O'chirish
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Hozircha commentlar yo'q.</p>
            )}

       
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterDetail;
