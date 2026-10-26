/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from "react";
import { useCourierStore } from "../store/useCourierStore";
import { useActiveOrders, type Order } from "../hooks/useActiveOrders";

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
        balloonContent: `<strong>${courier.name}</strong><br>Статус: ${courier.isBusy ? "Занят" : "Свободен"}`,
      },
      {
        preset: courier.isBusy
          ? "islands#redCircleDotIcon"
          : "islands#greenCircleDotIcon",
      },
    );
    collection.add(placemark);
  });
};

const renderOrders = (
  ymaps: any,
  collection: any,
  orders: Order[] | undefined,
) => {
  if (!collection) return;

  if (!orders) return;

  // Очищаем старые маркеры, чтобы они не дублировались
  collection.removeAll();

  // Проходимся по курьерам из Zustand стора
  orders.forEach((order) => {
    const placemark = new ymaps.Placemark(
      [order.lat, order.lng],
      {
        balloonContent: `<strong>${order.title}</strong><br>Статус: ${order.courierId ? "Занят" : "Свободен"}`,
      },
      {
        preset: "islands#blueHomeGlyphIcon",
      },
    );
    collection.add(placemark);
  });
};

export function DeliveryMap() {
  // useRef чтобы сохранить значение между перерендерами, и не вызывать перерендер при измнении
  // mapContainerRef нужен для получения прямого доступа к HTML-элементу (куда встраивать карту)
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // mapInstanceRef и collectionRef хранят инстансы Яндекса между перерендерами,
  // не вызывая лишних перерисовок при изменении их значений
  const mapInstanceRef = useRef<any>(null);
   const couriersCollectionRef = useRef<any>(null);
  const ordersCollectionRef = useRef<any>(null);

  // Забираем данные из Zustand стора
  const couriers = useCourierStore((state) => state.couriers);
  const selectedCourierId = useCourierStore((state) => state.selectedCourierId);
  const selectedCourier = couriers.find((c) => c.id === selectedCourierId);

  const { data: orders = [] } = useActiveOrders();

  // ЭФФЕКТ №1: Создание карты (onMounted)
  useEffect(() => {
    const ymaps = (window as any).ymaps;
    if (!ymaps || !mapContainerRef.current) return;

    ymaps.ready(() => {
      // Защита от Strict Mode: если карта в этом div уже инициализирована, ничего не делаем
      if (
        mapInstanceRef.current ||
        (mapContainerRef.current && mapContainerRef.current.children.length > 0)
      ) {
        return;
      }

      try {
        const map = new ymaps.Map(mapContainerRef.current, {
          center: [55.751244, 37.618423], // Москва
          zoom: 12,
          controls: ["zoomControl", "fullscreenControl"],
        });

            const couriersCollection = new ymaps.GeoObjectCollection();
        const ordersCollection = new ymaps.GeoObjectCollection();

        map.geoObjects.add(couriersCollection);
        map.geoObjects.add(ordersCollection);

        // Сохраняем ссылки в useRef
        mapInstanceRef.current = map;
        couriersCollectionRef.current = couriersCollection;
        ordersCollectionRef.current = ordersCollection;

        // Важно: РИСУЕМ МАРКЕРЫ СРАЗУ при создании карты
        renderMarkers(ymaps, couriersCollection, couriers);
        renderOrders(ymaps, ordersCollection, orders);
      } catch (error) {
        console.error("Ошибка при создании Яндекс Карт:", error);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        couriersCollectionRef.current = null;
        ordersCollectionRef.current = null;
      }
    };
  }, []); // Пустой массив = сработает один раз при монтировании

  // ЭФФЕКТ №2: Синхронизация маркеров (watch за изменением массива couriers)
  useEffect(() => {
    const ymaps = (window as any).ymaps;
    // Рисуем маркеры только если карта и коллекция уже физически созданы
    if (ymaps && couriersCollectionRef.current) {
      renderMarkers(ymaps, couriersCollectionRef.current, couriers);
    }
  }, [couriers]); // Этот эффект перезапускается каждый раз, когда массив couriers в сторе меняется

  // ЭФФЕКТ №3: Фокус на выбранного курьера (watch за selectedCourier)
  useEffect(() => {
    if (selectedCourier && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(
        [selectedCourier.lat, selectedCourier.lng],
        14,
        {
          checkZoomRange: true,
          duration: 400,
        },
      );
    }
  }, [selectedCourier]);

  // ЭФФЕКТ №4: Вывод адресов заказов
  useEffect(() => {
    const ymaps = (window as any).ymaps;
    // Рисуем маркеры только если карта и коллекция уже физически созданы
    if (ymaps && ordersCollectionRef.current) {
      renderOrders(ymaps, ordersCollectionRef.current, orders);
    }
  }, [orders]); // Этот эффект перезапускается каждый раз, когда массив couriers в сторе меняется

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #ccc",
        backgroundColor: "#f5f5f5",
      }}
    />
  );
}
