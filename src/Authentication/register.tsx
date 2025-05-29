import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "CEO" | "USER";
  image: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    role: "USER",
    image: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const registerResponse = await fetch("https://findcourse.net.uz/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!registerResponse.ok) {
        const error = await registerResponse.json();
        alert("Ro'yxatdan o'tishda xatolik: " + (error.message || "Muammo yuz berdi"));
        return;
      }

      const otpResponse = await fetch("https://findcourse.net.uz/api/users/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!otpResponse.ok) {
        const otpError = await otpResponse.json();
        alert("OTP yuborishda xatolik: " + (otpError.message || "Muammo yuz berdi"));
        return;
      }

      alert("Ro'yxatdan o'tish muvaffaqiyatli! Emailingizga kelgan kodni kiriting.");
      navigate(`/verifyOtpPage?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      alert("Tarmoqda muammo yuz berdi, iltimos keyinroq qayta urinib ko'ring.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen gap-20 bg-[#cfe1f3] relative">
      <div>
        <form
          className="w-[600px] h-auto p-10 border border-gray-400 rounded-2xl bg-white flex flex-col gap-4 mx-auto"
          onSubmit={handleRegister}
        >
          <h1 className="text-center text-3xl font-bold font-serif mb-3 text-[#1976D5]">
            Create Account
          </h1>

          <div className="flex justify-between items-center gap-4">
            <input className="border rounded p-2 w-full" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required/>
            <input className="border rounded p-2 w-full" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required/>
          </div>
          <input className="border rounded p-2 w-full" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required/>
          <input className="border rounded p-2 w-full" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required/>
          <input className="border rounded p-2 w-full" name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required/>

          <select className="border rounded p-2 w-full" name="role" value={formData.role} onChange={handleChange} required>
            <option value="USER">USER</option>
            <option value="CEO">CEO</option>
          </select>
          <input className="border rounded p-2 w-full" name="image" type="text" placeholder="Image filename (ixtiyoriy)" value={formData.image} onChange={handleChange}/>
          <center>
            <button type="submit" disabled={loading} className="w-80 bg-[#1976D5] text-white text-xl shadow-xl hover:bg-white hover:text-[#1976D5] px-10 py-4 rounded-full">
              {loading ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
            </button>
          </center>
        </form>
      </div>

      <div>
        <div className="absolute top-10 left-10">
          <p className="text-4xl font-serif font-bold text-[#1976D5]">
            EDUCATION
          </p>
        </div>
        <div>
          <img className="w-[500px]" src="/children.png" alt="Children" />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
