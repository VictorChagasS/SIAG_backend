/**
 * Tests for PrismaClassRepository
 *
 * These tests verify that the Prisma implementation of the class repository
 * is working correctly for CRUD operations.
 *
 * @module ClassRepositoryTests
 */
import { Test, TestingModule } from '@nestjs/testing';

import { IPaginationNamePeriodSearchOptions } from '@/common/interfaces/pagination.interfaces';
import { Class } from '@/modules/classes/domain/entities/class.entity';
import { PrismaClassRepository } from '@/modules/classes/infra/prisma/repositories/prisma-class.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('PrismaClassRepository', () => {
  let repository: PrismaClassRepository;
  let prismaService: PrismaService;

  // Test data
  const mockClassId = 'class-123';
  const mockTeacherId = 'teacher-123';
  const mockClass: Class = {
    id: mockClassId,
    name: 'Mathematics 101',
    code: 'MATH101',
    section: 1,
    period: '2023.1',
    teacherId: mockTeacherId,
    typeFormula: 'simple',
    studentCount: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Creation data
  const createClassData: Class = {
    name: 'Mathematics 101',
    code: 'MATH101',
    period: '2023.1',
    teacherId: mockTeacherId,
    section: 1,
    typeFormula: 'simple',
  };

  beforeEach(async () => {
    // Create mocks for Prisma service
    const mockPrismaService = {
      class: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    // Configure test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaClassRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaClassRepository>(PrismaClassRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test for class creation
   */
  describe('create', () => {
    it('should create a new class successfully', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.class.create as jest.Mock).mockResolvedValue({
        id: mockClassId,
        name: createClassData.name,
        code: createClassData.code,
        section: createClassData.section,
        period: createClassData.period,
        teacherId: createClassData.teacherId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act: Execute the method to be tested
      const result = await repository.create(createClassData);

      // Assert: Verify expected behavior
      expect(prismaService.class.create).toHaveBeenCalledWith({
        data: {
          name: createClassData.name,
          code: createClassData.code,
          section: createClassData.section,
          period: createClassData.period,
          teacherId: createClassData.teacherId,
        },
      });
      expect(result).toEqual(expect.objectContaining({
        id: mockClassId,
        name: createClassData.name,
        studentCount: 0, // Should initialize with 0 students
      }));
    });
  });

  /**
   * Test for finding class by ID
   */
  describe('findById', () => {
    it('should return a class when it exists', async () => {
      // Arrange: Configure mock for success scenario
      const mockPrismaResult = {
        ...mockClass,
        _count: { students: 25 },
      };

      (prismaService.class.findUnique as jest.Mock).mockResolvedValue(mockPrismaResult);

      // Act: Execute the method to be tested
      const result = await repository.findById(mockClassId);

      // Assert: Verify expected behavior
      expect(prismaService.class.findUnique).toHaveBeenCalledWith({
        where: { id: mockClassId },
        include: {
          _count: {
            select: { students: true },
          },
        },
      });
      expect(result).toEqual(expect.objectContaining({
        id: mockClassId,
        name: mockClass.name,
        studentCount: 25,
      }));
    });

    it('should return null when the class does not exist', async () => {
      // Arrange: Configure mock for failure scenario
      (prismaService.class.findUnique as jest.Mock).mockResolvedValue(null);

      // Act: Execute the method to be tested
      const result = await repository.findById('nonexistent-id');

      // Assert: Verify expected behavior
      expect(prismaService.class.findUnique).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' },
        include: {
          _count: {
            select: { students: true },
          },
        },
      });
      expect(result).toBeNull();
    });
  });

  /**
   * Test for finding classes by teacher ID
   */
  describe('findByTeacherId', () => {
    it('should return paginated classes for a teacher', async () => {
      // Arrange: Configure mock for success scenario
      const mockClasses = [
        {
          ...mockClass,
          _count: { students: 25 },
        },
        {
          ...mockClass,
          id: 'class-456',
          name: 'Physics 101',
          _count: { students: 15 },
        },
      ];

      const options: IPaginationNamePeriodSearchOptions = {
        page: 1,
        limit: 10,
        name: 'Math',
        period: '2023.1',
      };

      (prismaService.class.findMany as jest.Mock).mockResolvedValue(mockClasses);
      (prismaService.class.count as jest.Mock).mockResolvedValue(2);

      // Act: Execute the method to be tested
      const result = await repository.findByTeacherId(mockTeacherId, options);

      // Assert: Verify expected behavior
      expect(prismaService.class.findMany).toHaveBeenCalledWith({
        where: {
          teacherId: mockTeacherId,
          name: {
            contains: 'Math',
            mode: 'insensitive',
          },
          period: '2023.1',
        },
        include: {
          _count: {
            select: { students: true },
          },
        },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: mockClassId,
            name: mockClass.name,
            studentCount: 25,
          }),
        ]),
        total: 2,
      });
    });
  });

  /**
   * Test for finding active classes by teacher ID
   */
  describe('findActiveByTeacherId', () => {
    it('should return active classes for a teacher', async () => {
      // Arrange: Configure mock for success scenario
      const mockClasses = [
        {
          ...mockClass,
          _count: { students: 25 },
        },
      ];

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ currentPeriod: '2023.1' });
      (prismaService.class.findMany as jest.Mock).mockResolvedValue(mockClasses);

      // Act: Execute the method to be tested
      const result = await repository.findActiveByTeacherId(mockTeacherId, 'Math');

      // Assert: Verify expected behavior
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockTeacherId },
        select: { currentPeriod: true },
      });

      expect(prismaService.class.findMany).toHaveBeenCalledWith({
        where: {
          teacherId: mockTeacherId,
          period: '2023.1',
          name: {
            contains: 'Math',
            mode: 'insensitive',
          },
        },
        include: {
          _count: {
            select: { students: true },
          },
        },
      });

      expect(result).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: mockClassId,
          name: mockClass.name,
          studentCount: 25,
        }),
      ]));
    });
  });

  /**
   * Test for finding all classes
   */
  describe('findAll', () => {
    it('should return all classes', async () => {
      // Arrange: Configure mock for success scenario
      const mockClasses = [
        {
          ...mockClass,
          _count: { students: 25 },
        },
        {
          ...mockClass,
          id: 'class-456',
          name: 'Physics 101',
          _count: { students: 15 },
        },
      ];

      (prismaService.class.findMany as jest.Mock).mockResolvedValue(mockClasses);

      // Act: Execute the method to be tested
      const result = await repository.findAll();

      // Assert: Verify expected behavior
      expect(prismaService.class.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: { students: true },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({
        id: mockClassId,
        name: mockClass.name,
        studentCount: 25,
      }));
    });
  });

  /**
   * Test for updating class
   */
  describe('update', () => {
    it('should update a class successfully', async () => {
      // Arrange: Define update data and mock for success scenario
      const updateData = {
        name: 'Advanced Mathematics',
        code: 'MATH201',
      };

      const updatedClass = {
        ...mockClass,
        ...updateData,
        updatedAt: new Date(),
        _count: { students: 25 },
      };

      (prismaService.class.update as jest.Mock).mockResolvedValue(updatedClass);

      // Act: Execute the method to be tested
      const result = await repository.update(mockClassId, updateData);

      // Assert: Verify expected behavior
      expect(prismaService.class.update).toHaveBeenCalledWith({
        where: { id: mockClassId },
        data: updateData,
        include: {
          _count: {
            select: { students: true },
          },
        },
      });

      expect(result).toEqual(expect.objectContaining({
        id: mockClassId,
        name: updateData.name,
        code: updateData.code,
        studentCount: 25,
      }));
    });
  });

  /**
   * Test for deleting class
   */
  describe('delete', () => {
    it('should delete a class successfully', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.class.delete as jest.Mock).mockResolvedValue({});

      // Act: Execute the method to be tested
      await repository.delete(mockClassId);

      // Assert: Verify expected behavior
      expect(prismaService.class.delete).toHaveBeenCalledWith({
        where: { id: mockClassId },
      });
    });
  });

  /**
   * Test for finding class by name, period, and teacher
   */
  describe('findByNamePeriodAndTeacher', () => {
    it('should return a class when it exists with the specified criteria', async () => {
      // Arrange: Configure mock for success scenario
      const mockPrismaResult = {
        ...mockClass,
        _count: { students: 25 },
      };

      (prismaService.class.findFirst as jest.Mock).mockResolvedValue(mockPrismaResult);

      // Act: Execute the method to be tested
      const result = await repository.findByNamePeriodAndTeacher(
        mockClass.name,
        mockClass.period,
        mockTeacherId,
        1,
      );

      // Assert: Verify expected behavior
      expect(prismaService.class.findFirst).toHaveBeenCalledWith({
        where: {
          name: mockClass.name,
          period: mockClass.period,
          teacherId: mockTeacherId,
          section: 1,
        },
        include: {
          _count: {
            select: { students: true },
          },
        },
      });

      expect(result).toEqual(expect.objectContaining({
        id: mockClassId,
        name: mockClass.name,
        studentCount: 25,
      }));
    });

    it('should return null when no class exists with the specified criteria', async () => {
      // Arrange: Configure mock for no results scenario
      (prismaService.class.findFirst as jest.Mock).mockResolvedValue(null);

      // Act: Execute the method to be tested
      const result = await repository.findByNamePeriodAndTeacher(
        'Non-existent Class',
        '2023.2',
        mockTeacherId,
        1,
      );

      // Assert: Verify expected behavior
      expect(prismaService.class.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Non-existent Class',
          period: '2023.2',
          teacherId: mockTeacherId,
          section: 1,
        },
        include: {
          _count: {
            select: { students: true },
          },
        },
      });

      expect(result).toBeNull();
    });
  });
});
