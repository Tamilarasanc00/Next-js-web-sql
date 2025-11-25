// "use client";

// export default function LogoutButton() {
//   const handleLogout = () => {
//     // Remove token from cookies
//     document.cookie = "token=; path=/; max-age=0;";
//     // Remove from localStorage
//     localStorage.removeItem("token");

//     window.location.href = "/login";
//   };

//   return (
//     <button
//       onClick={handleLogout}
//       className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
//     >
//       Logout
//     </button>
//   );
// }


"use client";
import React from "react";


export default function LogoutButton() {
const handleLogout = () => {
document.cookie = "token=; path=/; max-age=0";
localStorage.removeItem("token");
window.location.href = "/login";
};


return (
<button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
);
}