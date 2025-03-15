export class Unit {
  id?: string;

  name: string;

  classId: string;

  averageFormula?: string;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(props: Omit<Unit, 'createdAt' | 'updatedAt'>) {
    Object.assign(this, props);
  }
}
