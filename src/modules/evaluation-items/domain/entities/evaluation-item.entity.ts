export class EvaluationItem {
  id?: string;

  name: string;

  unitId: string;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(props: Omit<EvaluationItem, 'createdAt' | 'updatedAt'>) {
    Object.assign(this, props);
  }
}
