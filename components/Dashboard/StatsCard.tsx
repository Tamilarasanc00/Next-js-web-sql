"use client";

import React from "react";
import { FiUsers, FiPackage, FiStar, FiShoppingCart } from "react-icons/fi";

export function StatsCard({
  role,
  users,
  products,
  points,
  myPoints,
  myProducts,
  myInventory,
}: {
  role: string;
  users: number;
  products: number;
  points: number;

  // customer-specific
  myPoints?: number;
  myProducts?: number;
  myInventory?: number;
}) {
  // -----------------------------------
  // CUSTOMER DASHBOARD CARDS
  // -----------------------------------
  const customerCards = [
    {
      title: "My Total Points",
      value: myPoints ?? 0,
      icon: <FiStar size={26} />,
      color: "from-green-500 to-green-600",
    },
    {
      title: "My Total Products",
      value: myProducts ?? 0,
      icon: <FiPackage size={26} />,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "My Inventory Items",
      value: myInventory ?? 0,
      icon: <FiShoppingCart size={26} />,
      color: "from-purple-500 to-purple-600",
    },
  ];

  // -----------------------------------
  // ADMIN / STAFF DASHBOARD CARDS
  // -----------------------------------
  const adminCards = [
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
console.log("ROLE",role);

  const cards = role === "customer" ? customerCards : adminCards;

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
