"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  Search,
  MapPin,
  Clock,
  Info,
  Navigation,
  Car,
  Bus,
  FootprintsIcon as Walk,
  MapPinIcon,
  RefreshCw,
  Map as MapIcon,
  X,
  Heart,
} from "lucide-react";
import { useTheme } from "./theme-provider";
import HealthUnitDetails from "./health-unit-details";
import FavoritesModal from "./favorites-modal";
import { useFavorites, LocalFavorite } from "@/hooks/use-favorites";

declare global {
  interface Window {
    google: any;
  }
}

interface HealthUnitLocatorProps {
  apiKey: string;
}

interface HealthUnit {
  id: string;
  name: string;
  address: string;
  location: any;
  distance?: string;
  duration?: string;
  openNow?: boolean;
  rating?: number;
  phoneNumber?: string;
  website?: string;
  photos?: any[];
  types?: string[];
}

export default function HealthUnitLocator({ apiKey }: HealthUnitLocatorProps) {
  const [map, setMap] = useState<any>(null);
  const [healthUnits, setHealthUnits] = useState<HealthUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<HealthUnit | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [transportMode, setTransportMode] = useState<string>("DRIVING");
  const [showMobileMap, setShowMobileMap] = useState<boolean>(false);
  const [isUsingDefaultLocation, setIsUsingDefaultLocation] =
    useState<boolean>(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mobileMapRef = useRef<HTMLDivElement>(null);
  const markers = useRef<any[]>([]);
  const infoWindow = useRef<any>(null);
  const isAnimating = useRef(false);
  const distanceMatrixCache = useRef<Map<string, any>>(new Map());
  const { theme } = useTheme();
  const { toggleFavorite, isFavorite } = useFavorites();

  const convertFavoriteToHealthUnit = (favorite: LocalFavorite): HealthUnit => {
    return {
      id: favorite.id,
      name: favorite.name,
      address: favorite.address,
      location: new window.google.maps.LatLng(
        favorite.latitude,
        favorite.longitude
      ),
      rating: favorite.rating,
      phoneNumber: favorite.phoneNumber,
      website: favorite.website,
      types: favorite.types,
    };
  };

  const formatDuration = (duration: string) => {
    return duration?.replace(/mins/g, "min") || "";
  };

  const getMapStyles = useCallback(() => {
    if (theme === "dark") {
      return [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
        {
          featureType: "administrative",
          elementType: "geometry",
          stylers: [{ color: "#757575" }],
        },
        {
          featureType: "administrative.country",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9e9e9e" }],
        },
        {
          featureType: "administrative.land_parcel",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#bdbdbd" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#757575" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#181818" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#616161" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#1b1b1b" }],
        },
        {
          featureType: "road",
          elementType: "geometry.fill",
          stylers: [{ color: "#2c2c2c" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#8a8a8a" }],
        },
        {
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [{ color: "#373737" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#3c3c3c" }],
        },
        {
          featureType: "road.highway.controlled_access",
          elementType: "geometry",
          stylers: [{ color: "#4e4e4e" }],
        },
        {
          featureType: "road.local",
          elementType: "labels.text.fill",
          stylers: [{ color: "#616161" }],
        },
        {
          featureType: "transit",
          elementType: "labels.text.fill",
          stylers: [{ color: "#757575" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#000000" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#3d3d3d" }],
        },
      ];
    }
    return [];
  }, [theme]);

  useEffect(() => {
    if (map) {
      map.setOptions({ styles: getMapStyles() });
    }
  }, [map, theme, getMapStyles]);

  const getUserLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      };

      let retries = 0;
      const maxRetries = 2;

      const tryGetLocation = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(position);
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              toast({
                title: "Permissão de localização negada",
                description:
                  "Usando localização padrão (São Luís, MA). Você pode tentar novamente clicando no banner.",
                variant: "destructive",
              });
              reject(error);
              return;
            }

            if (retries < maxRetries) {
              retries++;
              setTimeout(tryGetLocation, 1000);
            } else {
              let errorMessage = "Erro desconhecido na localização";
              switch (error.code) {
                case error.POSITION_UNAVAILABLE:
                  errorMessage = "Informações de localização indisponíveis";
                  break;
                case error.TIMEOUT:
                  errorMessage = "Timeout na requisição de localização";
                  break;
              }

              toast({
                title: "Não foi possível obter sua localização",
                description: `${errorMessage}. Usando localização padrão (São Luís, MA).`,
                variant: "destructive",
              });

              reject(error);
            }
          },
          options
        );
      };

      tryGetLocation();
    });
  }, []);

  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey,
        version: "weekly",
        libraries: ["places"],
      });

      try {
        await loader.load();
        infoWindow.current = new window.google.maps.InfoWindow();

        try {
          const position = await getUserLocation();
          const { latitude, longitude } = position.coords;
          const userPos = new window.google.maps.LatLng(latitude, longitude);
          setUserLocation(userPos);
          setIsUsingDefaultLocation(false);

          const mapInstance = new window.google.maps.Map(mapRef.current!, {
            center: userPos,
            zoom: 14,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            styles: getMapStyles(),
          });

          new window.google.maps.Marker({
            position: userPos,
            map: mapInstance,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4f46e5",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            },
            title: "Sua localização",
          });

          setMap(mapInstance);
          findNearbyHealthUnits(mapInstance, userPos);

          toast({
            title: "Localização obtida com sucesso",
            description: "Encontrando unidades de saúde próximas a você...",
          });
        } catch (locationError) {
          const defaultPos = new window.google.maps.LatLng(
            -2.5318674185944796,
            -44.300045193733375
          );
          setUserLocation(defaultPos);
          setIsUsingDefaultLocation(true);

          const mapInstance = new window.google.maps.Map(mapRef.current!, {
            center: defaultPos,
            zoom: 14,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            styles: getMapStyles(),
          });

          new window.google.maps.Marker({
            position: defaultPos,
            map: mapInstance,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#ff6b6b",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            },
            title: "Localização padrão (São Luís, MA)",
          });

          setMap(mapInstance);
          findNearbyHealthUnits(mapInstance, defaultPos);
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error);
        setLoading(false);
        toast({
          title: "Erro ao carregar o mapa",
          description:
            "Não foi possível inicializar o Google Maps. Verifique sua conexão.",
          variant: "destructive",
        });
      }
    };

    initMap();
  }, [apiKey, getMapStyles, getUserLocation]);

  const findNearbyHealthUnits = useCallback(
    async (mapInstance: any, location: any) => {
      setLoading(true);

      if (!window.google) return;

      const service = new window.google.maps.places.PlacesService(mapInstance);

      const request = {
        location,
        radius: 5000,
        type: "hospital",
        keyword: "unidade de saúde hospital clínica médica posto de saúde",
      };

      service.nearbySearch(request, async (results: any[], status: any) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results
        ) {
          markers.current.forEach((marker) => marker.setMap(null));
          markers.current = [];

          const units: HealthUnit[] = [];

          for (const place of results.slice(0, 20)) {
            if (place.geometry && place.geometry.location) {
              const unit: HealthUnit = {
                id: place.place_id!,
                name: place.name!,
                address: place.vicinity || place.formatted_address || "",
                location: place.geometry.location,
                openNow: place.opening_hours?.isOpen(),
                rating: place.rating,
                photos: place.photos,
                types: place.types,
              };

              const marker = new window.google.maps.Marker({
                position: place.geometry.location,
                map: mapInstance,
                title: place.name,
                icon: {
                  url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                },
              });

              marker.addListener("click", () => {
                const currentUnit =
                  healthUnits.find((u) => u.id === unit.id) || unit;
                setSelectedUnit(currentUnit);
                getPlaceDetails(unit.id);
              });

              markers.current.push(marker);
              units.push(unit);
            }
          }

          setHealthUnits(units);

          if (units.length > 0) {
            await getDistanceMatrix(units, location);
          }
          setLoading(false);
        } else {
          console.error("Error finding nearby health units:", status);
          setLoading(false);
        }
      });
    },
    []
  );

  const getDistanceMatrix = async (units: HealthUnit[], origin: any) => {
    if (!window.google || units.length === 0) return;

    const cacheKey = `${origin.lat()}-${origin.lng()}-${transportMode}`;

    if (distanceMatrixCache.current.has(cacheKey)) {
      const cachedData = distanceMatrixCache.current.get(cacheKey);
      setHealthUnits(cachedData);
      return;
    }

    const service = new window.google.maps.DistanceMatrixService();
    const destinations = units.map((unit) => unit.location);

    try {
      const response = await new Promise((resolve, reject) => {
        service.getDistanceMatrix(
          {
            origins: [origin],
            destinations,
            travelMode: transportMode as any,
            unitSystem: window.google.maps.UnitSystem.METRIC,
          },
          (result: any, status: any) => {
            if (status === "OK") {
              resolve(result);
            } else {
              reject(new Error(`Distance Matrix API error: ${status}`));
            }
          }
        );
      });

      const result = response as any;

      if (result.rows[0] && result.rows[0].elements) {
        const updatedUnits = units.map((unit, index) => {
          const element = result.rows[0].elements[index];
          if (element.status === "OK") {
            return {
              ...unit,
              distance: element.distance.text,
              duration: formatDuration(element.duration.text),
            };
          }
          return unit;
        });

        updatedUnits.sort((a, b) => {
          const distA = a.distance
            ? Number.parseInt(a.distance.replace(/[^\d]/g, ""))
            : Number.POSITIVE_INFINITY;
          const distB = b.distance
            ? Number.parseInt(b.distance.replace(/[^\d]/g, ""))
            : Number.POSITIVE_INFINITY;
          return distA - distB;
        });

        distanceMatrixCache.current.set(cacheKey, updatedUnits);
        setHealthUnits(updatedUnits);
      }
    } catch (error) {
      console.error("Error getting distance matrix:", error);
    }
  };

  const smoothPanAndZoom = useCallback(
    (targetLocation: any, targetZoom = 16, duration = 800) => {
      if (!map || !targetLocation || isAnimating.current) return;

      isAnimating.current = true;

      const start = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng(),
        zoom: map.getZoom(),
      };
      const end = {
        lat:
          typeof targetLocation.lat === "function"
            ? targetLocation.lat()
            : targetLocation.lat,
        lng:
          typeof targetLocation.lng === "function"
            ? targetLocation.lng()
            : targetLocation.lng,
        zoom: targetZoom,
      };

      const frameCount = Math.round(duration / 16);
      let frame = 0;

      function lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
      }

      function animate() {
        frame++;
        const t = Math.min(frame / frameCount, 1);

        const lat = lerp(start.lat, end.lat, t);
        const lng = lerp(start.lng, end.lng, t);
        const zoom = lerp(start.zoom, end.zoom, t);

        map.setCenter({ lat, lng });
        map.setZoom(zoom);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          map.setCenter({ lat: end.lat, lng: end.lng });
          map.setZoom(end.zoom);
          isAnimating.current = false;
        }
      }

      animate();
    },
    [map]
  );

  const getPlaceDetails = (placeId: string) => {
    if (!map || !window.google) return;

    const service = new window.google.maps.places.PlacesService(map);

    service.getDetails(
      {
        placeId,
        fields: [
          "name",
          "formatted_address",
          "formatted_phone_number",
          "opening_hours",
          "website",
          "rating",
          "user_ratings_total",
          "photos",
          "geometry",
          "types",
          "url",
        ],
      },
      (place: any, status: any) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place &&
          place.geometry
        ) {
          const existingUnit = healthUnits.find((unit) => unit.id === placeId);

          const updatedUnit: HealthUnit = {
            id: placeId,
            name: place.name!,
            address: place.formatted_address || existingUnit?.address || "",
            location: place.geometry.location!,
            openNow: place.opening_hours?.isOpen(),
            phoneNumber: place.formatted_phone_number,
            website: place.website,
            rating: place.rating,
            photos: place.photos,
            types: place.types,

            distance: existingUnit?.distance,
            duration: existingUnit?.duration,
          };

          setSelectedUnit(updatedUnit);

          smoothPanAndZoom(updatedUnit.location);

          setHealthUnits((prev) =>
            prev.map((unit) =>
              unit.id === placeId ? { ...unit, ...updatedUnit } : unit
            )
          );
        } else {
          console.error("Error getting place details:", status);
        }
      }
    );
  };

  const retryUserLocation = async () => {
    if (!map) return;

    try {
      setLoading(true);
      const position = await getUserLocation();
      const { latitude, longitude } = position.coords;
      const userPos = new window.google.maps.LatLng(latitude, longitude);

      setUserLocation(userPos);
      setIsUsingDefaultLocation(false);

      markers.current.forEach((marker) => marker.setMap(null));
      markers.current = [];

      new window.google.maps.Marker({
        position: userPos,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4f46e5",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        title: "Sua localização",
      });

      smoothPanAndZoom(userPos);

      await findNearbyHealthUnits(map, userPos);

      toast({
        title: "Localização atualizada",
        description: "Sua localização foi obtida com sucesso!",
      });
    } catch (error: any) {
      if (error.code !== 1) {
        toast({
          title: "Erro ao obter localização",
          description:
            "Não foi possível obter sua localização. Continuando com a localização atual.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!map || !userLocation || !searchQuery.trim()) return;

    const service = new window.google.maps.places.PlacesService(map);

    const request = {
      location: userLocation,
      radius: 10000,
      type: "hospital",
      keyword: searchQuery,
    };

    service.nearbySearch(request, async (results: any[], status: any) => {
      if (
        status === window.google.maps.places.PlacesServiceStatus.OK &&
        results
      ) {
        markers.current.forEach((marker) => marker.setMap(null));
        markers.current = [];

        const units: HealthUnit[] = [];

        for (const place of results.slice(0, 20)) {
          if (place.geometry && place.geometry.location) {
            const unit: HealthUnit = {
              id: place.place_id!,
              name: place.name!,
              address: place.vicinity || place.formatted_address || "",
              location: place.geometry.location,
              openNow: place.opening_hours?.isOpen(),
              rating: place.rating,
              photos: place.photos,
              types: place.types,
            };

            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map,
              title: place.name,
              icon: {
                url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              },
            });

            marker.addListener("click", () => {
              const currentUnit =
                healthUnits.find((u) => u.id === unit.id) || unit;
              setSelectedUnit(currentUnit);
              getPlaceDetails(unit.id);
            });

            markers.current.push(marker);
            units.push(unit);
          }
        }

        setHealthUnits(units);

        if (units.length > 0) {
          await getDistanceMatrix(units, userLocation);
        }
      } else {
        console.error("Error searching health units:", status);
      }
    });
  };

  const handleTransportModeChange = (mode: string) => {
    setTransportMode(mode);
    if (userLocation && healthUnits.length > 0) {
      getDistanceMatrix(healthUnits, userLocation);
    }
  };

  useEffect(() => {
    return () => {
      markers.current.forEach((marker) => marker.setMap(null));
      markers.current = [];
      distanceMatrixCache.current.clear();
    };
  }, []);

  useEffect(() => {
    if (showMobileMap && mobileMapRef.current && map && window.google) {
      const mobileMapInstance = new window.google.maps.Map(
        mobileMapRef.current,
        {
          center: map.getCenter(),
          zoom: map.getZoom(),
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          styles: getMapStyles(),
        }
      );

      markers.current.forEach((marker) => {
        const newMarker = new window.google.maps.Marker({
          position: marker.getPosition(),
          map: mobileMapInstance,
          title: marker.getTitle(),
          icon: marker.getIcon(),
        });

        newMarker.addListener("click", () => {
          const unit = healthUnits.find((u) => u.name === marker.getTitle());
          if (unit) {
            setSelectedUnit(unit);
            getPlaceDetails(unit.id);
          }
        });
      });

      if (userLocation) {
        new window.google.maps.Marker({
          position: userLocation,
          map: mobileMapInstance,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: isUsingDefaultLocation ? "#ff6b6b" : "#4f46e5",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
          title: isUsingDefaultLocation
            ? "Localização padrão (São Luís, MA)"
            : "Sua localização",
        });
      }
    }
  }, [
    showMobileMap,
    map,
    getMapStyles,
    userLocation,
    isUsingDefaultLocation,
    healthUnits,
  ]);

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="bg-card border-b py-3">
        <div className="hidden md:flex items-center">
          <div className="w-96 flex justify-start">
            <div className="w-full px-4">
              <FavoritesModal
                onSelectUnit={(unit) => {
                  const healthUnit = convertFavoriteToHealthUnit(unit);
                  setSelectedUnit(healthUnit);

                  if (map) {
                    const position = new window.google.maps.LatLng(
                      unit.latitude,
                      unit.longitude
                    );
                    map.setCenter(position);
                    map.setZoom(15);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex-1 mr-2">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Busca..."
                className="pl-10 rounded-lg w-full h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
        </div>

        <div className="md:hidden flex items-center gap-3 px-4 w-full">
          <div className="flex-shrink-0">
            <FavoritesModal
              onSelectUnit={(unit) => {
                const healthUnit = convertFavoriteToHealthUnit(unit);
                setSelectedUnit(healthUnit);

                if (map) {
                  const position = new window.google.maps.LatLng(
                    unit.latitude,
                    unit.longitude
                  );
                  map.setCenter(position);
                  map.setZoom(15);
                }
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Busca de unidades..."
                className="pl-10 rounded-lg w-full h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
        </div>
      </header>

      {isUsingDefaultLocation && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b border-orange-200 dark:border-orange-800/50 px-4 md:px-0 py-3 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center justify-center gap-3 min-w-0 sm:ml-0 md:ml-4">
              <div className="flex-shrink-0 p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                <MapPinIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Usando localização padrão
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] md:text-xs border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300"
                  >
                    São Luís, MA
                  </Badge>
                </div>
                <span className="text-xs text-orange-700 dark:text-orange-300 block">
                  Toque para tentar obter sua localização atual e melhorar os
                  resultados
                </span>
              </div>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={retryUserLocation}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white shadow-sm h-9 px-4 flex-shrink-0 sm:mr-0 md:mr-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Tentar novamente
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 h-full overflow-hidden">
        <div className="sidebar-container w-full md:w-96 md:flex-shrink-0 md:max-w-96 bg-card overflow-hidden flex flex-col rounded-l-lg">
          <div className="px-4 pt-4 ">
            <Tabs
              defaultValue="DRIVING"
              onValueChange={handleTransportModeChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 rounded-lg">
                <TabsTrigger
                  value="DRIVING"
                  className="flex items-center gap-1 rounded-lg transition-all duration-300 ease-in-out"
                >
                  <Car className="h-4 w-4" />
                  <span className="hidden sm:inline">Carro</span>
                </TabsTrigger>
                <TabsTrigger
                  value="TRANSIT"
                  className="flex items-center gap-1 rounded-lg transition-all duration-300 ease-in-out"
                >
                  <Bus className="h-4 w-4" />
                  <span className="hidden sm:inline">Ônibus</span>
                </TabsTrigger>
                <TabsTrigger
                  value="WALKING"
                  className="flex items-center gap-1 rounded-lg transition-all duration-300 ease-in-out"
                >
                  <Walk className="h-4 w-4" />
                  <span className="hidden sm:inline">A pé</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-2 transition-all duration-300 ease-in-out relative overflow-visible"></div>
            </Tabs>
          </div>

          <ScrollArea className="flex-1 border-t">
            <div className="transition-all duration-300 ease-in-out relative overflow-visible">
              <div
                key={transportMode}
                className="p-4 space-y-4 cards-container data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-2"
              >
                {loading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Card
                        key={i}
                        className="cursor-pointer hover:bg-muted/50 transition-all duration-300 ease-in-out rounded-lg animate-in fade-in-50 slide-in-from-bottom-2 h-40 flex flex-col"
                        style={{
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: "0.3s",
                          animationFillMode: "both",
                        }}
                      >
                        <CardHeader className="p-3 pb-2 flex-shrink-0">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent className="px-3 pb-3 pt-1 flex-1 flex flex-col justify-end">
                          <div className="flex items-center justify-between gap-3 pt-2">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                              <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-16" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : healthUnits.length > 0 ? (
                  healthUnits.map((unit, index) => (
                    <Card
                      key={unit.id}
                      className={`health-unit-card cursor-pointer rounded-lg transition-all duration-300 ease-in-out animate-in fade-in-50 slide-in-from-bottom-2 h-40 flex flex-col w-full max-w-full overflow-hidden ${
                        selectedUnit?.id === unit.id
                          ? "border-primary ring-1 ring-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                      data-selected={selectedUnit?.id === unit.id}
                      style={{
                        animationDelay: `${index * 0.05}s`,
                        animationDuration: "0.3s",
                        animationFillMode: "both",
                      }}
                      onClick={() => {
                        const currentUnit =
                          healthUnits.find((u) => u.id === unit.id) || unit;
                        setSelectedUnit(currentUnit);
                        getPlaceDetails(unit.id);
                      }}
                    >
                      <CardHeader className="p-3 pb-2 flex-shrink-0 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="card-title text-base font-semibold text-foreground leading-tight mb-1 break-words line-clamp-1 md:line-clamp-2 min-w-0">
                              {unit.name}
                            </CardTitle>
                            <CardDescription className="card-description flex items-start gap-2 text-sm text-muted-foreground min-w-0">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="leading-tight break-words line-clamp-1 md:line-clamp-2 min-w-0 overflow-hidden">
                                {unit.address}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 pb-3 pt-1 flex-1 flex flex-col justify-end min-w-0">
                        <div className="flex items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <Navigation className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="distance-info text-sm text-foreground truncate font-medium">
                                {unit.distance || "Calculando..."}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="distance-info text-sm text-foreground truncate font-medium">
                                {formatDuration(unit.duration ?? "") ||
                                  "Calculando..."}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-start pt-2">
                          {unit.openNow !== undefined && (
                            <Badge
                              className={`health-unit-status-badge text-xs h-5 px-2 py-0.5 font-semibold rounded-md ${
                                unit.openNow ? "open" : "closed"
                              }`}
                            >
                              {unit.openNow ? "Aberto" : "Fechado"}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Info className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Nenhuma unidade de saúde encontrada.</p>
                    <p className="text-sm">
                      Tente ajustar sua busca ou localização.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col h-full">
          <div
            ref={mapRef}
            className="hidden md:block flex-1 rounded-lg mt-2 mr-2 mb-2"
          />

          <div
            className={
              "w-full " +
              (typeof window !== "undefined" && window.innerWidth < 768
                ? "fixed md:hidden bottom-0 left-0 right-0 z-40"
                : "")
            }
          >
            {selectedUnit && (
              <HealthUnitDetails
                unit={selectedUnit}
                onClose={() => setSelectedUnit(null)}
              />
            )}
          </div>
        </div>
      </div>

      {showMobileMap && (
        <div className="md:hidden fixed inset-0 bg-background z-50 flex flex-col">
          <div className="bg-card border-b p-4 flex items-center justify-between flex-shrink-0">
            <h2 className="text-lg font-semibold">Encontre Unidades no Mapa</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileMap(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1">
              <div ref={mobileMapRef} className="w-full h-full" />
            </div>

            {selectedUnit && (
              <div className="bg-card border-t flex-shrink-0">
                <HealthUnitDetails
                  unit={selectedUnit}
                  onClose={() => setSelectedUnit(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      <Button
        className="md:hidden fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg floating-button-safe"
        onClick={() => setShowMobileMap(true)}
      >
        <MapIcon className="h-6 w-6 scale-[1.8]" />
      </Button>
    </div>
  );
}
