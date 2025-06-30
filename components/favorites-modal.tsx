"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import FavoritesList from "./favorites-list";
import { LocalFavorite } from "@/hooks/use-favorites";

interface FavoritesModalProps {
  onSelectUnit?: (unit: LocalFavorite) => void;
}

export default function FavoritesModal({ onSelectUnit }: FavoritesModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-auto md:w-full px-3 md:px-4 flex items-center justify-center gap-2"
        >
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Favoritos</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[85vw] md:w-[80vw] max-w-4xl h-[80vh] p-0 rounded-lg">
        <FavoritesList onSelectUnit={onSelectUnit} />
      </DialogContent>
    </Dialog>
  );
}
