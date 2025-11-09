import { BASE_URL, ApiResponse } from './config.js';

class XhrEngine {
  constructor(baseURL = BASE_URL) {
    this.baseURL = baseURL;
  }

  request(method, url, data = null) {
    return new Promise((resolve) => {
      const start_time = Date.now();
      const xhr = new XMLHttpRequest();

      xhr.open(method, `${this.baseURL}${url}`);
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          let responseData;
          try {
            responseData = xhr.responseText
              ? JSON.parse(xhr.responseText)
              : null;
          } catch (e) {
            responseData = null;
          }

          const res = new ApiResponse(
            xhr.status,
            xhr.status >= 200 && xhr.status < 300 ? responseData : undefined,
            xhr.status >= 200 && xhr.status < 300
              ? undefined
              : responseData?.mes || `HTTP ${xhr.status}`
          );

          const duration = Date.now() - start_time;
          console.log(`[XHR] ${method} ${url}`, res);
          resolve(res);
        }
      };

      xhr.onerr = () => {
        const res = new ApiResponse(0, undefined, "Network err");
        console.err(`[XHR] ${method} ${url}`, res);
        resolve(res);
      };

      xhr.send(data ? JSON.stringify(data) : null);
    });
  }

  async get(url) {
    return this.request("GET", url);
  }

  async post(url, data) {
    return this.request("POST", url, data);
  }

  async patch(url, data) {
    return this.request("PATCH", url, data);
  }

  async delete(url) {
    return this.request("DELETE", url);
  }
}

export default XhrEngine;