import * as fs from 'fs';
import * as path from 'path';

import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

async function importUniversities() {
  const csvFilePath = path.resolve(__dirname, './PDA_Lista_Instituicoes_Ensino_Superior_do_Brasil_EMEC.csv');
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

  const records = await new Promise<Array<{ id: string; name: string; acronym: string | null }>>((resolve, reject) => {
    const universities: Array<{ id: string; name: string; acronym: string | null }> = [];

    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
      .on('data', (row) => {
        const acronym = row.SIGLA?.trim() || null;

        universities.push({
          id: row.CODIGO_DA_IES,
          name: row.NOME_DA_IES,
          acronym,
        });
      })
      .on('end', () => resolve(universities))
      .on('error', reject);
  });

  // Importa em lotes de 100
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    batches.push(
      prisma.institution.createMany({
        data: batch,
        skipDuplicates: true,
      }),
    );
  }

  // Executa todas as operações em paralelo
  await Promise.all(batches);

  console.log(`Importadas ${records.length} universidades com sucesso!`);
}

importUniversities()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
