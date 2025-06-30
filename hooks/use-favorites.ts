"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  addFavorite as apiAddFavorite,
  getFavorites as apiGetFavorites,
  removeFavorite as apiRemoveFavorite,
  ApiFavoriteRequest,
  ApiFavoriteResponse,
} from "@/lib/api";

export interface HealthUnit {
  id: string;
  name: string;
  address: string;
  location: any;
  rating?: number;
  phoneNumber?: string;
  website?: string;
  types?: string[];
  distance?: string;
  duration?: string;
  openNow?: boolean;
}

export interface LocalFavorite {
  firebaseId: string;
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  phoneNumber?: string;
  website?: string;
  types?: string[];
  addedAt: string;
  userId: string;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<LocalFavorite[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, getToken } = useAuth();

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    const token = getToken();
    if (!token) return;

    try {
      setLoading(true);

      const apiFavorites = await apiGetFavorites(user.id, token);

      if (Array.isArray(apiFavorites)) {
        const convertedFavorites: LocalFavorite[] = apiFavorites.map((fav) => ({
          id: fav.id,
          name: fav.name,
          address: fav.address,
          latitude: fav.latitude,
          longitude: fav.longitude,
          rating: fav.rating,
          phoneNumber: fav.phoneNumber,
          website: fav.website,
          types: fav.types,
          addedAt: fav.addedAt,
          userId: fav.userId,
          firebaseId: fav.firebaseId,
        }));

        setFavorites(convertedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (healthUnit: HealthUnit) => {
    if (!user) {
      toast.error("Você precisa estar logado para adicionar favoritos");
      return;
    }

    if (isFavorite(healthUnit.id)) {
      toast.error("Esta unidade já está nos seus favoritos");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    try {
      const favoriteData: ApiFavoriteRequest = {
        id: healthUnit.id,
        name: healthUnit.name,
        address: healthUnit.address,
        latitude:
          typeof healthUnit.location.lat === "function"
            ? healthUnit.location.lat()
            : healthUnit.location.lat,
        longitude:
          typeof healthUnit.location.lng === "function"
            ? healthUnit.location.lng()
            : healthUnit.location.lng,
        rating: healthUnit.rating,
        phoneNumber: healthUnit.phoneNumber,
        website: healthUnit.website,
        types: healthUnit.types,
        addedAt: new Date().toISOString(),
        userId: user.id,
      };

      const newFavorite = await apiAddFavorite(favoriteData, token);

      const localFavorite: LocalFavorite = {
        id: newFavorite.id,
        name: newFavorite.name,
        address: newFavorite.address,
        latitude: newFavorite.latitude,
        longitude: newFavorite.longitude,
        rating: newFavorite.rating,
        phoneNumber: newFavorite.phoneNumber,
        website: newFavorite.website,
        types: newFavorite.types,
        addedAt: newFavorite.addedAt,
        userId: newFavorite.userId,
        firebaseId: newFavorite.firebaseId,
      };

      setFavorites((prev) => [...prev, localFavorite]);

      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('favoriteAdded', {
        detail: { favoriteId: healthUnit.id }
      }));

      toast.success("Unidade adicionada aos favoritos!");
    } catch (error) {
      toast.error("Erro ao adicionar favorito");
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    const token = getToken();
    if (!token) {
      toast.error("Token de autenticação não encontrado");
      return;
    }

    try {
      const favorite = favorites.find((fav) => fav.id === favoriteId);
      if (!favorite) {
        toast.error("Favorito não encontrado");
        return;
      }

      await apiRemoveFavorite(favorite.firebaseId, token);

      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));

      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('favoriteRemoved', {
        detail: { favoriteId }
      }));

      toast.success("Favorito removido!");
    } catch (error) {
      toast.error("Erro ao remover favorito");
    }
  };

  const isFavorite = (healthUnitId: string): boolean => {
    return favorites.some((fav) => fav.id === healthUnitId);
  };

  const checkIfFavorite = async (healthUnitId: string): Promise<boolean> => {
    if (!user) return false;

    const token = getToken();
    if (!token) return false;

    try {
      const apiFavorites = await apiGetFavorites(user.id, token);
      return apiFavorites.some((fav) => fav.id === healthUnitId);
    } catch (error) {
      return false;
    }
  };

  const toggleFavorite = (healthUnit: HealthUnit) => {
    if (isFavorite(healthUnit.id)) {
      removeFavorite(healthUnit.id);
    } else {
      addFavorite(healthUnit);
    }
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    checkIfFavorite,
    toggleFavorite,
    loadFavorites,
  };
}
