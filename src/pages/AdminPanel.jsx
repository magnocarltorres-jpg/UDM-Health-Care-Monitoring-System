import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserCheck,
  Users,
  UserX,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Config & API helpers                                                      */
/* -------------------------------------------------------------------------- */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://udm-health-care-api.onrender.com"
).replace(/\/+$/, "");

const PAGE_SIZE = 8;
const NOTICE_TIMEOUT_MS = 6000;

const emptyForm = { name: "", email: "", password: "", role: "Nurse" };

async function api(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("udm_auth_token");

  if (!token) {
    const error = new Error("Your session has expired. Please log in again.");
    error.status = 401;
    throw error;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      result.message || `Request failed with status ${response.status}.`,
    );
    error.status = response.status;
    error.code = result.code;
    throw error;
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/*  Pure helpers                                                              */
/* -------------------------------------------------------------------------- */

function normalizeStaff(member) {
  return {
    id: member.id,
    staffId: member.staffId ?? member.staff_id ?? "",
    name: member.name ?? "",
    role: member.role ?? "",
    status: member.status ?? "Active",
    profileImage: member.profileImage ?? member.profile_image ?? null,
    createdAt: member.createdAt ?? member.created_at ?? null,
  };
}

const normalize = (value) => String(value ?? "").trim().toLowerCase();
const isActiveAccount = (member) => normalize(member.status) === "active";
const isAdministratorAccount = (member) =>
  ["admin", "administrator"].includes(normalize(member.role));

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getInitials(name) {
  const parts = String(name || "Administrator").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

// Cryptographically random, skips look-alike characters (0/O, 1/l/I).
function generatePassword(length = 12) {
  const sets = [
    "ABCDEFGHJKLMNPQRSTUVWXYZ",
    "abcdefghijkmnpqrstuvwxyz",
    "23456789",
    "!@#$%&*?",
  ];
  const all = sets.join("");
  const random = (max) => {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    return buffer[0] % max;
  };

  const chars = sets.map((set) => set[random(set.length)]);
  while (chars.length < length) chars.push(all[random(all.length)]);

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/*  Presentational components                                                 */
/* -------------------------------------------------------------------------- */

function SectionHeading({ eyebrow, title, description, children }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-green-700">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </div>
  );
}

const palettes = {
  green: { icon: "bg-green-50 text-green-800", accent: "bg-green-500", label: "text-green-700" },
  blue: { icon: "bg-blue-50 text-blue-700", accent: "bg-blue-500", label: "text-blue-700" },
  amber: { icon: "bg-amber-50 text-amber-700", accent: "bg-amber-500", label: "text-amber-700" },
  red: { icon: "bg-red-50 text-red-700", accent: "bg-red-500", label: "text-red-700" },
};

function StatCard({ title, value, description, icon: Icon, color = "green", onClick }) {
  const palette = palettes[color] || palettes.green;
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition duration-200 sm:p-6 ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-700"
          : ""
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${palette.accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-gray-950">{value}</p>
        </div>
        <div className={`rounded-xl p-3 ${palette.icon}`}>
          <Icon size={23} strokeWidth={1.8} />
        </div>
      </div>
      <p className={`mt-4 text-xs font-medium ${palette.label}`}>{description}</p>
    </Wrapper>
  );
}

function StatusBadge({ status }) {
  const active = normalize(status) === "active";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-green-50 text-green-800 ring-1 ring-inset ring-green-200"
          : "bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-green-600" : "bg-gray-400"}`} />
      {status || "Unknown"}
    </span>
  );
}

function Avatar({ name, image, size = "normal" }) {
  const dimension = size === "large" ? "h-14 w-14 text-base" : "h-10 w-10 text-sm";

  if (image) {
    return (
      <img
        src={image}
        alt={`${name}'s profile`}
        className={`${dimension} shrink-0 rounded-full border border-gray-200 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${dimension} flex shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-900 ring-1 ring-inset ring-green-200`}
    >
      {getInitials(name)}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
        <Icon size={27} strokeWidth={1.7} />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">{description}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

function Banner({ tone, children, onDismiss }) {
  const isError = tone === "error";
  const Icon = isError ? CircleAlert : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      <Icon className="mt-0.5 shrink-0" size={19} />
      <p className="flex-1 leading-6">{children}</p>
      <button
        type="button"
        aria-label="Dismiss message"
        onClick={onDismiss}
        className={`rounded-md p-1 ${isError ? "hover:bg-red-100" : "hover:bg-green-100"}`}
      >
        <X size={17} />
      </button>
    </div>
  );
}

function Modal({ onClose, labelledBy, maxWidth = "max-w-lg", children }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-gray-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`my-auto w-full ${maxWidth} overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ dialog, busy, onCancel }) {
  const danger = dialog.tone === "danger";

  return (
    <Modal onClose={busy ? () => {} : onCancel} labelledBy="confirm-title" maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
            danger ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
          }`}
        >
          {danger ? <Trash2 size={22} /> : <KeyRound size={22} />}
        </div>
        <h2 id="confirm-title" className="text-xl font-bold text-gray-950">
          {dialog.title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{dialog.message}</p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={dialog.onConfirm}
            disabled={busy}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition disabled:opacity-50 ${
              danger ? "bg-red-700 hover:bg-red-600" : "bg-green-900 hover:bg-green-800"
            }`}
          >
            {busy && <RefreshCw size={16} className="animate-spin" />}
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CopyButton({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-900"
    >
      {copied ? <Check size={15} className="text-green-700" /> : <Copy size={15} />}
      {copied ? "Copied" : label}
    </button>
  );
}

function TemporaryPasswordDialog({ data, onClose }) {
  return (
    <Modal onClose={onClose} labelledBy="temp-password-title" maxWidth="max-w-md">
      <div className="p-6 sm:p-7">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-800">
          <KeyRound size={22} />
        </div>
        <h2 id="temp-password-title" className="text-xl font-bold text-gray-950">
          Temporary password ready
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {data.name}'s password was reset. Share the password below privately.
          It will not be shown again, and they must change it at their next login.
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
          <code className="select-all break-all font-mono text-base font-semibold tracking-wide text-gray-900">
            {data.password}
          </code>
          <CopyButton value={data.password} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-green-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800"
          >
            I've shared it
          </button>
        </div>
      </div>
    </Modal>
  );
}

function SortHeader({ label, sortKey, sort, onSort, className = "" }) {
  const active = sort.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;

  return (
    <th
      className={`px-5 py-4 ${className}`}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1.5 uppercase tracking-[0.12em] transition hover:text-gray-900 ${
          active ? "text-gray-900" : ""
        }`}
      >
        {label}
        <Icon size={13} className={active ? "" : "opacity-50"} />
      </button>
    </th>
  );
}

