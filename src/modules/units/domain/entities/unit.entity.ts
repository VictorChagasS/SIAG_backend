import { ITypeFormula } from '@/modules/classes/domain/entities/class.entity';

export class Unit {
  id?: string;

  name: string;

  classId: string;

  averageFormula?: string;

  typeFormula: ITypeFormula = 'simple'; // Tipo de fórmula: simples ou personalizada

  createdAt?: Date;

  updatedAt?: Date;

  constructor(props: Omit<Unit, 'createdAt' | 'updatedAt' | 'typeFormula'>) {
    Object.assign(this, props);

    // Se averageFormula estiver definido, definir typeFormula como 'personalized', caso contrário como 'simple'
    if (props.averageFormula) {
      this.typeFormula = 'personalized';
    } else {
      this.typeFormula = 'simple';
    }
  }
}
