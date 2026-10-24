import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Banknote, Bell, ChevronDown, CircleHelp, FileText, LayoutDashboard,
  Menu, Search, Settings, Users, X, ArrowUpRight, Info, CheckCircle2,
  Pencil, Plus, Save, ArrowLeft, History, Clock3, UserRound,
} from "lucide-react";
import type { Employee, SalaryComponent } from "./types/employee";
import { getEmployeesForSalary, getSalaryComponent, saveSalaryComponent, USE_MOCK_DATA } from "./services/salaryComponentService";
import { getMockSalaryHistory } from "./services/salaryHistoryService";
import type { SalaryHistoryRecord } from "./types/salaryHistory";

type SalaryFormValues = {
  basicSalary: string;
  fixedAllowance: string;
  deduction: string;
};
type SalaryFormErrors = Partial<Record<keyof SalaryFormValues, string>>;

const emptyForm: SalaryFormValues = { basicSalary: "", fixedAllowance: "0", deduction: "0" };

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", maximumFractionDigits: 0,
  }).format(value).replace(/\u00a0/g, " ");
}
function initials(name: string) {
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}

function formatSalarySnapshot(value: SalaryComponent | null) {
  if (!value) return "Belum diatur";
  return `Pokok ${formatRupiah(value.basicSalary)} · Tunjangan ${formatRupiah(value.fixedAllowance)} · Potongan ${formatRupiah(value.deduction)}`;
}

