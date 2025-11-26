
// "use client";
// import React, { useEffect, useState } from "react";

// export default function UsersTable() {
//   const [users, setUsers] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [mobile, setMobile] = useState("");
//   const [userType, setUserType] = useState("customer");

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch('/api/admin/users');
//       const data = await res.json();
//       setUsers(Array.isArray(data) ? data : data.users || []);
//     } catch (err) {
//       console.error(err);
//     } finally { setLoading(false); }
//   };

//   useEffect(() => { fetchUsers(); }, []);

//   const createUser = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const res = await fetch('/api/admin/users', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ name, email, mobile, userType, password: 'secret123' })
//       });
//       if (res.ok) { await fetchUsers(); setName(''); setEmail(''); setMobile(''); }
//     } catch (err) { console.error(err); }
//   };

//   const deleteUser = async (id: number) => {
//     console.log("Delete user ID:", id, typeof id);
//     if (!confirm('Delete user?')) return;
//     try { const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' }); if (res.ok) fetchUsers(); } catch (err) { console.error(err); }
//   };

//   return (
//     <div>
//       <div className="bg-white p-4 rounded shadow mb-4">
//         <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-2">
//           <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="p-2 border rounded" required />
//           <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="p-2 border rounded" required />
//           <input value={mobile} onChange={(e)=>setMobile(e.target.value)} placeholder="Mobile" className="p-2 border rounded" />
//           <div className="flex gap-2">
//             <select value={userType} onChange={(e)=>setUserType(e.target.value)} className="p-2 border rounded">
//               <option value="customer">Customer</option>
//               <option value="staff">Staff</option>
//               <option value="admin">Admin</option>
//             </select>
//             <button className="bg-indigo-600 text-white px-3 rounded">Add</button>
//           </div>
//         </form>
//       </div>

//       <div className="bg-white rounded shadow overflow-x-auto">
//         <table className="min-w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="p-2 text-left">#</th>
//               <th className="p-2 text-left">Name</th>
//               <th className="p-2 text-left">Email</th>
//               <th className="p-2 text-left">Mobile</th>
//               <th className="p-2 text-left">Type</th>
//               <th className="p-2 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
//             ) : users.length === 0 ? (
//               <tr><td colSpan={6} className="p-4 text-center">No users</td></tr>
//             ) : users.map((u, i) => (
//               <tr key={u.id} className="border-t hover:bg-gray-50">
//                 <td className="p-2">{i+1}</td>
//                 <td className="p-2">{u.name}</td>
//                 <td className="p-2">{u.email}</td>
//                 <td className="p-2">{u.mobile}</td>
//                 <td className="p-2">{u.userType}</td>
//                 <td className="p-2">
//                   <button onClick={()=>deleteUser(u.id)} className="text-sm text-red-600">Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }



"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

// -----------------------------
// USER PAGE
// -----------------------------
export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [userType, setUserType] = useState("customer");

  const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string>("");

// Handle file selection
const handleImage = (e: any) => {
  const file = e.target.files[0];
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
};

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

// CREATE USER with Image
const createUser = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const form = new FormData();
    form.append("name", name);
    form.append("email", email);
    form.append("mobile", mobile);
    form.append("userType", userType);
    form.append("password", "secret123");

    if (imageFile) {
      form.append("image", imageFile); // attach image
    }

    const res = await fetch("/api/admin/users", {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      await fetchUsers();
      setName("");
      setEmail("");
      setMobile("");
      setImageFile(null);
      setImagePreview("");
    }
  } catch (err) {
    console.error(err);
  }
};

  const deleteUser = async (id: number) => {
    if (!confirm("Delete user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Define Columns
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "mobile",
        header: "Mobile",
      },
      {
        accessorKey: "userType",
        header: "Type",
        cell: ({ row }) => (
          <span className="px-2 py-1 rounded bg-gray-100 text-sm">
            {row.original.userType}
          </span>
        ),
      },
      {
  accessorKey: "image",
  header: "Image",
  cell: ({ row }) =>
    row.original.image ? (
      <img
        src={row.original.image}
        className="w-10 h-10 rounded object-cover border"
      />
    ) : (
      <span className="text-gray-400 text-xs">No Image</span>
    ),
},

      {
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => deleteUser(row.original.id)}
            className="text-red-600 text-sm"
          >
            Delete
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* -----------------------------------
            CREATE USER FORM
      ------------------------------------ */}
      <div className="bg-white p-4 rounded shadow mb-4">


        <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-5 gap-2">
  <input
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Name"
    className="p-2 border rounded"
    required
  />
  <input
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Email"
    className="p-2 border rounded"
    required
  />
  <input
    value={mobile}
    onChange={(e) => setMobile(e.target.value)}
    placeholder="Mobile"
    className="p-2 border rounded"
  />

  {/* Image Upload */}
  <input
    type="file"
    accept="image/*"
    onChange={handleImage}
    className="p-2 border rounded"
  />

  {/* Image Preview */}
  {imagePreview && (
    <img
      src={imagePreview}
      alt="preview"
      className="w-12 h-12 rounded border object-cover"
    />
  )}

  <div className="flex gap-2">
    <select
      value={userType}
      onChange={(e) => setUserType(e.target.value)}
      className="p-2 border rounded"
    >
      <option value="customer">Customer</option>
      <option value="staff">Staff</option>
      <option value="admin">Admin</option>
    </select>

    <button className="bg-indigo-600 text-white px-3 rounded">
      Add
    </button>
  </div>
</form>

      </div>

      {/* -----------------------------------
            USERS TABLE USING TANSTACK
      ------------------------------------ */}
      <AdvancedDataTable columns={columns} data={users} loading={loading} />
    </div>
  );
}

// -----------------------------
// ADVANCED DATATABLE COMPONENT
// -----------------------------
function AdvancedDataTable({
  columns,
  data,
  loading,
}: {
  columns: ColumnDef<any>[];
  data: any[];
  loading: boolean;
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="p-2 border rounded w-64"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="p-2 text-left cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getIsSorted() === "asc" && " ▲"}
                    {header.column.getIsSorted() === "desc" && " ▼"}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-center" colSpan={columns.length}>
                  Loading...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td className="p-4 text-center" colSpan={columns.length}>
                  No users
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>

        <span className="ml-4">
          Page {table.getState().pagination.pageIndex + 1} /{" "}
          {table.getPageCount()}
        </span>
      </div>
    </div>
  );
}
