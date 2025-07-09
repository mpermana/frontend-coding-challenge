import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const bidsFilePath = path.join(process.cwd(), 'data', 'bids.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { collection_id, bid_id } = req.body;

  if (typeof collection_id !== 'number' || typeof bid_id !== 'number') {
    return res.status(400).json({ error: 'Invalid collection_id or bid_id' });
  }

  try {
    // Read bids file
    const bidsData = await fs.promises.readFile(bidsFilePath, 'utf-8');
    const bids = JSON.parse(bidsData);

    // Find bid to accept
    const bidToAccept = bids.find((b: any) => b.id === bid_id && b.collection_id === collection_id);
    if (!bidToAccept) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    // Update bids status
    const updatedBids = bids.map((b: any) => {
      if (b.collection_id === collection_id) {
        if (b.id === bid_id) {
          return { ...b, status: 'accepted' };
        } else if (b.status !== 'rejected') {
          return { ...b, status: 'rejected' };
        }
      }
      return b;
    });

    // Write back updated bids
    await fs.promises.writeFile(bidsFilePath, JSON.stringify(updatedBids, null, 2), 'utf-8');

    return res.status(200).json({ message: 'Bid accepted successfully', acceptedBid: bidToAccept });
  } catch (error) {
    console.error('Error updating bids:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
