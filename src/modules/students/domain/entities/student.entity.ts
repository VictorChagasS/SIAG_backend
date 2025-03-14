export class Student {
  id?: string;

  name: string;

  email?: string;

  registration: string;

  classId: string;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(props: Omit<Student, 'createdAt' | 'updatedAt'>) {
    Object.assign(this, props);
  }
}
