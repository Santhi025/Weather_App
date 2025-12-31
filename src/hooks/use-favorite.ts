// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useLocalStorage } from "./use-local-storage";

// interface FavoriteCity{
//   id: string;
//  name: string;
//   lat: number;
//   lon: number;
//   country: string;
//   state?: string;
//   addedAt: number;
// }

// export function useFavourite() {
//   const [favorites, setFavorites] = useLocalStorage<FavoriteCity[]>(
//     "favorites",
//     []
//   );
//   const queryClient = useQueryClient();

//   const favoritesQuery = useQuery({
//     queryKey: ["favorites"],
//     queryFn: () => favorites,
//     initialData: favorites,
//   });

//   const addFavourite = useMutation({
//     mutationFn: async (
//       city: Omit<FavoriteCity, "id" | "addedAt">
//     ) => {
//       const newFavorite: FavoriteCity = {
//         ...city,
//         id: `${city.lat}-${city.lon}`,
//         addedAt: Date.now(),
//       };

//       // Remove duplicates and keep only last 10 searches
//       const exists = favorites.some((fav) => fav.id === newFavorite.id);
//       if(exists) return favorites
//       const newFavorites = [...favorites, newFavorite].slice(0, 10);

//       setFavorites(newFavorites);
//       return newFavorites;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["favorites"],

//       });
//     },
//   });

//   const removeFavorite = useMutation({
//     mutationFn: async (cityId:string) => {
//         const newFavorites = favorites.filter((city) => city.id !== cityId)
//       setFavorites(newFavorites);
//       return newFavorites;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["favorites"],

//       });
//     },
//   });

//   return {
//     favorites: favoritesQuery.data,
//     addFavourite,
//     removeFavorite,
//     isFavorite: (lat:number, lon:number) => 
//         favorites.some((city) => city.lat === lat && city.lon == lon)
//   };
// }



// src/hooks/use-favorites.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalStorage } from "./use-local-storage";

export interface FavoriteCity {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
  addedAt: number;
}

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage<FavoriteCity[]>(
    "favorites",
    []
  );
  const queryClient = useQueryClient();

  const favoritesQuery = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favorites,
    initialData: favorites,
    staleTime: Infinity, // Since we're managing the data in localStorage
  });

  const addFavorite = useMutation({
    mutationFn: async (city: Omit<FavoriteCity, "id" | "addedAt">) => {
      const newFavorite: FavoriteCity = {
        ...city,
        id: `${city.lat}-${city.lon}`,
        addedAt: Date.now(),
      };

      // Prevent duplicates
      const exists = favorites.some((fav) => fav.id === newFavorite.id);
      if (exists) return favorites;

      const newFavorites = [...favorites, newFavorite];
      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (cityId: string) => {
      const newFavorites = favorites.filter((city) => city.id !== cityId);
      setFavorites(newFavorites);
      return newFavorites;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  return {
    favorites: favoritesQuery.data,
    addFavorite,
    removeFavorite,
    isFavorite: (lat: number, lon: number) =>
      favorites.some((city) => city.lat === lat && city.lon === lon),
  };
}