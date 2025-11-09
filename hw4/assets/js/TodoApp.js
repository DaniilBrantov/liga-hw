import FetchEngine from "./FetchEngine.js";
import XhrEngine from "./XhrEngine.js";
import ApiController from "./ApiController.js";



class TodoApp {
  constructor() {
    this.currentEngine = "fetch";
    this.controller = null;
    this.initApp();
  }
  
  addClearBtn() {
    const outputDiv = document.getElementById("output");
    const clearButton = document.createElement("button");
    clearButton.textContent = "🗑️ Очистить вывод";
    clearButton.className = "button button--clear";

    clearButton.addEventListener("click", () => {
      outputDiv.innerHTML = "";
    });

    // Св-во дня: previousElementSibling возвращает предыдущий элемент
    const outputHeader = outputDiv.previousElementSibling;
    outputHeader.appendChild(clearButton);
  }

  initApp() {
    this.createController();
    this.bindEvents();
    this.addClearBtn();
    this.updateOutput(
      "Приложение готово к использованию. Можешь еще чекнуть через кнопку '🔗 Проверить подключение'.",
      "info"
    );
    this.loadAll();
  }

  createController() {
    const engine =
      this.currentEngine === "fetch" ? new FetchEngine() : new XhrEngine();
    this.controller = new ApiController(engine);
  }

  bindEvents() {
    document.getElementById("engineSelect").addEventListener("change", (e) => {
      this.currentEngine = e.target.value;
      this.createController();
      this.updateOutput(
        `Движок изменен на: ${e.target.value.toUpperCase()}`,
        "success"
      );
    });

    document.getElementById("test_con").addEventListener("click", () => {
      this.testCon();
    });

    document.getElementById("add_task").addEventListener("click", () => {
      this.createTask();
    });

    document.getElementById("get_task").addEventListener("click", () => {
      this.getById();
    });

    document.getElementById("update_task").addEventListener("click", () => {
      this.updateTask();
    });

    document.getElementById("delete_task").addEventListener("click", () => {
      this.deleteTask();
    });
  }

  async testCon() {
    this.updateOutput("Чекаю...", "info");
    const res = await this.controller.testCon();

    if (res.status === 200) {
      this.updateOutput("✅ Мои поздравления! Всё воркает!", "success");
    } else {
      this.updateOutput(`❌ Пупупу... Тут это...: ${res.err}`, "err");
    }
  }

  async createTask() {

    const nameInput = document.getElementById("task_name");
    const infoInput = document.getElementById("task_info");
    const completedCheckbox = document.getElementById("task_completed");
    const importantCheckbox = document.getElementById("task_important");

    const name = nameInput.value.trim();
    const info = infoInput.value.trim();

    if (!name) {
      this.updateOutput("❌ Забыл про название таски", "err");
      return;
    }

    const taskData = {
      name: name,
      info: info || "",
      isCompleted: completedCheckbox.checked,
      isImportant: importantCheckbox.checked,
    };

    this.updateOutput("Создаю...", "info");
    const res = await this.controller.createTask(taskData);

    if (res.data && (res.data.id || res.data._id)) {
      const taskId = res.data.id || res.data._id;
      this.updateOutput(
        `✅ Задача создана с ID: ${taskId}. Можно чекнуть ниже`,
        "success"
      );
      nameInput.value = "";
      infoInput.value = "";
      completedCheckbox.checked = false;
      importantCheckbox.checked = false;
      await this.loadAll();
    } else {
      const errmes = res.err || "Неизвестная ошибка";
      this.updateOutput(`❌ Ошибка создания: ${errmes}`, "err");
    }
  }

  async loadAll() {
    const res = await this.controller.getAll();

    if (res.data) {
      this.displayTasks(res.data);
    }
  }




  async getById() {
    const taskId = document.getElementById("task_id").value.trim();

    if (!taskId) {
      this.updateOutput("❌ Введите ID задачи", "err");
      return;
    }

    this.updateOutput(`Ща, ищу...`, "info");
    const res = await this.controller.getById(taskId);

    if (res.data) {
      const task = res.data;
      const taskName = task.name || "Без названия";
      const isCompleted =
        task.isCompleted !== undefined ? task.isCompleted : task.completed;

      this.updateOutput(
        `✅ Задачка найдена:\n` +
          `Название: ${taskName}\n` +
          `Описание: ${task.info || "нет"}\n` +
          `Статус: ${isCompleted ? "Выполнена" : "В процессе"}\n` +
          `ID: ${task.id || task._id}`,
        "success"
      );
    } else {
      this.updateOutput(`❌ Задача не найдена: ${res.err}`, "err");
    }
  }

