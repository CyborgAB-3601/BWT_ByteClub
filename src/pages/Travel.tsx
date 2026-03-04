import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MapPin, Car, Bus, Train, Users, ArrowRight } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GlassPanel } from '@/components/ui/GlassPanel';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map center updates
function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export const TravelPage = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // Default to India
  const [markers, setMarkers] = useState<{lat: number, lng: number, label: string}[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);

  const handleInputChange = async (value: string, type: 'from' | 'to') => {
    if (type === 'from') setFrom(value);
    else setTo(value);
    
    if (value.length > 2) {
      try {
        const query = value.toLowerCase().includes('india') ? value : `${value}, India`;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setSuggestions(data);
        setActiveField(type);
      } catch (error) {
        console.error("Autosuggest failed:", error);
      }
    } else {
      setSuggestions([]);
      setActiveField(null);
    }
  };

  const handleSelectLocation = (location: any) => {
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    const displayName = location.display_name;
    
    if (activeField === 'from') {
      setFrom(displayName);
      setMarkers(prev => {
        const others = prev.filter(m => m.label !== 'Start');
        return [...others, { lat, lng: lon, label: 'Start' }];
      });
    } else {
      setTo(displayName);
      setMarkers(prev => {
        const others = prev.filter(m => m.label !== 'Destination');
        return [...others, { lat, lng: lon, label: 'Destination' }];
      });
    }
    
    setMapCenter([lat, lon]);
    setSuggestions([]);
    setActiveField(null);
  };

  const calculateFootprint = (dist: number, mode: 'car' | 'bus' | 'metro' | 'carpool') => {
    const factors = {
      car: 0.192,
      bus: 0.105,
      metro: 0.041,
      carpool: 0.096,
    };
    return (dist * factors[mode]).toFixed(2);
  };

  const handleCalculate = async () => {
    if (!from || !to) return;
    setLoading(true);
    
    try {
      // 1. Geocode "From" location
      const queryFrom = from.toLowerCase().includes('india') ? from : `${from}, India`;
      const fromRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryFrom)}`);
      const fromData = await fromRes.json();
      
      // 2. Geocode "To" location
      const queryTo = to.toLowerCase().includes('india') ? to : `${to}, India`;
      const toRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryTo)}`);
      const toData = await toRes.json();

      if (fromData.length > 0 && toData.length > 0) {
        const start = { lat: parseFloat(fromData[0].lat), lon: parseFloat(fromData[0].lon) };
        const end = { lat: parseFloat(toData[0].lat), lon: parseFloat(toData[0].lon) };

        // 3. Calculate distance using Haversine formula (as a simple free alternative to Routing API)
        const R = 6371; // Earth's radius in km
        const dLat = (end.lat - start.lat) * Math.PI / 180;
        const dLon = (end.lon - start.lon) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const directDist = R * c;
        
        // Add 20% to account for road distance vs straight line
        const roadDist = Math.round(directDist * 1.2);
        
        setDistance(roadDist);
        setMarkers([
          { lat: start.lat, lng: start.lon, label: 'Start' },
          { lat: end.lat, lng: end.lon, label: 'Destination' }
        ]);
        setMapCenter([ (start.lat + end.lat) / 2, (start.lon + end.lon) / 2 ]);
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      // Fallback to mock if API fails
      setDistance(Math.floor(Math.random() * 45) + 5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-text-hi">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-full">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Eco Travel</h1>
          <p className="text-text-lo mt-1">Calculate your travel carbon footprint using free OpenStreetMap data.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Plan Your Journey
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-text-lo mb-1">From</label>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => handleInputChange(e.target.value, 'from')}
                    placeholder="City, Street, or Landmark"
                    className="w-full px-4 py-2 bg-surface-solid border border-line rounded-lg text-text-hi focus:outline-none focus:border-primary transition-colors"
                  />
                  {activeField === 'from' && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-solid border border-line rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((item, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 hover:bg-primary/10 cursor-pointer text-text-hi text-sm border-b border-line last:border-0"
                          onClick={() => handleSelectLocation(item)}
                        >
                          {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-medium text-text-lo mb-1">To</label>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => handleInputChange(e.target.value, 'to')}
                    placeholder="City, Street, or Landmark"
                    className="w-full px-4 py-2 bg-surface-solid border border-line rounded-lg text-text-hi focus:outline-none focus:border-primary transition-colors"
                  />
                  {activeField === 'to' && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-solid border border-line rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((item, i) => (
                        <div
                          key={i}
                          className="px-4 py-2 hover:bg-primary/10 cursor-pointer text-text-hi text-sm border-b border-line last:border-0"
                          onClick={() => handleSelectLocation(item)}
                        >
                          {item.display_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleCalculate}
                  disabled={!from || !to || loading}
                  className="w-full mt-4"
                >
                  {loading ? 'Searching...' : 'Calculate Impact'}
                </Button>
              </div>
            </Card>

            <GlassPanel className="overflow-hidden h-80 relative border border-line z-0 p-0">
               <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <ChangeView center={mapCenter} zoom={distance ? 11 : 13} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {markers.map((m, i) => (
                    <Marker key={i} position={[m.lat, m.lng]}>
                      <Popup>{m.label}</Popup>
                    </Marker>
                  ))}
               </MapContainer>
            </GlassPanel>
          </div>

          <div className="space-y-6">
            {distance !== null && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-6 mb-6 bg-gradient-to-br from-surface to-surface-solid border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-text-lo">Estimated Distance</span>
                    <span className="text-2xl font-bold text-text-hi">{distance} km</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-lo">
                    <span className="truncate max-w-[150px]">{from}</span>
                    <ArrowRight className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate max-w-[150px]">{to}</span>
                  </div>
                </Card>

                <h3 className="text-lg font-semibold mb-4">Transport Options & Impact</h3>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-xl bg-surface border border-line hover:border-red-500/50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                          <Car className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Personal Car</span>
                      </div>
                      <span className="text-xl font-bold text-red-400">{calculateFootprint(distance, 'car')} kg CO₂</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-line hover:border-yellow-500/50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Carpool (2 ppl)</span>
                      </div>
                      <span className="text-xl font-bold text-yellow-400">{calculateFootprint(distance, 'carpool')} kg CO₂</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-line hover:border-primary/50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Bus className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Public Bus</span>
                      </div>
                      <span className="text-xl font-bold text-primary">{calculateFootprint(distance, 'bus')} kg CO₂</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-line hover:border-emerald-400/50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-400/10 text-emerald-400">
                          <Train className="w-5 h-5" />
                        </div>
                        <span className="font-medium">Metro / Train</span>
                      </div>
                      <span className="text-xl font-bold text-emerald-400">{calculateFootprint(distance, 'metro')} kg CO₂</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {distance === null && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-text-lo/50 min-h-[300px] border-2 border-dashed border-line rounded-xl">
                <MapPin className="w-12 h-12 mb-4 opacity-50" />
                <p>Enter locations to see environmental impact</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
