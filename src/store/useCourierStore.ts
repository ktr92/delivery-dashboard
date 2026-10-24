import { create } from 'zustand';

export interface Courier {
  id: number;
  name: string;
  isBusy: boolean;
  lat: number;  
  lng: number;
}

// Интерфейс всего стора
interface CourierState {
  couriers: Courier[];
  selectedCourierId: number | null;
  // Экшены (мутации) стора
  setCouriers: (couriers: Courier[]) => void;
  toggleCourierStatus: (id: number) => void;
  selectCourier: (id: number | null) => void;
}

// В Zustand нет разделения на state, getters и actions как в Pinia. Всё лежит в одном объекте.
export const useCourierStore = create<CourierState>((set) => ({
  // Начальное состояние (State)
  couriers: [
    { id: 1, name: 'Алексей', isBusy: false, lat: 55.751244, lng: 37.618423 },
    { id: 2, name: 'Иван', isBusy: true, lat: 55.755826, lng: 37.6173 },
  ],
  selectedCourierId: null,

  // Экшены (Actions)
  // Функция set принимает текущее состояние и возвращает объект с обновленными полями
  setCouriers: (newCouriers) => set({ couriers: newCouriers }),
  
  selectCourier: (id) => set({ selectedCourierId: id }),

  toggleCourierStatus: (id) =>
    set((state) => ({
      couriers: state.couriers.map((c) =>
        c.id === id ? { ...c, isBusy: !c.isBusy } : c
      ),
    })),
}));