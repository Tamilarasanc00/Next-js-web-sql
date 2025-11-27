
// "use client";
// import React, { useEffect, useState } from "react";
// import {jwtDecode} from "jwt-decode";


// export default function ProductsTable() {
//   const [products, setProducts] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [sku, setSku] = useState("");
//   const [name, setName] = useState("");
//   const [pointsValue, setPointsValue] = useState<number>(0);
//   const [role, setRole] = useState<string>("");

// useEffect(() => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     const decoded: any = jwtDecode(token);
//     setRole(decoded.userType); // admin, staff, customer
//   }
// }, []);



//   const fetchProducts = async () => {
//     setLoading(true);
//     try { const res = await fetch('/api/admin/products'); const data = await res.json(); setProducts(Array.isArray(data) ? data : data.products || []); } catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   useEffect(()=>{ fetchProducts(); }, []);

//   const createProduct = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const res = await fetch('/api/admin/products', {
//         method: 'POST', headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ sku, name, pointsValue })
//       });
//       if (res.ok) { await fetchProducts(); setSku(''); setName(''); setPointsValue(0); }
//     } catch (err) { console.error(err); }
//   };

//  // const deleteProduct = async (id: number) => { if (!confirm('Delete product?')) return; try { const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); if (res.ok) fetchProducts(); } catch (err) { console.error(err); } };
// const deleteProduct = async (id: number) => {
//   try {
//     const confirmDelete = confirm("Delete product?");
//     if (!confirmDelete) return;

//     const res = await fetch(`/api/admin/products/${id}`, {
//       method: "DELETE",
//       headers: { "Content-Type": "application/json" }
//     });

//     if (!res.ok) {
//       const error = await res.json();
//       console.error("Delete Error:", error);
//       alert(error.error || "Delete failed");
//       return;
//     }

//     fetchProducts(); // refresh list
//   } catch (err) {
//     console.error("Network Error:", err);
//     alert("Network error. Please try again.");
//   }
// };


//   return (
//     <div>
//       <div className="bg-white p-4 rounded shadow mb-4">
//         <form onSubmit={createProduct} className="grid grid-cols-1 md:grid-cols-4 gap-2">
//           <input value={sku} onChange={(e)=>setSku(e.target.value)} placeholder="SKU" className="p-2 border rounded" required />
//           <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" className="p-2 border rounded" required />
//           <input value={pointsValue} onChange={(e)=>setPointsValue(Number(e.target.value))} placeholder="Points" className="p-2 border rounded" type="number" required />
//           <div className="flex gap-2">
//             {role !== "customer" && (
//               <button className="bg-indigo-600 text-white px-3 rounded">Add</button>
//             )}

//           </div>
//         </form>
//       </div>

//       <div className="bg-white rounded shadow overflow-x-auto">
//         <table className="min-w-full">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="p-2 text-left">#</th>
//               <th className="p-2 text-left">SKU</th>
//               <th className="p-2 text-left">Name</th>
//               <th className="p-2 text-left">Points</th>
//               <th className="p-2 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {loading ? (
//               <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
//             ) : products.length === 0 ? (
//               <tr><td colSpan={5} className="p-4 text-center">No products</td></tr>
//             ) : products.map((p,i)=> (
//               <tr key={p.id} className="border-t hover:bg-gray-50">
//                 <td className="p-2">{i+1}</td>
//                 <td className="p-2">{p.sku}</td>
//                 <td className="p-2">{p.name}</td>
//                 <td className="p-2">{p.pointsValue}</td>
//                 <td className="p-2">
//                   {role === "admin" && (
//   <button onClick={() => deleteProduct(p.id)} className="text-sm text-red-600">
//     Delete
//   </button>
// )}

//                   </td>
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
import { jwtDecode } from "jwt-decode";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

export default function ProductsTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [pointsValue, setPointsValue] = useState<string>(0);
  const [role, setRole] = useState<string>("");

