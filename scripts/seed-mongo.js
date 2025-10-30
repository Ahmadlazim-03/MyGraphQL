const { MongoClient, ObjectId } = require('mongodb');

// Usage: node scripts/seed-mongo.js <MONGODB_URI>
// If no URI provided, it will use the example from the dashboard config.

const DEFAULT_URI = 'mongodb://mongo:tcYiIkKJGHqpAeIMjUuGrViuiMLmLXrU@turntable.proxy.rlwy.net:54197';

async function main() {
  const uri = process.argv[2] || process.env.MONGODB_URI || DEFAULT_URI;
  console.log('Using MongoDB URI:', uri);

  const client = new MongoClient(uri, { maxPoolSize: 10 });
  try {
    await client.connect();
    const db = client.db();
    console.log('Connected to', db.databaseName);

    // Collections we'll seed
    const usersCol = db.collection('users');
    const mahasiswaCol = db.collection('mahasiswa');
    const alumniCol = db.collection('alumni');
    const pekerjaanCol = db.collection('pekerjaanAlumni');
    const filesCol = db.collection('files');

    // Insert sample users
    const users = [
      { email: 'alice@example.com', username: 'alice', createdAt: new Date(), updatedAt: new Date() },
      { email: 'bob@example.com', username: 'bob', createdAt: new Date(), updatedAt: new Date() },
    ];
    const uRes = await usersCol.insertMany(users);
    console.log('Inserted users:', Object.values(uRes.insertedIds).map((id) => id.toString()));

    // Mahasiswa sample (student) referencing user id
    const mahasiswaDocs = [
      { userEmail: 'alice@example.com', nim: '2021001', prodi: 'TI', createdAt: new Date() },
      { userEmail: 'bob@example.com', nim: '2021002', prodi: 'SI', createdAt: new Date() },
    ];
    const mRes = await mahasiswaCol.insertMany(mahasiswaDocs);
    console.log('Inserted mahasiswa:', Object.values(mRes.insertedIds).map((id) => id.toString()));

    // Alumni sample
    const alumniDocs = [
      { userEmail: 'alice@example.com', angkatan: 2021, pekerjaan: [], createdAt: new Date() },
    ];
    const aRes = await alumniCol.insertMany(alumniDocs);
    console.log('Inserted alumni:', Object.values(aRes.insertedIds).map((id) => id.toString()));

    // PekerjaanAlumni sample
    const kerjaDocs = [
      { alumniEmail: 'alice@example.com', perusahaan: 'Acme Corp', posisi: 'Engineer', mulaiTahun: 2023 },
    ];
    const kRes = await pekerjaanCol.insertMany(kerjaDocs);
    console.log('Inserted pekerjaanAlumni:', Object.values(kRes.insertedIds).map((id) => id.toString()));

    // Files sample
    const files = [
      { ownerEmail: 'alice@example.com', filename: 'cv.pdf', size: 1024, createdAt: new Date() },
    ];
    const fRes = await filesCol.insertMany(files);
    console.log('Inserted files:', Object.values(fRes.insertedIds).map((id) => id.toString()));

    // Print counts and one sample from each collection
    const collections = [
      { name: 'users', col: usersCol },
      { name: 'mahasiswa', col: mahasiswaCol },
      { name: 'alumni', col: alumniCol },
      { name: 'pekerjaanAlumni', col: pekerjaanCol },
      { name: 'files', col: filesCol },
    ];

    for (const c of collections) {
      const count = await c.col.countDocuments();
      const sample = await c.col.findOne({}, { sort: { _id: 1 } });
      console.log(`\nCollection: ${c.name}`);
      console.log('  count =', count);
      console.log('  sample =', sample);
    }

    console.log('\nSeeding completed.');
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
