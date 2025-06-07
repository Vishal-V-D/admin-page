// src/pages/Dashboard.jsx
import React, { useEffect, useState, useMemo } from "react"; // Added useMemo
import { db } from "../services/firebase"; // Make sure auth is NOT imported if not used
import { collection, getDocs } from "firebase/firestore";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users as UsersIcon,
  CheckCircle,
  Clock,
  XCircle,
  BarChart2,
  PieChart as PieChartIcon,
  Zap, // New icon for insights
  Award, // New icon for insights
  TrendingUp, // New icon for insights
} from "lucide-react"; // Icons for dashboard cards

export default function Dashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [approvedUsers, setApprovedUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [revokedUsers, setRevokedUsers] = useState(0);
  const [userRoles, setUserRoles] = useState({});
  const [newUsersOverTime, setNewUsersOverTime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pieColors, setPieColors] = useState([]);
  const [rolePieColors, setRolePieColors] = useState([]);

  useEffect(() => {
    // Dynamically get CSS variable values for chart colors
    const rootStyles = getComputedStyle(document.documentElement);
    setPieColors([
      rootStyles.getPropertyValue("--color-success").trim(), // Approved
      rootStyles.getPropertyValue("--color-warning").trim(), // Pending
      rootStyles.getPropertyValue("--color-danger").trim(), // Revoked
    ]);
    setRolePieColors([
      rootStyles.getPropertyValue("--color-primary").trim(),
      rootStyles.getPropertyValue("--color-secondary").trim(),
      rootStyles.getPropertyValue("--color-accent").trim(),
      rootStyles.getPropertyValue("--color-info").trim(),
      // Add more colors if you expect more roles
      rootStyles.getPropertyValue("--color-text-soft").trim(),
    ]);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Ensure invitedAt is a Date object for sorting
          invitedAt: doc.data().invitedAt?.toDate() || new Date(),
        }));

        const approvedCount = users.filter(
          (u) => u.status === "approved"
        ).length;
        const pendingCount = users.filter(
          (u) => u.status === "pending"
        ).length;
        const revokedCount = users.filter(
          (u) => u.status === "revoked"
        ).length;

        setTotalUsers(users.length);
        setApprovedUsers(approvedCount);
        setPendingUsers(pendingCount);
        setRevokedUsers(revokedCount);

        // Calculate user roles distribution
        const roles = {};
        users.forEach((user) => {
          const role = user.role || "viewer"; // Default to 'viewer' if role is missing
          roles[role] = (roles[role] || 0) + 1;
        });
        setUserRoles(roles);

        // Calculate new users over time (weekly for simplicity)
        const weeklyUsers = {};
        users.forEach(user => {
            const date = new Date(user.invitedAt);
            const startOfWeek = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
            const weekKey = startOfWeek.toISOString().split('T')[0]; // YYYY-MM-DD for week start
            weeklyUsers[weekKey] = (weeklyUsers[weekKey] || 0) + 1;
        });

        // Sort keys and format for Recharts
        const sortedWeeks = Object.keys(weeklyUsers).sort();
        const activityData = sortedWeeks.map(key => ({
            date: key,
            'New Users': weeklyUsers[key]
        }));
        setNewUsersOverTime(activityData);

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  // Memoized data for charts and insights to prevent unnecessary re-renders
  const approvalPieData = useMemo(() => ([
    { name: "Approved", value: approvedUsers },
    { name: "Pending", value: pendingUsers },
    { name: "Revoked", value: revokedUsers },
  ]), [approvedUsers, pendingUsers, revokedUsers]);

  const rolePieData = useMemo(() => (
    Object.keys(userRoles).map((role) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: userRoles[role],
    }))
  ), [userRoles]);

  // --- New Insights Calculations ---
  const approvalRate = useMemo(() => {
    if (totalUsers === 0) return "0%";
    return `${((approvedUsers / totalUsers) * 100).toFixed(1)}%`;
  }, [approvedUsers, totalUsers]);

  const mostCommonRole = useMemo(() => {
    if (Object.keys(userRoles).length === 0) return "N/A";
    let commonRole = "N/A";
    let maxCount = 0;
    for (const role in userRoles) {
      if (userRoles[role] > maxCount) {
        maxCount = userRoles[role];
        commonRole = role.charAt(0).toUpperCase() + role.slice(1);
      }
    }
    return commonRole;
  }, [userRoles]);

  const averageWeeklySignups = useMemo(() => {
    if (newUsersOverTime.length === 0) return 0;
    const totalNewUsers = newUsersOverTime.reduce((sum, week) => sum + week['New Users'], 0);
    return (totalNewUsers / newUsersOverTime.length).toFixed(1);
  }, [newUsersOverTime]);
  // --- End New Insights Calculations ---


  if (loading)
    return (
      <p
        className="text-center text-xl animate-fadeIn"
        style={{ color: "var(--color-text-soft)" }}
      >
        Loading dashboard...
      </p>
    );

  return (
    <div className="space-y-8 animate-fadeIn">
      <h2
        className="text-4xl font-extrabold text-center mb-8"
        style={{ color: "var(--color-text)" }}
      >
        Dashboard Overview
      </h2>

      {/* User Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Users"
          value={totalUsers}
          icon={UsersIcon}
          color="var(--color-primary)"
        />
        <DashboardCard
          title="Approved Users"
          value={approvedUsers}
          icon={CheckCircle}
          color="var(--color-success)"
        />
        <DashboardCard
          title="Pending Users"
          value={pendingUsers}
          icon={Clock}
          color="var(--color-warning)"
        />
        <DashboardCard
          title="Revoked Users"
          value={revokedUsers}
          icon={XCircle}
          color="var(--color-danger)"
        />
      </div>

      {/* Key Insights Section */}
      <h3
        className="text-2xl font-semibold text-center mt-10 mb-6"
        style={{ color: "var(--color-text)" }}
      >
        Key Insights
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Approval Rate"
          value={approvalRate}
          icon={Zap}
          color="var(--color-success)" // Green for good rate
        />
        <DashboardCard
          title="Most Common Role"
          value={mostCommonRole}
          icon={Award}
          color="var(--color-secondary)" // Accent color
        />
        <DashboardCard
          title="Avg. Weekly Signups"
          value={averageWeeklySignups}
          icon={TrendingUp}
          color="var(--color-info)" // Info color
        />
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Users Over Time Chart */}
        <div
          className="p-6 rounded-lg shadow-lg"
          style={{
            backgroundColor: "var(--color-card-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            className="text-xl font-medium mb-4 flex items-center"
            style={{ color: "var(--color-text-soft)" }}
          >
            <BarChart2 size={20} className="mr-2" /> New Users Over Time
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={newUsersOverTime} margin={{ top: 20, right: 30, bottom: 20, left: 0 }}> {/* Increased margin */}
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--color-text-soft)' }} />
              <YAxis tick={{ fill: 'var(--color-text-soft)' }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: 'var(--color-text-soft)' }}
                contentStyle={{
                  backgroundColor: 'var(--color-card-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  borderRadius: '8px',
                  padding: '10px'
                }}
                labelStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                itemStyle={{ color: 'var(--color-text)' }}
                formatter={(value, name) => [`${value} users`, `Week of ${name}`]} // Custom formatter for clear display
              />
              <Line
                type="monotone"
                dataKey="New Users"
                stroke="var(--color-info)"
                strokeWidth={3}
                dot={{ stroke: 'var(--color-info)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Approval Status Pie Chart */}
        <div
          className="p-12 rounded-lg shadow-lg"
          style={{
            backgroundColor: "var(--color-card-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            className="text-xl font-medium mb-4 flex items-center"
            style={{ color: "var(--color-text-soft)" }}
          >
            <PieChartIcon size={20} className="mr-2" /> User Approval Status
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}> {/* Increased margin */}
              <Pie
                data={approvalPieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80} // Adjusted outerRadius slightly
                labelLine={false}
                label={({ name, percent, value }) => {
                  if (value === 0) return ''; // Hide label if value is 0
                  return `${name} (${(percent * 100).toFixed(0)}%)`;
                }}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {approvalPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Legend
                wrapperStyle={{ color: "var(--color-text)", paddingTop: '10px' }}
                formatter={(value) => (
                  <span style={{ color: "var(--color-text)" }}>{value}</span>
                )}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  borderRadius: '8px',
                  padding: '10px'
                }}
                itemStyle={{ color: "var(--color-text)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* User Roles Distribution Pie Chart */}
        <div
          className="p-6 rounded-lg shadow-lg lg:col-span-2"
          style={{
            backgroundColor: "var(--color-card-bg)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h3
            className="text-xl font-medium mb-4 flex items-center"
            style={{ color: "var(--color-text-soft)" }}
          >
            <PieChartIcon size={20} className="mr-2" /> User Roles Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}> {/* Increased margin */}
              <Pie
                data={rolePieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                labelLine={false}
                label={({ name, percent, value }) => {
                  if (value === 0) return ''; // Hide label if value is 0
                  return `${name} (${(percent * 100).toFixed(0)}%)`;
                }}
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {rolePieData.map((entry, index) => (
                  <Cell key={`role-cell-${index}`} fill={rolePieColors[index % rolePieColors.length]} />
                ))}
              </Pie>
              <Legend
                wrapperStyle={{ color: "var(--color-text)", paddingTop: '10px' }}
                formatter={(value) => (
                  <span style={{ color: "var(--color-text)" }}>{value}</span>
                )}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  borderRadius: '8px',
                  padding: '10px'
                }}
                itemStyle={{ color: "var(--color-text)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// Reusable Dashboard Card Component
function DashboardCard({ title, value, icon: Icon, color }) {
  return (
    <div
      className="p-6 rounded-lg shadow-lg flex items-center justify-between
                   transform hover:scale-[1.02] transition-transform duration-300"
      style={{
        backgroundColor: "var(--color-card-bg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div>
        <h3 className="text-lg font-medium mb-2" style={{ color: "var(--color-text-soft)" }}>
          {title}
        </h3>
        <p className="text-4xl font-bold" style={{ color }}>
          {value}
        </p>
      </div>
      {Icon && (
        <Icon size={48} style={{ color: color, opacity: 0.7 }} />
      )}
    </div>
  );
}