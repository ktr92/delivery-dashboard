import { useState } from "react";

// В React пропсы — это аргумент функции-компонента
interface CourierCardProps {
  id: number;
  name: string;
}

function CourierCard({ id, name }: CourierCardProps) {
  // Локальное состояние. useState возвращает массив: [текущее_значение, функция_для_обновления]
  // Во Vue это было бы: const isBusy = ref(false)
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const toggleStatus = () => {
    setIsBusy(!isBusy); // Переключаем стейт. Это вызовет ПЕРЕРЕНДЕР этого компонента.
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '8px', borderRadius: '8px' }}>
      <h3>Курьер: {name} (ID: {id})</h3>
      
      {/* Условный рендеринг (аналог v-if / v-else) */}
      <p>Статус: {isBusy ? '🔴 На заказе' : '🟢 Свободен'}</p>
      
      {/* Отреагировать на клик: вместо @click пишем onClick={имяФункции} */}
      <button onClick={toggleStatus}>
        {isBusy ? 'Освободить' : 'Отправить на заказ'}
      </button>
    </div>
  );
}

// Главный компонент приложения
export default function App() {
  // Симуляция списка данных
  const couriers = [
    { id: 1, name: 'Алексей' },
    { id: 2, name: 'Иван' },
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Панель управления курьерами</h1>
      
      {/* Рендеринг списков (аналог v-for). Мы используем нативный JS .map() */}
      {/* В React вместо :key пишем key={...} на самом верхнем элементе внутри цикла */}
      <div style={{ display: 'flex' }}>
        {couriers.map((courier) => (
          <CourierCard key={courier.id} id={courier.id} name={courier.name} />
        ))}
      </div>
    </div>
  );
}