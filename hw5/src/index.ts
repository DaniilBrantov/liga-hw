import config from './config';


interface Task {
  id: number;
  name: string;
  info?: string;
  isImportant: boolean;
  isCompleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type CreateTaskData = {
  name: string;
  info?: string;
  isImportant?: boolean;
  isCompleted?: boolean;
};

type UpdateTaskData = Partial<Omit<Task, 'id'>> & {
  id: number;
};

// interface ApiResponse<T> {
//   data: T;
//   message?: string;
//   status: number;
// }




class ApiError extends Error {
  constructor(message: string, public status?: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

class BaseFetchAgent {
  constructor(private _apiUrl: string) {}

  private logger = {
    info: (message: string, data?: any) => console.log(`[INFO] ${message}`, data),
    error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
    warn: (message: string, data?: any) => console.warn(`[WARN] ${message}`, data),
  };

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Не удалось прочитать ответ сервера' };
      }

      throw new ApiError(
        errorData.message || `HTTP ошибка! Статус: ${response.status}`,
        response.status,
        errorData.code
      );
    }

    try {
      return await response.json();
    } catch (error) {
      throw new ApiError('Невалидный JSON в ответе сервера');
    }
  }

  protected async fetchRequest<ReturnDataType>(
    url: string,
    configOverrides: RequestInit = {},
    timeout = 10000
  ): Promise<ReturnDataType> {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      this.logger.info(`Выполнение запроса: ${url}`, {
        method: configOverrides.method || 'GET',
        timeout,
      });

      const response = await fetch(`${this._apiUrl}${url}`, {
        ...config.BASE_CONFIG,
        ...configOverrides,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const duration = Date.now() - startTime;
      this.logger.info(`Запрос выполнен: ${url}`, {
        status: response.status,
        duration: `${duration}мс`,
      });

      return await this.handleResponse<ReturnDataType>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      if (error instanceof ApiError) {
        this.logger.error(`Ошибка API: ${url}`, {
          error: error.message,
          status: error.status,
          duration: `${duration}мс`,
        });
        throw error;
      }

      if (error.name === 'AbortError') {
        const networkError = new NetworkError(`Таймаут запроса: ${timeout}ms`);
        this.logger.error(`Таймаут: ${url}`, {
          error: networkError.message,
          duration: `${duration}мс`,
        });
        throw networkError;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      const apiError = new ApiError(`Сетевая ошибка: ${errorMessage}`);
      this.logger.error(`Сетевая ошибка: ${url}`, {
        error: apiError.message,
        duration: `${duration}мс`,
      });
      throw apiError;
    }
  }
}

class RequestTaskAgent extends BaseFetchAgent {
  constructor() {
    super(config.API_URL);
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage?.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      return await this.fetchRequest<Task[]>('/tasks', {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(`Не удалось получить список задач: ${errorMessage}`);
    }
  }

  async createTask(newTask: CreateTaskData): Promise<Task> {
    try {
      return await this.fetchRequest<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(newTask),
        headers: {
          ...this.getAuthHeaders(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(`Не удалось создать задачу: ${errorMessage}`);
    }
  }

  async getTaskById(id: number): Promise<Task> {
    try {
      return await this.fetchRequest<Task>(`/tasks/${id}`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(`Не удалось получить задачу #${id}: ${errorMessage}`);
    }
  }

  async updateTask(updatedTask: UpdateTaskData): Promise<Task> {
    try {
      const { id, ...taskData } = updatedTask;
      return await this.fetchRequest<Task>(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(taskData),
        headers: {
          ...this.getAuthHeaders(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(`Не удалось обновить задачу #${updatedTask.id}: ${errorMessage}`);
    }
  }

  async deleteTask(id: number): Promise<void> {
    try {
      await this.fetchRequest(`/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          ...this.getAuthHeaders(),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ApiError(`Не удалось удалить задачу #${id}: ${errorMessage}`);
    }
  }


}

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  duration: number;
  timestamp: string;
}

async function testAPI(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  const createdTaskIds: number[] = [];

  const runTest = async <T>(name: string, testFn: () => Promise<T>): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await testFn();
      const duration = Math.round(performance.now() - startTime);
      results.push({
        success: true,
        message: `✅ ${name}`,
        data: result,
        duration,
        timestamp: new Date().toISOString(),
      });
      return result;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        success: false,
        message: `❌ ${name}: ${errorMessage}`,
        duration,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  };

  try {
    console.log('Начало теста API...\n');

    const allTasks = await runTest('Получение всех задач', () => requestTaskInstance.getAllTasks());
    console.log(`Всего задач в системе: ${allTasks.length}`);

    const testTaskData: CreateTaskData = {
      name: 'Тестовая задача API',
      info: 'Описание тестовой задачи для проверки работы API',
      isImportant: true,
      isCompleted: false,
    };

    const newTask = await runTest('Создание новой таски', () => requestTaskInstance.createTask(testTaskData));

    if (!newTask.id) {
      throw new Error('нет такого id');
    }
    createdTaskIds.push(newTask.id);
    console.log(` Создана таска #${newTask.id}: "${newTask.name}"`);

    const retrievedTask = await runTest('Получение таски по id', () => requestTaskInstance.getTaskById(newTask.id));

    await runTest('Проверка...', async () => {
      const isNameConsistent = retrievedTask.name === testTaskData.name;
      const isInfoConsistent = retrievedTask.info === testTaskData.info;
      const isImportantConsistent = retrievedTask.isImportant === testTaskData.isImportant;

      if (!isNameConsistent || !isInfoConsistent || !isImportantConsistent) {
        throw new Error('Данные не совпадают');
      }
      return 'Всё гуд';
    });

    const updateData: UpdateTaskData = {
      id: newTask.id,
      isCompleted: true,
      info: 'Новое описание',
    };

    const updatedTask = await runTest('Обновление', () => requestTaskInstance.updateTask(updateData));
    console.log(`Задача обновлена: ${updatedTask.isCompleted ? 'Выполнена' : 'В процессе'}`);

    const secondTask = await runTest('Создание второй задачи', () =>
      requestTaskInstance.createTask({
        name: '2ая тест задача',
        info: 'Доп задача для теста',
        isImportant: false,
        isCompleted: true,
      })
    );

    if (secondTask.id) {
      createdTaskIds.push(secondTask.id);
      console.log(` Создана 2ая задача #${secondTask.id}`);
    }

    const finalTasks = await runTest('Проверка финального списка задач', () => requestTaskInstance.getAllTasks());

    console.log(`Финальное кол-во задач: ${finalTasks.length}`);

    const successfulTests = results.filter((r) => r.success).length;
    const totalTests = results.length;
    const successRate = Math.round((successfulTests / totalTests) * 100);

    console.log('\n ИТОГИ ТЕСТИРОВАНИЯ:');
    console.log(` Успешных тестов: ${successfulTests}/${totalTests}`);
    console.log(` Процент успеха: ${successRate}%`);
    console.log(` Общее время выполнения: ${results.reduce((acc, r) => acc + r.duration, 0)}ms`);

    if (successRate === 100) {
      console.log('\n Все тесты пройдены успешно! API работает корректно.');
    } else {
      console.log('\n Некоторые тесты не пройдены. Проверьте логи для деталей.');
    }
  } catch (error) {
    console.error('\n Критическая ошибка во время тестирования:', error);
  } finally {
    if (createdTaskIds.length > 0) {
      console.log('\nОчистка тестовых данных...');

      for (const taskId of createdTaskIds) {
        try {
          await requestTaskInstance.deleteTask(taskId);
          console.log(`Удалена тест задача #${taskId}`);
        } catch (error) {
          console.error(`Не удалось удалить задачу #${taskId}:`, error);
        }
      }

      console.log('Очистка всё. Окончена');
    }
  }

  return results;
}

const getRequestTaskInstance = (): RequestTaskAgent => {
  if (typeof window !== 'undefined' && !(window as any).__requestTaskInstance) {
    (window as any).__requestTaskInstance = new RequestTaskAgent();
  }
  return new RequestTaskAgent();
};

const requestTaskInstance = getRequestTaskInstance();

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'requestTaskInstance', {
    value: requestTaskInstance,
    writable: false,
    configurable: true,
  });

  Object.defineProperty(window, 'testAPI', {
    value: testAPI,
    writable: false,
    configurable: true,
  });

  Object.defineProperty(window, 'ApiError', {
    value: ApiError,
    writable: false,
    configurable: true,
  });
}

console.log('API загружен и готов');

export {
  RequestTaskAgent,
  requestTaskInstance,
  testAPI,
  ApiError,
  NetworkError,
  type Task,
  type CreateTaskData,
  type UpdateTaskData,
  type TestResult,
};
