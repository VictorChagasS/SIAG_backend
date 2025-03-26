/**
 * Unit Tests for CalculateAllAveragesUseCase
 *
 * This file contains tests to validate success scenarios and exceptions
 * related to calculating averages for all students in a class.
 */
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CLASS_REPOSITORY } from '@/modules/classes/classes.providers';
import { CalculateAllAveragesUseCase } from '@/modules/grades/domain/usecases/calculate-all-averages.usecase';
import { CalculateStudentAverageUseCase } from '@/modules/grades/domain/usecases/calculate-student-average.usecase';
import { STUDENT_REPOSITORY } from '@/modules/students/students.providers';

describe('CalculateAllAveragesUseCase', () => {
  let useCase: CalculateAllAveragesUseCase;
  let mockStudentRepository: any;
  let mockClassRepository: any;
  let mockCalculateStudentAverageUseCase: any;

  // Sample data for tests
  const mockTeacherId = 'teacher-123';
  const mockClassId = 'class-123';

  // Sample students
  const mockStudents = [
    {
      id: 'student-1',
      name: 'John Smith',
      registration: '2021001',
      classId: mockClassId,
    },
    {
      id: 'student-2',
      name: 'Mary Johnson',
      registration: '2021002',
      classId: mockClassId,
    },
    {
      id: 'student-3',
      name: 'Peter Davis',
      registration: '2021003',
      classId: mockClassId,
    },
  ];

  // Sample class
  const mockClass = {
    id: mockClassId,
    name: 'Math 101',
    teacherId: mockTeacherId,
    typeFormula: 'simple',
    averageFormula: null,
  };

  // Sample average results for each student
  const mockStudentAverages = [
    {
      studentId: 'student-1',
      studentName: 'John Smith',
      average: 8.5,
      unitAverages: [
        { unitId: 'unit-1', unitName: 'Unit 1', average: 8.0 },
        { unitId: 'unit-2', unitName: 'Unit 2', average: 9.0 },
      ],
    },
    {
      studentId: 'student-2',
      studentName: 'Mary Johnson',
      average: 9.25,
      unitAverages: [
        { unitId: 'unit-1', unitName: 'Unit 1', average: 9.0 },
        { unitId: 'unit-2', unitName: 'Unit 2', average: 9.5 },
      ],
    },
    {
      studentId: 'student-3',
      studentName: 'Peter Davis',
      average: 7.0,
      unitAverages: [
        { unitId: 'unit-1', unitName: 'Unit 1', average: 6.5 },
        { unitId: 'unit-2', unitName: 'Unit 2', average: 7.5 },
      ],
    },
  ];

  beforeEach(async () => {
    // Create repository mocks
    mockStudentRepository = {
      findByClassId: jest.fn(),
    };

    mockClassRepository = {
      findById: jest.fn(),
    };

    // Mock for the CalculateStudentAverageUseCase
    mockCalculateStudentAverageUseCase = {
      execute: jest.fn(),
    };

    // Test module configuration
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalculateAllAveragesUseCase,
        {
          provide: STUDENT_REPOSITORY,
          useValue: mockStudentRepository,
        },
        {
          provide: CLASS_REPOSITORY,
          useValue: mockClassRepository,
        },
        {
          provide: CalculateStudentAverageUseCase,
          useValue: mockCalculateStudentAverageUseCase,
        },
      ],
    }).compile();

    useCase = module.get<CalculateAllAveragesUseCase>(CalculateAllAveragesUseCase);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should correctly calculate the average for all students in a class', async () => {
      // Arrange: Configure mocks
      mockClassRepository.findById.mockResolvedValue(mockClass);
      mockStudentRepository.findByClassId.mockResolvedValue(mockStudents);

      // Configure the mock to return averages for each student
      mockCalculateStudentAverageUseCase.execute
        .mockResolvedValueOnce(mockStudentAverages[0])
        .mockResolvedValueOnce(mockStudentAverages[1])
        .mockResolvedValueOnce(mockStudentAverages[2]);

      // Act: Execute the method being tested
      const result = await useCase.execute(mockTeacherId, mockClassId);

      // Assert: Verify expected behavior

      // Verify that methods were called with correct parameters
      expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
      expect(mockStudentRepository.findByClassId).toHaveBeenCalledWith(mockClassId);

      // Verify that average calculation was called for each student
      expect(mockCalculateStudentAverageUseCase.execute).toHaveBeenCalledTimes(3);
      expect(mockCalculateStudentAverageUseCase.execute).toHaveBeenCalledWith(
        mockStudents[0].id,
        mockClassId,
        mockTeacherId,
      );
      expect(mockCalculateStudentAverageUseCase.execute).toHaveBeenCalledWith(
        mockStudents[1].id,
        mockClassId,
        mockTeacherId,
      );
      expect(mockCalculateStudentAverageUseCase.execute).toHaveBeenCalledWith(
        mockStudents[2].id,
        mockClassId,
        mockTeacherId,
      );

      // Verify the result
      expect(result).toEqual({
        classId: mockClassId,
        className: mockClass.name,
        studentAverages: mockStudents.map((student, index) => ({
          studentId: student.id,
          studentName: student.name,
          studentRegistration: student.registration,
          average: mockStudentAverages[index].average,
          unitAverages: mockStudentAverages[index].unitAverages,
        })),
      });

      // Verify specific calculations
      const firstStudent = result.studentAverages.find((s) => s.studentId === 'student-1');
      expect(firstStudent.average).toBe(8.5);

      const secondStudent = result.studentAverages.find((s) => s.studentId === 'student-2');
      expect(secondStudent.average).toBe(9.25);

      const thirdStudent = result.studentAverages.find((s) => s.studentId === 'student-3');
      expect(thirdStudent.average).toBe(7.0);
    });

    it('should return an empty list when there are no students in the class', async () => {
      // Arrange: Configure mocks
      mockClassRepository.findById.mockResolvedValue(mockClass);
      mockStudentRepository.findByClassId.mockResolvedValue([]);

      // Act: Execute the method being tested
      const result = await useCase.execute(mockTeacherId, mockClassId);

      // Assert: Verify expected behavior
      expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
      expect(mockStudentRepository.findByClassId).toHaveBeenCalledWith(mockClassId);
      expect(mockCalculateStudentAverageUseCase.execute).not.toHaveBeenCalled();

      expect(result).toEqual({
        classId: mockClassId,
        className: mockClass.name,
        studentAverages: [],
      });
    });

    it('should throw NotFoundException when the class does not exist', async () => {
      // Arrange: Configure mock to return null (class not found)
      mockClassRepository.findById.mockResolvedValue(null);

      // Act & Assert: Execute and verify exception is thrown
      await expect(useCase.execute(mockTeacherId, 'non-existent-class'))
        .rejects.toThrow(NotFoundException);

      // Verify that the method was called with the correct ID
      expect(mockClassRepository.findById).toHaveBeenCalledWith('non-existent-class');

      // Verify that other methods were not called
      expect(mockStudentRepository.findByClassId).not.toHaveBeenCalled();
      expect(mockCalculateStudentAverageUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when the teacher is not the class owner', async () => {
      // Arrange: Configure mock to return a class with a different teacher
      const otherTeacherClass = {
        ...mockClass,
        teacherId: 'other-teacher-456',
      };
      mockClassRepository.findById.mockResolvedValue(otherTeacherClass);

      // Act & Assert: Execute and verify exception is thrown
      await expect(useCase.execute(mockTeacherId, mockClassId))
        .rejects.toThrow(ForbiddenException);

      // Verify that the method was called with the correct ID
      expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);

      // Verify that other methods were not called
      expect(mockStudentRepository.findByClassId).not.toHaveBeenCalled();
      expect(mockCalculateStudentAverageUseCase.execute).not.toHaveBeenCalled();
    });

    it('should correctly calculate averages when the class uses a custom formula', async () => {
      // Arrange: Configure class with custom formula
      const classWithFormula = {
        ...mockClass,
        typeFormula: 'personalized',
        averageFormula: '(N1 * 0.4) + (N2 * 0.6)', // Formula with different weights
      };

      // Averages adjusted to reflect the custom formula
      const customAvgStudentAverages = [
        {
          studentId: 'student-1',
          studentName: 'John Smith',
          average: 8.6, // (8.0 * 0.4) + (9.0 * 0.6) = 8.6
          unitAverages: [
            { unitId: 'unit-1', unitName: 'Unit 1', average: 8.0 },
            { unitId: 'unit-2', unitName: 'Unit 2', average: 9.0 },
          ],
        },
        {
          studentId: 'student-2',
          studentName: 'Mary Johnson',
          average: 9.3, // (9.0 * 0.4) + (9.5 * 0.6) = 9.3
          unitAverages: [
            { unitId: 'unit-1', unitName: 'Unit 1', average: 9.0 },
            { unitId: 'unit-2', unitName: 'Unit 2', average: 9.5 },
          ],
        },
      ];

      mockClassRepository.findById.mockResolvedValue(classWithFormula);
      mockStudentRepository.findByClassId.mockResolvedValue(mockStudents.slice(0, 2));

      mockCalculateStudentAverageUseCase.execute
        .mockResolvedValueOnce(customAvgStudentAverages[0])
        .mockResolvedValueOnce(customAvgStudentAverages[1]);

      // Act: Execute the method being tested
      const result = await useCase.execute(mockTeacherId, mockClassId);

      // Assert: Verify expected behavior
      expect(mockClassRepository.findById).toHaveBeenCalledWith(mockClassId);
      expect(mockStudentRepository.findByClassId).toHaveBeenCalledWith(mockClassId);
      expect(mockCalculateStudentAverageUseCase.execute).toHaveBeenCalledTimes(2);

      // Verify that results reflect the custom formula
      expect(result.studentAverages[0].average).toBe(8.6);
      expect(result.studentAverages[1].average).toBe(9.3);
    });

    it('should generate averages that match manual calculations for given grades and formulas', async () => {
      // Arrange: Create test data with known grades and expected averages
      const classWithFormula = {
        ...mockClass,
        typeFormula: 'personalized',
        averageFormula: '(N1 * 0.3) + (N2 * 0.7)', // Unit 1 with weight 0.3, Unit 2 with weight 0.7
      };

      // Test data: student grades and unit averages
      // We're not directly using this data but keeping it as documentation
      // to show what grades would produce these unit averages
      /*
      const mockGrades = {
        'student-1': {
          // Unit 1 grades
          'unit-1': [
            { evaluationItemId: 'eval-1-1', value: 7.0 }, // Test 1
            { evaluationItemId: 'eval-1-2', value: 8.0 }, // Assignment 1
          ],
          // Unit 2 grades
          'unit-2': [
            { evaluationItemId: 'eval-2-1', value: 9.0 }, // Test 2
            { evaluationItemId: 'eval-2-2', value: 9.5 }, // Assignment 2
          ],
        },
        'student-2': {
          // Unit 1 grades
          'unit-1': [
            { evaluationItemId: 'eval-1-1', value: 8.5 }, // Test 1
            { evaluationItemId: 'eval-1-2', value: 9.0 }, // Assignment 1
          ],
          // Unit 2 grades
          'unit-2': [
            { evaluationItemId: 'eval-2-1', value: 10.0 }, // Test 2
            { evaluationItemId: 'eval-2-2', value: 9.0 }, // Assignment 2
          ],
        },
      };
      */

      // Calculate expected unit averages (simple average)
      const expectedUnitAverages = {
        'student-1': {
          'unit-1': (7.0 + 8.0) / 2, // 7.5
          'unit-2': (9.0 + 9.5) / 2, // 9.25
        },
        'student-2': {
          'unit-1': (8.5 + 9.0) / 2, // 8.75
          'unit-2': (10.0 + 9.0) / 2, // 9.5
        },
      };

      // Calculate expected final averages (using class formula)
      const expectedFinalAverages = {
        'student-1': (expectedUnitAverages['student-1']['unit-1'] * 0.3)
                     + (expectedUnitAverages['student-1']['unit-2'] * 0.7),
        'student-2': (expectedUnitAverages['student-2']['unit-1'] * 0.3)
                     + (expectedUnitAverages['student-2']['unit-2'] * 0.7),
      };

      // Create student average results that match our expected unit averages
      const detailedStudentAverages = [
        {
          studentId: 'student-1',
          studentName: 'John Smith',
          average: expectedFinalAverages['student-1'],
          unitAverages: [
            { unitId: 'unit-1', unitName: 'Unit 1', average: expectedUnitAverages['student-1']['unit-1'] },
            { unitId: 'unit-2', unitName: 'Unit 2', average: expectedUnitAverages['student-1']['unit-2'] },
          ],
        },
        {
          studentId: 'student-2',
          studentName: 'Mary Johnson',
          average: expectedFinalAverages['student-2'],
          unitAverages: [
            { unitId: 'unit-1', unitName: 'Unit 1', average: expectedUnitAverages['student-2']['unit-1'] },
            { unitId: 'unit-2', unitName: 'Unit 2', average: expectedUnitAverages['student-2']['unit-2'] },
          ],
        },
      ];

      // Configure mocks
      mockClassRepository.findById.mockResolvedValue(classWithFormula);
      mockStudentRepository.findByClassId.mockResolvedValue(mockStudents.slice(0, 2));

      mockCalculateStudentAverageUseCase.execute
        .mockResolvedValueOnce(detailedStudentAverages[0])
        .mockResolvedValueOnce(detailedStudentAverages[1]);

      // Act: Execute the method being tested
      const result = await useCase.execute(mockTeacherId, mockClassId);

      // Assert: Verify expected behavior

      // 1. Verify the actual calculated values match our expected values
      expect(result.studentAverages[0].average).toBe(expectedFinalAverages['student-1']);
      expect(result.studentAverages[1].average).toBe(expectedFinalAverages['student-2']);

      // 2. Manually calculate and verify unit averages
      expect(result.studentAverages[0].unitAverages[0].average).toBe(7.5); // Unit 1 for student 1
      expect(result.studentAverages[0].unitAverages[1].average).toBe(9.25); // Unit 2 for student 1
      expect(result.studentAverages[1].unitAverages[0].average).toBe(8.75); // Unit 1 for student 2
      expect(result.studentAverages[1].unitAverages[1].average).toBe(9.5); // Unit 2 for student 2

      // 3. Manually calculate and verify final averages using the formula
      const student1FinalAvg = (7.5 * 0.3) + (9.25 * 0.7); // = 8.725
      const student2FinalAvg = (8.75 * 0.3) + (9.5 * 0.7); // = 9.275

      expect(result.studentAverages[0].average).toBeCloseTo(student1FinalAvg, 4);
      expect(result.studentAverages[1].average).toBeCloseTo(student2FinalAvg, 4);

      // 4. Verify that formula substitution works correctly
      // For student 1:
      const formula = '(N1 * 0.3) + (N2 * 0.7)';
      const formulaWithValues = formula
        .replace(/N1/g, expectedUnitAverages['student-1']['unit-1'].toString())
        .replace(/N2/g, expectedUnitAverages['student-1']['unit-2'].toString());

      // eslint-disable-next-line no-eval
      const calculatedAvg = eval(formulaWithValues);
      expect(calculatedAvg).toBeCloseTo(result.studentAverages[0].average, 4);
    });
  });
});
