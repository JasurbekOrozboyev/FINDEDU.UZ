import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, CardMedia, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from '@mui/icons-material/Category';

export interface Major {
  name: string;
}

export interface Branch {
  id: number;
  name: string;
}

export interface Center {
  id: number;
  name: string;
  phone: string;
  regionId: number;
  address: string;
  image: string;
}

export interface Reseption {
  id: number;
  userId: number;
  centerId: number;
  filialId?: number;
  majorId: number;
  visitDate: string;
  status: string;
  center?: Center;
  filial?: Branch;
  major?: Major;
}

export interface UserProfileData {
  receptions?: Reseption[];
}

const ProfilePage: React.FC = () => {
  const [receptions, setReceptions] = useState<Reseption[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [reseptionToDeleteId, setReseptionToDeleteId] = useState<number | null>(null);
  const navigate = useNavigate();

  const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) {
      return "https://placehold.co/100x100/cccccc/ffffff?text=Rasm+topilmadi"; 
    }
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `https://findcourse.net.uz/api/image/${imagePath}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        setError("Nabat ma'lumotlarini ko'rish uchun ro'yhatdan o'tish kerak.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const userRes = await fetch(`https://findcourse.net.uz/api/users/mydata`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userRes.ok) {
          const errorData = await userRes.json().catch(() => ({ message: "Serverdan ma'lumot olishda xato." }));
          throw new Error(errorData.message || "Darsga yozilish ma'lumotlarini olishda xatolik: " + userRes.statusText);
        }

        const responseBody: { data: UserProfileData } = await userRes.json();
        setReceptions(responseBody.data.receptions || []);
        setError("");
      } catch (err: any) {
        setError(err.message || "Navbatni yuklashda kutilmagan xatolik yuz berdi.");
        setReceptions(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return {
        date: `${day}.${month}.${year}`,
        time: `${hours}:${minutes}`,
      };
    } catch (e) {
      return { date: "Noma'lum sana", time: "Noma'lum vaqt" };
    }
  };

  const handleDeleteReseptionClick = (id: number) => {
    setReseptionToDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteReseptionConfirm = async () => {
    setOpenDeleteDialog(false);
    if (!reseptionToDeleteId) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("O'chirish uchun tizimga kirishingiz kerak.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`https://findcourse.net.uz/api/reseption/${reseptionToDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Navbat o'chirishda xatolik: ${response.status} ${response.statusText}. Javob: ${errorText}`
        );
      }

      setReceptions((prevReceptions) => {
        if (!prevReceptions) return null;
        return prevReceptions.filter((r) => r.id !== reseptionToDeleteId);
      });
      setError("Navbat muvaffaqiyatli o'chirildi!"); 
      setReseptionToDeleteId(null);
    } catch (err: any) {
      setError(err.message || "O'chirishda xato");
    }
  };

  const handleDeleteReseptionCancel = () => {
    setOpenDeleteDialog(false);
    setReseptionToDeleteId(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Darsga yozilishlar yuklanmoqda...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4, p: 3 }}>
      {error && (
        <Alert severity={error.includes("muvaffaqiyatli") ? "success" : "error"} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!receptions || receptions.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 5 }}>
          Sizda hali uchrashuvlar yo'q.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {receptions.map((reseption) => {
            const center = reseption.center;
            const filial = reseption.filial;
            const major = reseption.major;
            const formattedDateTime = formatDateTime(reseption.visitDate);
            return (
              <Grid  key={reseption.id} component="div">
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {center?.image && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                      <CardMedia
                        component="img"
                        image={getImageUrl(center.image)}
                        alt={center.name}
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1px solid #ccc',
                        }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Typography gutterBottom variant="h6" component="div" color="primary">
                      {center?.name || "Noma'lum Markaz"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: 'center', mb: 0.5 }}>
                      <CategoryIcon sx={{ mr: 1, fontSize: 18 }} />
                      <Box component="span" fontWeight="medium">Yo'nalish:</Box> {major?.name}
                    </Typography>
                    {filial ? (
                      <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: 'center', mb: 0.5 }}>
                        <LocationOnIcon sx={{ mr: 1, fontSize: 18 }} />
                        <Box component="span" fontWeight="medium">Manzil:</Box> , {filial.name} filiali
                      </Typography>
                    ) : center?.address ? (
                      <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: 'center', mb: 0.5 }}>
                        <LocationOnIcon sx={{ mr: 1, fontSize: 18 }} />
                        <Box component="span" fontWeight="medium">Manzil:</Box> {center.address}
                      </Typography>
                    ) : null}
                    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: 'center', mb: 0.5 }}>
                      <CalendarTodayIcon sx={{ mr: 1, fontSize: 18 }} />
                      <Box component="span" fontWeight="medium">Tashrif sanasi:</Box> {formattedDateTime.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: 'center' }}>
                      <ScheduleIcon sx={{ mr: 1, fontSize: 18 }} />
                      <Box component="span" fontWeight="medium">Vaxti:</Box> {formattedDateTime.time}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="text"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteReseptionClick(reseption.id)}
                      sx={{ textTransform: 'none' }}>
                      O'chirish
                    </Button>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteReseptionCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description">
        <DialogTitle id="delete-dialog-title">{"Navbatni o'chirishni tasdiqlaysizmi?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Siz ushbu navbatni o'chirishga aminmisiz? Bu amalni qaytarib bo'lmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteReseptionCancel} color="primary">
            Bekor qilish
          </Button>
          <Button onClick={handleDeleteReseptionConfirm} color="error" autoFocus>
            O'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProfilePage;