const BASE_URL = "https://tasks-service-maks1394.amvera.io";

class ApiResponse {
  constructor(status, data, err) {
    this.status = status;
    this.data = data;
    this.err = err;
    this.timestamp = new Date().toISOString();
  }
}

export { BASE_URL, ApiResponse };