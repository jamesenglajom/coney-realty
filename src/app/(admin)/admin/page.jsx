import React from "react";

import StatCard from "@/app/components/admin/dashboard/StatCard";
import Table1 from "@/app/components/admin/table/Table1";
import SampleTable from "@/app/components/admin/table/SampleTable";

function page() {
  const dashboardStats = [
    {
      id: 1,
      title: "Total Active Users",
      value: "12,842",
      change: 12.5, // Percentage increase
      trend: "up",
    },
    {
      id: 2,
      title: "Monthly Revenue",
      value: "$45,200",
      change: 8.2,
      trend: "up",
    },
    {
      id: 3,
      title: "Product Stock Alerts",
      value: "14",
      change: -2.4, // Indicates a decrease in alerts
      trend: "down",
    },
    {
      id: 4,
      title: "Pending Blog Reviews",
      value: "29",
      change: 5.0,
      trend: "up",
    },
  ];

  const userColumns = ["User Name", "Status", "Role", "Actions"];

  const userData = [
    {
      id: "u1",
      name: "Alex Thompson",
      email: "alex.t@company.com",
      status: "Active", // Trigger: Green Badge
      role: "Super Admin",
      lastLogin: "2 mins ago",
    },
    {
      id: "u2",
      name: "Sarah Jenkins",
      email: "s.jenkins@design.io",
      status: "Pending", // Trigger: Gold/Yellow Badge
      role: "Editor",
      lastLogin: "5 hours ago",
    },
    {
      id: "u3",
      name: "Michael Chen",
      email: "m.chen@tech.com",
      status: "Inactive", // Trigger: Gray/Muted Badge
      role: "Viewer",
      lastLogin: "3 days ago",
    },
    {
      id: "u4",
      name: "Elena Rodriguez",
      email: "elena.rod@market.es",
      status: "Suspended", // Trigger: Red Badge
      role: "Product Manager",
      lastLogin: "1 week ago",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard title="Total Users" value="12,482" trend={12} />
      <StatCard title="Active Blogs" value="156" trend={-2} />
      <StatCard title="Revenue" value="$45,200" trend={8} />
      <StatCard title="Pending Orders" value="43" trend={24} />
    </div>
  );
}

export default page;
