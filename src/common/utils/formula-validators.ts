/**
 * Formula Validators
 *
 * Utility functions for validating mathematical formulas,
 * particularly those used for grade calculations in educational contexts.
 *
 * @module CommonUtils
 */
import { BadRequestException } from '@nestjs/common';

/**
 * Validates a personalized formula for grade calculation
 *
 * Checks if the formula is mathematically valid and uses the correct
 * references to available units (N1, N2, etc.).
 *
 * @param {string} formula - The formula to validate
 * @param {number} unitCount - Number of available units/periods
 * @throws {BadRequestException} If the formula is invalid
 */
export function validatePersonalizedFormula(formula: string, unitCount: number): void {
  // Encontrar todas as referências a N1, N2, etc. na fórmula
  const references = formula.match(/N\d+/g) || [];

  // Verificar se a fórmula é uma expressão matemática válida
  validateMathExpression(formula);

  // Verificar se há referências a unidades que não existem
  const invalidReference = references.find((ref) => {
    const unitNumber = parseInt(ref.substring(1), 10);
    return unitNumber <= 0 || unitNumber > unitCount;
  });

  if (invalidReference) {
    const validReferences = Array.from(
      { length: unitCount },
      (_, i) => `N${i + 1}`,
    ).join(', ');

    throw new BadRequestException(
      `A fórmula contém referência a ${invalidReference}, mas existem apenas ${unitCount} unidades. `
      + `As referências válidas são: ${validReferences}.`,
    );
  }

  // Verificar se todas as unidades estão sendo utilizadas na fórmula
  const uniqueReferences = new Set(references.map((ref) => parseInt(ref.substring(1), 10)));
  const missingUnits = [];

  for (let i = 1; i <= unitCount; i += 1) {
    if (!uniqueReferences.has(i)) {
      missingUnits.push(`N${i}`);
    }
  }

  if (missingUnits.length > 0) {
    throw new BadRequestException(
      `A fórmula não contém referência a todas as unidades. Unidades faltando: ${missingUnits.join(', ')}.`,
    );
  }
}

/**
 * Validates if a string is a valid mathematical expression
 *
 * Performs various checks to ensure the formula is a valid
 * mathematical expression with proper syntax.
 *
 * @param {string} formula - The formula to validate
 * @throws {BadRequestException} If the formula contains invalid syntax
 */
export function validateMathExpression(formula: string): void {
  // Remover espaços em branco para facilitar a validação
  const cleanFormula = formula.replace(/\s+/g, '');

  // Verificar operadores consecutivos (++, --, +-, -+, etc.)
  if (/[+\-*/]{2,}/.test(cleanFormula)) {
    throw new BadRequestException('A fórmula contém operadores consecutivos (++, --, +-, etc.), o que não é válido.');
  }

  // Verificar se a fórmula termina com um operador
  if (/[+\-*/]$/.test(cleanFormula)) {
    throw new BadRequestException('A fórmula não pode terminar com um operador.');
  }

  // Verificar se a fórmula começa com um operador (exceto - que pode ser usado para números negativos)
  if (/^[+*/]/.test(cleanFormula)) {
    throw new BadRequestException('A fórmula não pode começar com os operadores +, * ou /.');
  }

  // Verificar se os parênteses estão balanceados
  let openParenCount = 0;
  for (let i = 0; i < cleanFormula.length; i += 1) {
    if (cleanFormula[i] === '(') {
      openParenCount += 1;
    } else if (cleanFormula[i] === ')') {
      openParenCount -= 1;
      if (openParenCount < 0) {
        throw new BadRequestException('A fórmula contém parênteses desbalanceados.');
      }
    }
  }

  if (openParenCount !== 0) {
    throw new BadRequestException('A fórmula contém parênteses desbalanceados.');
  }

  // Verificar se há divisão por zero explícita
  if (/\/0(?![0-9])/.test(cleanFormula)) {
    throw new BadRequestException('A fórmula contém divisão por zero.');
  }

  // Verificar se a fórmula contém apenas caracteres válidos
  // Caracteres válidos: números, operadores (+, -, *, /), parênteses, ponto decimal e N seguido de números
  if (!/^[0-9+\-*/().N\d]*$/.test(cleanFormula)) {
    throw new BadRequestException('A fórmula contém caracteres inválidos. Use apenas números, operadores (+, -, *, /), parênteses, ponto decimal e referências a unidades (N1, N2, etc.).');
  }

  // Verificar se todas as ocorrências de N são seguidas por um número
  const nMatches = cleanFormula.match(/N[^0-9]/g);
  if (nMatches) {
    throw new BadRequestException('Todas as referências a unidades devem seguir o formato N seguido de um número (ex: N1, N2).');
  }
}
