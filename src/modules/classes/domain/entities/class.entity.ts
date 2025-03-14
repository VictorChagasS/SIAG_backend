export class Class {
  id?: string;

  name: string;

  code?: string;

  period: string; // Formato: "year.period" (ex: "2025.2")

  teacherId: string;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(props: Omit<Class, 'createdAt' | 'updatedAt'>) {
    Object.assign(this, props);
  }
}
