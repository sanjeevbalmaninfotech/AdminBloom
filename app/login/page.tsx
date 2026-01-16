'use client';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { mainUrls } from '../constant/endPoints';


interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  [key: string]: unknown;
}

export default function Login() {
  const [username, setUsername] = useState('bloomHospital');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
   
    try {
      const apiUrl =  `${mainUrls.backendUrl}/admin/login`
        
    
      const response = await axios.post<LoginResponse>(
        apiUrl,
        {
          username,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    
      const data = response.data;
    
      if (data.success) {
        // Store login state
        localStorage.setItem('isLoggedIn', 'true');
    
        // Store token if provided
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
    
        // Redirect to home page
        router.push('/');
      } else {
        setError(data.message || 'Invalid username or password');
      }
    } catch (err: unknown) {
      console.error('Login error', err);
    
      if (axios.isAxiosError(err)) {
        const message =
          err.response?.data?.message ||
          err.response?.statusText ||
          'Failed to connect to server';
        setError(message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during login');
      }
    }
     finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={handleLogin} style={{ minWidth: 420, background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Image src="/BloomLogo.svg" alt="Website Logo" width={180} height={120} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ddd' }}
          />
        </div>
        {error && (
          <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
        )}
     <button
  type="submit"
  disabled={loading}
  className="w-full rounded-md bg-[#087ea4] px-4 py-2.5 text-white font-bold border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? 'Logging in...' : 'Login'}
</button>

      </form>
    </div>
  );
}

