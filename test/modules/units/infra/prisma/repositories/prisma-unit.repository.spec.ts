/**
 * Tests for PrismaUnitRepository
 *
 * These tests verify that the Prisma implementation of the unit repository
 * is working correctly for CRUD operations.
 *
 * @module UnitRepositoryTests
 */
import { Test, TestingModule } from '@nestjs/testing';

import { Unit } from '@/modules/units/domain/entities/unit.entity';
import { PrismaUnitRepository } from '@/modules/units/infra/prisma/repositories/prisma-unit.repository';
import { PrismaService } from '@/prisma/prisma.service';

describe('PrismaUnitRepository', () => {
  let repository: PrismaUnitRepository;
  let prismaService: PrismaService;

  // Test data
  const mockUnitId = 'unit-123';
  const mockClassId = 'class-123';
  const mockUnit: Unit = {
    id: mockUnitId,
    name: 'First Bimester',
    classId: mockClassId,
    averageFormula: '(N1 + N2) / 2',
    typeFormula: 'personalized',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Creation data
  const createUnitData: Unit = {
    name: 'First Bimester',
    classId: mockClassId,
    averageFormula: '(N1 + N2) / 2',
    typeFormula: 'personalized',
  };

  beforeEach(async () => {
    // Create mocks for Prisma service
    const mockPrismaService = {
      unit: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    // Configure test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUnitRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUnitRepository>(PrismaUnitRepository);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  /**
   * Test for unit creation
   */
  describe('create', () => {
    it('should create a new unit successfully', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.unit.create as jest.Mock).mockResolvedValue(mockUnit);

      // Act: Execute the method to be tested
      const result = await repository.create(createUnitData);

      // Assert: Verify expected behavior
      expect(prismaService.unit.create).toHaveBeenCalledWith({
        data: {
          name: createUnitData.name,
          classId: createUnitData.classId,
          averageFormula: createUnitData.averageFormula,
        },
      });
      expect(result).toEqual(mockUnit);
    });
  });

  /**
   * Test for finding unit by ID
   */
  describe('findById', () => {
    it('should return a unit when it exists', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.unit.findUnique as jest.Mock).mockResolvedValue(mockUnit);

      // Act: Execute the method to be tested
      const result = await repository.findById(mockUnitId);

      // Assert: Verify expected behavior
      expect(prismaService.unit.findUnique).toHaveBeenCalledWith({
        where: { id: mockUnitId },
      });
      expect(result).toEqual(mockUnit);
    });

    it('should return null when the unit does not exist', async () => {
      // Arrange: Configure mock for failure scenario
      (prismaService.unit.findUnique as jest.Mock).mockResolvedValue(null);

      // Act: Execute the method to be tested
      const result = await repository.findById(mockUnitId);

      // Assert: Verify expected behavior
      expect(prismaService.unit.findUnique).toHaveBeenCalledWith({
        where: { id: mockUnitId },
      });
      expect(result).toBeNull();
    });
  });

  /**
   * Test for finding units by class ID
   */
  describe('findByClassId', () => {
    it('should return all units from a class', async () => {
      // Arrange: Configure mock for success scenario
      const mockUnits = [mockUnit, { ...mockUnit, id: 'unit-456', name: 'Second Bimester' }];
      (prismaService.unit.findMany as jest.Mock).mockResolvedValue(mockUnits);

      // Act: Execute the method to be tested
      const result = await repository.findByClassId(mockClassId);

      // Assert: Verify expected behavior
      expect(prismaService.unit.findMany).toHaveBeenCalledWith({
        where: { classId: mockClassId },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual(mockUnits);
      expect(result.length).toBe(2);
    });

    it('should return an empty array when there are no units for the class', async () => {
      // Arrange: Configure mock for no results scenario
      (prismaService.unit.findMany as jest.Mock).mockResolvedValue([]);

      // Act: Execute the method to be tested
      const result = await repository.findByClassId(mockClassId);

      // Assert: Verify expected behavior
      expect(prismaService.unit.findMany).toHaveBeenCalledWith({
        where: { classId: mockClassId },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  /**
   * Test for finding unit by name and class ID
   */
  describe('findByNameAndClassId', () => {
    it('should return a unit when it exists with the specified name and class', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.unit.findFirst as jest.Mock).mockResolvedValue(mockUnit);

      // Act: Execute the method to be tested
      const result = await repository.findByNameAndClassId(mockUnit.name, mockClassId);

      // Assert: Verify expected behavior
      expect(prismaService.unit.findFirst).toHaveBeenCalledWith({
        where: {
          name: mockUnit.name,
          classId: mockClassId,
        },
      });
      expect(result).toEqual(mockUnit);
    });

    it('should return null when no unit exists with the specified name and class', async () => {
      // Arrange: Configure mock for no results scenario
      (prismaService.unit.findFirst as jest.Mock).mockResolvedValue(null);

      // Act: Execute the method to be tested
      const result = await repository.findByNameAndClassId('Non-existent Name', mockClassId);

      // Assert: Verify expected behavior
      expect(prismaService.unit.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Non-existent Name',
          classId: mockClassId,
        },
      });
      expect(result).toBeNull();
    });
  });

  /**
   * Test for unit update
   */
  describe('update', () => {
    it('should update a unit successfully', async () => {
      // Arrange: Define update data and mock for success scenario
      const updateData = {
        name: 'Updated Bimester',
        averageFormula: '(N1 + N2 + N3) / 3',
      };
      const updatedUnit = { ...mockUnit, ...updateData, updatedAt: new Date() };
      (prismaService.unit.update as jest.Mock).mockResolvedValue(updatedUnit);

      // Act: Execute the method to be tested
      const result = await repository.update(mockUnitId, updateData);

      // Assert: Verify expected behavior
      expect(prismaService.unit.update).toHaveBeenCalledWith({
        where: { id: mockUnitId },
        data: updateData,
      });
      expect(result).toEqual(updatedUnit);
    });
  });

  /**
   * Test for unit deletion
   */
  describe('delete', () => {
    it('should delete a unit successfully', async () => {
      // Arrange: Configure mock for success scenario
      (prismaService.unit.delete as jest.Mock).mockResolvedValue(undefined);

      // Act: Execute the method to be tested
      await repository.delete(mockUnitId);

      // Assert: Verify expected behavior
      expect(prismaService.unit.delete).toHaveBeenCalledWith({
        where: { id: mockUnitId },
      });
    });
  });
});
