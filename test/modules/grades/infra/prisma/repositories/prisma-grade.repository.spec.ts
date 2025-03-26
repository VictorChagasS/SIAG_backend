/**
 * Tests for PrismaGradeRepository
 *
 * Verifies if the data returned by the repository allows
 * correctly calculating averages using different formulas.
 */
import { Test, TestingModule } from '@nestjs/testing';

import { PrismaGradeRepository } from '@/modules/grades/infra/prisma/repositories/prisma-grade.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('PrismaGradeRepository', () => {
  let repository: PrismaGradeRepository;
  let prismaService: PrismaService;

  // Sample IDs
  const mockStudentId = 'student-123';
  const mockUnitId = 'unit-123';
  const mockEvalItem1Id = 'eval-1';
  const mockEvalItem2Id = 'eval-2';
  const mockEvalItem3Id = 'eval-3';

  // Sample grades
  const mockGrades = [
    {
      id: 'grade-1',
      studentId: mockStudentId,
      evaluationItemId: mockEvalItem1Id,
      value: 7.5,
      comments: 'Good work',
      createdAt: new Date(),
      updatedAt: new Date(),
      evaluationItem: {
        id: mockEvalItem1Id,
        name: 'Test 1',
        unitId: mockUnitId,
      },
    },
    {
      id: 'grade-2',
      studentId: mockStudentId,
      evaluationItemId: mockEvalItem2Id,
      value: 8.5,
      comments: 'Very good',
      createdAt: new Date(),
      updatedAt: new Date(),
      evaluationItem: {
        id: mockEvalItem2Id,
        name: 'Assignment 1',
        unitId: mockUnitId,
      },
    },
    {
      id: 'grade-3',
      studentId: mockStudentId,
      evaluationItemId: mockEvalItem3Id,
      value: 6.0,
      comments: 'Needs improvement',
      createdAt: new Date(),
      updatedAt: new Date(),
      evaluationItem: {
        id: mockEvalItem3Id,
        name: 'Presentation',
        unitId: mockUnitId,
      },
    },
  ];

  beforeEach(async () => {
    // Mock for the Prisma service
    const prismaServiceMock = {
      grade: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn((calls) => Promise.all(calls.map((call) => call))),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaGradeRepository,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    repository = module.get<PrismaGradeRepository>(PrismaGradeRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('findByStudentAndUnit', () => {
    it('should return data that allows calculating simple arithmetic average correctly', async () => {
      // Arrange: Configure mock to return grades
      (prismaService.grade.findMany as jest.Mock).mockResolvedValue(mockGrades);

      // Act: Execute the method being tested
      const result = await repository.findByStudentAndUnit(mockStudentId, mockUnitId);

      // Assert: Verify expected behavior
      expect(prismaService.grade.findMany).toHaveBeenCalledWith({
        where: {
          studentId: mockStudentId,
          evaluationItem: {
            unitId: mockUnitId,
          },
        },
        include: {
          evaluationItem: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      // Verify that the returned data is correct
      expect(result).toEqual(mockGrades);

      // Calculate simple arithmetic average manually
      const simpleAverage = mockGrades.reduce((acc, grade) => acc + grade.value, 0) / mockGrades.length;

      // Calculate using the returned data
      const calculatedAverage = result.reduce((acc, grade) => acc + grade.value, 0) / result.length;

      // Verify that the averages are equal
      expect(calculatedAverage).toBe(simpleAverage);
      expect(calculatedAverage).toBe((7.5 + 8.5 + 6.0) / 3); // 7.333...
    });

    it('should return data that allows calculating average with different weights', async () => {
      // Arrange: Configure mock to return grades
      (prismaService.grade.findMany as jest.Mock).mockResolvedValue(mockGrades);

      // Act: Execute the method being tested
      const result = await repository.findByStudentAndUnit(mockStudentId, mockUnitId);

      // Assert: Verify that the data was returned correctly
      expect(result).toEqual(mockGrades);

      // Verify if we can calculate a weighted average (custom formula)
      // Example: Test with weight 0.5, Assignment with weight 0.3, Presentation with weight 0.2

      // Map evaluation item IDs to their indices in the formula
      const evalItemMap = {
        [mockEvalItem1Id]: 'N1', // Test 1
        [mockEvalItem2Id]: 'N2', // Assignment 1
        [mockEvalItem3Id]: 'N3', // Presentation
      };

      // Extract values for the formula
      const variables: Record<string, number> = {};
      result.forEach((grade) => {
        const varName = evalItemMap[grade.evaluationItemId];
        variables[varName] = grade.value;
      });

      // Custom formula: (N1 * 0.5) + (N2 * 0.3) + (N3 * 0.2)
      const formula = '(N1 * 0.5) + (N2 * 0.3) + (N3 * 0.2)';

      // Replace variables in the formula
      let formulaWithValues = formula;
      Object.entries(variables).forEach(([name, value]) => {
        const regex = new RegExp(name, 'g');
        formulaWithValues = formulaWithValues.replace(regex, value.toString());
      });

      // Calculate the average using eval (simulating what the system does)
      // eslint-disable-next-line no-eval
      const calculatedWeightedAverage = eval(formulaWithValues);

      // Calculate manually for comparison
      const expectedWeightedAverage = (7.5 * 0.5) + (8.5 * 0.3) + (6.0 * 0.2);

      // Verify that the averages are equal
      expect(calculatedWeightedAverage).toBe(expectedWeightedAverage);
      expect(calculatedWeightedAverage).toBe(7.5); // 7.
    });

    it('should correctly handle the case of no grades found', async () => {
      // Arrange: Configure mock to return empty array
      (prismaService.grade.findMany as jest.Mock).mockResolvedValue([]);

      // Act: Execute the method being tested
      const result = await repository.findByStudentAndUnit(mockStudentId, mockUnitId);

      // Assert: Verify expected behavior
      expect(prismaService.grade.findMany).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findByUnit', () => {
    it('should return data that allows calculating averages for multiple students', async () => {
      // Arrange: Prepare data for multiple students
      const mockStudentId2 = 'student-456';
      const mockGradesMultipleStudents = [
        ...mockGrades, // Grades of the first student
        {
          id: 'grade-4',
          studentId: mockStudentId2,
          evaluationItemId: mockEvalItem1Id,
          value: 9.0,
          comments: 'Excellent',
          createdAt: new Date(),
          updatedAt: new Date(),
          evaluationItem: {
            id: mockEvalItem1Id,
            name: 'Test 1',
            unitId: mockUnitId,
          },
          student: {
            id: mockStudentId2,
            name: 'Mary Smith',
            registration: '2021002',
          },
        },
        {
          id: 'grade-5',
          studentId: mockStudentId2,
          evaluationItemId: mockEvalItem2Id,
          value: 8.0,
          comments: 'Very good',
          createdAt: new Date(),
          updatedAt: new Date(),
          evaluationItem: {
            id: mockEvalItem2Id,
            name: 'Assignment 1',
            unitId: mockUnitId,
          },
          student: {
            id: mockStudentId2,
            name: 'Mary Smith',
            registration: '2021002',
          },
        },
        {
          id: 'grade-6',
          studentId: mockStudentId2,
          evaluationItemId: mockEvalItem3Id,
          value: 9.5,
          comments: 'Excellent presentation',
          createdAt: new Date(),
          updatedAt: new Date(),
          evaluationItem: {
            id: mockEvalItem3Id,
            name: 'Presentation',
            unitId: mockUnitId,
          },
          student: {
            id: mockStudentId2,
            name: 'Mary Smith',
            registration: '2021002',
          },
        },
      ];

      // Add student information for the first student's grades
      const mockGradesWithStudents = mockGradesMultipleStudents.map((grade) => {
        if (grade.studentId === mockStudentId) {
          return {
            ...grade,
            student: {
              id: mockStudentId,
              name: 'John Smith',
              registration: '2021001',
            },
          };
        }
        return grade;
      });

      (prismaService.grade.findMany as jest.Mock).mockResolvedValue(mockGradesWithStudents);

      // Act: Execute the method being tested
      const result = await repository.findByUnit(mockUnitId);

      // Assert: Verify expected behavior
      expect(prismaService.grade.findMany).toHaveBeenCalledWith({
        where: {
          evaluationItem: {
            unitId: mockUnitId,
          },
        },
        include: {
          evaluationItem: true,
          student: true,
        },
        orderBy: [
          { student: { name: 'asc' } },
          { evaluationItem: { name: 'asc' } },
        ],
      });

      // Verify that the returned data is correct
      expect(result).toEqual(mockGradesWithStudents);

      // Group grades by student
      const studentGrades: Record<string, any[]> = {};
      result.forEach((grade) => {
        if (!studentGrades[grade.studentId]) {
          studentGrades[grade.studentId] = [];
        }
        studentGrades[grade.studentId].push(grade);
      });

      // Calculate average for each student
      Object.keys(studentGrades).forEach((studentId) => {
        const grades = studentGrades[studentId];
        const studentAverage = grades.reduce((acc, grade) => acc + grade.value, 0) / grades.length;

        // Verify that the average is correct
        if (studentId === mockStudentId) {
          expect(studentAverage).toBe((7.5 + 8.5 + 6.0) / 3); // 7.333...
        } else if (studentId === mockStudentId2) {
          expect(studentAverage).toBe((9.0 + 8.0 + 9.5) / 3); // 8.833...
        }
      });

      // Verify if we can apply a weighted formula for each student
      const weightedFormula = '(N1 * 0.5) + (N2 * 0.3) + (N3 * 0.2)';

      Object.keys(studentGrades).forEach((studentId) => {
        const grades = studentGrades[studentId];

        // Map grades to variables in the formula
        const variables: Record<string, number> = {};
        grades.forEach((grade) => {
          if (grade.evaluationItemId === mockEvalItem1Id) variables.N1 = grade.value;
          if (grade.evaluationItemId === mockEvalItem2Id) variables.N2 = grade.value;
          if (grade.evaluationItemId === mockEvalItem3Id) variables.N3 = grade.value;
        });

        // Replace variables in the formula
        let formulaWithValues = weightedFormula;
        Object.entries(variables).forEach(([name, value]) => {
          const regex = new RegExp(name, 'g');
          formulaWithValues = formulaWithValues.replace(regex, value.toString());
        });

        // Calculate weighted average
        // eslint-disable-next-line no-eval
        const weightedAverage = eval(formulaWithValues);

        // Verify that the weighted average is correct for each student
        if (studentId === mockStudentId) {
          expect(weightedAverage).toBe((7.5 * 0.5) + (8.5 * 0.3) + (6.0 * 0.2)); // 7.55
        } else if (studentId === mockStudentId2) {
          expect(weightedAverage).toBe((9.0 * 0.5) + (8.0 * 0.3) + (9.5 * 0.2)); // 8.8
        }
      });
    });
  });
});
