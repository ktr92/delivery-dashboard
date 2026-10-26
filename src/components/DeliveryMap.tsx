import { useEffect, useRef } from "react";
import { useCourierStore } from "../store/useCourierStore";
import { useActiveOrders } from "../hooks/useActiveOrders";

export function DeliveryMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Создаем две отдельные коллекции, чтобы они не мешали друг другу
  const couriersCollectionRef = useRef<any>(null);
  const ordersCollectionRef = useRef<any>(null);

  const couriers = useCourierStore((state) => state.couriers);
  const selectedCourierId = useCourierStore((state) => state.selectedCourierId);
  const selectedCourier = couriers.find((c) => c.id === selectedCourierId);

  // Получаем адреса заказов из кэша / API
  const { data: orders = [] } = useActiveOrders();

  // ЭФФЕКТ №1: Инициализация карты (onMounted)
  useEffect(() => {
    const ymaps = (window as any).ymaps;
    if (!ymaps || !mapContainerRef.current) return;

    ymaps.ready(() => {
      if (
        mapInstanceRef.current ||
        (mapContainerRef.current && mapContainerRef.current.children.length > 0)
      ) {
        return;
      }

      try {
        const map = new ymaps.Map(mapContainerRef.current, {
          center: [55.751244, 37.618423],
          zoom: 12,
          controls: ["zoomControl", "fullscreenControl"],
        });

        // Создаем и добавляем на карту коллекцию для курьеров
        const couriersCollection = new ymaps.GeoObjectCollection();
        map.geoObjects.add(couriersCollection);
        couriersCollectionRef.current = couriersCollection;

        // Создаем и добавляем на карту коллекцию для адресов
        const ordersCollection = new ymaps.GeoObjectCollection();
        map.geoObjects.add(ordersCollection);
        ordersCollectionRef.current = ordersCollection;

        mapInstanceRef.current = map;

        // Рисуем первоначальный список курьеров
        couriers.forEach((courier) => {
          const courierPlacemark = new ymaps.Placemark(
            [courier.lat, courier.lng],
            {
              balloonContent: `<strong>Курьер: ${courier.name}</strong><br>Статус: ${courier.isBusy ? "Занят" : "Свободен"}`,
              hintContent: courier.name,
            },
            {
              preset: courier.isBusy
                ? "islands#redCircleDotIcon"
                : "islands#greenCircleDotIcon",
            },
          );
          (courierPlacemark as any).courierId = courier.id;
          couriersCollection.add(courierPlacemark);
        });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ЭФФЕКТ №2: Отрисовка адресов заказов (Срабатывает, когда orders загрузились из API)
  useEffect(() => {
    const ymaps = (window as any).ymaps;
    if (!ymaps || !ordersCollectionRef.current) return;

    // Стираем старые адреса и перерисовываем актуальные
    ordersCollectionRef.current.removeAll();

    // Фильтруем заказы, если выбран конкретный курьер
    const filteredOrders = selectedCourierId
      ? orders.filter((o) => o.courierId === selectedCourierId)
      : orders;

    filteredOrders.forEach((order) => {
      const orderPlacemark = new ymaps.Placemark(
        [order.lat, order.lng],
        {
          balloonContent: `<strong>Заказ #${order.id}</strong><br>${order.title}`,
          hintContent: `Точка доставки #${order.id}`,
        },
        {
          preset: "islands#blueHomeIcon",
          iconColor: "#1e88e5",
        },
      );
      ordersCollectionRef.current.add(orderPlacemark);
    });
  }, [orders, selectedCourierId]); // Реагирует на загрузку заказов или фильтрацию

  // ЭФФЕКТ №3: Движение курьеров (Срабатывает при тиках сокетов)
  useEffect(() => {
    const ymaps = (window as any).ymaps;
    if (!ymaps || !couriersCollectionRef.current) return;

    couriersCollectionRef.current.each((geoObject: any) => {
      if (geoObject.courierId !== undefined) {
        const freshData = couriers.find((c) => c.id === geoObject.courierId);
        if (freshData) {
          // Просто обновляем координаты — нативный балун ЕДЕТ следом!
          geoObject.geometry.setCoordinates([freshData.lat, freshData.lng]);
          geoObject.options.set(
            "preset",
            freshData.isBusy
              ? "islands#redCircleDotIcon"
              : "islands#greenCircleDotIcon",
          );
        }
      }
    });
  }, [couriers]);

  // ЭФФЕКТ №4: Фильтрация видимости самих курьеров
  useEffect(() => {
    if (!couriersCollectionRef.current) return;

    couriersCollectionRef.current.each((geoObject: any) => {
      if (geoObject.courierId !== undefined) {
        if (selectedCourierId) {
          geoObject.options.set(
            "visible",
            geoObject.courierId === selectedCourierId,
          );
        } else {
          geoObject.options.set("visible", true);
        }
      }
    });
  }, [selectedCourierId]);

  // ЭФФЕКТ №5: Умное масштабирование границ (Bounds) при выборе курьера
  useEffect(() => {
    const mapInstance = mapInstanceRef.current;
    const ymaps = (window as any).ymaps;

    if (!mapInstance || !ymaps) return;

    // 1. Если курьер выбран — подстраиваем масштаб под него и его заказы
    if (selectedCourier) {
      // Собираем массив координат [lat, lng], которые ДОЛЖНЫ поместиться на экране
      const pointsToFit: [number, number][] = [
        [selectedCourier.lat, selectedCourier.lng], // Координата самого курьера
      ];

      // Находим все заказы, привязанные к этому курьеру
      const courierOrders = orders.filter(
        (o) => o.courierId === selectedCourier.id,
      );

      // Добавляем координаты этих заказов в наш массив
      courierOrders.forEach((order) => {
        pointsToFit.push([order.lat, order.lng]);
      });

      // На основе массива точек генерируем прямоугольную область для Яндекс Карт
      // Метод util.bounds.fromPoints сам вычислит крайнюю верхнюю-левую и нижнюю-правую точки
      const bounds = ymaps.util.bounds.fromPoints(pointsToFit);

      // Применяем границы к карте с плавной анимацией
      mapInstance.setBounds(bounds, {
        checkZoomRange: true, // Проверить, чтобы масштаб не ушел в бесконечность
        duration: 500, // Длительность анимации в мс
        zoomMargin: 50, // Отступ в пикселях от краев карты, чтобы маркеры не прижимались к рамке
      });
    } else {
      // 2. Если фильтр сброшен (никто не выбран) — можно вернуть дефолтный центр Москвы
      // (Делаем проверку, чтобы не сбрасывать карту просто так при первом рендере)
      if (mapInstance.getZoom() !== 12 && !selectedCourierId) {
        mapInstance.setCenter([55.751244, 37.618423], 12, {
          duration: 400,
        });
      }
    }
  }, [selectedCourier, selectedCourierId, orders]); // Эффект сработает при клике на «Подробнее» или если обновился список заказов

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
