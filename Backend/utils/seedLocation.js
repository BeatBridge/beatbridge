const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

// Load the location data from the JSON file
const locations = JSON.parse(fs.readFileSync('locations.json', 'utf-8'));

async function main() {
    for (const location of locations) {
        await prisma.location.upsert({
            where: { name: location.name },
            update: { pathData: location.path_data },
            create: {
                name: location.name,
                latitude: 0, // Use actual latitude if available
                longitude: 0, // Use actual longitude if available
                pathData: location.path_data
            }
        });
    }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