function Pagination({ page, pageCount, total, onChange }) {
  if (pageCount <= 1) return null;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
      <p>
        {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-[4.5rem] text-center font-semibold text-gray-700">
          Page {page} of {pageCount}
        </span>
        <button
          type="button"
          aria-label="Next page"
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                            */
/* -------------------------------------------------------------------------- */

export default function AdminPanel({ user, onLogout }) {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [staff, setStaff] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [showPassword, setShowPassword] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);

  const currentStaffId = user?.id ?? user?.staffId ?? user?.staff_id ?? null;
  const isCurrentUser = (member) =>
    currentStaffId != null && String(currentStaffId) === String(member.id);

  // Keep the latest onLogout without re-creating loaders on every parent render.
  const logoutRef = useRef(onLogout);
  useEffect(() => {
    logoutRef.current = onLogout;
  }, [onLogout]);

  // Wraps api(): an expired or rejected token signs the admin out.
  const call = useCallback(async (path, options) => {
    try {
      return await api(path, options);
    } catch (err) {
      if (err.status === 401) logoutRef.current?.();
      throw err;
    }
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Staff Management", icon: Users },
    { name: "Password Reset Requests", icon: KeyRound },
    { name: "Access Control", icon: ShieldCheck },
    { name: "Settings", icon: Settings },
  ];

  /* ------------------------------- Data loading ------------------------------ */

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      const result = await call("/api/admin/staff");
      const list = result.staff ?? result.staffAccounts ?? [];
      if (!Array.isArray(list)) {
        throw new Error("The server returned an invalid staff list.");
      }
      setStaff(list.map(normalizeStaff));
    } catch (err) {
      setError(err.message || "Unable to load staff accounts.");
    } finally {
      setLoading(false);
    }
  }, [call]);

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const result = await call("/api/admin/password-reset-requests");
      const list = result.requests ?? [];
      if (!Array.isArray(list)) {
        throw new Error("The server returned an invalid request list.");
      }
      setRequests(list);
    } catch (err) {
      setError(err.message || "Unable to load password reset requests.");
    } finally {
      setRequestsLoading(false);
    }
  }, [call]);

  useEffect(() => {
    loadStaff();
    loadRequests();
  }, [loadStaff, loadRequests]);

  // Success messages clear themselves; errors stay until dismissed.
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), NOTICE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  // Any filter change returns to the first page.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, roleFilter, sort]);

  /* -------------------------------- Navigation ------------------------------- */

  const clearMessages = () => {
    setError("");
    setNotice("");
  };

  const navigateTo = (pageName) => {
    setActivePage(pageName);
    setSidebarOpen(false);
    clearMessages();

    if (pageName === "Password Reset Requests") loadRequests();
    if (pageName === "Staff Management" || pageName === "Password Reset Requests") loadStaff();
  };

  const handleManualRefresh = () => {
    clearMessages();
    loadStaff();
    if (activePage === "Password Reset Requests" || activePage === "Dashboard") {
      loadRequests();
    }
  };

  const toggleSort = (key) =>
    setSort((previous) =>
      previous.key === key
        ? { key, dir: previous.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );

  /* --------------------------------- Create ---------------------------------- */

  const openAddForm = () => {
    setForm({ ...emptyForm });
    setShowPassword(false);
    clearMessages();
    setFormOpen(true);
  };

  const closeForm = useCallback(() => {
    if (saving) return;
    setFormOpen(false);
    setForm({ ...emptyForm });
  }, [saving]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    clearMessages();

    const name = form.name.trim();
    const email = form.email.trim();
    const { password, role } = form;

    if (!name) return setError("Full name is required.");
    if (name.length > 120) return setError("Full name must not exceed 120 characters.");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError("Please enter a valid email address.");
    }
    if (!["Nurse", "Doctor"].includes(role)) return setError("Please select a valid staff role.");
    if (password.length < 8) return setError("The password must contain at least 8 characters.");

    setSaving(true);
    try {
      const result = await call("/api/admin/staff", {
        method: "POST",
        body: { name, email, password, role },
      });

      const generatedStaffId = result.staff?.staffId ?? result.staff?.staff_id ?? "";

      setFormOpen(false);
      setForm({ ...emptyForm });
      setNotice(
        `${result.message || "Staff account created successfully."}${
          generatedStaffId ? ` Staff ID: ${generatedStaffId}.` : ""
        }`,
      );
      await loadStaff();
    } catch (err) {
      // Surface the error inside the form's page, keep the modal open to retry.
      setError(err.message || "Unable to create the staff account.");
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Activate / delete ---------------------------- */

  const runStatusChange = async (member, nextStatus) => {
    setSaving(true);
    try {
      const result = await call(`/api/admin/staff/${encodeURIComponent(member.id)}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });

      setStaff((previous) =>
        previous.map((item) =>
          String(item.id) === String(member.id) ? { ...item, status: nextStatus } : item,
        ),
      );
      setNotice(
        result.message ||
          `${member.name} is now ${nextStatus.toLowerCase()}.`,
      );
      await Promise.all([loadStaff(), loadRequests()]);
    } catch (err) {
      setError(err.message || "Unable to update the account status.");
    } finally {
      setSaving(false);
      setConfirmDialog(null);
    }
  };

  const handleStatusToggle = (member) => {
    if (saving) return;
    clearMessages();

    if (isAdministratorAccount(member)) {
      return setError("Administrator accounts cannot be changed here.");
    }
    if (!member.id) return setError("This account has no valid database ID.");

    const active = isActiveAccount(member);
    if (active && isCurrentUser(member)) {
      return setError("You cannot deactivate your own account.");
    }

    // Activating is harmless; deactivating locks someone out, so confirm it.
    if (!active) {
      runStatusChange(member, "Active");
      return;
    }

    setConfirmDialog({
      title: `Deactivate ${member.name}?`,
      message: `${member.name} (${member.staffId}) will no longer be able to sign in until you activate the account again.`,
      confirmLabel: "Deactivate account",
      tone: "danger",
      onConfirm: () => runStatusChange(member, "Inactive"),
    });
  };

  const runDelete = async (member) => {
    setSaving(true);
    try {
      const result = await call(`/api/admin/staff/${encodeURIComponent(member.id)}`, {
        method: "DELETE",
      });

      setStaff((previous) =>
        previous.filter((item) => String(item.id) !== String(member.id)),
      );
      setNotice(result.message || "Staff account deleted successfully.");
      await Promise.all([loadStaff(), loadRequests()]);
    } catch (err) {
      setError(err.message || "Unable to delete the staff account.");
    } finally {
      setSaving(false);
      setConfirmDialog(null);
    }
  };

  const handleDelete = (member) => {
    if (saving) return;
    clearMessages();

    if (isAdministratorAccount(member)) {
      return setError("Administrator accounts cannot be deleted.");
    }
    if (isCurrentUser(member)) return setError("You cannot delete your own account.");
    if (!member.id) return setError("This account has no valid database ID.");

    setConfirmDialog({
      title: `Delete ${member.name}?`,
      message: `${member.name} (${member.staffId}) will be permanently removed. This action cannot be undone.`,
      confirmLabel: "Delete permanently",
      tone: "danger",
      onConfirm: () => runDelete(member),
    });
  };

  /* ------------------------------ Password reset ------------------------------ */

  const runPasswordReset = async (request, staffName) => {
    setSaving(true);
    try {
      const result = await call(
        `/api/admin/password-reset-requests/${encodeURIComponent(request.id)}/reset`,
        { method: "POST" },
      );

      if (!result.temporaryPassword) {
        setNotice(result.message || "Password reset and email sent successfully.");
      } else {
        setTempPassword({ name: staffName, password: result.temporaryPassword });
        setNotice(result.message || "Password reset. Email delivery failed; securely share the temporary password.");
      }

      await Promise.all([loadStaff(), loadRequests()]);
    } catch (err) {
      setError(err.message || "Unable to reset this password.");
    } finally {
      setSaving(false);
      setConfirmDialog(null);
    }
  };

  const handleResetPassword = (request) => {
    if (saving) return;
    clearMessages();

    const staffId = request.staff_id ?? request.staffId ?? "";
    const staffMember = staff.find(
      (member) => String(member.staffId).trim() === String(staffId).trim(),
    );

    if (!request.id) return setError("This reset request has no valid database ID.");
    if (!staffMember?.id) {
      return setError("The staff account could not be found. Refresh and try again.");
    }
    if (isAdministratorAccount(staffMember)) {
      return setError("Administrator accounts cannot be reset here.");
    }
    if (!isActiveAccount(staffMember)) {
      return setError("Activate this staff account before resetting its password.");
    }

    const staffName = request.staffName || staffMember.name;

    setConfirmDialog({
      title: `Reset password for ${staffName}?`,
      message:
        "A unique temporary password will be generated and emailed to the staff member's saved email address. They must change it after logging in. If email delivery fails, the temporary password will be shown to you.",
      confirmLabel: "Reset password",
      tone: "primary",
      onConfirm: () => runPasswordReset(request, staffName),
    });
  };

  /* ------------------------------ Derived values ------------------------------ */

  const activeCount = staff.filter(isActiveAccount).length;
  const inactiveCount = staff.length - activeCount;
  const nurseCount = staff.filter((m) => normalize(m.role) === "nurse").length;
  const doctorCount = staff.filter((m) => normalize(m.role) === "doctor").length;

  const filteredStaff = useMemo(() => {
    const term = search.trim().toLowerCase();

    const matches = staff.filter((member) => {
      const matchesSearch =
        !term ||
        [member.name, member.staffId, member.role, member.status].some((field) =>
          String(field).toLowerCase().includes(term),
        );
      const matchesStatus =
        statusFilter === "All" || normalize(member.status) === normalize(statusFilter);
      const matchesRole =
        roleFilter === "All" || normalize(member.role) === normalize(roleFilter);

      return matchesSearch && matchesStatus && matchesRole;
    });

    const direction = sort.dir === "asc" ? 1 : -1;
    return [...matches].sort(
      (a, b) =>
        direction *
        String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        }),
    );
  }, [staff, search, statusFilter, roleFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pagedStaff = filteredStaff.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const filtersActive = search || statusFilter !== "All" || roleFilter !== "All";
  const busy = loading || requestsLoading;

  /* --------------------------------- Render ---------------------------------- */

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-gray-800 md:flex">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-gray-950/50 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col bg-[#123b2c] text-white shadow-xl transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-green-900 shadow-sm">
              <Activity size={27} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">UDM CLINIC</h1>
              <p className="mt-1 text-[11px] font-medium tracking-wide text-green-200">
                HEALTHCARE MONITORING
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-2 pt-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-green-300/80">
            Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const selected = activePage === item.name;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => navigateTo(item.name)}
                aria-current={selected ? "page" : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${
                  selected
                    ? "bg-white text-green-950 shadow-sm"
                    : "text-green-50/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} strokeWidth={selected ? 2.2 : 1.8} className="shrink-0" />
                <span className="flex-1">{item.name}</span>

                {item.name === "Password Reset Requests" && requests.length > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      selected ? "bg-amber-100 text-amber-900" : "bg-amber-300 text-amber-950"
                    }`}
                  >
                    {requests.length}
                  </span>
                )}

                {selected && <ChevronRight className="shrink-0" size={16} />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{user?.name || "Administrator"}</p>
                <p className="mt-1 text-xs text-green-200">Administrator</p>
              </div>
              <ShieldCheck size={17} className="text-green-300" />
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-200 transition hover:bg-red-500/15 hover:text-white"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                onClick={() => setSidebarOpen(true)}
                className="rounded-xl border border-gray-200 p-2.5 text-gray-700 transition hover:bg-gray-100 md:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>UDM Clinic</span>
                  <ChevronRight size={13} />
                  <span className="truncate text-gray-600">{activePage}</span>
                </div>
                <h2 className="mt-1 truncate text-lg font-bold text-gray-950 sm:text-xl">
                  {activePage}
                </h2>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 sm:flex">
                <CalendarDays size={16} className="text-green-800" />
                <span className="text-xs font-medium text-gray-600">
                  {new Date().toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={busy || saving}
                aria-label="Refresh current data"
                title="Refresh data"
                className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:border-green-200 hover:bg-green-50 hover:text-green-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw size={18} className={busy ? "animate-spin" : ""} />
              </button>

              <div className="hidden h-9 w-px bg-gray-200 sm:block" />

              <Avatar name={user?.name} />

              <div className="hidden min-w-0 lg:block">
                <p className="max-w-40 truncate text-sm font-semibold text-gray-900">
                  {user?.name || "Administrator"}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">System Administrator</p>
              </div>

              <ChevronDown size={15} className="hidden text-gray-400 lg:block" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-10">
          {error && (
            <Banner tone="error" onDismiss={() => setError("")}>
              {error}
            </Banner>
          )}
          {notice && (
            <Banner tone="success" onDismiss={() => setNotice("")}>
              {notice}
            </Banner>
          )}

          {/* ------------------------------ Dashboard ------------------------------ */}
          {activePage === "Dashboard" && (
            <div className="space-y-8">
              <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123b2c] via-[#18513b] to-[#24734c] p-6 text-white shadow-lg shadow-green-950/10 sm:p-8 lg:p-10">
                <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-2 -top-12 h-56 w-56 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-white/[0.04]" />

                <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
                  <div className="max-w-2xl">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-300" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-50">
                        Administration workspace
                      </span>
                    </div>

                    <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                      Welcome back,
                      <br className="sm:hidden" /> {user?.name || "Administrator"}.
                    </h1>

                    <p className="mt-4 max-w-xl text-sm leading-7 text-green-50/80 sm:text-base">
                      Manage authorized clinic personnel, monitor account access, and review
                      password reset requests from one place.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => navigateTo("Staff Management")}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-green-950 shadow-sm transition hover:bg-green-50"
                      >
                        <Users size={17} />
                        Manage Staff
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo("Password Reset Requests")}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                      >
                        <KeyRound size={17} />
                        Review Requests
                        {requests.length > 0 && (
                          <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold text-green-950">
                            {requests.length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="hidden lg:flex lg:items-center lg:justify-center">
                    <div className="flex h-36 w-36 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 shadow-inner">
                      <Stethoscope size={74} strokeWidth={1.2} className="text-white" />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <SectionHeading
                  eyebrow="Overview"
                  title="Clinic staff overview"
                  description="A summary of registered staff accounts and their current access status."
                >
                  <button
                    type="button"
                    onClick={handleManualRefresh}
                    disabled={busy}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-green-200 hover:bg-green-50 hover:text-green-900 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
                    Refresh
                  </button>
                </SectionHeading>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total staff"
                    value={staff.length}
                    description="Registered personnel accounts"
                    icon={Users}
                    color="blue"
                    onClick={() => navigateTo("Staff Management")}
                  />
                  <StatCard
                    title="Active accounts"
                    value={activeCount}
                    description="Currently marked active"
                    icon={UserCheck}
                    color="green"
                    onClick={() => {
                      setStatusFilter("Active");
                      navigateTo("Staff Management");
                    }}
                  />
                  <StatCard
                    title="Inactive accounts"
                    value={inactiveCount}
                    description="Access currently disabled"
                    icon={UserX}
                    color="amber"
                    onClick={() => {
                      setStatusFilter("Inactive");
                      navigateTo("Staff Management");
                    }}
                  />
                  <StatCard
                    title="Pending requests"
                    value={requests.length}
                    description="Password resets awaiting review"
                    icon={KeyRound}
                    color="red"
                    onClick={() => navigateTo("Password Reset Requests")}
                  />
                </div>
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Personnel distribution</h3>
                      <p className="mt-1 text-sm text-gray-500">Registered accounts grouped by role.</p>
                    </div>
                    <div className="rounded-xl bg-green-50 p-3 text-green-800">
                      <Activity size={21} />
                    </div>
                  </div>

                  <div className="mt-7 space-y-6">
                    {[
                      { label: "Nurses", count: nurseCount, bar: "bg-green-700" },
                      { label: "Doctors", count: doctorCount, bar: "bg-blue-600" },
                    ].map((row) => (
                      <div key={row.label}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${row.bar}`} />
                            <span className="text-sm font-medium text-gray-700">{row.label}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{row.count}</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={`h-full rounded-full transition-all ${row.bar}`}
                            style={{
                              width: `${staff.length ? (row.count / staff.length) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium text-gray-500">Nurse accounts</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">{nurseCount}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs font-medium text-gray-500">Doctor accounts</p>
                      <p className="mt-2 text-2xl font-bold text-gray-900">{doctorCount}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Password reset requests</h3>
                      <p className="mt-1 text-sm text-gray-500">Review staff access recovery requests.</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3 text-amber-800">
                      <KeyRound size={21} />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-4 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-800 shadow-sm">
                      <Clock3 size={23} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
                      <p className="mt-1 text-xs leading-5 text-gray-600">
                        Pending request{requests.length === 1 ? "" : "s"} need administrator review.
                      </p>
                    </div>
                  </div>

                  {requests.length > 0 ? (
                    <div className="mt-5 space-y-3">
                      {requests.slice(0, 3).map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-800">
                              {request.staffName || "Staff member"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {request.staff_id || request.staffId || "—"}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800">
                            Pending
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-gray-500">
                      There are no pending password reset requests.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => navigateTo("Password Reset Requests")}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-900"
                  >
                    View all requests
                    <ChevronRight size={17} />
                  </button>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-7">
                <SectionHeading
                  eyebrow="Personnel"
                  title="Newest staff"
                  description="The most recently registered accounts in your staff database."
                >
                  <button
                    type="button"
                    onClick={() => navigateTo("Staff Management")}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-green-800 transition hover:text-green-950"
                  >
                    Manage staff
                    <ChevronRight size={16} />
                  </button>
                </SectionHeading>

                {loading && staff.length === 0 ? (
                  <div className="flex items-center justify-center gap-3 py-10 text-sm text-gray-500">
                    <RefreshCw size={19} className="animate-spin" />
                    Loading personnel...
                  </div>
                ) : staff.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No staff accounts yet"
                    description="Create an authorized Nurse or Doctor account to get started."
                  >
                    <button
                      type="button"
                      onClick={openAddForm}
                      className="rounded-xl bg-green-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                    >
                      Add staff
                    </button>
                  </EmptyState>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {[...staff]
                      .sort((a, b) => {
                        const da = new Date(a.createdAt || 0).getTime();
                        const db = new Date(b.createdAt || 0).getTime();
                        return db - da;
                      })
                      .slice(0, 5)
                      .map((member) => (
                        <div
                          key={member.id}
                          className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar name={member.name} image={member.profileImage} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-gray-900">
                                {member.name}
                              </p>
                              <p className="mt-1 truncate text-xs text-gray-500">
                                {member.staffId} · {member.role}
                              </p>
                            </div>
                          </div>
                          <StatusBadge status={member.status} />
                        </div>
                      ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* --------------------------- Staff Management --------------------------- */}
          {activePage === "Staff Management" && (
            <div>
              <SectionHeading
                eyebrow="Personnel directory"
                title="Staff management"
                description="Create authorized accounts, monitor account status, and manage clinic personnel."
              >
                <button
                  type="button"
                  onClick={loadStaff}
                  disabled={loading || saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={openAddForm}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:opacity-50"
                >
                  <Plus size={17} />
                  Add staff
                </button>
              </SectionHeading>

              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <StatCard title="Total staff" value={staff.length} description="Registered personnel" icon={Users} color="blue" />
                <StatCard title="Active accounts" value={activeCount} description="Currently active" icon={UserCheck} color="green" />
                <StatCard title="Inactive accounts" value={inactiveCount} description="Access disabled" icon={UserX} color="amber" />
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="relative min-w-0 flex-1">
                      <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, Staff ID, or role..."
                        aria-label="Search staff"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-100"
                      />
                    </div>

                    <select
                      aria-label="Filter by role"
                      value={roleFilter}
                      onChange={(event) => setRoleFilter(event.target.value)}
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-green-700 focus:bg-white"
                    >
                      <option value="All">All roles</option>
                      <option value="Nurse">Nurses</option>
                      <option value="Doctor">Doctors</option>
                      <option value="Administrator">Administrators</option>
                    </select>

                    <select
                      aria-label="Filter by account status"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none focus:border-green-700 focus:bg-white"
                    >
                      <option value="All">All statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {loading && staff.length === 0 ? (
                  <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500">
                    <RefreshCw size={20} className="animate-spin text-green-800" />
                    Loading staff accounts...
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title={filtersActive ? "No matching staff accounts" : "No staff accounts yet"}
                    description={
                      filtersActive
                        ? "Try a different search term or change the filters."
                        : "Create an authorized Nurse or Doctor account to get started."
                    }
                  >
                    {filtersActive ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("All");
                          setRoleFilter("All");
                        }}
                        className="text-sm font-semibold text-green-800 hover:text-green-950"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openAddForm}
                        className="rounded-xl bg-green-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                      >
                        Add staff
                      </button>
                    )}
                  </EmptyState>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left text-sm">
                      <thead className="border-b border-gray-100 bg-gray-50/80">
                        <tr className="text-[10px] font-bold text-gray-500">
                          <SortHeader label="Staff member" sortKey="name" sort={sort} onSort={toggleSort} />
                          <SortHeader label="Staff ID" sortKey="staffId" sort={sort} onSort={toggleSort} />
                          <SortHeader label="Role" sortKey="role" sort={sort} onSort={toggleSort} />
                          <SortHeader label="Account status" sortKey="status" sort={sort} onSort={toggleSort} />
                          <th className="px-5 py-4 text-right uppercase tracking-[0.12em]">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {pagedStaff.map((member) => {
                          const active = isActiveAccount(member);
                          const protectedAccount = isAdministratorAccount(member);
                          const self = isCurrentUser(member);

                          return (
                            <tr key={member.id} className="transition hover:bg-green-50/40">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar name={member.name} image={member.profileImage} />
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-gray-900">
                                      {member.name}
                                      {self && (
                                        <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                                          You
                                        </span>
                                      )}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      {protectedAccount
                                        ? "Protected administrator account"
                                        : "Clinic personnel"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 font-medium text-gray-700">
                                {member.staffId || "—"}
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                                  {protectedAccount && <ShieldCheck size={14} />}
                                  {member.role}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <StatusBadge status={member.status} />
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    title={
                                      protectedAccount
                                        ? "Administrator account is protected"
                                        : self && active
                                          ? "You cannot deactivate your own account"
                                          : active
                                            ? "Deactivate account"
                                            : "Activate account"
                                    }
                                    aria-label={`${active ? "Deactivate" : "Activate"} ${member.name}`}
                                    onClick={() => handleStatusToggle(member)}
                                    disabled={saving || protectedAccount || (self && active)}
                                    className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    {active ? <UserX size={17} /> : <UserCheck size={17} />}
                                  </button>

                                  <button
                                    type="button"
                                    title={
                                      protectedAccount || self
                                        ? "This account cannot be deleted here"
                                        : "Delete staff account"
                                    }
                                    aria-label={`Delete ${member.name}`}
                                    onClick={() => handleDelete(member)}
                                    disabled={saving || protectedAccount || self}
                                    className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                                  >
                                    <Trash2 size={17} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <Pagination
                  page={currentPage}
                  pageCount={pageCount}
                  total={filteredStaff.length}
                  onChange={setPage}
                />

                <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    Showing <span className="font-semibold text-gray-800">{filteredStaff.length}</span> of{" "}
                    <span className="font-semibold text-gray-800">{staff.length}</span> accounts
                  </p>
                  <p>
                    {activeCount} active <span className="mx-1">·</span> {inactiveCount} inactive
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------ Password Reset Requests ----------------------- */}
          {activePage === "Password Reset Requests" && (
            <div>
              <SectionHeading
                eyebrow="Account recovery"
                title="Password reset requests"
                description="Review requests submitted by Nurses and Doctors. Resetting an account assigns a temporary password and requires the staff member to change it at the next login."
              >
                <button
                  type="button"
                  onClick={() => {
                    loadRequests();
                    loadStaff();
                  }}
                  disabled={busy || saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={requestsLoading ? "animate-spin" : ""} />
                  Refresh requests
                </button>
              </SectionHeading>

              <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-amber-800 shadow-sm">
                    <KeyRound size={23} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Pending review</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {requests.length} request{requests.length === 1 ? "" : "s"} awaiting action
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  Administrator review required
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h3 className="font-bold text-gray-900">Requests awaiting action</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Verify each account before approving a password reset.
                  </p>
                </div>

                {requestsLoading && requests.length === 0 ? (
                  <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-500">
                    <RefreshCw size={20} className="animate-spin text-green-800" />
                    Loading requests...
                  </div>
                ) : requests.length === 0 ? (
                  <EmptyState
                    icon={CheckCircle2}
                    title="You're all caught up"
                    description="There are no pending password reset requests. New submissions will appear here after you refresh or revisit this page."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[880px] text-left text-sm">
                      <thead className="border-b border-gray-100 bg-gray-50/80">
                        <tr className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                          <th className="px-5 py-4">Staff member</th>
                          <th className="px-5 py-4">Staff ID</th>
                          <th className="px-5 py-4">Role</th>
                          <th className="px-5 py-4">Account status</th>
                          <th className="px-5 py-4">Submitted</th>
                          <th className="px-5 py-4 text-right">Action</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {requests.map((request) => {
                          const requestStaffId = request.staff_id ?? request.staffId ?? "";
                          const member = staff.find(
                            (item) => String(item.staffId).trim() === String(requestStaffId).trim(),
                          );

                          const role = request.role || member?.role || "Unknown";
                          const accountStatus = request.accountStatus || member?.status || "Unknown";

                          const isEligible =
                            Boolean(member?.id) &&
                            isActiveAccount(member) &&
                            ["nurse", "doctor"].includes(normalize(role));

                          return (
                            <tr key={request.id} className="transition hover:bg-green-50/30">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <Avatar name={request.staffName || member?.name || "Staff"} />
                                  <div>
                                    <p className="font-semibold text-gray-900">
                                      {request.staffName || member?.name || "Unknown staff member"}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">Request #{request.id}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 font-medium text-gray-700">
                                {requestStaffId || "—"}
                              </td>

                              <td className="px-5 py-4">
                                <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                                  {role}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <StatusBadge status={accountStatus} />
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Clock3 size={15} className="shrink-0 text-gray-400" />
                                  <span className="whitespace-nowrap text-xs">
                                    {formatDate(request.requested_at ?? request.requestedAt)}
                                  </span>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleResetPassword(request)}
                                    disabled={saving || !isEligible}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-green-900 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <KeyRound size={15} />
                                    Reset password
                                  </button>
                                </div>

                                {!isEligible && (
                                  <p className="mt-2 text-right text-[10px] leading-4 text-gray-400">
                                    {member?.id
                                      ? "Account must be active and a Nurse or Doctor"
                                      : "Account not found. Refresh and try again"}
                                  </p>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-4">
                  <p className="text-xs leading-5 text-gray-500">
                    Temporary passwords should be changed immediately after login. This page shows
                    pending requests only.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------- Access Control ---------------------------- */}
          {activePage === "Access Control" && (
            <div>
              <SectionHeading
                eyebrow="Permissions and security"
                title="Access control"
                description="Manage access for clinic staff while keeping Administrator accounts protected."
              />

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-800">
                    <ShieldCheck size={25} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Staff account permissions</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Activate or deactivate Nurse and Doctor accounts from Staff Management.
                    Deactivated accounts should not be able to sign in.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo("Staff Management")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
                  >
                    Manage account access
                    <ChevronRight size={17} />
                  </button>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                    <KeyRound size={25} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">Password recovery</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Review reset requests before assigning a temporary password. Staff must change
                    that temporary password before accessing clinic resources.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo("Password Reset Requests")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-900"
                  >
                    Review reset requests
                    <ChevronRight size={17} />
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-bold text-gray-900">Current access overview</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Counts from the staff accounts returned by your backend.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium text-gray-500">Total accounts</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{staff.length}</p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-4">
                    <p className="text-xs font-medium text-green-800">Active</p>
                    <p className="mt-2 text-2xl font-bold text-green-900">{activeCount}</p>
                  </div>
                  <div className="rounded-xl bg-gray-100 p-4">
                    <p className="text-xs font-medium text-gray-600">Inactive</p>
                    <p className="mt-2 text-2xl font-bold text-gray-800">{inactiveCount}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* -------------------------------- Settings ------------------------------- */}
          {activePage === "Settings" && (
            <div>
              <SectionHeading
                eyebrow="Configuration"
                title="Administration settings"
                description="Review system information and access the main account management tools."
              />

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-4">
                    <Avatar name={user?.name} size="large" />
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-gray-900">
                        {user?.name || "Administrator"}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">System Administrator</p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between gap-3 py-2">
                      <span className="text-sm text-gray-500">Account role</span>
                      <span className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-800">
                        Administrator
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 py-2">
                      <span className="text-sm text-gray-500">Session</span>
                      <span className="inline-flex items-center gap-2 text-xs font-semibold text-green-800">
                        <span className="h-2 w-2 rounded-full bg-green-600" />
                        Authenticated
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                    <FileText size={24} />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">System management</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Manage authorized staff and account recovery from the administration workspace.
                  </p>

                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={() => navigateTo("Staff Management")}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition hover:border-green-200 hover:bg-green-50"
                    >
                      <span className="flex items-center gap-3">
                        <Users size={18} className="text-green-800" />
                        <span className="text-sm font-semibold text-gray-800">Staff management</span>
                      </span>
                      <ChevronRight size={17} className="text-gray-400" />
                    </button>

                    <button
                      type="button"
                      onClick={() => navigateTo("Password Reset Requests")}
                      className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left transition hover:border-green-200 hover:bg-green-50"
                    >
                      <span className="flex items-center gap-3">
                        <KeyRound size={18} className="text-green-800" />
                        <span className="text-sm font-semibold text-gray-800">
                          Password reset requests
                        </span>
                      </span>
                      <ChevronRight size={17} className="text-gray-400" />
                    </button>

                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex w-full items-center justify-between rounded-xl border border-red-100 p-4 text-left transition hover:bg-red-50"
                    >
                      <span className="flex items-center gap-3">
                        <LogOut size={18} className="text-red-700" />
                        <span className="text-sm font-semibold text-red-800">Sign out</span>
                      </span>
                      <ChevronRight size={17} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ------------------------------ Create account ------------------------------ */}
      {formOpen && (
        <Modal onClose={closeForm} labelledBy="create-title">
          <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5 sm:px-7">
            <div>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-800">
                <Plus size={22} />
              </div>
              <h2 id="create-title" className="text-xl font-bold text-gray-950">
                Create staff account
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Register an authorized Nurse or Doctor for the clinic.
              </p>
            </div>

            <button
              type="button"
              aria-label="Close form"
              onClick={closeForm}
              disabled={saving}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-5 p-6 sm:p-7">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
              >
                <CircleAlert size={17} className="mt-0.5 shrink-0" />
                <p className="leading-5">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="staffName" className="mb-2 block text-sm font-semibold text-gray-700">
                Full name
              </label>
              <input
                id="staffName"
                name="name"
                type="text"
                required
                autoFocus
                maxLength={120}
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                autoComplete="name"
                placeholder="Enter the complete name"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div>
              <label htmlFor="staffEmail" className="mb-2 block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                id="staffEmail"
                name="email"
                type="email"
                required
                maxLength={254}
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                autoComplete="email"
                placeholder="name@example.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div>
              <label htmlFor="staffRole" className="mb-2 block text-sm font-semibold text-gray-700">
                Staff role
              </label>
              <select
                id="staffRole"
                name="role"
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-100"
              >
                <option value="Nurse">Nurse</option>
                <option value="Doctor">Doctor</option>
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="staffPassword" className="text-sm font-semibold text-gray-700">
                  Initial password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, password: generatePassword() }));
                    setShowPassword(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 transition hover:text-green-950"
                >
                  <RefreshCw size={13} />
                  Generate
                </button>
              </div>

              <div className="relative">
                <input
                  id="staffPassword"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-24 font-mono text-sm outline-none transition placeholder:font-sans placeholder:text-gray-400 focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-100"
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {form.password && (
                    <button
                      type="button"
                      aria-label="Copy password"
                      title="Copy password"
                      onClick={() => copyToClipboard(form.password)}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Share this initial password securely with the staff member. They must change it at
                first login.
              </p>
            </div>

            <div className="rounded-xl border border-green-100 bg-green-50/70 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-green-800" />
                <p className="text-xs leading-5 text-green-900">
                  A Staff ID will be generated automatically when this account is created.
                  Administrator accounts are not created from this form.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Create account
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmDialog && (
        <ConfirmDialog
          dialog={confirmDialog}
          busy={saving}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {tempPassword && (
        <TemporaryPasswordDialog data={tempPassword} onClose={() => setTempPassword(null)} />
      )}
    </div>
  );
}