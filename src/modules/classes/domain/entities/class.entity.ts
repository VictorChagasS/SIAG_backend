export type ITypeFormula = 'simple' | 'personalized';

export class Class {
  id?: string;

  name: string;

  code?: string;

  period: string; // Formato: "year.period" (ex: "2025.2")

  teacherId: string;

  averageFormula?: string; // Fórmula personalizada para cálculo da média da turma

  typeFormula: ITypeFormula = 'simple'; // Tipo de fórmula: simples ou personalizada

  studentCount?: number; // Contagem de estudantes na turma

  createdAt?: Date;

  updatedAt?: Date;

  constructor(props: Omit<Class, 'createdAt' | 'updatedAt' | 'studentCount' | 'typeFormula'>) {
    Object.assign(this, props);

    // Se averageFormula estiver definido, definir typeFormula como 'personalized', caso contrário como 'simple'
    if (props.averageFormula) {
      this.typeFormula = 'personalized';
    } else {
      this.typeFormula = 'simple';
    }
  }
}
