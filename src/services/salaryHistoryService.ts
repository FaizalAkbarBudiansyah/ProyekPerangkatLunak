import type { SalaryHistoryRecord } from "../types/salaryHistory";

// Data riwayat simulasi untuk mengembangkan UI T14 sebelum endpoint T9 tersedia.
// Saat backend siap, ganti implementasi ini dengan request ke API riwayat.
export function getMockSalaryHistory(): SalaryHistoryRecord[] {
  return [
    {
      id: "history-1",
      employeeId: 1,
      oldValue: { basicSalary: 4_500_000, fixedAllowance: 500_000, deduction: 100_000 },
      newValue: { basicSalary: 5_000_000, fixedAllowance: 750_000, deduction: 100_000 },
      changedBy: "Rani K. (Admin HR)",
      changedAt: "2026-10-20T09:15:00+07:00",
    },
    {
      id: "history-2",
      employeeId: 3,
      oldValue: { basicSalary: 4_500_000, fixedAllowance: 400_000, deduction: 0 },
      newValue: { basicSalary: 4_800_000, fixedAllowance: 500_000, deduction: 0 },
      changedBy: "Rani K. (Admin HR)",
      changedAt: "2026-10-21T14:30:00+07:00",
    },
  ];
}
