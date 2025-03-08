export class User {
  id?: string;

  name: string;

  email: string;

  password: string;

  isAdmin: boolean;

  institutionId: string;

  createdAt?: Date;

  updatedAt?: Date;

  constructor(props: Omit<User, 'createdAt' | 'updatedAt'>) {
    Object.assign(this, props);
    this.isAdmin = props.isAdmin ?? false;
  }
}