function validateSalary(values: SalaryFormValues): SalaryFormErrors {
  const errors: SalaryFormErrors = {};
  const basicText = values.basicSalary.trim();
  const allowanceText = values.fixedAllowance.trim();
  const deductionText = values.deduction.trim();

  const basic = basicText === "" ? NaN : Number(basicText);
  const allowance = allowanceText === "" ? 0 : Number(allowanceText);
  const deduction = deductionText === "" ? 0 : Number(deductionText);

  if (basicText === "") {
    errors.basicSalary = "Gaji pokok wajib diisi.";
  } else if (!Number.isFinite(basic)) {
    errors.basicSalary = "Gaji pokok harus berupa angka yang valid.";
  } else if (basic <= 0) {
    errors.basicSalary = "Gaji pokok harus lebih besar dari Rp 0.";
  } else if (!Number.isInteger(basic)) {
    errors.basicSalary = "Gaji pokok harus berupa angka bulat dalam rupiah.";
  }

  if (allowanceText !== "" && !Number.isFinite(allowance)) {
    errors.fixedAllowance = "Tunjangan tetap harus berupa angka yang valid.";
  } else if (allowance < 0) {
    errors.fixedAllowance = "Tunjangan tetap tidak boleh bernilai negatif.";
  } else if (!Number.isInteger(allowance)) {
    errors.fixedAllowance = "Tunjangan tetap harus berupa angka bulat dalam rupiah.";
  }

  if (deductionText !== "" && !Number.isFinite(deduction)) {
    errors.deduction = "Potongan harus berupa angka yang valid.";
  } else if (deduction < 0) {
    errors.deduction = "Potongan tidak boleh bernilai negatif.";
  } else if (!Number.isInteger(deduction)) {
    errors.deduction = "Potongan harus berupa angka bulat dalam rupiah.";
  }

  return errors;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [formValues, setFormValues] = useState<SalaryFormValues>(emptyForm);
  const [formErrors, setFormErrors] = useState<SalaryFormErrors>({});
  const [saveMessage, setSaveMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [isSavingSalary, setIsSavingSalary] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<SalaryHistoryRecord[]>(() => getMockSalaryHistory());

  useEffect(() => {
    let active = true;
    getEmployeesForSalary()
      .then((data) => { if (active) { setEmployees(data); setLoadError(false); } })
      .catch(() => { if (active) setLoadError(true); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((employee) =>
      employee.name.toLowerCase().includes(q) || employee.nik.toLowerCase().includes(q)
    );
  }, [employees, query]);

  const selectedEmployee = employees.find((employee) => employee.id === selectedId) ?? null;

  async function selectEmployee(id: number) {
    if (id === -1) {
      setSelectedId(null);
      setIsEditingSalary(false);
      setFormErrors({});
      setSaveMessage("");
      setShowHistory(false);
      return;
    }
    setSelectedId(id);
    setIsEditingSalary(false);
    setFormErrors({});
    setSaveMessage("");
    setShowHistory(false);
    if (!USE_MOCK_DATA) {
      try {
        const salaryComponent = await getSalaryComponent(id);
        setEmployees((current) => current.map((employee) =>
          employee.id === id ? { ...employee, salaryComponent: salaryComponent ?? undefined } : employee
        ));
      } catch (error) {
        setSaveMessage(error instanceof Error ? error.message : "Gagal memuat komponen gaji.");
      }
    }
  }
  function openSalaryForm(employee: Employee) {
    const salary = employee.salaryComponent;
    setFormValues(salary ? {
      basicSalary: String(salary.basicSalary),
      fixedAllowance: String(salary.fixedAllowance),
      deduction: String(salary.deduction),
    } : emptyForm);
    setFormErrors({});
    setSaveMessage("");
    setIsEditingSalary(true);
  }
  function cancelSalaryForm() {
    setIsEditingSalary(false);
    setFormErrors({});
    setSaveMessage("");
  }
  function updateField(field: keyof SalaryFormValues, value: string) {
    const nextValues = { ...formValues, [field]: value };
    setFormValues(nextValues);
    setFormErrors((old) => {
      // Revalidate a field as the user corrects it, but do not show errors
      // for untouched fields before the first submit/blur.
      if (old[field]) {
        const nextErrors = validateSalary(nextValues);
        return { ...old, [field]: nextErrors[field] };
      }
      return old;
    });
    setSaveMessage("");
  }

  function validateFieldOnBlur(field: keyof SalaryFormValues) {
    const errors = validateSalary(formValues);
    setFormErrors((old) => ({ ...old, [field]: errors[field] }));
  }
  async function submitSalaryForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEmployee || isSavingSalary) return;
    const errors = validateSalary(formValues);
    setFormErrors(errors);
    if (Object.keys(errors).length) return;

    const requestedSalary: SalaryComponent = {
      basicSalary: Number(formValues.basicSalary),
      fixedAllowance: formValues.fixedAllowance.trim() === "" ? 0 : Number(formValues.fixedAllowance),
      deduction: formValues.deduction.trim() === "" ? 0 : Number(formValues.deduction),
    };
    // Assumption for AC5: payroll period is monthly; changes start next month.
    const now = new Date();
    const nextPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const effectiveFrom = `${nextPeriod.getFullYear()}-${String(nextPeriod.getMonth() + 1).padStart(2, "0")}-01`;

    setIsSavingSalary(true);
    setSaveMessage("");
    try {
      const savedSalary = await saveSalaryComponent(
        selectedEmployee.id,
        { ...requestedSalary, effectiveFrom },
        Boolean(selectedEmployee.salaryComponent),
      );
      const historyEntry: SalaryHistoryRecord = {
        id: `local-${Date.now()}`,
        employeeId: selectedEmployee.id,
        oldValue: selectedEmployee.salaryComponent ?? null,
        newValue: savedSalary,
        changedBy: "Rani K. (Admin HR)",
        changedAt: new Date().toISOString(),
      };
      setEmployees((old) => old.map((employee) =>
        employee.id === selectedEmployee.id ? { ...employee, salaryComponent: savedSalary } : employee
      ));
      if (USE_MOCK_DATA) setHistoryRecords((old) => [historyEntry, ...old]);
      setShowHistory(false);
      setIsEditingSalary(false);
      setFormErrors({});
      setSaveMessage(USE_MOCK_DATA
        ? `Tersimpan pada simulasi. Berlaku mulai ${effectiveFrom}; belum dikirim ke backend.`
        : `Komponen gaji berhasil disimpan. Berlaku mulai ${effectiveFrom}.`);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Komponen gaji gagal disimpan. Silakan coba lagi.");
    } finally {
      setIsSavingSalary(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="icon-button mobile-menu-button" aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"} onClick={() => setMobileMenuOpen((open) => !open)}>
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <a className="brand" href="#" aria-label="Araya Business Hub beranda"><span className="brand-mark"><Banknote size={19} /></span><span>Araya Business Hub</span></a>
        <div className="global-search"><Search size={17} aria-hidden="true" /><span>Cari menu atau halaman...</span><kbd>⌘ K</kbd></div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Bantuan"><CircleHelp size={19} /></button>
          <button className="icon-button" aria-label="Notifikasi"><Bell size={19} /></button>
          <button className="profile-button"><span className="avatar">RK</span><span className="profile-name">Rani K.</span><ChevronDown size={15} /></button>
        </div>
      </header>

      {mobileMenuOpen && <button className="mobile-overlay" aria-label="Tutup menu" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-label">MODUL SDM</div>
        <nav aria-label="Navigasi modul SDM">
          <a className="nav-item" href="#dashboard"><LayoutDashboard size={18} /> Ringkasan</a>
          <a className="nav-item" href="#karyawan"><Users size={18} /> Data karyawan</a>
          <a className="nav-item active" href="#komponen-gaji" aria-current="page"><Banknote size={18} /> Komponen gaji</a>
          <a className="nav-item" href="#laporan"><FileText size={18} /> Laporan</a>
        </nav>
        <div className="sidebar-bottom"><a className="nav-item" href="#pengaturan"><Settings size={18} /> Pengaturan</a><div className="sidebar-note"><span className="status-dot" /><span>Lingkungan pengembangan</span></div></div>
      </aside>

      <main className="main-content" id="komponen-gaji">
        <div className="breadcrumb"><span>SDM</span><span className="crumb-separator">/</span><span>Penggajian</span><span className="crumb-separator">/</span><strong>Komponen gaji</strong></div>
        <div className="page-heading"><div><h1>Komponen gaji</h1><p>Temukan karyawan untuk melihat dan mengatur komponen gajinya.</p></div><span className="prototype-badge">Prototipe · Data contoh</span></div>

        <section className="content-card" aria-labelledby="employee-list-heading">
          <div className="card-heading"><div><h2 id="employee-list-heading">Daftar karyawan</h2><p>Pilih karyawan untuk melihat atau mengatur komponen gajinya.</p></div><span className="count-badge">{filteredEmployees.length} karyawan</span></div>
          <div className="table-toolbar">
            <label className="search-field"><Search size={18} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau NIK..." aria-label="Cari nama atau NIK karyawan" />{query && <button className="clear-search" onClick={() => setQuery("")} aria-label="Hapus pencarian"><X size={16} /></button>}</label>
            <span className="toolbar-hint">Pencarian berdasarkan nama atau NIK</span>
          </div>
          <div className="table-scroll"><table>
            <thead><tr><th>Karyawan</th><th>NIK</th><th>Departemen</th><th>Status komponen gaji</th><th className="align-right">Aksi</th></tr></thead>
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
                      <span>Coba muat ulang halaman.</span>
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => window.location.reload()}
                      >
                        Muat ulang
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-search">
                      <Search size={25} />
                      <strong>Karyawan tidak ditemukan</strong>
                      <span>Coba periksa kembali nama atau NIK yang kamu masukkan.</span>
                      <button
                        type="button"
                        className="button-secondary"
                        onClick={() => setQuery("")}
                      >
                        Hapus pencarian
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const selected = selectedId === employee.id;

                  return (
                    <tr
                      key={employee.id}
                      className={selected ? "selected-row" : ""}
                    >
                      <td>
                        <div className="employee-cell">
                          <span className="employee-avatar">
                            {initials(employee.name)}
                          </span>
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
                          <span className="status-badge status-success">
                            <CheckCircle2 size={14} /> Sudah diatur
                          </span>
                        ) : (
                          <span className="status-badge status-pending">
                            <span className="status-dot" /> Belum diatur
                          </span>
                        )}
                      </td>
                      <td className="align-right">
                        <button
                          type="button"
                          className={`text-button ${selected ? "text-button-selected" : ""}`}
                          onClick={() =>
                            selected
                              ? (setSelectedId(null), cancelSalaryForm())
                              : selectEmployee(employee.id)
                          }
                          aria-pressed={selected}
                        >
                          {selected ? "Tutup" : "Pilih"}
                          <ArrowUpRight size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table></div>
          <div className="table-footer"><span>Menampilkan {filteredEmployees.length} dari {employees.length} karyawan</span><span className="demo-note">Data simulasi, bukan data karyawan nyata</span></div>
        </section>

        {selectedEmployee && <section className="detail-card" aria-live="polite">
          <div className="detail-heading"><div><span className="eyebrow">KARYAWAN TERPILIH</span><h2>{selectedEmployee.name}</h2><p>{selectedEmployee.nik} · {selectedEmployee.department} · {selectedEmployee.position}</p></div><button className="icon-button" onClick={() => { setSelectedId(null); cancelSalaryForm(); }} aria-label="Tutup detail"><X size={18} /></button></div>

          <div className="history-toolbar">
            <div className="history-toolbar-copy">
              <History size={18} />
              <div><strong>Riwayat perubahan</strong><small>Nilai lama, nilai baru, pengubah, dan waktu perubahan</small></div>
            </div>
            <button type="button" className="button-secondary history-toggle" onClick={() => setShowHistory((visible) => !visible)} aria-expanded={showHistory}>
              <History size={16} /> {showHistory ? "Sembunyikan riwayat" : "Lihat riwayat"}
            </button>
          </div>

          {showHistory && <section className="history-panel" aria-label="Riwayat perubahan komponen gaji">
            <div className="history-panel-heading">
              <div><h3>Riwayat komponen gaji</h3><p>{selectedEmployee.name} · NIK {selectedEmployee.nik}</p></div>
              <span className="history-count">{historyRecords.filter((record) => record.employeeId === selectedEmployee.id).length} catatan</span>
            </div>
            <p className="history-demo-note"><Info size={15} /> Data riwayat pada tampilan ini adalah simulasi sampai API T9 tersedia.</p>
            {historyRecords.filter((record) => record.employeeId === selectedEmployee.id).length === 0 ? (
              <div className="history-empty"><History size={24} /><strong>Belum ada riwayat perubahan</strong><span>Riwayat akan muncul setelah komponen gaji diubah dan disimpan.</span></div>
            ) : (
              <div className="history-list">
                {historyRecords.filter((record) => record.employeeId === selectedEmployee.id).map((record) => (
                  <article className="history-record" key={record.id}>
                    <div className="history-record-top">
                      <span className="history-event"><Clock3 size={15} /> Perubahan komponen gaji</span>
                      <time dateTime={record.changedAt}>{formatDateTime(record.changedAt)} WIB</time>
                    </div>
                    <div className="history-values">
                      <div className="history-value old-value"><span>Nilai lama</span><p>{formatSalarySnapshot(record.oldValue)}</p></div>
                      <div className="history-value new-value"><span>Nilai baru</span><p>{formatSalarySnapshot(record.newValue)}</p></div>
                    </div>
                    <div className="history-actor"><UserRound size={15} /><span>Diubah oleh <strong>{record.changedBy}</strong></span></div>
                  </article>
                ))}
              </div>
            )}
          </section>}

          {isEditingSalary ? <form className="salary-form" onSubmit={submitSalaryForm} noValidate>
            <div className="form-heading"><div><h3>{selectedEmployee.salaryComponent ? "Edit komponen gaji" : "Atur komponen gaji"}</h3><p>Masukkan nominal dalam rupiah. Perubahan direncanakan berlaku pada periode gaji berikutnya.</p></div><span className="required-note">* Wajib diisi</span></div>
            <div className="salary-form-grid">
              <div className="form-field"><label htmlFor="basicSalary">Gaji pokok (Rp) <span>*</span></label><input id="basicSalary" name="basicSalary" type="text" inputMode="numeric" value={formValues.basicSalary} onChange={(e) => updateField("basicSalary", e.target.value)} onBlur={() => validateFieldOnBlur("basicSalary")} aria-invalid={Boolean(formErrors.basicSalary)} aria-describedby={formErrors.basicSalary ? "basicSalary-error" : "basicSalary-help"} placeholder="Contoh: 5000000" />{formErrors.basicSalary ? <small className="field-error" id="basicSalary-error">{formErrors.basicSalary}</small> : <small className="field-help" id="basicSalary-help">Harus lebih besar dari Rp 0.</small>}</div>
              <div className="form-field"><label htmlFor="fixedAllowance">Tunjangan tetap (Rp)</label><input id="fixedAllowance" name="fixedAllowance" type="text" inputMode="numeric" value={formValues.fixedAllowance} onChange={(e) => updateField("fixedAllowance", e.target.value)} onBlur={() => validateFieldOnBlur("fixedAllowance")} aria-invalid={Boolean(formErrors.fixedAllowance)} aria-describedby={formErrors.fixedAllowance ? "fixedAllowance-error" : "fixedAllowance-help"} placeholder="Contoh: 750000" />{formErrors.fixedAllowance ? <small className="field-error" id="fixedAllowance-error">{formErrors.fixedAllowance}</small> : <small className="field-help" id="fixedAllowance-help">Kosong dianggap Rp 0.</small>}</div>
              <div className="form-field"><label htmlFor="deduction">Potongan (Rp)</label><input id="deduction" name="deduction" type="text" inputMode="numeric" value={formValues.deduction} onChange={(e) => updateField("deduction", e.target.value)} onBlur={() => validateFieldOnBlur("deduction")} aria-invalid={Boolean(formErrors.deduction)} aria-describedby={formErrors.deduction ? "deduction-error" : "deduction-help"} placeholder="Contoh: 100000" />{formErrors.deduction ? <small className="field-error" id="deduction-error">{formErrors.deduction}</small> : <small className="field-help" id="deduction-help">Kosong dianggap Rp 0.</small>}</div>
            </div>
            {Object.keys(formErrors).length > 0 && <div className="inline-notice error-notice" role="alert"><Info size={18} /><span>Periksa kembali kolom yang ditandai sebelum menyimpan.</span></div>}
            {saveMessage && <div className="inline-notice error-notice" role="alert"><Info size={18} /><span>{saveMessage}</span></div>}
            <div className="form-actions"><button type="button" className="button-secondary" onClick={cancelSalaryForm}><ArrowLeft size={16} /> Batal</button><button type="submit" className="button-primary" disabled={isSavingSalary}><Save size={16} /> {isSavingSalary ? "Menyimpan..." : "Simpan komponen"}</button></div>
          </form> : selectedEmployee.salaryComponent ? <>
            <div className="detail-summary"><div className="summary-item"><span>Gaji pokok</span><strong>{formatRupiah(selectedEmployee.salaryComponent.basicSalary)}</strong></div><div className="summary-item"><span>Tunjangan tetap</span><strong>{formatRupiah(selectedEmployee.salaryComponent.fixedAllowance)}</strong></div><div className="summary-item"><span>Potongan</span><strong>{formatRupiah(selectedEmployee.salaryComponent.deduction)}</strong></div></div>
            <div className="detail-action-row"><div className="inline-notice success-notice"><CheckCircle2 size={18} /><span>{saveMessage || "Komponen gaji tersedia pada data contoh."}</span></div><button className="button-primary" onClick={() => openSalaryForm(selectedEmployee)}><Pencil size={16} /> Edit komponen</button></div>
          </> : <div className="empty-detail"><span className="empty-icon"><Info size={22} /></span><div className="empty-detail-copy"><h3>Komponen gaji belum diatur</h3><p>Karyawan ini belum memiliki komponen gaji pada data contoh. Atur komponen untuk mengisi dasar gaji karyawan.</p></div><button className="button-primary empty-detail-action" onClick={() => openSalaryForm(selectedEmployee)}><Plus size={16} /> Atur komponen</button></div>}
        </section>}
        <footer className="page-footer"><span>M14 · Pengaturan komponen gaji</span><span>Capstone Project · Kelompok C5</span></footer>
      </main>
    </div>
  );
}
