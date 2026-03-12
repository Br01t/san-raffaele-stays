import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { X } from "lucide-react";

interface GalleryProps {
  images: string[];
  name: string;
}

const Gallery = ({ images, name }: GalleryProps) => {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
    setOpen(true);
  };

  return (
    <>
    <div className="flex flex-col gap-2 h-full">
      {/* Immagine principale grande */}
      <div 
        className="relative cursor-pointer group overflow-hidden rounded-xl h-64 sm:h-80 md:h-96"
        onClick={() => handleOpen(0)}
      >
        <img
          src={images[0]}
          alt={`${name} - Vista principale alloggio`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
      </div>

      {/* Griglia miniature sotto */}
      <div className="grid grid-cols-4 gap-2">
        {images.slice(1, 5).map((img, i) => (
          <button 
            key={i + 1} 
            className="relative cursor-pointer group overflow-hidden rounded-lg h-16 sm:h-20 md:h-24 block w-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => handleOpen(i + 1)}
            aria-label={`Visualizza foto ${i + 2} di ${name}`}
          >
            <img
              src={img}
              alt={`${name} - Miniatura foto ${i + 2}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs sm:text-sm font-semibold">
                +{images.length - 5}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-black/90 shadow-none flex items-center justify-center [&>button]:hidden">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Custom Close Button */}
            <button 
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 z-[60] bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors md:top-8 md:right-8 outline-none focus-visible:ring-2 focus-visible:ring-white"
              aria-label="Chiudi galleria immagini"
            >
              <X className="h-8 w-8" aria-hidden="true" />
            </button>

            <Carousel 
              opts={{
                startIndex: selectedIndex,
                loop: true,
              }}
              className="w-full max-w-5xl px-4"
            >
              <CarouselContent>
                {images.map((img, i) => (
                  <CarouselItem key={i} className="flex items-center justify-center">
                    <img
                      src={img}
                      alt={`${name} - Dettaglio alloggio foto ${i + 1}`}
                      className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                      loading="lazy"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious 
                className="left-4 md:-left-12 bg-white/90 hover:bg-white border-none text-primary h-12 w-12 sm:h-14 sm:w-14 shadow-lg scale-110 md:scale-125" 
                aria-label="Foto precedente"
              />
              <CarouselNext 
                className="right-4 md:-right-12 bg-white/90 hover:bg-white border-none text-primary h-12 w-12 sm:h-14 sm:w-14 shadow-lg scale-110 md:scale-125" 
                aria-label="Foto successiva"
              />
            </Carousel>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Gallery;
