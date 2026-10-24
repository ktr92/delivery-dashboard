import { useState } from "react";
import { Modal } from "./ui/Modal"; // Импортируем модалку из UI-kit
import { type Courier, useCourierStore } from "../store/useCourierStore";

// В React пропсы — это аргумент функции-компонента
interface CourierCardProps {
  courier: Courier; // Принимаем объект курьера из пропсов
}

export function CourierCard({ courier }: CourierCardProps) {
  // Локальное состояние. useState возвращает массив: [текущее_значение, функция_для_обновления]
  // Во Vue это было бы: const isBusy = ref(false)
  //const [isBusy, setIsBusy] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Достаем экшены из стора Zustand
  const toggleCourierStatus = useCourierStore(
    (state) => state.toggleCourierStatus,
  );
  const selectCourier = useCourierStore((state) => state.selectCourier);

  const handleOpenDetails = () => {
    selectCourier(courier.id); // Записываем в стор, какого курьера мы сейчас смотрим
    setIsModalOpen(true);
  };

  const handleCloseDetails = () => {
    selectCourier(null);
    setIsModalOpen(false);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        margin: "8px",
        borderRadius: "8px",
        width: "200px",
      }}
    >
      <h3>{courier.name}</h3>
      <p>Статус: {courier.isBusy ? "🔴 На заказе" : "🟢 Свободен"}</p>

      <button onClick={() => toggleCourierStatus(courier.id)}>
        Сменить статус
      </button>
      <br />
      <br />
      <button onClick={handleOpenDetails}>Подробнее</button>
      {/* модалка-портал. Всё что внутри — это children (слот) */}
      <Modal isOpen={isModalOpen} onClose={handleCloseDetails}>
        <h2>Детальная информация</h2>
        <p>Имя курьера: {courier.name}</p>
        <p>ID в системе: {courier.id}</p>
        <p>Текущая занятость: {courier.isBusy ? "Занят" : "Свободен"}</p>
      </Modal>
    </div>
  );
}
