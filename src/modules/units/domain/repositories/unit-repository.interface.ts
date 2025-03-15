import { Unit } from '../entities/unit.entity';

export interface IUnitRepository {
  create(unitData: Unit): Promise<Unit>;
  findById(id: string): Promise<Unit | null>;
  findByClassId(classId: string): Promise<Unit[]>;
  findByNameAndClassId(name: string, classId: string): Promise<Unit | null>;
  update(id: string, unitData: Partial<Unit>): Promise<Unit>;
  delete(id: string): Promise<void>;
}
