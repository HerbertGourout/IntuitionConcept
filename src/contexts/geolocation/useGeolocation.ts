import { useContext } from 'react';
import { GeolocationContext } from './GeolocationContextBase';

export const useGeolocation = () => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useGeolocation must be used within a GeolocationProvider');
  }
  return context;
}
