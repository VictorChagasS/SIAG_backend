/**
 * Download Class Template Use Case
 *
 * This use case handles the download of an empty template file in Excel format
 * that teachers can use to record student grades.
 *
 * @module ClassUseCases
 */
import * as fs from 'fs';
import * as path from 'path';

import { Injectable } from '@nestjs/common';

/**
 * Use case for downloading the empty class template
 *
 * Provides functionality to download the base Excel template that teachers
 * can use to record student grades and later import them into the system.
 *
 * @class DownloadClassTemplateUseCase
 */
@Injectable()
export class DownloadClassTemplateUseCase {
  /**
   * Executes the template download process
   *
   * Returns the template file as a buffer that can be sent to the client.
   *
   * @returns {Promise<Buffer>} Excel template file as a buffer
   * @throws {Error} If the template file cannot be accessed
   */
  async execute(): Promise<Buffer> {
    try {
      // Caminho para o arquivo template.xlsx
      const templatePath = path.resolve(process.cwd(), 'src/common/utils/template.xlsx');

      // Verificar se o arquivo existe
      if (!fs.existsSync(templatePath)) {
        throw new Error('Template file not found');
      }

      // Ler o arquivo como buffer
      const templateBuffer = fs.readFileSync(templatePath);

      return templateBuffer;
    } catch (error) {
      throw new Error(`Error processing template file: ${error.message}`);
    }
  }
}
