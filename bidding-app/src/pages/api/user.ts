import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface User {
  id: number;
  name: string;
  email: string;
}

const filePath = path.join(process.cwd(), 'data', 'users.json');

function readUsers(): User[] {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeUsers(users: User[]) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  let users: User[] = readUsers();

  switch (method) {
    case 'GET': {
      const id = query.id ? parseInt(query.id as string) : null;
      if (id) {
        const user = users.find(u => u.id === id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json(user);
      }
      return res.status(200).json(users);
    }

    case 'POST': {
      const newUser: User = {
        id: Date.now(),
        name: body.name,
        email: body.email
      };
      users.push(newUser);
      writeUsers(users);
      return res.status(201).json(newUser);
    }

    case 'PUT': {
      const id = parseInt(query.id as string);
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return res.status(404).json({ message: 'User not found' });

      users[index] = { ...users[index], ...body };
      writeUsers(users);
      return res.status(200).json(users[index]);
    }

    case 'DELETE': {
      const id = parseInt(query.id as string);
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return res.status(404).json({ message: 'User not found' });

      const deleted = users.splice(index, 1);
      writeUsers(users);
      return res.status(200).json({ message: `User ${id} deleted`, user: deleted[0] });
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
