"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import {
  X,
  MapPin,
  Clock,
  Phone,
  Globe,
  Star,
  Navigation,
  Calendar,
  Info,
  Heart,
} from "lucide-react";
import { useFavorites } from "@/hooks/use-favorites";

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

interface HealthUnitDetailsProps {
  unit: HealthUnit;
  onClose: () => void;
}

export default function HealthUnitDetails({
  unit,
  onClose,
}: HealthUnitDetailsProps) {
  const [activeTab, setActiveTab] = useState("info");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const { toggleFavorite, checkIfFavorite } = useFavorites();

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const isFavorited = await checkIfFavorite(unit.id);
      setIsFav(isFavorited);
    };

    checkFavoriteStatus();
  }, [unit.id, checkIfFavorite]);

  // Escutar eventos de mudança nos favoritos
  useEffect(() => {
    const handleFavoriteChange = async (event: CustomEvent) => {
      const { favoriteId } = event.detail;
      if (favoriteId === unit.id) {
        const newStatus = await checkIfFavorite(unit.id);
        setIsFav(newStatus);
      }
    };

    const handleFavoriteAdded = (event: Event) =>
      handleFavoriteChange(event as CustomEvent);
    const handleFavoriteRemoved = (event: Event) =>
      handleFavoriteChange(event as CustomEvent);

    window.addEventListener("favoriteAdded", handleFavoriteAdded);
    window.addEventListener("favoriteRemoved", handleFavoriteRemoved);

    return () => {
      window.removeEventListener("favoriteAdded", handleFavoriteAdded);
      window.removeEventListener("favoriteRemoved", handleFavoriteRemoved);
    };
  }, [unit.id, checkIfFavorite]);

  const formatType = (type: string) => {
    const typeMap: Record<string, string> = {
      hospital: "Hospital",
      health: "Saúde",
      doctor: "Médico",
      pharmacy: "Farmácia",
      physiotherapist: "Fisioterapeuta",
      dentist: "Dentista",
      health_clinic: "Clínica de Saúde",
      medical_clinic: "Clínica Médica",
      emergency_clinic: "Clínica de Emergência",
      emergency_room: "Sala de Emergência",
      clinic: "Clínica",
      point_of_interest: "Ponto de Interesse",
      establishment: "Estabelecimento",
    };

    return typeMap[type] || type.replace(/_/g, " ");
  };

  const getPhotoUrl = (photo: any | undefined) => {
    if (!photo) {
      return "/placeholder.svg?height=300&width=400";
    }

    try {
      if (typeof photo.getUrl === "function") {
        const url = photo.getUrl({ maxWidth: 800, maxHeight: 600 });
        return url;
      } else if (
        photo.html_attributions &&
        photo.html_attributions.length > 0
      ) {
        if (typeof photo.getUrl === "function") {
          return photo.getUrl({ maxWidth: 800, maxHeight: 600 });
        }
      } else if (typeof photo === "string") {
        return photo;
      } else {
        const url =
          photo.getUrl && photo.getUrl({ maxWidth: 800, maxHeight: 600 });
        if (url) {
          return url;
        }
      }
    } catch (error) {
      console.error("Error getting photo URL:", error);
    }

    return "/placeholder.svg?height=300&width=400";
  };

  const navigatePhotos = (direction: number) => {
    if (!unit.photos || unit.photos.length === 0) return;

    let newIndex = photoIndex + direction;
    if (newIndex < 0) newIndex = unit.photos.length - 1;
    if (newIndex >= unit.photos.length) newIndex = 0;

    setPhotoIndex(newIndex);
  };

  const openDirections = () => {
    if (!unit.location) return;

    try {
      const lat =
        typeof unit.location.lat === "function"
          ? unit.location.lat()
          : unit.location.lat;
      const lng =
        typeof unit.location.lng === "function"
          ? unit.location.lng()
          : unit.location.lng;
      const destination = `${lat},${lng}`;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${unit.id}`,
        "_blank"
      );
    } catch (error) {
      console.error("Error opening directions:", error);
    }
  };

  return (
    <div
      className="bg-card flex flex-col animate-fadeIn border-t md:border-t-0 overflow-hidden"
      style={{ height: "384px", minHeight: "384px", maxHeight: "384px" }}
    >
      <CardHeader className="flex flex-row items-start justify-between py-2 pb-2 mr-2 border-b flex-shrink-0 mb:px-0 px-4 md:pl-0">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-xl text-foreground truncate">
            {unit.name}
          </CardTitle>
          <CardDescription className="flex items-start gap-1 mt-1">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="truncate">{unit.address}</span>
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="flex-shrink-0 -mr-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <div className="flex-1 flex flex-col overflow-hidden mb:px-0 md:pl-0 px-2 ">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col"
        >
          <div className="py-2 px-2md:px-0 pt-2 flex-shrink-0">
            <TabsList className="w-full justify-start">
              <TabsTrigger
                value="info"
                className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 ease-in-out"
              >
                <Info className="h-4 w-4" />
                Informações
              </TabsTrigger>
              <TabsTrigger
                value="photos"
                className="flex items-center gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 ease-in-out"
              >
                <Calendar className="h-4 w-4" />
                Fotos
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden h-72">
            <TabsContent
              value="info"
              className="data-[state=active]:animate-in data-[state=active]:fade-in-50 data-[state=active]:slide-in-from-bottom-2 h-full"
            >
              <ScrollArea className="h-full ">
                <div className="py-2 space-y-3 md:px-0 px-2 ">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        Distância
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Navigation className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">
                          {unit.distance || "Não disponível"}
                        </span>
                      </div>
                    </div>

                    {unit.rating !== undefined && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-foreground">
                          Avaliação
                        </div>
                        <div className="flex items-center gap-1">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.round(unit.rating || 0)
                                    ? "text-yellow-400 fill-yellow-400 dark:text-yellow-300 dark:fill-yellow-300"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          <span className="text-sm ml-1 text-foreground">
                            {unit.rating}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        Website
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        <a
                          href={unit.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline max-w-[160px] truncate"
                        >
                          {unit.website || "Não disponivel"}
                        </a>
                      </div>
                    </div>

                    {unit.types && unit.types.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-foreground">
                          Tipo
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {unit.types
                            .filter(
                              (type) =>
                                ![
                                  "point_of_interest",
                                  "establishment",
                                ].includes(type)
                            )
                            .slice(0, 2)
                            .map((type, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {formatType(type)}
                              </Badge>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-foreground">
                        Tempo estimado
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">
                          {unit.duration || "Não disponível"}
                        </span>
                      </div>
                    </div>

                    {unit.openNow !== undefined && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-foreground">
                          Status
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant={unit.openNow ? "outline" : "secondary"}
                            className={unit.openNow ? "text-green-600" : ""}
                          >
                            {unit.openNow ? "Aberto" : "Fechado"}
                          </Badge>
                        </div>
                      </div>
                    )}

                    {unit.phoneNumber && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-foreground">
                          Telefone
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          <a
                            href={`https://api.whatsapp.com/send?phone=${unit.phoneNumber?.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            {unit.phoneNumber}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="photos" className="h-full">
              <ScrollArea className="h-full">
                <div className="py-2">
                  {unit.photos &&
                  Array.isArray(unit.photos) &&
                  unit.photos.length > 0 ? (
                    <div className="relative rounded-lg overflow-hidden h-44">
                      <img
                        src={getPhotoUrl(unit.photos[photoIndex])}
                        alt={`${unit.name} - foto ${photoIndex + 1}`}
                        className="w-full h-full object-contain bg-muted/20"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg?height=300&width=400";
                        }}
                      />

                      {unit.photos.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1">
                          {unit.photos.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setPhotoIndex(i)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                i === photoIndex ? "bg-white" : "bg-white/50"
                              }`}
                              aria-label={`Ver foto ${i + 1}`}
                            />
                          ))}
                        </div>
                      )}

                      {unit.photos.length > 1 && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/40 text-white rounded-full p-1"
                            onClick={() => navigatePhotos(-1)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="m15 18-6-6 6-6" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/40 text-white rounded-full p-1"
                            onClick={() => navigatePhotos(1)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4"
                            >
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          </Button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-44 text-muted-foreground rounded-lg bg-muted/20 border-2 border-dashed border-muted">
                      <Info className="h-16 w-16 mb-4 opacity-30" />
                      <p className="text-lg font-medium">
                        Nenhuma foto disponível
                      </p>
                      <p className="text-sm mt-1">
                        Esta unidade de saúde não possui fotos no momento
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>

          <div className="absolute inset-x-0 bottom-2 border-t pt-2 md:mr-2 px-4 md:px-0  bg-card flex-shrink-0 ">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={isFav ? "default" : "outline"}
                onClick={async () => {
                  await toggleFavorite(unit);
                  const newStatus = await checkIfFavorite(unit.id);
                  setIsFav(newStatus);
                }}
                className="flex-1"
              >
                <Heart
                  className={`h-4 w-4 mr-2 ${
                    isFav ? "fill-current text-red-500" : ""
                  }`}
                />
                {isFav ? "Favoritado" : "Favoritar"}
              </Button>
              <Button onClick={openDirections} className="flex-1">
                <Navigation className="h-4 w-4 mr-2" />
                Como chegar
              </Button>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
