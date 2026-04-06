import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransactionsService } from './transactions/transactions.service';

async function check() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(TransactionsService);
  
  console.log('--- ĐANG QUÉT DỮ LIỆU ---');
  // Thử lấy 1000 cái đầu tiên không lọc
  const res = await service.findAll(1, { limit: 1000 }); // userId 1 là mặc định hoặc bạn có thể thay đổi
  console.log(`Tìm thấy: ${res.data.length} giao dịch.`);
  console.log(`Tổng số trong DB (theo Backend): ${res.total}`);
  
  if (res.data.length > 0) {
    console.log('Ví dụ giao dịch đầu tiên:', res.data[0]);
  }
  
  await app.close();
}

check().catch(console.error);
