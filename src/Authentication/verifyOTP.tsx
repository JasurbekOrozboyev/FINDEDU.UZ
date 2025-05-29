import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
} from "@mui/material";

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email");

  if (!email) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="error">
          Email manzili ko'rsatilmagan. Iltimos, ro'yxatdan o'tish sahifasiga
          qayting.
        </Alert>
      </Container>
    );
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const verifyResponse = await fetch(
        "https://findcourse.net.uz/api/users/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      if (!verifyResponse.ok) {
        const error = await verifyResponse.json();
        setErrorMsg("OTP tasdiqlashda xatolik: " + (error.message || "Muammo yuz berdi"));
        setLoading(false);
        return;
      }

      setSuccessMsg("Email muvaffaqiyatli tasdiqlandi!");
      setLoading(false);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setErrorMsg("Tarmoqda muammo yuz berdi, iltimos keyinroq qayta urinib ko'ring.");
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{ mt: 10, p: 4, display: "flex", flexDirection: "column", gap: 3 }}
      >
        <Typography variant="h5" component="h1" textAlign="center" fontWeight="bold">
          OTP Tasdiqlash
        </Typography>

        <Typography variant="body1" textAlign="center">
          Email: <strong>{email}</strong>
        </Typography>

        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        {successMsg && <Alert severity="success">{successMsg}</Alert>}

        <Box
          component="form"
          onSubmit={handleVerifyOtp}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Emailga kelgan OTP kodni kiriting"
            variant="outlined"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
          >
            {loading ? "Tekshirilmoqda..." : "OTP tasdiqlash"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default VerifyOtpPage;
