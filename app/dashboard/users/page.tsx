"use client";
import UsersTable from "@/components/Dashboard/UsersTable";
import { DashboardLayout } from "@/components/Dashboard/Layout";

export default function UsersPage() {
  return (
    <DashboardLayout>
      <UsersTable />
    </DashboardLayout>
  );
}
