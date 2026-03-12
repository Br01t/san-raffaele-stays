import { UtensilsCrossed, Wifi, AirVent, BedDouble, ParkingCircle, Wind } from "lucide-react";

const amenities = [
  { icon: UtensilsCrossed, label: "CUCINA ATTREZZATA" },
  { icon: Wifi,            label: "WI-FI GRATUITO" },
  { icon: AirVent,         label: "ARIA CONDIZIONATA" },
  { icon: BedDouble,       label: "4 POSTI LETTO" },
  { icon: ParkingCircle,   label: "PARCHEGGIO GRATUITO" },
  { icon: Wind,            label: "PHON IN CAMERA" },
];

const AmenityStrip = () => (
  <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-border">
    {amenities.map(({ icon: Icon, label }) => (
      <div key={label} className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground leading-tight tracking-wide">
          {label}
        </span>
      </div>
    ))}
  </div>
);

export default AmenityStrip;
