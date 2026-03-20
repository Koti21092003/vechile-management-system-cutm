const API = import.meta.env.VITE_API_URL;

export const loginUser = async (email: string, password: string) => {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return res.json();
};

export const getVehicles = async (token: string) => {
  const res = await fetch(`${API}/vehicles`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.json();
};