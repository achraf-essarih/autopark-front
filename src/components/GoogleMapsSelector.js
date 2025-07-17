import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Clock, Route } from 'lucide-react';
import './GoogleMapsSelector.css';

const GoogleMapsSelector = ({ 
  onLocationSelect, 
  onDistanceCalculated,
  initialDestination = '',
  departureLocation = { lat: 34.03713134630721, lng: -4.997884940839293 }, // Epta.ma par défaut
  height = '400px' 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [searchValue, setSearchValue] = useState(initialDestination);

  const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!API_KEY) {
      setError('Clé API Google Maps non configurée');
      setLoading(false);
      return;
    }

    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      const loader = new Loader({
        apiKey: API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });

      const google = await loader.load();
      
      // Initialiser la carte
      const map = new google.maps.Map(mapRef.current, {
        center: departureLocation,
        zoom: 10,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'simplified' }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Initialiser les services de directions
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        draggable: true,
        map: map,
        suppressMarkers: false
      });

      // Marqueur de départ
      new google.maps.Marker({
        position: departureLocation,
        map: map,
        title: 'Point de départ',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });

      // Marqueur de destination (draggable)
      markerRef.current = new google.maps.Marker({
        map: map,
        draggable: true,
        title: 'Destination - Cliquez et glissez pour ajuster',
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#EA4335',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });

      // Initialiser l'autocomplétion
      const input = document.getElementById('maps-search-input');
      if (input) {
        autocompleteRef.current = new google.maps.places.Autocomplete(input, {
          types: ['geocode'],
          componentRestrictions: { country: 'ma' } // Limiter au Maroc
        });

        autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
      }

      // Event listeners
      map.addListener('click', handleMapClick);
      markerRef.current.addListener('dragend', handleMarkerDrag);
      directionsRendererRef.current.addListener('directions_changed', handleDirectionsChange);

      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
      setError('Erreur lors du chargement de Google Maps');
      setLoading(false);
    }
  };

  const handleMapClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    };
    
    updateDestination(location);
  };

  const handleMarkerDrag = () => {
    const position = markerRef.current.getPosition();
    const location = {
      lat: position.lat(),
      lng: position.lng()
    };
    
    updateDestination(location);
  };

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (place.geometry) {
      const location = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
      
      updateDestination(location, place.formatted_address);
    }
  };

  const updateDestination = async (location, address = null) => {
    setSelectedLocation(location);
    
    // Mettre à jour le marqueur
    markerRef.current.setPosition(location);
    
    // Centrer la carte
    mapInstanceRef.current.panTo(location);
    
    // Reverse geocoding pour obtenir l'adresse si pas fournie
    if (!address) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        const result = await geocoder.geocode({ location });
        address = result.results[0]?.formatted_address || 'Adresse inconnue';
      } catch (error) {
        console.error('Erreur de géocodage inverse:', error);
        address = `${location.lat}, ${location.lng}`;
      }
    }

    setSearchValue(address);

    // Calculer l'itinéraire
    calculateRoute(location);

    // Notifier le parent
    if (onLocationSelect) {
      onLocationSelect({
        location,
        address,
        googleMapsLink: `https://www.google.com/maps/dir/${departureLocation.lat},${departureLocation.lng}/${location.lat},${location.lng}`
      });
    }
  };

  const calculateRoute = (destination) => {
    if (!directionsServiceRef.current) return;

    const request = {
      origin: departureLocation,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    directionsServiceRef.current.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
        
        const route = result.routes[0];
        const leg = route.legs[0];
        
        const routeData = {
          distance: leg.distance.value / 1000, // Convertir en km
          duration: leg.duration.value / 60, // Convertir en minutes
          distanceText: leg.distance.text,
          durationText: leg.duration.text
        };
        
        setRouteInfo(routeData);
        
        // Notifier le parent
        if (onDistanceCalculated) {
          onDistanceCalculated(routeData);
        }
      } else {
        console.error('Erreur de calcul d\'itinéraire:', status);
      }
    });
  };

  const handleDirectionsChange = () => {
    const directions = directionsRendererRef.current.getDirections();
    const route = directions.routes[0];
    const leg = route.legs[0];
    
    const routeData = {
      distance: leg.distance.value / 1000,
      duration: leg.duration.value / 60,
      distanceText: leg.distance.text,
      durationText: leg.duration.text
    };
    
    setRouteInfo(routeData);
    
    if (onDistanceCalculated) {
      onDistanceCalculated(routeData);
    }
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  if (error) {
    return (
      <div className="maps-error">
        <MapPin size={48} />
        <p>{error}</p>
        <small>Vérifiez que la clé API Google Maps est correctement configurée</small>
      </div>
    );
  }

  return (
    <div className="google-maps-selector">
      <div className="maps-search-container">
        <div className="search-input-container">
          <MapPin size={20} />
          <input
            id="maps-search-input"
            type="text"
            placeholder="Rechercher une destination..."
            value={searchValue}
            onChange={handleSearchChange}
            className="maps-search-input"
          />
        </div>
      </div>

      <div className="maps-container" style={{ height }}>
        {loading && (
          <div className="maps-loading">
            <div className="loading-spinner"></div>
            <p>Chargement de Google Maps...</p>
          </div>
        )}
        <div ref={mapRef} className="google-map" style={{ height: '100%' }} />
      </div>

      {routeInfo && (
        <div className="route-info">
          <div className="route-info-item">
            <Route size={16} />
            <span>{routeInfo.distanceText}</span>
          </div>
          <div className="route-info-item">
            <Clock size={16} />
            <span>{routeInfo.durationText}</span>
          </div>
          <div className="route-info-item">
            <Navigation size={16} />
            <span>Itinéraire optimisé</span>
          </div>
        </div>
      )}

      <div className="maps-instructions">
        <p>
          <strong>Instructions :</strong> Cliquez sur la carte ou utilisez la barre de recherche pour sélectionner une destination. 
          Vous pouvez glisser-déposer le marqueur rouge pour ajuster la position.
        </p>
      </div>
    </div>
  );
};

export default GoogleMapsSelector; 