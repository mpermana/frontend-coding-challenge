'use client';
import { useEffect, useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface UserSelectorProps {
  onSelect: (userId: number) => void;
  initialUserId?: number;
}

export default function UserSelector({ onSelect, initialUserId }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(initialUserId);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch('/api/user');
      const data = await res.json();
      setUsers(data);
      const defaultId = initialUserId ?? data[0]?.id;
      setSelectedUserId(defaultId);
      if (defaultId) onSelect(defaultId);
    };
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedUserId(id);
    onSelect(id);
  };

  return (
    <div className="top-4 right-4">
      <label className="text-sm font-medium mr-2">Developer User Selector:</label>
      <select
        value={selectedUserId ?? ''}
        onChange={handleChange}
        className="border rounded px-2 py-1"
      >
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
}
