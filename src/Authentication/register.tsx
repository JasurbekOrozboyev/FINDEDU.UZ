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

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Ro'yxatdan o'tish
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

      const registerData = await registerResponse.json();

      if (registerData.token) {
        localStorage.setItem("token", registerData.token);
      }

      // OTP yuborish
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
    }
  };

  return (
    <form className="flex flex-col gap-4 max-w-md mx-auto mt-10" onSubmit={handleRegister}>
      <input
        name="firstName"
        placeholder="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
      />
      <input
        name="lastName"
        placeholder="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <select name="role" value={formData.role} onChange={handleChange} required>
        <option value="USER">USER</option>
        <option value="CEO">CEO</option>
      </select>
      <input
        name="image"
        placeholder="Image filename"
        value={formData.image}
        onChange={handleChange}
      />
      <button type="submit" className="py-2 rounded transition" >
        Ro'yxatdan o'tish
      </button>
    </form>
  );
};

export default RegisterPage;
