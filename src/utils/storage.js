// Centralized LocalStorage Manager for Carevaa
// Only the logged-in user's session is kept in the browser; all app data comes from the backend API.

const getStorage = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage`, error);
    return defaultValue;
  }
};

const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage`, error);
  }
};

export const getAppointments = () => getStorage('carevia_appointments');
export const saveAppointments = (appointments) => setStorage('carevia_appointments', appointments);

export const getDoctors = () => getStorage('carevia_doctors');
export const saveDoctors = (doctors) => setStorage('carevia_doctors', doctors);

export const getPatients = () => getStorage('carevia_patients');
export const savePatients = (patients) => setStorage('carevia_patients', patients);

export const getCurrentUser = () => getStorage('carevia_current_user', null);
export const saveCurrentUser = (user) => setStorage('carevia_current_user', user);
export const clearCurrentUser = () => localStorage.removeItem('carevia_current_user');
