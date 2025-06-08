// src/pages/Users.jsx
import React, { useEffect, useState, useMemo } from "react";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import {
  Search,
  UserPlus,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import UserRow from "../components/userrow"; // Ensure this path is correct: userrow vs UserRow

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [inviteStatus, setInviteStatus] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  const usersRef = collection(db, "users");

  const fetchUsers = async () => {
    setLoading(true);
    console.log("DEBUG: fetchUsers started..."); // Debug 1
    try {
      const snapshot = await getDocs(usersRef);
      const usersList = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        invitedAt: d.data().invitedAt?.toDate() || new Date(),
      }));
      console.log("DEBUG: Raw usersList from Firestore:", usersList); // Debug 2: Check what you get from DB
      setUsers(usersList);
      console.log("DEBUG: Users state updated. Total users:", usersList.length); // Debug 3
    } catch (err) {
      console.error("DEBUG ERROR: Failed to fetch users:", err); // Debug 4: Important for Firebase errors
      setInviteStatus("Failed to load users. Check console for details.");
    }
    setLoading(false);
    console.log("DEBUG: fetchUsers finished. Loading set to false."); // Debug 5
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserStatus = async (userId, status) => {
    try {
      await updateDoc(doc(db, "users", userId), { status });
      console.log(`DEBUG: User ${userId} status updated to ${status}. Re-fetching users.`); // Debug 6
      fetchUsers();
    } catch (err) {
      console.error("DEBUG ERROR: Failed to update user status:", err);
    }
  };

  const assignRole = async (userId, role) => {
    try {
      await updateDoc(doc(db, "users", userId), { role });
      console.log(`DEBUG: User ${userId} role assigned to ${role}. Re-fetching users.`); // Debug 7
      fetchUsers();
    } catch (err) {
      console.error("DEBUG ERROR: Failed to assign role:", err);
    }
  };

  const inviteUser = async (e) => {
    e.preventDefault();
    if (!emailInput) return;
    setInviteStatus("Inviting...");
    console.log(`DEBUG: Attempting to invite user: ${emailInput}`); // Debug 8
    try {
      await addDoc(usersRef, {
        email: emailInput,
        status: "pending",
        role: "viewer",
        invitedAt: new Date(),
      });
      setInviteStatus(`Invited ${emailInput} successfully.`);
      setEmailInput("");
      console.log("DEBUG: User invited. Re-fetching users."); // Debug 9
      fetchUsers();
    } catch (err) {
      setInviteStatus("Failed to invite user. Error: " + err.message);
      console.error("DEBUG ERROR: Failed to invite user:", err); // Debug 10
    }
  };

  const sortedAndFilteredUsers = useMemo(() => {
    console.log("DEBUG: useMemo started. Current 'users' state:", users); // Debug 11: Check input to useMemo
    let filteredUsers = [...users];

    if (searchTerm) {
      filteredUsers = filteredUsers.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    console.log("DEBUG: After searchTerm filter:", filteredUsers.length, "users."); // Debug 12

    if (filterStatus !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => user.status === filterStatus
      );
    }
    console.log("DEBUG: After status filter ('", filterStatus, "'):", filteredUsers.length, "users."); // Debug 13

    if (filterRole !== "all") {
      filteredUsers = filteredUsers.filter(
        (user) => (user.role || 'viewer') === filterRole
      );
    }
    console.log("DEBUG: After role filter ('", filterRole, "'):", filteredUsers.length, "users."); // Debug 14

    if (sortConfig.key) {
      filteredUsers.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'invitedAt') {
            aValue = aValue.getTime();
            bValue = bValue.getTime();
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    console.log("DEBUG: Final sortedAndFilteredUsers count before pagination:", filteredUsers.length); // Debug 15
    return filteredUsers;
  }, [users, searchTerm, filterStatus, filterRole, sortConfig]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedAndFilteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );
  console.log("DEBUG: currentUsers (for display) count:", currentUsers.length); // Debug 16
  console.log("DEBUG: currentUsers array:", currentUsers); // Debug 17: See the actual users being passed to UserRow

  const totalPages = Math.ceil(sortedAndFilteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp size={16} />;
    }
    return <ArrowDown size={16} />;
  };

  return (
    <div className="animate-fadeIn">
      <h2
        className="text-4xl font-extrabold mb-8 text-center"
        style={{ color: "var(--color-text)" }}
      >
        User Management
      </h2>

      <form
        onSubmit={inviteUser}
        className="mb-10 flex flex-col sm:flex-row gap-4 p-5 rounded-xl shadow-lg animate-slideInRight"
        style={{ backgroundColor: "var(--color-card-bg)" }}
      >
        <div className="relative flex-grow">
          <input
            type="email"
            placeholder="Enter user email to invite"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
            className="w-full px-5 py-3 pl-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-75"
            style={{
              borderColor: "var(--color-input-border)",
              backgroundColor: "var(--color-input-bg)",
              color: "var(--color-text)",
            }}
          />
          <UserPlus
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-soft)" }}
          />
        </div>
        <button
          type="submit"
          className={`w-80 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75`}
          style={{ backgroundColor: "var(--color-primary)", color: "white" }}
        >
          Invite User
        </button>
      </form>

      {inviteStatus && (
        <p
          className="mb-8 text-center text-sm font-medium animate-fadeIn"
          style={{ color: "var(--color-text-soft)" }}
        >
          {inviteStatus}
        </p>
      )}

      <div
        className="mb-8 p-5 rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideInRight"
        style={{ backgroundColor: "var(--color-card-bg)" }}
      >
        <div className="relative col-span-full md:col-span-1">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-5 py-3 pl-12 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-75"
            style={{
              borderColor: "var(--color-input-border)",
              backgroundColor: "var(--color-input-bg)",
              color: "var(--color-text)",
            }}
          />
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-text-soft)" }}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-5 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-75"
          style={{
            borderColor: "var(--color-input-border)",
            backgroundColor: "var(--color-input-bg)",
            color: "var(--color-text)",
          }}
        >
          <option value="all">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="revoked">Revoked</option>
        </select>

        <select
          value={filterRole}
          onChange={(e) => {
            setFilterRole(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-5 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-75"
          style={{
            borderColor: "var(--color-input-border)",
            backgroundColor: "var(--color-input-bg)",
            color: "var(--color-text)",
          }}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="viewer">Viewer</option>
        </select>
      </div>

      {loading ? (
        <p
          className="text-center text-xl"
          style={{ color: "var(--color-text-soft)" }}
        >
          Loading users...
        </p>
      ) : sortedAndFilteredUsers.length === 0 ? (
        <p
          className="text-center text-xl"
          style={{ color: "var(--color-text-soft)" }}
        >
          No users found matching your criteria.
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fadeIn">
            {currentUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onUpdateStatus={updateUserStatus}
                onAssignRole={assignRole}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-10">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                <ChevronLeft size={20} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => paginate(i + 1)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
                    ${currentPage === i + 1
                      ? "shadow-md"
                      : "hover:bg-sidebar-hover"
                    }`}
                  style={{
                    backgroundColor: currentPage === i + 1 ? 'var(--color-primary)' : 'var(--color-card-bg)',
                    color: currentPage === i + 1 ? 'white' : 'var(--color-text)',
                    border: currentPage === i + 1 ? 'none' : '1px solid var(--color-border)'
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--color-card-bg)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  opacity: currentPage === totalPages ? 0.5 : 1
                }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}