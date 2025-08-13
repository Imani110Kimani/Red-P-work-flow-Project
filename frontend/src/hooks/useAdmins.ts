import { useEffect, useState } from 'react';

export interface Admin {
  email: string;
  role: 'admin' | 'super_admin';
  created_at?: string;
  last_login?: string;
}

export function useAdmins(): { admins: Admin[]; loading: boolean; error: string } {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAdmins() {
      try {
        setLoading(true);
        setError('');
        const response = await fetch('https://simbamanageadmins-egambyhtfxbfhabc.westus-01.azurewebsites.net/api/read-admin');
        if (!response.ok) throw new Error('Failed to fetch admins');
        const data = await response.json();
        if (data.success && data.admins) {
          setAdmins(data.admins);
        } else {
          setAdmins([]);
        }
      } catch (err) {
        setError('Could not load admins');
      } finally {
        setLoading(false);
      }
    }
    fetchAdmins();
  }, []);

  return { admins, loading, error };
}
