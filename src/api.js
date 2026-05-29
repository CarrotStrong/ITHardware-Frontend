const BASE_URL = import.meta.env.VITE_API_URL;

export const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  //Jeśli 401 brak tokena
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/'; 
    return null;
  }

  //Jeśli 403 brak uprawnień
  if (response.status === 403) {
    console.error("Brak uprawnień do tego zasobu (403)");
    return response; 
  }

  return response;
};