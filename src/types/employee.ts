export type SalaryComponent = {
  basicSalary: number;
  fixedAllowance: number;
  deduction: number;
};

export type Employee = {
  id: number;
  name: string;
  nik: string;
  department: string;
  position: string;
  salaryComponent?: SalaryComponent;
};
