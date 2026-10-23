import { useEffect, useMemo, useState } from "react";
import {
  Banknote,
  Bell,
  ChevronDown,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Users,
  X,
  ArrowUpRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import type { Employee } from "./types/employee";
import { getEmployees } from "./services/employeeService";


function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace(/\u00a0/g, " ");
}

export default function App() {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let isActive = true;

    getEmployees()
      .then((data) => {
        if (isActive) {
          setEmployees(data);
          setLoadError(false);
        }
      })
      .catch(() => {
        if (isActive) setLoadError(true);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return employees;
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(normalizedQuery) ||
        employee.nik.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const selectedEmployee =
    employees.find((employee) => employee.id === selectedId) ?? null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="icon-button mobile-menu-button"
          aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <a className="brand" href="#" aria-label="Araya Business Hub beranda">
          <span className="brand-mark"><Banknote size={19} /></span>
          <span>Araya Business Hub</span>
        </a>
        <div className="global-search">
          <Search size={17} aria-hidden="true" />
          <span>Cari menu atau halaman...</span>
          <kbd>⌘ K</kbd>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Bantuan"><CircleHelp size={19} /></button>
          <button className="icon-button" aria-label="Notifikasi"><Bell size={19} /></button>
          <button className="profile-button">
            <span className="avatar">RK</span>
            <span className="profile-name">Rani K.</span>
            <ChevronDown size={15} />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Tutup menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-label">MODUL SDM</div>
        <nav aria-label="Navigasi modul SDM">
          <a className="nav-item" href="#dashboard"><LayoutDashboard size={18} /> Ringkasan</a>
          <a className="nav-item" href="#karyawan"><Users size={18} /> Data karyawan</a>
          <a className="nav-item active" href="#komponen-gaji" aria-current="page">
            <Banknote size={18} /> Komponen gaji
          </a>
          <a className="nav-item" href="#laporan"><FileText size={18} /> Laporan</a>
        </nav>
        <div className="sidebar-bottom">
          <a className="nav-item" href="#pengaturan"><Settings size={18} /> Pengaturan</a>
          <div className="sidebar-note">
            <span className="status-dot" />
            <span>Lingkungan pengembangan</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="komponen-gaji">
        <div className="breadcrumb">
          <span>SDM</span><span className="crumb-separator">/</span><span>Penggajian</span>
          <span className="crumb-separator">/</span><strong>Komponen gaji</strong>
        </div>

        <div className="page-heading">
          <div>
            <h1>Komponen gaji</h1>
            <p>Temukan karyawan untuk melihat pengaturan komponen gajinya.</p>
          </div>
          <span className="prototype-badge">Prototipe · Data contoh</span>
        </div>

        <section className="content-card" aria-labelledby="employee-list-heading">
          <div className="card-heading">
            <div>
              <h2 id="employee-list-heading">Daftar karyawan</h2>
              <p>Pilih karyawan untuk melihat status komponen gaji.</p>
            </div>
            <span className="count-badge">{filteredEmployees.length} karyawan</span>
          </div>

          <div className="table-toolbar">
            <label className="search-field">
              <Search size={18} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama atau NIK..."
                aria-label="Cari nama atau NIK karyawan"
              />
              {query && (
                <button className="clear-search" onClick={() => setQuery("")} aria-label="Hapus pencarian">
                  <X size={16} />
                </button>
              )}
            </label>
            <span className="toolbar-hint">Pencarian berdasarkan nama atau NIK</span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Karyawan</th>
                  <th>NIK</th>
                  <th>Departemen</th>
                  <th>Status komponen gaji</th>
                  <th className="align-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-search">
                        <strong>Memuat daftar karyawan...</strong>
                        <span>Mohon tunggu sebentar.</span>
                      </div>
                    </td>
                  </tr>
                ) : loadError ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-search">
                        <strong>Daftar karyawan gagal dimuat</strong>
                        <span>Coba muat ulang halaman. Jika backend belum tersedia, periksa data mock.</span>
                        <button className="button-secondary" onClick={() => window.location.reload()}>Muat ulang</button>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.map((employee) => {
                  const isSelected = selectedId === employee.id;
                  return (
                    <tr key={employee.id} className={isSelected ? "selected-row" : ""}>
                      <td>
                        <div className="employee-cell">
                          <span className="employee-avatar">{initials(employee.name)}</span>
                          <span className="employee-info">
                            <strong>{employee.name}</strong>
                            <small>{employee.position}</small>
                          </span>
                        </div>
                      </td>
                      <td className="numeric-text">{employee.nik}</td>
                      <td>{employee.department}</td>
                      <td>
                        {employee.salaryComponent ? (
                          <span className="status-badge status-success"><CheckCircle2 size={14} /> Sudah diatur</span>
                        ) : (
                          <span className="status-badge status-pending"><span className="status-dot" /> Belum diatur</span>
                        )}
                      </td>
                      <td className="align-right">
                        <button
                          className={`text-button ${isSelected ? "text-button-selected" : ""}`}
                          onClick={() => setSelectedId(isSelected ? null : employee.id)}
                          aria-pressed={isSelected}
                        >
                          {isSelected ? "Tutup" : "Pilih"}
                          <ArrowUpRight size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-search">
                        <Search size={25} />
                        <strong>Karyawan tidak ditemukan</strong>
                        <span>Coba periksa kembali nama atau NIK yang kamu masukkan.</span>
                        <button className="button-secondary" onClick={() => setQuery("")}>Hapus pencarian</button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>Menampilkan {filteredEmployees.length} dari {employees.length} karyawan</span>
            <span className="demo-note">Data simulasi, bukan data karyawan nyata</span>
          </div>
        </section>

        {selectedEmployee && (
          <section className="detail-card" aria-live="polite">
            <div className="detail-heading">
              <div>
                <span className="eyebrow">KARYAWAN TERPILIH</span>
                <h2>{selectedEmployee.name}</h2>
                <p>{selectedEmployee.nik} · {selectedEmployee.department} · {selectedEmployee.position}</p>
              </div>
              <button className="icon-button" onClick={() => setSelectedId(null)} aria-label="Tutup detail">
                <X size={18} />
              </button>
            </div>

            {selectedEmployee.salaryComponent ? (
              <>
                <div className="detail-summary">
                  <div className="summary-item">
                    <span>Gaji pokok</span>
                    <strong>{formatRupiah(selectedEmployee.salaryComponent.basicSalary)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Tunjangan tetap</span>
                    <strong>{formatRupiah(selectedEmployee.salaryComponent.fixedAllowance)}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Potongan</span>
                    <strong>{formatRupiah(selectedEmployee.salaryComponent.deduction)}</strong>
                  </div>
                </div>
                <div className="inline-notice success-notice">
                  <CheckCircle2 size={18} />
                  <span>Komponen gaji tersedia pada data contoh.</span>
                </div>
              </>
            ) : (
              <div className="empty-detail">
                <span className="empty-icon"><Info size={22} /></span>
                <div>
                  <h3>Komponen gaji belum diatur</h3>
                  <p>Karyawan ini belum memiliki komponen gaji pada data contoh. Form pengaturan akan dikerjakan pada task T12.</p>
                </div>
              </div>
            )}
          </section>
        )}

        <footer className="page-footer">
          <span>M14 · Pengaturan komponen gaji</span>
          <span>Capstone Project · Kelompok C5</span>
        </footer>
      </main>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
