import { useQuery } from "@tanstack/react-query";

export interface Order {
  id: number;
  title: string; // В нашей симуляции это будет "Адрес доставки"
  courierId: number;
  lat: number;
  lng: number;
}

// Функция, которая делает непосредственный fetch на сервер
/* const fetchActiveOrders = async (): Promise<Order[]> => {
  const res = await fetch('https://typicode.com');
  if (!res.ok) throw new Error('Ошибка при загрузке заказов');
  return res.json();
}; */

// Функция-симуляция.  имитирует задержку сервера в 1 секунду
const fetchActiveOrders = async (): Promise<Order[]> => {
  // Возвращаем промис, который зарезолвится через 1000 миллисекунд
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 101,
          title: "Ленинский проспект, д. 45, кв. 12",
          courierId: 1,
          lat: 55.741244,
          lng: 37.608423,
        },
        {
          id: 102,
          title: "ул. Тверская, д. 8, стр. 2",
          courierId: 2,
          lat: 55.760226,
          lng: 37.611311,
        },
        {
          id: 103,
          title: "Пресненская набережная, д. 6",
          courierId: 1,
          lat: 55.748444,
          lng: 37.539242,
        },
        {
          id: 104,
          title: "Приморский бульвар, д. 12",
          courierId: 2,
          lat: 55.735826,
          lng: 37.627344,
        },
        {
          id: 105,
          title: "ул. Малая Бронная, д. 22",
          courierId: 1,
          lat: 55.761844,
          lng: 37.592423,
        },
      ]);
    }, 1000);
  });
};

// кастомный хук.
export function useActiveOrders() {
  return useQuery<Order[]>({
    queryKey: ["activeOrders"],
    queryFn: fetchActiveOrders,
    staleTime: 60000, // 1 минута свежести кэша
  });
}
