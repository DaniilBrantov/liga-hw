function addLog(message: string): void {
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML += `\n${message}`;
    output.scrollTop = output.scrollHeight;
  }
}

function clearOutput(): void {
  const output = document.getElementById('output');
  if (output) {
    output.innerHTML = 'Лог чист';
  }
}

async function runFullTest(): Promise<void> {
  addLog('Запуск полного теста API...');
  try {
    // @ts-ignore - функция из index.ts
    await testAPI();
    addLog('Полный тест завершен успешно!');
  } catch (error) {
    addLog(`Ошибка: ${error}`);
  }
}

async function getAllTasks(): Promise<void> {
  addLog('📋 Получаю все задачи...');
  try {
    // @ts-ignore - экземпляр из index.ts
    const tasks = await requestTaskInstance.getAllTasks();
    addLog(`Получено задач: ${tasks.length}`);
    addLog(JSON.stringify(tasks, null, 2));
  } catch (error) {
    addLog(`Ошибка: ${error}`);
  }
}

async function createTestTask(): Promise<void> {
  addLog('Создаю тестовую задачу...');
  try {
    // @ts-ignore - экземпляр из index.ts
    const task = await requestTaskInstance.createTask({
      name: 'Тестовая задача из интерфейса',
      info: 'Создана через веб-интерфейс',
      isImportant: true,
      isCompleted: false,
    });
    addLog('Задача создана успешно!');
    addLog(JSON.stringify(task, null, 2));
  } catch (error) {
    addLog(`Ошибка: ${error}`);
  }
}

function setupEventListeners(): void {
  const fullTestBtn = document.getElementById('fullTestBtn');
  const getTasksBtn = document.getElementById('getTasksBtn');
  const createTaskBtn = document.getElementById('createTaskBtn');
  const clearBtn = document.getElementById('clearBtn');

  if (fullTestBtn) {
    fullTestBtn.addEventListener('click', runFullTest);
  }
  if (getTasksBtn) {
    getTasksBtn.addEventListener('click', getAllTasks);
  }
  if (createTaskBtn) {
    createTaskBtn.addEventListener('click', createTestTask);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', clearOutput);
  }
}

function initApp(): void {
  setupEventListeners();
  addLog('API готов к работе.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
