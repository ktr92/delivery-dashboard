import { useEffect, useRef } from 'react';
import { useCourierStore } from '../store/useCourierStore';

  // ФУНКЦИЯ ОТРИСОВКИ МАРКЕРОВ (вынесена отдельно, чтобы использовать в разных эффектах)
  const renderMarkers = (ymaps: any, collection: any, couriersList: any[]) => {
    if (!collection) return;
    
    // Очищаем старые маркеры, чтобы они не дублировались
    collection.removeAll();

    // Проходимся по курьерам из Zustand стора
    couriersList.forEach((courier) => {
      const placemark = new ymaps.Placemark(
        [courier.lat, courier.lng],
        { 
          balloonContent: `<strong>${courier.name}</strong><br>Статус: ${courier.isBusy ? 'Занят' : 'Свободен'}` 
        },
        { 
          preset: courier.isBusy ? 'islands#redCircleDotIcon' : 'islands#greenCircleDotIcon' 
        }
      );
      collection.add(placemark);
    });
  };

export function DeliveryMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const collectionRef = useRef<any>(null);


  // Забираем данные из Zustand стора
  const couriers = useCourierStore((state) => state.couriers);
  const selectedCourierId = useCourierStore((state) => state.selectedCourierId);
  const selectedCourier = couriers.find((c) => c.id === selectedCourierId);


  // ЭФФЕКТ №1: Создание карты (onMounted)
  useEffect(() => {
    const ymaps = (window as any).ymaps;
    if (!ymaps || !mapContainerRef.current) return;

    ymaps.ready(() => {
      // Защита от Strict Mode: если карта в этом div уже инициализирована, ничего не делаем
      if (mapInstanceRef.current || (mapContainerRef.current && mapContainerRef.current.children.length > 0)) {
        return;
      }

      try {
        const map = new ymaps.Map(mapContainerRef.current, {
          center: [55.751244, 37.618423], // Москва
          zoom: 12,
          controls: ['zoomControl', 'fullscreenControl'],
        });

        const collection = new ymaps.GeoObjectCollection();
        map.geoObjects.add(collection);

        // Сохраняем ссылки в useRef
        mapInstanceRef.current = map;
        collectionRef.current = collection;

        // Важно: РИСУЕМ МАРКЕРЫ СРАЗУ при создании карты
        renderMarkers(ymaps, collection, couriers);
      } catch (error) {
        console.error("Ошибка при создании Яндекс Карт:", error);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        collectionRef.current = null;
      }
    };
  }, []); // Пустой массив = сработает один раз при монтировании

  // ЭФФЕКТ №2: Синхронизация маркеров (watch за изменением массива couriers)
  useEffect(() => {


    const ymaps = (window as any).ymaps;
    // Рисуем маркеры только если карта и коллекция уже физически созданы
    if (ymaps && collectionRef.current) {
      renderMarkers(ymaps, collectionRef.current, couriers);
    }
  }, [couriers]); // Этот эффект перезапускается каждый раз, когда массив couriers в сторе меняется

  // ЭФФЕКТ №3: Фокус на выбранного курьера (watch за selectedCourier)
  useEffect(() => {
    if (selectedCourier && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter([selectedCourier.lat, selectedCourier.lng], 14, {
        checkZoomRange: true,
        duration: 400,
      });
    }
  }, [selectedCourier]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '500px',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #ccc',
        backgroundColor: '#f5f5f5'
      }}
    />
  );
}
