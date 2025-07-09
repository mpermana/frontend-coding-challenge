import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

type BidStatus = 'pending' | 'accepted' | 'rejected';

interface Bid {
  id: number;
  collection_id: number;
  price: number;
  user_id: number;
  status: BidStatus;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface EnrichedBid extends Bid {
  user: {
    id: number;
    name: string;
  };
}

const bidsPath = path.join(process.cwd(), 'data', 'bids.json');
const usersPath = path.join(process.cwd(), 'data', 'users.json');

function readBids(): Bid[] {
  const data = fs.readFileSync(bidsPath, 'utf-8');
  return JSON.parse(data);
}

function writeBids(bids: Bid[]) {
  fs.writeFileSync(bidsPath, JSON.stringify(bids, null, 2));
}

function readUsers(): User[] {
  const data = fs.readFileSync(usersPath, 'utf-8');
  return JSON.parse(data);
}

function getUserMap(users: User[]): Record<number, string> {
  const map: Record<number, string> = {};
  users.forEach((u) => {
    map[u.id] = u.name;
  });
  return map;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  let bids: Bid[] = readBids();
  const users: User[] = readUsers();
  const userMap = getUserMap(users);

  switch (method) {
    case 'GET': {
      const collectionId = parseInt(query.collection_id as string);
      let filtered = bids;
      if (!isNaN(collectionId)) {
        filtered = bids.filter((b) => b.collection_id === collectionId);
      }

      const enriched: EnrichedBid[] = filtered.map((b) => ({
        ...b,
        user: {
          id: b.user_id,
          name: userMap[b.user_id] || 'Unknown'
        }
      }));

      return res.status(200).json(enriched);
    }

    case 'POST': {
      const newBid: Bid = {
        id: Date.now(),
        collection_id: body.collection_id,
        price: body.price,
        user_id: body.user_id,
        status: 'pending'
      };
      bids.push(newBid);
      writeBids(bids);
      return res.status(201).json({
        ...newBid,
        user: {
          id: newBid.user_id,
          name: userMap[newBid.user_id] || 'Unknown'
        }
      });
    }

    case 'PUT': {
      const id = parseInt(query.id as string);
      const index = bids.findIndex((b) => b.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Bid not found' });
      }
      bids[index] = { ...bids[index], ...body };
      writeBids(bids);
      const updated = bids[index];
      return res.status(200).json({
        ...updated,
        user: {
          id: updated.user_id,
          name: userMap[updated.user_id] || 'Unknown'
        }
      });
    }

    case 'DELETE': {
      const id = parseInt(query.id as string);
      const index = bids.findIndex((b) => b.id === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Bid not found' });
      }
      const [deleted] = bids.splice(index, 1);
      writeBids(bids);
      return res.status(200).json({ message: `Bid ${id} deleted`, bid: deleted });
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
