import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, List, ListItem, ListItemText, Divider, IconButton,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import DeleteIcon from '@mui/icons-material/Delete';

export interface Center {
  id: number;
  name: string;
  phone: string;
  regionId: number;
  address: string;
  image: string;
  seoId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserLikedItem {
  id: number;
  userId: number;
  centerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserLikesResponseData {
  likes?: UserLikedItem[];
}

export interface AllCentersResponse {
  data: Center[];
}

const LikedCentersPage: React.FC = () => {
  const [likedCenters, setLikedCenters] = useState<(UserLikedItem & { centerDetails?: Center })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const BASE_URL = 'https://findcourse.net.uz'; 

  const getCenterImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) {
      return "https://via.placeholder.com/180x120?text=No+Image";
    }
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    return `${BASE_URL}/api/image/${imagePath}`;
  };

  const fetchAllCenters = useCallback(async (): Promise<Center[]> => {
    try {
      const res = await fetch(`${BASE_URL}/api/centers`);
      if (!res.ok) {
        throw new Error(`Markazlarni yuklashda xatolik: ${res.status} ${res.statusText}`);
      }
      const json: AllCentersResponse = await res.json();
      return json.data;
    } catch (err) {
      console.error("Barcha markazlarni yuklashda xato:", err);
      return [];
    }
  }, [BASE_URL]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("Yoqtirilgan markazlarni ko'rish uchun tizimga kirish kerak.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const likedRes = await fetch(`${BASE_URL}/api/users/mydata`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!likedRes.ok) {
          const errorData = await likedRes.json().catch(() => ({ message: "Serverdan ma'lumot olishda xato." }));
          throw new Error(errorData.message || "Yoqtirilgan markazlarni olishda xatolik: " + likedRes.statusText);
        }

        const likedResponseBody: { data: UserLikesResponseData } = await likedRes.json();
        const userLikedItems = likedResponseBody.data.likes || [];

        const allCenters = await fetchAllCenters();
        const centerMap = new Map<number, Center>();
        allCenters.forEach(center => centerMap.set(center.id, center));

        const combinedLikedCenters = userLikedItems.map(likedItem => ({
          ...likedItem,
          centerDetails: centerMap.get(likedItem.centerId)
        }));

        setLikedCenters(combinedLikedCenters);

      } catch (err: any) {
        setError(err.message || "Yoqtirilgan markazlarni yuklashda kutilmagan xatolik yuz berdi.");
        setLikedCenters(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchAllCenters, BASE_URL]); 

  const handleRemoveLike = async (likeId: number) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("O'chirish uchun tizimga kirish kerak.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/liked/${likeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "O'chirishda server xatosi." }));
        throw new Error(errorData.message || "Yoqtirishni o'chirishda xatolik: " + res.statusText);
      }

      setLikedCenters(prev => prev ? prev.filter(like => like.id !== likeId) : []);
    } catch (err: any) {
      setError(err.message || "Yoqtirishni o'chirishda kutilmagan xatolik yuz berdi.");
    }
  };

  const hasLikes = likedCenters && likedCenters.length > 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Yoqtirilgan markazlar yuklanmoqda...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, p: 3 }}>
        <Alert severity="error">
          {error}
        </Alert>
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 2 }}>
          Iltimos, qayta urinib ko'ring yoki tizimga kirganingizni tekshiring.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4, p: 3 }}>
      

      {!hasLikes ? (
        <Typography variant="h6" align="center" color="text.secondary" sx={{ mt: 5 }}>
          Sizda hozircha yoqtirilgan markazlar mavjud emas.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {likedCenters!.map((like) => (
            <Grid item xs={12} sm={6} md={4} key={like.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ position: 'relative' }}>
                  {like.centerDetails?.image && (
                    <img className="w-80 h-auto" src={getCenterImageUrl(like.centerDetails.image)} alt={like.centerDetails.name} />
                  )}
                  <IconButton
                    aria-label="remove from favorites"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.6)',
                      },
                    }}
                    onClick={() => handleRemoveLike(like.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {like.centerDetails?.name || "Noma'lum Markaz"}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <List dense disablePadding>
                    {like.centerDetails?.address && (
                      <ListItem disablePadding>
                        <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                        <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}>
                          {like.centerDetails.address}
                        </ListItemText>
                      </ListItem>
                    )}
                    {like.centerDetails?.phone && (
                      <ListItem disablePadding>
                        <PhoneIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                        <ListItemText primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}>
                          {like.centerDetails.phone}
                        </ListItemText>
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default LikedCentersPage;