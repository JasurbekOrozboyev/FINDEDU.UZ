import React, { useState, useEffect } from "react";

interface Major {
  id: number;
  name: string;
}

const CreateCenterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    regionId: 1,
    address: "",
    image: "",
    phone: "",
    majorsId: [] as number[],
  });

  const [majors, setMajors] = useState<Major[]>([]);
  const [message, setMessage] = useState("");

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await fetch("https://findcourse.net.uz/api/major");
        if (!res.ok) throw new Error("Yo'nalishlarni olishda xatolik yuz berdi");
        const data = await res.json();
        setMajors(data.data || []);
      } catch (err) {
        console.error("Yo'nalishlarni olishda xatolik:", err);
      }
    };

    fetchMajors();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "regionId" ? Number(value) : value,
    }));
  };

  const handleMajorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = Number(e.target.value);
    setFormData((prev) => ({
      ...prev,
      majorsId: prev.majorsId.includes(id)
        ? prev.majorsId.filter((mid) => mid !== id)
        : [...prev.majorsId, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken) {
      setMessage("Token topilmadi. Iltimos, tizimga qayta kiring.");
      return;
    }

    try {
      const res = await fetch("https://findcourse.net.uz/api/centers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Yuborishda xatolik");

    const data = await res.json();
    setMajors(data.data || []);

      alert("Markaz muvaffaqiyatli qo'shildi!");
      setFormData({
        name: "",
        regionId: 1,
        address: "",
        image: "",
        phone: "",
        majorsId: [],
      });
    } catch (err: any) {
      setMessage("Xatolik: " + err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 border rounded shadow bg-white">
      <h2 className="text-2xl font-bold mb-4">Yangi o'quv markazi qo'shish</h2>
      {message && <p className="mb-4 text-blue-600">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Nomi" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required/>
        <input name="address" placeholder="Manzil" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded" required/>
        <input name="image" type="file" placeholder="Rasm URL (masalan: center.jpg)" value={formData.image} onChange={handleChange} className="w-full p-2 border rounded"/>
        <input name="phone" placeholder="Telefon" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded"/>

        <select name="regionId" value={formData.regionId} onChange={handleChange} className="w-full p-2 border rounded">
          <option value={1}>Toshkent</option>
          <option value={2}>Andijon</option>
          <option value={3}>Namangan</option>
          <option value={4}>Buxoro</option>
          <option value={5}>Jizzax</option>
          <option value={6}>Qashqadaryo</option>
          <option value={7}>Samarqand</option>
        </select>

        <div>
            <p className="font-medium mb-2">Yo'nalishlar:</p>
            {majors.length === 0 ? (
                <p>Yuklanmoqda...</p>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                {majors.map((major) => (
                    <label key={major.id} className="flex items-center">
                    <input type="checkbox" value={major.id} checked={formData.majorsId.includes(major.id)} onChange={handleMajorsChange} className="mr-2"/>
                    {major.name}
                    </label>
                ))}
                </div>
            )}
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Yuborish
        </button>
      </form>
    </div>
  );
};

export default CreateCenterPage;
