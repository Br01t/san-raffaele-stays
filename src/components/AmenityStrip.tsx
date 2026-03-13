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
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
  {amenities.map((a) => (
    <div key={a.label} className="bg-card rounded-2xl p-6 card-shadow text-center">
      <a.icon className="w-10 h-10 text-primary mx-auto mb-3" />
      <span className="text-sm font-medium">{a.label}</span>
    </div>
  ))}
</div>
);

export default AmenityStrip;
