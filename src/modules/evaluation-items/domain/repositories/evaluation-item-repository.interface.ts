import { EvaluationItem } from '../entities/evaluation-item.entity';

export interface IEvaluationItemRepository {
  create(evaluationItemData: EvaluationItem): Promise<EvaluationItem>;
  findById(id: string): Promise<EvaluationItem | null>;
  findByUnitId(unitId: string): Promise<EvaluationItem[]>;
  findByNameAndUnitId(name: string, unitId: string): Promise<EvaluationItem | null>;
  update(id: string, evaluationItemData: Partial<EvaluationItem>): Promise<EvaluationItem>;
  delete(id: string): Promise<void>;
}
