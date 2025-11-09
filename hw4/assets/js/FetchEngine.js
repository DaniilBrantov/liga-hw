import { BASE_URL, ApiResponse } from './config.js';

class FetchEngine {
  constructor(baseURL = BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(url, options = {}) {
    const start_time = Date.now();
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      let data;
      const text = await response.text();

      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { mes: text };
        }
      }

      const res = new ApiResponse(
        response.status,
        response.ok ? data : undefined,
        response.ok
          ? undefined
          : data?.mes || data?.err || `HTTP ${response.status}`
      );

      const duration = Date.now() - start_time;
      console.log(`[Fetch] ${options.method || "GET"} ${url}`, res);

      return res;
    } catch (err) {
      const res = new ApiResponse(0, undefined, err.mes);
      console.err(`[Fetch] ${options.method || "GET"} ${url}`, res);
      return res;
    }
  }

  async get(url) {
    return this.request(url, { method: "GET" });
  }

  async post(url, data) {
    return this.request(url, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async patch(url, data) {
    return this.request(url, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(url) {
    return this.request(url, { method: "DELETE" });
  }
}

export default FetchEngine;