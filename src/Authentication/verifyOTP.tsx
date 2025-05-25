import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");

  if (!email) {
    return <p>Email manzili ko'rsatilmagan. Iltimos, ro'yxatdan o'tish sahifasiga qayting.</p>;
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const verifyResponse = await fetch("https://findcourse.net.uz/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        alert("OTP tasdiqlashda xatolik: " + (error.message || "Muammo yuz berdi"));
        return;
      }

      alert("Email muvaffaqiyatli tasdiqlandi!");

      // Masalan, login sahifasiga yo'naltirish:
      navigate("/login");
    } catch (error) {
      alert("Tarmoqda muammo yuz berdi, iltimos keyinroq qayta urinib ko'ring.");
      console.error(error);
    }
  };

  return (
    <form className="flex flex-col gap-4 max-w-md mx-auto mt-10" onSubmit={handleVerifyOtp}>
      <p>Email: <strong>{email}</strong></p>
      <input
        type="text"
        placeholder="Emailga kelgan OTP kodni kiriting"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        required
      />
      <button
        type="submit"
        className="bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
      >
        OTP tasdiqlash
      </button>
    </form>
  );
};

export default VerifyOtpPage;
