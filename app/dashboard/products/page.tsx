"use client";
import ProductsTable from "@/components/Dashboard/ProductsTable";
import { DashboardLayout } from "@/components/Dashboard/Layout";

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <ProductsTable />
    </DashboardLayout>
  );
}
