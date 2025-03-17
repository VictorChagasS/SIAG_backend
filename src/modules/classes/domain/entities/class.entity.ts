export type ITypeFormula = 'simple' | 'personalized';

export class Class {
  id?: string;

  name: string;

  code?: string;

  section?: number; // Número da turma, por padrão é 1

  period: string; // Formato: "year.period" (ex: "2025.2")

  teacherId: string;

  averageFormula?: string; // Fórmula personalizada para cálculo da média da turma

  typeFormula: ITypeFormula = 'simple'; // Tipo de fórmula: simples ou personalizada

  studentCount?: number; // Contagem de estudantes na turma

  createdAt?: Date;

  updatedAt?: Date;

  constructor(props: Omit<Class, 'createdAt' | 'updatedAt' | 'studentCount' | 'typeFormula'> & { section?: number }) {
    Object.assign(this, props);

    // Se averageFormula estiver definido, definir typeFormula como 'personalized', caso contrário como 'simple'
    if (props.averageFormula) {
      this.typeFormula = 'personalized';
    } else {
      this.typeFormula = 'simple';
    }

    // Define o valor padrão para section se não for fornecido
    if (props.section === undefined) {
      this.section = 1;
    } else {
      this.section = props.section;
    }
  }
}
