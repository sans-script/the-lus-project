"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  MapPin,
  Star,
  Phone,
  Globe,
  Trash2,
  Calendar,
  Info,
} from "lucide-react";
import { useFavorites, LocalFavorite } from "@/hooks/use-favorites";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FavoritesListProps {
  onSelectUnit?: (unit: LocalFavorite) => void;
}

export default function FavoritesList({ onSelectUnit }: FavoritesListProps) {
  const { favorites, loading, removeFavorite } = useFavorites();
  const [selectedUnit, setSelectedUnit] = useState<LocalFavorite | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4 text-center">
        <p className="text-muted-foreground">Carregando favoritos...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col p-8 text-center items-center justify-center">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nenhum favorito ainda
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adicione unidades de saúde aos seus favoritos para acessá-las
          rapidamente
        </p>
      </div>
    );
  }

  const formatType = (type: string) => {
    const typeMap: Record<string, string> = {
      hospital: "Hospital",
      pharmacy: "Farmácia",
      doctor: "Médico",
      health: "Saúde",
      dentist: "Dentista",
      physiotherapist: "Fisioterapeuta",
      establishment: "Estabelecimento",
      point_of_interest: "Ponto de Interesse",
    };
    return typeMap[type] || type.replace(/_/g, " ");
  };

  const handleRemoveFavorite = (unitId: string, unitName: string) => {
    removeFavorite(unitId);
  };

  const handleSelectUnit = (unit: LocalFavorite) => {
    setSelectedUnit(unit);
    if (onSelectUnit) {
      onSelectUnit(unit);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Meus Favoritos
          </h2>
          <p className="text-sm text-muted-foreground">
            {favorites.length} unidade{favorites.length !== 1 ? "s" : ""} salva
            {favorites.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 px-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent p-4">
        <div className="space-y-4 pb-4">
          {favorites.map((unit) => (
            <Card
              key={unit.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => handleSelectUnit(unit)}
            >
              <CardHeader className="pb-2 px-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-base leading-tight line-clamp-2">
                      {unit.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="line-clamp-1">{unit.address}</span>
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[90vw] max-w-md mx-auto rounded-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg">
                          Remover dos favoritos
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm break-words">
                          Tem certeza que deseja remover "
                          <span className="font-medium break-all">
                            {unit.name}
                          </span>
                          " da sua lista de favoritos? Esta ação não pode ser
                          desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">
                          Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                          onClick={() =>
                            handleRemoveFavorite(unit.id, unit.name)
                          }
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-3 px-3">
                <div className="space-y-2">
                  {unit.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{unit.rating}</span>
                    </div>
                  )}

                  {(unit.phoneNumber || unit.website) && (
                    <div className="flex flex-wrap gap-3">
                      {unit.phoneNumber && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span className="line-clamp-1 max-w-[120px]">
                            {unit.phoneNumber}
                          </span>
                        </div>
                      )}
                      {unit.website && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          <span>Website</span>
                        </div>
                      )}
                    </div>
                  )}

                  {unit.types && unit.types.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {unit.types.slice(0, 2).map((type, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs px-2 py-0"
                        >
                          {formatType(type)}
                        </Badge>
                      ))}
                      {unit.types.length > 2 && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          +{unit.types.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(new Date(unit.addedAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
