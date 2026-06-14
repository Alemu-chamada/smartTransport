import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { MainLayout } from "../../routes/MainLayout";
import { DataTable, Column } from "../../shared/ui/DataTable";
import { StatusBadge } from "../../shared/ui/StatusBadge";
import { Button } from "../../shared/ui/Button";
import { SearchBar } from "../../shared/ui/SearchBar";
import { FilterPanel } from "../../shared/ui/FilterPanel";
import { Modal } from "../../shared/ui/Modal";
import { Input } from "../../shared/ui/Input";
import { UserPlus, Edit, Ban, Shield, Bell } from "lucide-react";
import { userApi } from "../../features/user/services";
import { notificationApi } from "../../features/notification/services";
import type { User } from "../../providers/AuthProvider";

export function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleModalLoading, setRoleModalLoading] = useState(false);
  const [newRole, setNewRole] = useState("passenger");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationContent, setNotificationContent] = useState("");
  const [notificationLoading, setNotificationLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await userApi.getUsers();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUser) return;

    setRoleModalLoading(true);
    try {
      await userApi.updateUserRole(selectedUser.id, newRole);
      await fetchUsers();
      setIsRoleModalOpen(false);
    } catch (error) {
      console.error("Error assigning role:", error);
      alert("Failed to assign role");
    } finally {
      setRoleModalLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim()) return;

    setNotificationLoading(true);
    try {
      await notificationApi.sendToAll({
        title: notificationTitle.trim(),
        content: notificationContent.trim()
      });
      alert("Notifications sent to all users!");
      setIsNotificationModalOpen(false);
      setNotificationTitle("");
      setNotificationContent("");
    } catch (error) {
      console.error("Failed to send notifications:", error);
      alert("Failed to send notifications");
    } finally {
      setNotificationLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const matchesStatus =
      selectedStatus === "all" || 
      (selectedStatus === "active" && user.is_active) ||
      (selectedStatus === "suspended" && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const columns: Column<User>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "role",
      label: "Role",
      render: (user) => (
        <StatusBadge
          status={user.role.replace("_", " ")}
          variant={user.role === "system_admin" ? "info" : "default"}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user) => (
        <StatusBadge
          status={user.is_active ? "active" : "suspended"}
          variant={user.is_active ? "success" : "error"}
        />
      ),
    },
    {
      key: "joined",
      label: "Joined",
      render: (user) => new Date(user.created_at).toLocaleDateString()
    },
    {
      key: "actions",
      label: "Actions",
      render: (user) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
              setIsEditModalOpen(true);
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenRoleModal(user);
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Assign Role"
          >
            <Shield className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Suspend"
          >
            <Ban className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                User Management
              </h1>
              <p className="text-muted-foreground">
                Manage system users and permissions
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsNotificationModalOpen(true)}>
                <Bell className="h-5 w-5 mr-2" />
                Send Notification
              </Button>
              <Button>
                <UserPlus className="h-5 w-5 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FilterPanel>
            <div className="flex-1 min-w-[250px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name or email..."
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Roles</option>
                <option value="passenger">Passenger</option>
                <option value="driver">Driver</option>
                <option value="system_admin">System Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </FilterPanel>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={filteredUsers}
            emptyMessage="No users found"
          />
        </motion.div>

        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User"
        >
          {selectedUser && (
            <div className="space-y-4">
              <Input label="Name" value={selectedUser.name} />
              <Input label="Email" value={selectedUser.email} />
              <Input label="Phone" value={selectedUser.phone} />
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1">Save Changes</Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          title="Assign Role"
        >
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Assign a new role to <strong>{selectedUser.name}</strong>
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="passenger">Passenger</option>
                  <option value="driver">Driver</option>
                  <option value="system_admin">System Admin</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setIsRoleModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleAssignRole} loading={roleModalLoading}>
                  Assign Role
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          title="Send Notification to All Users"
        >
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Enter notification title..."
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content (optional)
              </label>
              <textarea
                placeholder="Enter notification content..."
                value={notificationContent}
                onChange={(e) => setNotificationContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px]"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsNotificationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSendNotification} loading={notificationLoading} disabled={!notificationTitle.trim()}>
                Send Notification
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
}