  async updateTask() {
    const taskId = document.getElementById("update_task_id").value.trim();
    const nameInput = document.getElementById("update_task_name");
    const infoInput = document.getElementById("update_task_info");
    const completedCheckbox = document.getElementById("update_task_completed");
    const importantCheckbox = document.getElementById("update_task_important");

    if (!taskId) {
      this.updateOutput("❌ Блин, забыл про ID задачи для обновления", "err");
      return;
    }

    const name = nameInput.value.trim();
    const info = infoInput.value.trim();

    if (
      !name &&
      !info &&
      !completedCheckbox.checked &&
      !importantCheckbox.checked
    ) {
      this.updateOutput(
        "❌ Подсказка: какие новые данные для обновления?",
        "err"
      );
      return;
    }

    this.updateOutput(`Получение задачки...`, "info");
    const currentTask = await this.controller.getById(taskId);

    if (!currentTask.data) {
      this.updateOutput(`❌ Ой! А задачи с ID ${taskId} нет`, "err");
      return;
    }

    const taskData = {
      name: name || currentTask.data.name,
      info: info || currentTask.data.info,
      isCompleted: completedCheckbox.checked,
      isImportant: importantCheckbox.checked,
    };


    this.updateOutput(`Обновляю...`, "info");
    const res = await this.controller.updateTask(taskId, taskData);

    if (res.data) {
      this.updateOutput(`✅ Задача обновлена!`, "success");
      nameInput.value = "";
      infoInput.value = "";
      completedCheckbox.checked = false;
      importantCheckbox.checked = false;
      document.getElementById("update_task_id").value = "";
      await this.loadAll();
    } else {
      this.updateOutput(`❌ Пупупу... Ошибочка обновления: ${res.err}`, "err");
    }
  }

  async deleteTask() {
    const taskId = document.getElementById("task_id").value.trim();

    if (!taskId) {
      this.updateOutput(
        "❌ Подсказка:  Циферки(ID) задачки для удаления какие?",
        "err"
      );
      return;
    }

    this.updateOutput(`Удаляю...`, "warning");
    const res = await this.controller.deleteTask(taskId);

    if (res.status === 200) {
      this.updateOutput(`✅ Удалил успешно!`, "success");
      await this.loadAll();
    } else {
      this.updateOutput(`❌ Пупупу... Еррррор удаления: ${res.err}`, "err");
    }
  }


  displayTasks(tasks) {
    const tasksList = document.getElementById("tasks_list");

    if (!tasks || tasks.length === 0) {
      tasksList.innerHTML = '<div class="task-item">Тут пусто. Задач нет</div>';
      return;
    }

    if (!Array.isArray(tasks)) {
      tasksList.innerHTML =
        '<div class="task-item">Ошибка формата данных</div>';
      return;
    }

    tasksList.innerHTML = tasks
      .map((task) => {
        if (!task) return '<div class="task-item">Неверный формат задачи</div>';

        const taskName = task.name || "Без названия";
        const taskInfo = task.info || "Без описания";
        const isCompleted =
          task.isCompleted !== undefined ? task.isCompleted : task.completed;
        const isImportant = task.isImportant || false;
        const taskId = task.id || task._id || "нет";



        return `
                  <div class="task-item ${isImportant ? "important-task" : ""}">
                      <div class="task-header">
                          <div class="task-title">${this.escapeHtml(
                            taskName
                          )}</div>
                          <div class="task-status ${
                            isCompleted
                              ? "task-status--completed"
                              : "task-status--pending"
                          }">
                              ${isCompleted ? "✅ Выполнена" : "⏳ В процессе"}
                          </div>
                      </div>
                      <div class="task-info">${this.escapeHtml(taskInfo)}</div>
                      <div class="task-meta">
                          <span>ID: ${taskId}</span>
                      </div>
                  </div>
              `;
      })
      .join("");
  }
  updateOutput(mes, type = "info") {
    const output = document.getElementById("output");
    const timestamp = new Date().toLocaleTimeString();
    output.innerHTML = `<span class="${type}">[${timestamp}] ${mes}</span>`;
    output.scrollTop = output.scrollHeight;
  }

  escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) {
      return "";
    }
    return String(unsafe)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

export default TodoApp;
