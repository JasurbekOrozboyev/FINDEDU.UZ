import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Checkbox, FormGroup, Box, Alert, CircularProgress,
} from "@mui/material";
import type { SelectChangeEvent } from '@mui/material/Select'; 


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
  const [loadingMajors, setLoadingMajors] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        setLoadingMajors(true);
        const res = await fetch("https://findcourse.net.uz/api/major");
        if (!res.ok) throw new Error("Yo'nalishlarni olishda xatolik yuz berdi");
        const data = await res.json();
        setMajors(data.data || []);
      } catch (err: any) {
        console.error("Yo'nalishlarni olishda xatolik:", err);
        setMessage("Xatolik: Yo'nalishlarni yuklashda muammo yuz berdi.");
      } finally {
        setLoadingMajors(false);
      }
    };

    fetchMajors();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<number> 
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: name === "regionId" ? Number(value) : value,
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
    setSubmitting(true);
    setMessage(""); 

    if (!accessToken) {
      setMessage("Token topilmadi. Iltimos, tizimga qayta kiring.");
      setSubmitting(false);
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Yuborishda xatolik yuz berdi");
      }

      setMessage("Markaz muvaffaqiyatli qo'shildi!");
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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4, p: 3, border: "1px solid #e0e0e0", borderRadius: 2, boxShadow: 3, bgcolor: "background.paper" }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Yangi o'quv markazi qo'shish
      </Typography>
      {message && (
        <Alert severity={message.includes("muvaffaqiyatli") ? "success" : "error"} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField name="name" label="Nomi" value={formData.name} onChange={handleChange} fullWidth required/>
        <TextField name="address" label="Manzil" value={formData.address} onChange={handleChange} fullWidth required/>
        <TextField name="image" type="file" label="Rasm" onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }}/>
        <TextField name="phone" label="Telefon" value={formData.phone} onChange={handleChange} fullWidth/>

        <FormControl fullWidth>
          <InputLabel id="region-select-label">Viloyat</InputLabel>
          <Select labelId="region-select-label" name="regionId" value={formData.regionId} label="Viloyat" onChange={handleChange}>
            <MenuItem value={1}>Toshkent</MenuItem>
            <MenuItem value={2}>Andijon</MenuItem>
            <MenuItem value={3}>Namangan</MenuItem>
            <MenuItem value={4}>Buxoro</MenuItem>
            <MenuItem value={5}>Jizzax</MenuItem>
            <MenuItem value={6}>Qashqadaryo</MenuItem>
            <MenuItem value={7}>Samarqand</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Yo'nalishlar:
          </Typography>
          {loadingMajors ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress />
            </Box>
          ) : majors.length === 0 ? (
            <Typography>Yo'nalishlar topilmadi.</Typography>
          ) : (
            <FormGroup row>
              {majors.map((major) => (
                <FormControlLabel key={major.id} control={
                    <Checkbox value={major.id} checked={formData.majorsId.includes(major.id)} onChange={handleMajorsChange}/>
                  }
                  label={major.name}/>
              ))}
            </FormGroup>
          )}
        </Box>
        <Button  type="submit" variant="contained" color="primary" fullWidth disabled={submitting}>
          <p className="text-black ">{submitting ? <CircularProgress size={24} color="inherit" /> : "Yuborish"}</p>
        </Button>
      </Box>
    </Container>
  );
};

export default CreateCenterPage;