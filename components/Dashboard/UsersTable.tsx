
"use client";
import React, { useEffect, useState } from "react";

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [userType, setUserType] = useState("customer");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, mobile, userType, password: 'secret123' })
      });
      if (res.ok) { await fetchUsers(); setName(''); setEmail(''); setMobile(''); }
    } catch (err) { console.error(err); }
  };

  const deleteUser = async (id: number) => {
    console.log("Delete user ID:", id, typeof id);
    if (!confirm('Delete user?')) return;
    try { const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' }); if (res.ok) fetchUsers(); } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-4">
        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="p-2 border rounded" required />
          <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="p-2 border rounded" required />
          <input value={mobile} onChange={(e)=>setMobile(e.target.value)} placeholder="Mobile" className="p-2 border rounded" />
          <div className="flex gap-2">
            <select value={userType} onChange={(e)=>setUserType(e.target.value)} className="p-2 border rounded">
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button className="bg-indigo-600 text-white px-3 rounded">Add</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Mobile</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center">No users</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{i+1}</td>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.mobile}</td>
                <td className="p-2">{u.userType}</td>
                <td className="p-2">
                  <button onClick={()=>deleteUser(u.id)} className="text-sm text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
