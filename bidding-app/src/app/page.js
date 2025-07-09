'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import UserSelector from '@/components/UserSelector';

export default function BiddingSystem() {
  const [collections, setCollections] = useState([]);
  const [bids, setBids] = useState({});
  const [userId, setUserId] = useState();

  // Collection form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [formCollection, setFormCollection] = useState({
    name: '',
    descriptions: '',
    stocks: 0,
    price: 0,
  });

  // Bid editing states
  const [editingBid, setEditingBid] = useState(null);
  const [editBidPrice, setEditBidPrice] = useState('');

  useEffect(() => {
    fetch('/api/collections')
      .then((res) => res.json())
      .then(setCollections);
  }, []);

  const fetchBids = async (collectionId) => {
    const res = await fetch(`/api/bids?collection_id=${collectionId}`);
    const data = await res.json();
    setBids((prev) => ({ ...prev, [collectionId]: data }));
  };

  const handleAcceptBid = async (collectionId, bidId) => {
    await fetch('/api/bids/accept', {
      method: 'POST',
      body: JSON.stringify({ collection_id: collectionId, bid_id: bidId }),
      headers: { 'Content-Type': 'application/json' },
    });
    await fetchBids(collectionId);
  };

  const handleDeleteCollection = async (collectionId) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;

    const res = await fetch(`/api/collections?id=${collectionId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setCollections((prev) => prev.filter((c) => c.id !== collectionId));
      setBids((prev) => {
        const updated = { ...prev };
        delete updated[collectionId];
        return updated;
      });
    } else {
      alert('Failed to delete collection');
    }
  };

  const openEditForm = (collection) => {
    setEditingCollection(collection);
    setFormCollection({
      name: collection.name,
      descriptions: collection.descriptions,
      stocks: collection.stocks,
      price: collection.price,
    });
    setShowCreateForm(true);
  };

  const openCreateForm = () => {
    setEditingCollection(null);
    setFormCollection({ name: '', descriptions: '', stocks: 0, price: 0 });
    setShowCreateForm(true);
  };

  const handleFormSubmit = async () => {
    if (!formCollection.name.trim()) {
      alert('Name is required');
      return;
    }

    if (editingCollection) {
      const res = await fetch(`/api/collections?id=${editingCollection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formCollection),
      });
      if (res.ok) {
        const updated = await res.json();
        setCollections((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        setShowCreateForm(false);
        setEditingCollection(null);
      } else {
        alert('Failed to update collection');
      }
    } else {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formCollection, user_id: userId }),
      });
      if (res.ok) {
        const created = await res.json();
        setCollections((prev) => [created, ...prev]);
        setShowCreateForm(false);
      } else {
        alert('Failed to create collection');
      }
    }
  };

  const handleCreateBid = async (collectionId) => {
    if (!userId) {
      alert('Please select a user first.');
      return;
    }

    const bidPrice = prompt('Enter your bid price:');
    if (!bidPrice || isNaN(bidPrice)) {
      alert('Invalid bid price.');
      return;
    }

    const res = await fetch('/api/bids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection_id: collectionId,
        price: Number(bidPrice),
        user_id: userId,
        status: 'pending',
      }),
    });

    if (res.ok) {
      alert('Bid created successfully!');
      fetchBids(collectionId);
    } else {
      alert('Failed to create bid.');
    }
  };

  const handleCancelBid = async (collectionId, bidId) => {
    if (!window.confirm('Are you sure you want to cancel this bid?')) return;

    const res = await fetch(`/api/bids?id=${bidId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      alert('Bid cancelled');
      fetchBids(collectionId);
    } else {
      alert('Failed to cancel bid');
    }
  };

  return (
    <div className="p-4 relative">
      <UserSelector onSelect={(id) => setUserId(id)} />

      {/* Header + Create Button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Welcome to Bidding System</h1>
        <Button onClick={openCreateForm}>Create Collection</Button>
      </div>

      {/* Create / Edit Collection Form */}
      {showCreateForm && (
        <div className="border p-4 rounded mb-6 bg-gray-50 max-w-md">
          <h2 className="text-lg font-semibold mb-2">
            {editingCollection ? 'Edit Collection' : 'Create New Collection'}
          </h2>
          <input
            className="border p-2 rounded w-full mb-2"
            placeholder="Name"
            value={formCollection.name}
            onChange={(e) =>
              setFormCollection({ ...formCollection, name: e.target.value })
            }
          />
          <textarea
            className="border p-2 rounded w-full mb-2"
            placeholder="Description"
            value={formCollection.descriptions}
            onChange={(e) =>
              setFormCollection({ ...formCollection, descriptions: e.target.value })
            }
          />
          <input
            type="number"
            className="border p-2 rounded w-full mb-2"
            placeholder="Stocks"
            value={formCollection.stocks}
            onChange={(e) =>
              setFormCollection({ ...formCollection, stocks: Number(e.target.value) })
            }
          />
          <input
            type="number"
            className="border p-2 rounded w-full mb-2"
            placeholder="Price"
            value={formCollection.price}
            onChange={(e) =>
              setFormCollection({ ...formCollection, price: Number(e.target.value) })
            }
          />
          <div className="flex space-x-2">
            <Button onClick={handleFormSubmit}>
              {editingCollection ? 'Update' : 'Create'}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowCreateForm(false);
                setEditingCollection(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Collections List */}
      <div className="grid gap-6">
        {collections.map((collection) => (
          <Card key={collection.id} className="bg-white rounded-2xl shadow p-4">
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{collection.name}</h2>
                  <p>{collection.descriptions}</p>
                  <p>
                    <strong>Stocks:</strong> {collection.stocks} | <strong>Price:</strong> ${collection.price}
                  </p>
                </div>
                {collection.user_id === userId && (
                  <div className="space-x-2">
                    <Button onClick={() => openEditForm(collection)}>Edit</Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteCollection(collection.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <Button onClick={() => fetchBids(collection.id)}>Show Bids</Button>
                <Button onClick={() => handleCreateBid(collection.id)}>Create Bid</Button>
              </div>

              <div className="mt-2 grid gap-2">
                {(bids[collection.id] || []).map((bid) => (
                  <div
                    key={bid.id}
                    className="flex justify-between items-center border p-2 rounded"
                  >
                    <div>
                      <p>
                        <strong>User:</strong> {bid.user.name} | <strong>Bid:</strong> ${bid.price} |{' '}
                        <strong>Status:</strong> {bid.status}
                      </p>
                    </div>

                    {collection.user_id === userId ? (
                      <div className="space-x-2 flex items-center">
                        <Button
                          disabled={bid.status !== 'pending'}
                          onClick={() => handleAcceptBid(collection.id, bid.id)}
                        >
                          Accept
                        </Button>
                        {userId === bid.user_id && bid.status === 'pending' &&
                        <Button variant="destructive" onClick={() => handleCancelBid(collection.id, bid.id)}>Cancel Bid (delete)</Button>}
                      </div>
                    ) : bid.user_id === userId ? (
                      <div className="space-x-2 flex items-center">
                        {editingBid?.id === bid.id ? (
                          <>
                            <input
                              type="number"
                              className="border rounded px-2 py-1 w-24 mr-2"
                              value={editBidPrice}
                              onChange={(e) => setEditBidPrice(e.target.value)}
                            />
                            <Button
                              onClick={async () => {
                                if (!editBidPrice || isNaN(editBidPrice)) {
                                  alert('Invalid price');
                                  return;
                                }
                                const res = await fetch(`/api/bids?id=${bid.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ price: Number(editBidPrice) }),
                                });
                                if (res.ok) {
                                  await fetchBids(collection.id);
                                  setEditingBid(null);
                                } else {
                                  alert('Failed to update bid');
                                }
                              }}
                            >
                              Save
                            </Button>
                            <Button variant="destructive" onClick={() => setEditingBid(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              disabled={bid.status === 'rejected'}
                              onClick={() => {
                                setEditingBid(bid);
                                setEditBidPrice(bid.price);
                              }}
                            >
                              Edit
                            </Button>
                            <Button variant="destructive" onClick={() => handleCancelBid(collection.id, bid.id)}>Cancel Bid (delete)</Button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