const [imageFile, setImageFile] = useState<File | null>(null);
const [preview, setPreview] = useState("");

  // Decode token and get role
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: any = jwtDecode(token);
      setRole(decoded.userType); // admin, staff, customer
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e: any) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImageFile(file);
  setPreview(URL.createObjectURL(file));
};

const createProduct = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!sku || !name || !pointsValue) return;

  const formData = new FormData();
  formData.append("sku", sku);
  formData.append("name", name);
  formData.append("pointsValue", String(pointsValue));
  if (imageFile) formData.append("image", imageFile);

  try {
    const res = await fetch("/api/admin/products", {
      method: "POST",
      body: formData, // <-- IMPORTANT: NO HEADERS
    });

    const data = await res.json();

    if (res.ok) {
      await fetchProducts();
      setSku("");
      setName("");
      setPointsValue('');
      setImageFile(null);
      setPreview("");
    } else {
      alert(data.error || "Failed");
    }
  } catch (error) {
    console.error(error);
  }
};


  const deleteProduct = async (id: number) => {
    try {
      const confirmDelete = confirm("Delete product?");
      if (!confirmDelete) return;

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Delete Error:", error);
        alert(error.error || "Delete failed");
        return;
      }

      fetchProducts();
    } catch (err) {
      console.error("Network Error:", err);
      alert("Network error. Please try again.");
    }
  };

  // ----------------------------
  // TABLE COLUMNS
  // ----------------------------
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "sku",
        header: "SKU",
      },
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "pointsValue",
        header: "Points",
      },
      {
        header: "Actions",
        cell: ({ row }) =>
          role === "admin" ? (
            <button
              onClick={() => deleteProduct(row.original.id)}
              className="text-red-600 text-sm"
            >
              Delete
            </button>
          ) : (
            <span className="text-gray-400 text-xs">No access</span>
          ),
      },
    ],
    [role]
  );

  return (
    <div className="space-y-6">
      {/* -----------------------------------------
          CREATE PRODUCT FORM
      ------------------------------------------ */}
      
        
{role !== 'customer' && (
<div className="bg-white p-4 rounded shadow mb-4">
 <form
  onSubmit={createProduct}
  className="grid grid-cols-1 md:grid-cols-5 gap-2"
>
  {/* SKU */}
<input
  value={sku}
  onChange={(e) => {
    let val = e.target.value.toUpperCase();      // convert to uppercase
    val = val.replace(/[^A-Z0-9]/g, "");         // allow only A-Z and 0-9
    setSku(val);
  }}
  placeholder="SKU"
  className="p-2 border rounded"
  required
/>


  {/* NAME */}
  <input
    value={name}
    onChange={(e) => setName(e.target.value)}
    placeholder="Name"
    className="p-2 border rounded"
    required
  />

  {/* POINTS */}
<input
  type="text"
  className="p-2 border rounded"
  placeholder="Points"
  value={pointsValue}
  onChange={(e) => {
    const value = e.target.value.replace(/\D/g, ''); // only digits 0–9
    setPointsValue(value);
  }}
  required
/>


  {/* IMAGE FILE */}
  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="p-2 border rounded"
  />

  {/* SUBMIT */}
  <button className="bg-indigo-600 text-white px-3 rounded">
    Add
  </button>
</form>
{/* IMAGE PREVIEW */}
{preview && (
  <div className="mt-2">
    <img
      src={preview}
      className="w-20 h-20 rounded border object-cover"
    />
  </div>
)}

      </div>
)}








      {/* -----------------------------------------
               PRODUCT TABLE (TANSTACK)
      ------------------------------------------ */}
      <ProductsDataTable columns={columns} data={products} loading={loading} />
    </div>
  );
}

// --------------------------
// REUSABLE DATATABLE SECTION
// --------------------------
function ProductsDataTable({
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
      <input
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search..."
        className="p-2 border rounded w-64"
      />

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
                  No products
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
