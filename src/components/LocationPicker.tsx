"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, X } from "lucide-react";

interface LocationPickerProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  initialAddress?: string;
}

export default function LocationPicker({
  onLocationSelect,
  initialAddress = "",
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [address, setAddress] = useState(initialAddress);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const autocompleteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Verificar si Google Maps ya está cargado
    if (window.google && window.google.maps && window.google.maps.places) {
      initializeAutocomplete();
      return;
    }

    // Cargar Google Maps API solo si no está cargada
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Si el script ya existe, esperar a que cargue
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(checkGoogle);
          initializeAutocomplete();
        }
      }, 100);
      return () => clearInterval(checkGoogle);
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API Key no configurada. El selector de ubicación funcionará en modo manual.');
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        initializeAutocomplete();
      }
    };

    script.onerror = () => {
      console.error('Error al cargar Google Maps API');
    };
  }, []);

  const initializeAutocomplete = () => {
    if (!autocompleteRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteRef.current,
      {
        types: ["address"],
        componentRestrictions: { country: "mx" },
        fields: ["formatted_address", "geometry", "address_components"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location?.lat() || 0;
        const lng = place.geometry.location?.lng() || 0;
        const formattedAddress = place.formatted_address || "";

        setAddress(formattedAddress);
        setCoordinates({ lat, lng });
        onLocationSelect({
          address: formattedAddress,
          lat,
          lng,
        });
        setIsOpen(false);
      }
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("❌ Tu navegador no soporta geolocalización. Por favor, escribe tu dirección manualmente.");
      return;
    }

    setIsLoading(true);

    // Opciones para geolocalización
    const options = {
      enableHighAccuracy: true,
      timeout: 10000, // 10 segundos
      maximumAge: 0, // No usar caché
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          
          if (!apiKey) {
            // Si no hay API key, usar la ubicación directamente sin geocoding
            const manualAddress = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
            setAddress(manualAddress);
            setCoordinates({ lat: latitude, lng: longitude });
            onLocationSelect({
              address: manualAddress,
              lat: latitude,
              lng: longitude,
            });
            setIsLoading(false);
            alert("✅ Ubicación obtenida. Por favor, completa la dirección manualmente en el campo de texto.");
            return;
          }

          // Usar Geocoding API para obtener la dirección
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=es`
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.status === 'OK' && data.results && data.results.length > 0) {
            const formattedAddress = data.results[0].formatted_address;
            setAddress(formattedAddress);
            setCoordinates({ lat: latitude, lng: longitude });
            onLocationSelect({
              address: formattedAddress,
              lat: latitude,
              lng: longitude,
            });
            setIsOpen(false);
          } else if (data.status === 'ZERO_RESULTS') {
            alert("⚠️ No se encontró una dirección para esta ubicación. Por favor, escríbela manualmente.");
          } else {
            throw new Error(`Geocoding error: ${data.status}`);
          }
        } catch (error: any) {
          console.error("Error al obtener dirección:", error);
          // Intentar usar coordenadas directamente
          const manualAddress = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
          setAddress(manualAddress);
          setCoordinates({ lat: latitude, lng: longitude });
          onLocationSelect({
            address: manualAddress,
            lat: latitude,
            lng: longitude,
          });
          alert("⚠️ Se obtuvo tu ubicación pero no se pudo convertir a dirección. Por favor, completa la dirección manualmente.");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        setIsLoading(false);
        let errorMessage = "No se pudo obtener tu ubicación. ";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "❌ Permiso denegado. Por favor, permite el acceso a tu ubicación en la configuración del navegador y vuelve a intentar.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "⚠️ La información de ubicación no está disponible.";
            break;
          case error.TIMEOUT:
            errorMessage += "⏱️ La solicitud de ubicación expiró. Intenta de nuevo.";
            break;
          default:
            errorMessage += "❌ Error desconocido.";
            break;
        }
        
        errorMessage += "\n\n💡 Puedes escribir tu dirección manualmente en el campo de texto.";
        
        alert(errorMessage);
        console.error("Error de geolocalización:", error);
      },
      options
    );
  };

  const handleClear = () => {
    setAddress("");
    setCoordinates(null);
    onLocationSelect({
      address: "",
      lat: 0,
      lng: 0,
    });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Ubicación de Entrega *
      </label>

      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={autocompleteRef}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Busca tu dirección o comparte tu ubicación"
              className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
              onClick={() => setIsOpen(true)}
            />
            {address && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Usar mi ubicación actual"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                <span className="hidden sm:inline">Mi Ubicación</span>
              </>
            )}
          </button>
        </div>
      </div>

      {coordinates && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="font-medium">Ubicación seleccionada:</span>
            <span>{address}</span>
          </p>
        </div>
      )}

      <div className="mt-2 space-y-1">
        <p className="text-xs text-gray-500">
          💡 Escribe tu dirección o haz clic en "Mi Ubicación" para compartirla automáticamente
        </p>
        {typeof window !== "undefined" && !window.location.protocol.includes("https") && window.location.hostname !== "localhost" && (
          <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded border border-yellow-200">
            ⚠️ Nota: La geolocalización funciona mejor en HTTPS. Si estás en localhost, debería funcionar normalmente.
          </p>
        )}
      </div>
    </div>
  );
}

// Extender el tipo Window para incluir google
declare global {
  interface Window {
    google: any;
  }
}
