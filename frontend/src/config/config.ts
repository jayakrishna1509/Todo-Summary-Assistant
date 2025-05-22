interface Config {
  apiBaseUrl: string;
}

const defaultConfig: Config = {
  apiBaseUrl: 'http://localhost:5000/api'
};

export const config: Config = defaultConfig;