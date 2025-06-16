import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, Box, CircularProgress, Alert, Grid,  Card, CardMedia, CardContent, CardActions, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";

interface Center {
  id: number;
  name: string;
  address: string;
  phone?: string;
  image?: string;
}

const MyCentersPage = () => {
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [centerToDeleteId, setCenterToDeleteId] = useState<number | null>(null);
  const accessToken = localStorage.getItem("accessToken");
  const navigate = useNavigate();

  const getImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) {
      return "https://placehold.co/400x200/cccccc/ffffff?text=Rasm+topilmadi";
    }
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `https://findcourse.net.uz/api/image/${imagePath}`;
  };

  useEffect(() => {
    if (!accessToken) {
      setError("Iltimos, tizimga kiring!");
      setLoading(false);
      return;
    }

    const fetchCenters = async () => {
      try {
        const res = await fetch("https://findcourse.net.uz/api/users/mycenters", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Markazlarni olishda xatolik yuz berdi");
        }

        const data = await res.json();
        setCenters(data.data || []);
      } catch (err: any) {
        setError(err.message || "Markazlarni olishda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, [accessToken]);

  const handleDeleteClick = (id: number) => {
    setCenterToDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    setOpenDeleteDialog(false);
    if (!centerToDeleteId) return;

    if (!accessToken) {
      setError("Token topilmadi. Iltimos, tizimga kirishingiz kerak.");
      return;
    }

    try {
      const res = await fetch(`https://findcourse.net.uz/api/centers/${centerToDeleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Markazni o'chirishda xatolik yuz berdi");
      }

      setCenters((prev) => prev.filter((center) => center.id !== centerToDeleteId));
      setError("Markaz muvaffaqiyatli o'chirildi!"); 
      setCenterToDeleteId(null);
    } catch (err: any) {
      setError(err.message || "Markazni o'chirishda xatolik yuz berdi");
    }
  };

  const handleDeleteCancel = () => {
    setOpenDeleteDialog(false);
    setCenterToDeleteId(null);
  };

  const handleEdit = (id: number) => {
    navigate(`/editcenter/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Yuklanmoqda...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4, p: 3, mx: 'auto' }}>
      {error && (
        <Alert severity={error.includes("muvaffaqiyatli") ? "success" : "error"} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {centers.length === 0 ? (
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 5 }}>
          Sizda hozircha markazlar mavjud emas.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {centers.map((center) => (
            <Grid item xs={12} sm={6} md={4} key={center.id} component="div" >
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia component="img" height="200" image={getImageUrl(center.image)} alt={center.name}/>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="div">
                    {center.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationOnIcon sx={{ mr: 1, fontSize: 18 }} />
                    {center.address}
                  </Typography>
                  {center.phone && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                      <PhoneIcon sx={{ mr: 1, fontSize: 18 }} />
                      Telefon: {center.phone}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/centerdetail/${center.id}`);
                      }}>
                      Batafsil
                    </Button>
                    <Button size="small" variant="contained" color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(center.id);
                      }}>
                      Tahrirlash
                    </Button>
                    <Button size="small" variant="contained" color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(center.id);
                      }}>
                      O'chirish
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">{"Markazni o'chirishni tasdiqlaysizmi?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Siz ushbu markazni o'chirishga aminmisiz? Bu amalni qaytarib bo'lmaydi.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Bekor qilish
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            O'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyCentersPage;