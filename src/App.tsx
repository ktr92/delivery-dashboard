import { useCourierStore } from './store/useCourierStore';
import { CourierCard } from './components/CourierCard';
import { DeliveryMap } from './components/DeliveryMap'; // Импортируем нашу Яндекс.Карту

export default function App() {
  // Забираем массив курьеров из Zustand стора
  const couriers = useCourierStore((state) => state.couriers);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>(Yandex Maps)</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginTop: '20px' }}>
        {/* Левая колонка: Список карточек курьеров */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2>Курьеры на линии</h2>
          {couriers.map((courier) => (
            <CourierCard key={courier.id} courier={courier} />
          ))}
        </div>

        {/* Правая колонка: Наш новый компонент карты */}
        <div>
          <h2>Интерактивная карта</h2>
          <DeliveryMap />
        </div>
      </div>
    </div>
  );
}
