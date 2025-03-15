export class Class {
  id?: string;

  name: string;

  code?: string;

  period: string; // Formato: "year.period" (ex: "2025.2")

  teacherId: string;

  averageFormula?: string; // Fórmula personalizada para cálculo da média da turma

  createdAt?: Date;

  updatedAt?: Date;

  constructor(props: Omit<Class, 'createdAt' | 'updatedAt'>) {
    Object.assign(this, props);
  }
}
