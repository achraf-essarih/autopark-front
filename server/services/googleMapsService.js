const fetch = require('node-fetch');

class GoogleMapsService {
  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  // Calculer la distance et le temps entre deux points
  async calculateDistanceAndTime(originLat, originLng, destLat, destLng) {
    if (!this.apiKey) {
      console.warn('Clé API Google Maps non configurée');
      return null;
    }

    try {
      const origin = `${originLat},${originLng}`;
      const destination = `${destLat},${destLng}`;
      
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${this.apiKey}&units=metric&language=fr`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
        const element = data.rows[0].elements[0];
        return {
          distance_km: parseFloat((element.distance.value / 1000).toFixed(2)),
          temps_estime_minutes: Math.round(element.duration.value / 60)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du calcul de distance Google Maps:', error);
      return null;
    }
  }

  // Générer un lien Google Maps
  generateGoogleMapsLink(originLat, originLng, destLat, destLng) {
    if (!destLat || !destLng) {
      return null;
    }

    if (originLat && originLng) {
      // Lien avec point de départ et destination
      return `https://www.google.com/maps/dir/${originLat},${originLng}/${destLat},${destLng}`;
    } else {
      // Lien vers la destination uniquement
      return `https://www.google.com/maps/place/${destLat},${destLng}`;
    }
  }

  // Calculer la distance approximative (formule haversine) si l'API n'est pas disponible
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lat1)) * Math.cos(this.degreesToRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return parseFloat(distance.toFixed(2));
  }

  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = new GoogleMapsService(); 