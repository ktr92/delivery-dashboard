/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMemo } from "react";
import { useActiveOrders } from "../hooks/useActiveOrders";
import { useCourierStore } from "../store/useCourierStore";

export function OrdersList() {
  // Вызываем кастомный хук
  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useActiveOrders();

  const selectedCourierId = useCourierStore((state) => state.selectedCourierId);

  // ФИЛЬТРАЦИЯ НА ЛЕТУ ЧЕРЕЗ useMemo
  // Код выполнится только если изменятся сами заказы из API ИЛИ id выбранного курьера
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    // Если курьер не выбран (например, null или undefined), возвращаем все заказы
    if (!selectedCourierId) return orders;

    // Фильтруем заказы по соответствию courierId
    return orders.filter((order) => order.courierId === selectedCourierId);
  }, [orders, selectedCourierId]);

  // Обработка состояния загрузки (аналог pending в useFetch)
  if (isLoading) return <div>⏳ Загрузка активных заказов...</div>;

  // Обработка ошибок (аналог error в useFetch)
  if (isError)
    return (
      <div style={{ color: "red" }}>
        ❌ Произошла ошибка: {(error as Error).message}
      </div>
    );

  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#fafafa",
        marginTop: "20px",
      }}
    >
      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3>📦 Новые заказы из API (TanStack Query)</h3>
        <button
          onClick={() => refetch()}
          style={{ padding: "4px 8px", fontSize: "12px" }}
        >
          Обновить
        </button>
      </div>

      <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
        {filteredOrders?.map((order) => (
          <li
            key={order.id}
            style={{ margin: "6px 0", fontSize: "14px", textAlign: "left" }}
          >
            <strong>Заказ #{order.id}:</strong> ул.{" "}
            {order.title.substring(0, 20)}...
          </li>
        ))}
      </ul>

      {/* Кнопка сброса фильтра, чтобы снова увидеть все заказы */}
        {selectedCourierId && (
          <button 
            onClick={() => useCourierStore.getState().selectCourier(null)}
            style={{ padding: '4px 8px', fontSize: '12px', marginRight: '8px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Показать все
          </button>
        )}
    </div>
  );
}
