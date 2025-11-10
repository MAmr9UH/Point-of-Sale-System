export interface Employee {
  StaffID?: number;
  FirstName: string;
  LastName: string;
  Email: string;
  PhoneNumber: string;
  Role: 'manager' | 'cashier' | 'cook';
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
