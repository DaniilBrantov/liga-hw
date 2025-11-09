class ApiController {
  constructor(engine) {
    this.engine = engine;
  }

  async getAll() {
    return this.engine.get("/tasks");
  }

  async getById(id) {
    return this.engine.get(`/tasks/${id}`);
  }

  async createTask(taskData) {
    return this.engine.post("/tasks", taskData);
  }

  async updateTask(id, taskData) {
    return this.engine.patch(`/tasks/${id}`, taskData);
  }

  async deleteTask(id) {
    return this.engine.delete(`/tasks/${id}`);
  }

  async testCon() {
    return this.engine.get("/tasks");
  }
}

export default ApiController;