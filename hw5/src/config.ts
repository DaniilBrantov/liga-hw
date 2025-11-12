interface AppConfig {
  API_URL: string;
  BASE_CONFIG: RequestInit;
}

const config: AppConfig = {
  API_URL: process.env.REACT_APP_API_URL || 'https://tasks-service-maks1394.amvera.io',
  BASE_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

if (!config.API_URL) {
  console.warn('REACT_APP_API_URL не установлен, используется значение по умолчанию');
}

export default config;
