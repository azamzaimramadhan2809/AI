import 'dotenv/config';
import assert from 'node:assert/strict';
import { prisma } from '../src/database/prisma';
try {
  const user = await prisma.user.findUnique({ where: { email: 'ui-smoke-0912-0910@example.invalid' }, include: { ais: { include: { messages: true } } } });
  if (user) {
    assert.equal(user.username, 'ui_smoke_0912_0910');
    const messages = user.ais.flatMap(ai => ai.messages);
    assert.equal(messages.filter(message => message.role === 'ASSISTANT').length, 1);
    assert.ok(!messages.some(message => message.content.includes('BERHASIL')));
    console.log('PASS: one completed assistant reply persisted; cancelled reply and memory-OFF chat absent');
    await prisma.user.delete({ where: { id: user.id, email: user.email } });
    console.log('CLEANUP: UI test account and associated records removed');
  }
} finally { await prisma.$disconnect(); }
