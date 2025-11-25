// "use client";
// import React from "react";


// export function StatsCard({ users, products, points }: { users: number; products: number; points: number; }) {
// return (
// <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
// <div className="bg-white p-4 rounded shadow">
// <p className="text-sm text-gray-500">Total Users</p>
// <p className="text-2xl font-semibold">{users}</p>
// </div>
// <div className="bg-white p-4 rounded shadow">
// <p className="text-sm text-gray-500">Total Products</p>
// <p className="text-2xl font-semibold">{products}</p>
// </div>
// <div className="bg-white p-4 rounded shadow">
// <p className="text-sm text-gray-500">Estimated Points</p>
// <p className="text-2xl font-semibold">{points}</p>
// </div>
// </div>
// );
// }

"use client";

import React from "react";
import { FiUsers, FiPackage, FiStar } from "react-icons/fi";

export function StatsCard({
  users,
  products,
  points,
}: {
  users: number;
  products: number;
  points: number;
}) {
  const cards = [
    {
      title: "Total Users",
      value: users,
      icon: <FiUsers size={26} />,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Total Products",
      value: products,
      icon: <FiPackage size={26} />,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Total Points (Estimated)",
      value: points,
      icon: <FiStar size={26} />,
      color: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="p-6 rounded-xl shadow-lg bg-white border border-gray-100 
                     hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div
              className={`h-14 w-14 rounded-xl bg-gradient-to-br ${card.color} 
                           flex items-center justify-center text-white`}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
