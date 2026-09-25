const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("Menjalankan seed database...");

  // Hapus data yang ada (opsional, berhati-hati jika di production!)
  await prisma.user.deleteMany();
  await prisma.classroom.deleteMany();

  // Hash password standar untuk uji coba
  const defaultPassword = await bcrypt.hash('rahasia123', 10);

  // 1. Buat Akun Guru
  const guru = await prisma.user.create({
    data: {
      email: 'guru@contoh.com',
      username: 'guru123',
      password: defaultPassword,
      role: 'GURU',
      teacherProfile: {
        create: {
          fullName: 'Bapak Budi Santoso, S.Pd',
          nip: '198001012010011001',
          schoolName: 'SMA Negeri 1 Contoh',
          whatsapp: '081234567890',
          quota: 50 // punya 50 token/kuota tes
        }
      }
    },
    include: {
      teacherProfile: true
    }
  });
  console.log(`Berhasil membuat Guru: ${guru.email} (Username: guru123)`);

  // 2. Buat Kelas yang diajar oleh guru tersebut
  const kelas = await prisma.classroom.create({
    data: {
      classCode: 'X-IPA-1',
      name: 'Kelas X IPA 1',
      teacherId: guru.teacherProfile.id
    }
  });
  console.log(`Berhasil membuat Kelas: ${kelas.name}`);

  // 3. Buat Akun Siswa di dalam kelas tersebut
  const siswa = await prisma.user.create({
    data: {
      email: 'siswa@contoh.com',
      username: 'siswa123',
      password: defaultPassword,
      role: 'SISWA',
      studentProfile: {
        create: {
          fullName: 'Andi Setiawan',
          nis: '2023001',
          gender: 'Laki-laki',
          classroomId: kelas.id
        }
      }
    },
    include: {
      studentProfile: true
    }
  });
  console.log(`Berhasil membuat Siswa: ${siswa.email} (Username: siswa123)`);

  console.log("✨ Seeding selesai! Anda bisa login dengan password: rahasia123");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
