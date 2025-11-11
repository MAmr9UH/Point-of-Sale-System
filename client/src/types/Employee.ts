export interface Employee {
  StaffID?: number;
  Fname: string;
  Lname: string;
  Email: string;
  PhoneNumber: string;
  Role: 'cashier' | 'cook';
  PayRate?: number;
  HireDate?: string;
  CreatedAt?: string;
  LastUpdatedAt?: string;
}

export interface Shift {
  assignId?: number;
  activeLocationId: number;
  staffId: number;
  scheduleStart: string;
  scheduleEnd: string;
  locationName?: string;
}

export interface EmployeeWithShifts extends Employee {
  Shifts?: Shift[];
}
