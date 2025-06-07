import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, orderBy, query, limit, getDocs } from 'firebase/firestore';

export default function Logs() {
  const [logs, setLogs] = useState([]);

  const load = async () => {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    setLogs(snap.docs.map((d) => d.data()));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Recent Logs</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr><th className="p-2 text-left">Time</th><th>User</th><th>Action</th></tr>
        </thead>
        <tbody>
          {logs.map((l, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{new Date(l.timestamp).toLocaleString()}</td>
              <td>{l.email}</td>
              <td>{l.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
