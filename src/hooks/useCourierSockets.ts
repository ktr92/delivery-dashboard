import { useEffect } from 'react';
import { useCourierStore } from '../store/useCourierStore';

export function useCourierSockets() {
  const setCouriers = useCourierStore((state) => state.setCouriers);
  const couriers = useCourierStore((state) => state.couriers);

   useEffect(() => {
    // В реальном проекте здесь было бы: const ws = new WebSocket('wss://://delivery.com')
    // сделаем симуляцию сокета, которая слегка меняет координаты курьеров
    const interval = setInterval(() => {
      const updatedCouriers = couriers.map((courier) => {
        // Случайное микро-смещение для имитации движения по городу
        const randomOffsetLat = (Math.random() - 0.5) * 0.002;
        const randomOffsetLng = (Math.random() - 0.5) * 0.002;

        return {
          ...courier,
          lat: courier.lat + randomOffsetLat,
          lng: courier.lng + randomOffsetLng,
        };
      });

      // Записываем новые координаты в Zustand. 
      // Карта автоматически поймает это во 2-м useEffect и передвинет маркеры
      setCouriers(updatedCouriers);
    }, 1500);

    return () => clearInterval(interval);
  }, [couriers, setCouriers]);
}