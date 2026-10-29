/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";

interface Data {
  id: number,
  title: string,
  completed: boolean
}

interface ApiResponse {
  status: number,
  endpoint: string,
  message: string,
  data: Data[]
}

interface FetchOptions {
  signal: AbortSignal
}

const fakeFetch = (url: string, options: FetchOptions) => {
  return new Promise((resolve, reject) => {
    const signal = options.signal;

    if (signal && signal.aborted) {
      reject(new DOMException("Aborted"));
    }

    const timeoutId = setTimeout(() => {
      const fakeResponse = {
        ok: true,
        status: 200,
        statusText: "OK",
        url: url,
        json: () =>
          Promise.resolve({
            status: "success",
            endpoint: url,
            message: "Имитация fetch сработала идеально!",
            data: [
              { id: 1, title: "Тестовый пост №1", completed: false },
              { id: 2, title: "Тестовый пост №2", completed: true },
            ],
          }),
      };

      resolve(fakeResponse);
    }, 1500);

    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        reject(new DOMException("Aborted"));
      });
    }
  });
};

export function Search() {
  const [value, changeText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const cache = useRef<Map<string, ApiResponse>>(new Map());
  const timer = useRef<ReturnType <typeof setTimeout>>(null);
  const controller = useRef<AbortController | null>(null);

  function searchInput(val: string) {
    changeText(val);

    setLoading(true);
    
    if (cache.current.has(val)) {
      console.log("CACHED: ", cache.current.get(val));
      setLoading(false);
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    if (controller.current) {
      controller.current.abort();
    }

    controller.current = new AbortController();

    timer.current = setTimeout(() => {
      try {
        fakeFetch(val, { signal: controller.current.signal })
          .then((res) => res.json())
          .then((res) => {
            console.log(val, res);
            controller.current = null;
            cache.current.set(val, res);
            console.log(cache.current);

            setLoading(false);
          });
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.log("debounce");
        } else {
          console.log(error.message);
        }
        setLoading(false);
      }
    }, 500);
  }

  // Защита от Memory Leak: чистим всё, если компонент размонтировался в процессе ввода
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (controller.current) controller.current.abort();
    };
  }, []);

  return (
    <div>
      {loading ? <p>Загрузка...</p> : <p>{value}</p>}
      <input
        type="text"
        value={value}
        onChange={(e) => searchInput(e.target.value)}
        style={{ backgroundColor: "#eee" }}
      />
    </div>
  );
}
