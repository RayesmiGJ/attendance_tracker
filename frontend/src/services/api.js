import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Function to get CSRF token from cookies
function getCSRFToken() {
  const name = 'csrftoken';
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith(name))
    ?.split('=')[1];
  return cookieValue;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-CSRFToken': getCSRFToken(),  // Add CSRF token to headers
  },
  withCredentials: true,
});

// Update CSRF token before each request
api.interceptors.request.use(request => {
  // Get fresh token before each request
  const token = getCSRFToken();
  if (token) {
    request.headers['X-CSRFToken'] = token;
  }
  
  console.log('Starting Request:', request.method, request.url);
  console.log('Full URL:', API_BASE_URL + request.url);
  console.log('CSRF Token:', token);
  return request;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      console.error('CSRF token error - refreshing token');
      // You might want to refresh the page or handle this specially
    }
    return Promise.reject(error);
  }
);

export default api;