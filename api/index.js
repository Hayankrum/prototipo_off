// server/vercel.ts
import { getRequestListener } from "@hono/node-server";

// server/app.ts
import { Hono as Hono3 } from "hono";
import { bodyLimit } from "hono/body-limit";
import { serveStatic } from "@hono/node-server/serve-static";

// server/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// server/env.ts
import { z } from "zod";
var envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL \xE9 obrigat\xF3ria"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET deve ter no m\xEDnimo 32 caracteres"),
  APP_URL: z.string().url("APP_URL deve ser uma URL v\xE1lida").default("http://localhost:5173"),
  PORT: z.coerce.number().int().positive().default(3e3)
});
var env = envSchema.parse(process.env);

// server/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";

// server/generated/prisma/client.ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import "@prisma/client/runtime/client";

// server/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.10.0",
  "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
  "activeProvider": "postgresql",
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../server/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id                 String         @id\n  name               String\n  email              String\n  emailVerified      Boolean        @default(false)\n  image              String?\n  createdAt          DateTime       @default(now())\n  updatedAt          DateTime       @updatedAt\n  // Contador monot\xF4nico por usu\xE1rio: fonte do serverSeq/cursor de sync.\n  // Incrementado dentro da transa\xE7\xE3o de push (serializa as escritas do usu\xE1rio).\n  seq                BigInt         @default(0)\n  // Aceite dos Termos de uso/privacidade: vers\xE3o + data/hora (prova de consentimento).\n  aceiteTermosEm     DateTime?\n  aceiteTermosVersao String?\n  sessions           Session[]\n  accounts           Account[]\n  itens              Item[]\n  mutacoes           SyncMutation[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\n// Dados sincroniz\xE1veis. Epoch ms (BigInt) igual ao cliente; serverSeq \xE9 o\n// cursor por usu\xE1rio e tamb\xE9m o serverVersion devolvido ao cliente.\nmodel Item {\n  id        String  @id\n  userId    String\n  titulo    String\n  descricao String\n  concluido Boolean @default(false)\n  criadoEm  BigInt\n  updatedAt BigInt\n  deletedAt BigInt?\n  serverSeq BigInt\n  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, serverSeq])\n  @@map("item")\n}\n\n// Log de idempot\xEAncia do push: cada id de muta\xE7\xE3o aplicada (ou avaliada como\n// "ignorada") aparece no m\xE1ximo uma vez \u2014 reenviar o mesmo lote n\xE3o duplica.\nmodel SyncMutation {\n  id        String @id\n  userId    String\n  appliedAt BigInt\n  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@map("sync_mutation")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"seq","kind":"scalar","type":"BigInt"},{"name":"aceiteTermosEm","kind":"scalar","type":"DateTime"},{"name":"aceiteTermosVersao","kind":"scalar","type":"String"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"itens","kind":"object","type":"Item","relationName":"ItemToUser"},{"name":"mutacoes","kind":"object","type":"SyncMutation","relationName":"SyncMutationToUser"}],"dbName":"user","schema":null},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session","schema":null},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account","schema":null},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification","schema":null},"Item":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"titulo","kind":"scalar","type":"String"},{"name":"descricao","kind":"scalar","type":"String"},{"name":"concluido","kind":"scalar","type":"Boolean"},{"name":"criadoEm","kind":"scalar","type":"BigInt"},{"name":"updatedAt","kind":"scalar","type":"BigInt"},{"name":"deletedAt","kind":"scalar","type":"BigInt"},{"name":"serverSeq","kind":"scalar","type":"BigInt"},{"name":"user","kind":"object","type":"User","relationName":"ItemToUser"}],"dbName":"item","schema":null},"SyncMutation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"appliedAt","kind":"scalar","type":"BigInt"},{"name":"user","kind":"object","type":"User","relationName":"SyncMutationToUser"}],"dbName":"sync_mutation","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","itens","mutacoes","_count","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_avg","_sum","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Item.findUnique","Item.findUniqueOrThrow","Item.findFirst","Item.findFirstOrThrow","Item.findMany","Item.createOne","Item.createMany","Item.createManyAndReturn","Item.updateOne","Item.updateMany","Item.updateManyAndReturn","Item.upsertOne","Item.deleteOne","Item.deleteMany","Item.groupBy","Item.aggregate","SyncMutation.findUnique","SyncMutation.findUniqueOrThrow","SyncMutation.findFirst","SyncMutation.findFirstOrThrow","SyncMutation.findMany","SyncMutation.createOne","SyncMutation.createMany","SyncMutation.createManyAndReturn","SyncMutation.updateOne","SyncMutation.updateMany","SyncMutation.updateManyAndReturn","SyncMutation.upsertOne","SyncMutation.deleteOne","SyncMutation.deleteMany","SyncMutation.groupBy","SyncMutation.aggregate","AND","OR","NOT","id","userId","appliedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","titulo","descricao","concluido","criadoEm","updatedAt","deletedAt","serverSeq","identifier","value","expiresAt","createdAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","name","email","emailVerified","image","seq","aceiteTermosEm","aceiteTermosVersao","every","some","none","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "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-QAC8AQAhDggAAKwBACAdAAC-AQAgHgAAvgEAIHcBAAAAAXgBAAAABXkBAAAABXoBAAAAAXsBAAAAAXwBAAAAAX0BAAAAAX4BAL0BACF_AQAAAAGAAQEAAAABgQEBAAAAAQt3AQAAAAF4AQAAAAV5AQAAAAV6AQAAAAF7AQAAAAF8AQAAAAF9AQAAAAF-AQC-AQAhfwEAAAABgAEBAAAAAYEBAQAAAAELcQAAvwEAMHIAAEEAEHMAAL8BADB0AQCgAQAhdQEAoAEAIYYBQACyAQAhiwFAALIBACGMAUAAsgEAIZYBAQCgAQAhlwEBALkBACGYAQEAuQEAIQ1xAADAAQAwcgAAKwAQcwAAwAEAMHQBAKABACGGAUAAsgEAIYwBQACyAQAhmQEBAKABACGaAQEAoAEAIZsBIACpAQAhnAEBALkBACGdAQQAoQEAIZ4BQAC6AQAhnwEBALkBACERBAAAxgEAIAUAAMcBACAGAADIAQAgBwAAyQEAIHEAAMEBADByAAAYABBzAADBAQAwdAEAtgEAIYYBQAC3AQAhjAFAALcBACGZAQEAtgEAIZoBAQC2AQAhmwEgAMIBACGcAQEAwwEAIZ0BBADEAQAhngFAAMUBACGfAQEAwwEAIQJ3IAAAAAF-IACwAQAhC3cBAAAAAXgBAAAABXkBAAAABXoBAAAAAXsBAAAAAXwBAAAAAX0BAAAAAX4BAL4BACF_AQAAAAGAAQEAAAABgQEBAAAAAQh3BAAAAAF4BAAAAAR5BAAAAAR6BAAAAAF7BAAAAAF8BAAAAAF9BAAAAAF-BAClAQAhCHdAAAAAAXhAAAAABXlAAAAABXpAAAAAAXtAAAAAAXxAAAAAAX1AAAAAAX5AALwBACEDoAEAAAMAIKEBAAADACCiAQAAAwAgA6ABAAAHACChAQAABwAgogEAAAcAIAOgAQAACwAgoQEAAAsAIKIBAAALACADoAEAAA8AIKEBAAAPACCiAQAADwAgBwMAAMsBACBxAADKAQAwcgAADwAQcwAAygEAMHQBALYBACF1AQC2AQAhdgQAxAEAIRMEAADGAQAgBQAAxwEAIAYAAMgBACAHAADJAQAgcQAAwQEAMHIAABgAEHMAAMEBADB0AQC2AQAhhgFAALcBACGMAUAAtwEAIZkBAQC2AQAhmgEBALYBACGbASAAwgEAIZwBAQDDAQAhnQEEAMQBACGeAUAAxQEAIZ8BAQDDAQAhowEAABgAIKQBAAAYACANAwAAywEAIHEAAMwBADByAAALABBzAADMAQAwdAEAtgEAIXUBALYBACGCAQEAtgEAIYMBAQC2AQAhhAEgAMIBACGFAQQAxAEAIYYBBADEAQAhhwEEAM0BACGIAQQAxAEAIQh3BAAAAAF4BAAAAAV5BAAAAAV6BAAAAAF7BAAAAAF8BAAAAAF9BAAAAAF-BACuAQAhEQMAAMsBACBxAADOAQAwcgAABwAQcwAAzgEAMHQBALYBACF1AQC2AQAhhgFAALcBACGMAUAAtwEAIY0BAQC2AQAhjgEBALYBACGPAQEAwwEAIZABAQDDAQAhkQEBAMMBACGSAUAAxQEAIZMBQADFAQAhlAEBAMMBACGVAQEAwwEAIQwDAADLAQAgcQAAzwEAMHIAAAMAEHMAAM8BADB0AQC2AQAhdQEAtgEAIYYBQAC3AQAhiwFAALcBACGMAUAAtwEAIZYBAQC2AQAhlwEBAMMBACGYAQEAwwEAIQAAAAAAAagBAQAAAAEFqAEEAAAAAa4BBAAAAAGvAQQAAAABsAEEAAAAAbEBBAAAAAEFFQAAyAIAIBYAAMsCACClAQAAyQIAIKYBAADKAgAgqwEAAAEAIAMVAADIAgAgpQEAAMkCACCrAQAAAQAgAAAAAAAAAagBIAAAAAEFqAEEAAAAAa4BBAAAAAGvAQQAAAABsAEEAAAAAbEBBAAAAAEFFQAAwwIAIBYAAMYCACClAQAAxAIAIKYBAADFAgAgqwEAAAEAIAMVAADDAgAgpQEAAMQCACCrAQAAAQAgAAAAAagBQAAAAAEAAAABqAEBAAAAAQGoAUAAAAABBRUAAL4CACAWAADBAgAgpQEAAL8CACCmAQAAwAIAIKsBAAABACADFQAAvgIAIKUBAAC_AgAgqwEAAAEAIAAAAAUVAAC5AgAgFgAAvAIAIKUBAAC6AgAgpgEAALsCACCrAQAAAQAgAxUAALkCACClAQAAugIAIKsBAAABACAAAAAAAAsVAACgAgAwFgAApQIAMKUBAAChAgAwpgEAAKICADCnAQAAowIAIKgBAACkAgAwqQEAAKQCADCqAQAApAIAMKsBAACkAgAwrAEAAKYCADCtAQAApwIAMAsVAACUAgAwFgAAmQIAMKUBAACVAgAwpgEAAJYCADCnAQAAlwIAIKgBAACYAgAwqQEAAJgCADCqAQAAmAIAMKsBAACYAgAwrAEAAJoCADCtAQAAmwIAMAsVAACIAgAwFgAAjQIAMKUBAACJAgAwpgEAAIoCADCnAQAAiwIAIKgBAACMAgAwqQEAAIwCADCqAQAAjAIAMKsBAACMAgAwrAEAAI4CADCtAQAAjwIAMAsVAAD8AQAwFgAAgQIAMKUBAAD9AQAwpgEAAP4BADCnAQAA_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_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-VQc_WBpAWR5BWx9CXB9DXx9EYB9FYR9GYx9HZQdIZiBJaB9KagdLayFMbB9NbR9ObgdPcSJQciZRcwRSdARTdQRUdgRVdwRWeQRXewdYfCdZfgRagAEHW4EBKFyCAQRdgwEEXoQBB1-HASlgiAEvYYkBBWKKAQVjiwEFZIwBBWWNAQVmjwEFZ5EBB2iSATBplAEFapYBB2uXATFsmAEFbZkBBW6aAQdvnQEycJ4BOA"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("node:buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// server/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// server/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// server/prisma.ts
var adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
var prisma = new PrismaClient({ adapter });

// server/auth.ts
var origensDev = [
  .../* @__PURE__ */ new Set([
    new URL(env.APP_URL).origin,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ])
];
var auth = betterAuth({
  secret: env.AUTH_SECRET,
  baseURL: env.APP_URL,
  trustedOrigins: env.NODE_ENV === "development" ? origensDev : [],
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5
    }
  },
  // get-session é chamado a cada ciclo de sync; em dev fica livre (padrão better-auth)
  rateLimit: {
    enabled: env.NODE_ENV === "production",
    window: 60,
    max: 120
  }
});

// server/sync.ts
import { Hono as Hono2 } from "hono";

// shared/schemas/sync.ts
import { z as z4 } from "zod";

// shared/schemas/item.ts
import { z as z2 } from "zod";
var itemSchema = z2.object({
  id: z2.string().min(1),
  titulo: z2.string(),
  descricao: z2.string(),
  concluido: z2.boolean(),
  criadoEm: z2.number(),
  updatedAt: z2.number(),
  deletedAt: z2.number().optional(),
  serverVersion: z2.number().int().positive().optional()
});

// shared/schemas/outbox.ts
import { z as z3 } from "zod";
var operacaoOutboxSchema = z3.enum(["upsert", "delete"]);
var mutacaoSchema = z3.object({
  id: z3.string().min(1),
  tabela: z3.string().min(1),
  registroId: z3.string().min(1),
  operacao: operacaoOutboxSchema,
  payload: itemSchema
});

// shared/schemas/sync.ts
var TABELA_ITEMS = "items";
var LIMITE_MUTACOES = 500;
var LIMITE_PULL = 500;
var PADRAO_PULL = 100;
var pushRequestSchema = z4.object({
  mutacoes: z4.array(mutacaoSchema).min(1).max(LIMITE_MUTACOES)
});
var statusMutacaoSchema = z4.enum(["aplicada", "ignorada", "invalida"]);
var resultadoMutacaoSchema = z4.object({
  mutacaoId: z4.string().min(1),
  status: statusMutacaoSchema,
  serverVersion: z4.number().int().positive().optional(),
  registro: itemSchema.optional()
});
var pushResponseSchema = z4.object({
  resultados: z4.array(resultadoMutacaoSchema),
  proximoCursor: z4.string()
});
var pullQuerySchema = z4.object({
  cursor: z4.string().regex(/^\d+$/).default("0"),
  limit: z4.coerce.number().int().min(1).max(LIMITE_PULL).default(PADRAO_PULL)
});
var pullResponseSchema = z4.object({
  registros: z4.array(itemSchema),
  proximoCursor: z4.string(),
  temMais: z4.boolean()
});

// server/session.ts
async function exigirSessao(c) {
  const sessao = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!sessao) return null;
  return { userId: sessao.user.id, email: sessao.user.email };
}

// server/termos.ts
import { Hono } from "hono";

// shared/termos.ts
import { z as z5 } from "zod";
var TERMOS_VERSAO = "1.0";
var termosStatusSchema = z5.object({
  versaoAtual: z5.string().min(1),
  precisaAceitar: z5.boolean(),
  aceite: z5.object({
    versao: z5.string(),
    em: z5.number()
  }).nullable()
});
var aceitarTermosSchema = z5.object({
  versao: z5.string().min(1)
});

// server/termos.ts
async function statusDoUsuario(userId) {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { aceiteTermosEm: true, aceiteTermosVersao: true }
  });
  const em = usuario?.aceiteTermosEm ?? null;
  const versao = usuario?.aceiteTermosVersao ?? null;
  const aceite = em !== null && versao !== null ? { versao, em: em.getTime() } : null;
  return {
    versaoAtual: TERMOS_VERSAO,
    precisaAceitar: aceite === null || aceite.versao !== TERMOS_VERSAO,
    aceite
  };
}
async function exigirTermosAceitos(userId) {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { aceiteTermosVersao: true }
  });
  return usuario?.aceiteTermosVersao === TERMOS_VERSAO;
}
var termosRoutes = new Hono();
termosRoutes.get("/termos/status", async (c) => {
  const sessao = await exigirSessao(c);
  if (!sessao) return c.json({ erro: "N\xE3o autenticado", code: "UNAUTHORIZED" }, 401);
  return c.json(await statusDoUsuario(sessao.userId));
});
termosRoutes.post("/termos/aceitar", async (c) => {
  const sessao = await exigirSessao(c);
  if (!sessao) return c.json({ erro: "N\xE3o autenticado", code: "UNAUTHORIZED" }, 401);
  const bruto = await c.req.json().catch(() => null);
  const parse = aceitarTermosSchema.safeParse(bruto);
  if (!parse.success) {
    return c.json({ erro: "Payload inv\xE1lido", code: "INVALID_PAYLOAD" }, 400);
  }
  if (parse.data.versao !== TERMOS_VERSAO) {
    return c.json({ erro: "Vers\xE3o do termo inv\xE1lida", code: "VERSAO_INVALIDA" }, 400);
  }
  await prisma.user.update({
    where: { id: sessao.userId },
    data: { aceiteTermosEm: /* @__PURE__ */ new Date(), aceiteTermosVersao: TERMOS_VERSAO }
  });
  return c.json(await statusDoUsuario(sessao.userId));
});

// server/sync.ts
var JANELA_MS = 5 * 60 * 1e3;
function toWire(item) {
  const base = {
    id: item.id,
    titulo: item.titulo,
    descricao: item.descricao,
    concluido: item.concluido,
    criadoEm: Number(item.criadoEm),
    updatedAt: Number(item.updatedAt),
    serverVersion: Number(item.serverSeq)
  };
  return item.deletedAt === null ? base : { ...base, deletedAt: Number(item.deletedAt) };
}
async function processarLote(userId, mutacoes, resultados) {
  const agoraMs = Date.now();
  const limiteTs = agoraMs + JANELA_MS;
  await prisma.$transaction(async (tx) => {
    const inicial = await tx.user.update({
      where: { id: userId },
      data: { seq: { increment: 1 } },
      select: { seq: true }
    });
    let seqReservado = inicial.seq;
    const proximoSeq = async () => {
      if (seqReservado !== null) {
        const reservado = seqReservado;
        seqReservado = null;
        return reservado;
      }
      const { seq } = await tx.user.update({
        where: { id: userId },
        data: { seq: { increment: 1 } },
        select: { seq: true }
      });
      return seq;
    };
    for (const mut of mutacoes) {
      if (mut.tabela !== TABELA_ITEMS) {
        resultados.push({ mutacaoId: mut.id, status: "invalida" });
        continue;
      }
      const jaVista = await tx.syncMutation.findUnique({ where: { id: mut.id } });
      if (jaVista) {
        const atual = await tx.item.findUnique({ where: { id: mut.registroId } });
        if (atual && atual.userId === userId) {
          resultados.push({
            mutacaoId: mut.id,
            status: "aplicada",
            serverVersion: Number(atual.serverSeq),
            registro: toWire(atual)
          });
        } else {
          resultados.push({ mutacaoId: mut.id, status: "aplicada" });
        }
        continue;
      }
      const existente = await tx.item.findUnique({ where: { id: mut.registroId } });
      if (existente && existente.userId !== userId) {
        resultados.push({ mutacaoId: mut.id, status: "invalida" });
        continue;
      }
      const updatedAt = Math.min(mut.payload.updatedAt, limiteTs);
      let deletedAt = mut.payload.deletedAt;
      if (deletedAt !== void 0 && deletedAt > updatedAt) deletedAt = updatedAt;
      if (existente && existente.updatedAt > BigInt(updatedAt)) {
        await tx.syncMutation.create({
          data: { id: mut.id, userId, appliedAt: BigInt(agoraMs) }
        });
        resultados.push({
          mutacaoId: mut.id,
          status: "ignorada",
          serverVersion: Number(existente.serverSeq),
          registro: toWire(existente)
        });
        continue;
      }
      const seq = await proximoSeq();
      const dadosItem = {
        titulo: mut.payload.titulo,
        descricao: mut.payload.descricao,
        concluido: mut.payload.concluido,
        updatedAt: BigInt(updatedAt),
        deletedAt: deletedAt === void 0 ? null : BigInt(deletedAt),
        serverSeq: seq
      };
      const gravado = await tx.item.upsert({
        where: { id: mut.registroId },
        create: {
          id: mut.registroId,
          userId,
          criadoEm: BigInt(mut.payload.criadoEm),
          ...dadosItem
        },
        update: dadosItem
      });
      await tx.syncMutation.create({
        data: { id: mut.id, userId, appliedAt: BigInt(agoraMs) }
      });
      resultados.push({
        mutacaoId: mut.id,
        status: "aplicada",
        serverVersion: Number(seq),
        registro: toWire(gravado)
      });
    }
    if (seqReservado !== null) {
      await tx.user.update({
        where: { id: userId },
        data: { seq: { decrement: 1 } }
      });
    }
  });
}
function ehConflitoConcorrente(erro) {
  return typeof erro === "object" && erro !== null && "code" in erro && erro.code === "P2002";
}
var syncRoutes = new Hono2();
syncRoutes.post("/sync/push", async (c) => {
  const sessao = await exigirSessao(c);
  if (!sessao) return c.json({ erro: "N\xE3o autenticado", code: "UNAUTHORIZED" }, 401);
  if (!await exigirTermosAceitos(sessao.userId)) {
    return c.json({ erro: "Aceite os termos de uso para sincronizar", code: "TERMOS_PENDENTES" }, 403);
  }
  const bruto = await c.req.json().catch(() => null);
  const parse = pushRequestSchema.safeParse(bruto);
  if (!parse.success) {
    return c.json({ erro: "Payload inv\xE1lido", detalhes: parse.error.issues }, 400);
  }
  const resultados = [];
  try {
    try {
      await processarLote(sessao.userId, parse.data.mutacoes, resultados);
    } catch (erro) {
      if (!ehConflitoConcorrente(erro)) throw erro;
      resultados.length = 0;
      await processarLote(sessao.userId, parse.data.mutacoes, resultados);
    }
  } catch (erro) {
    console.error("push falhou", erro);
    return c.json({ erro: "Falha ao processar o lote" }, 500);
  }
  const usuario = await prisma.user.findUnique({
    where: { id: sessao.userId },
    select: { seq: true }
  });
  return c.json({ resultados, proximoCursor: String(usuario?.seq ?? 0n) });
});
syncRoutes.get("/sync/pull", async (c) => {
  const sessao = await exigirSessao(c);
  if (!sessao) return c.json({ erro: "N\xE3o autenticado", code: "UNAUTHORIZED" }, 401);
  if (!await exigirTermosAceitos(sessao.userId)) {
    return c.json({ erro: "Aceite os termos de uso para sincronizar", code: "TERMOS_PENDENTES" }, 403);
  }
  const parse = pullQuerySchema.safeParse({
    cursor: c.req.query("cursor"),
    limit: c.req.query("limit")
  });
  if (!parse.success) {
    return c.json({ erro: "Query inv\xE1lida", detalhes: parse.error.issues }, 400);
  }
  const { cursor, limit } = parse.data;
  const linhas = await prisma.item.findMany({
    where: { userId: sessao.userId, serverSeq: { gt: BigInt(cursor) } },
    orderBy: { serverSeq: "asc" },
    take: limit + 1
  });
  const temMais = linhas.length > limit;
  const pagina = temMais ? linhas.slice(0, limit) : linhas;
  const proximoCursor = pagina.length > 0 ? String(pagina[pagina.length - 1].serverSeq) : cursor;
  return c.json({ registros: pagina.map(toWire), proximoCursor, temMais });
});

// server/app.ts
var LIMITE_CORPO_API = 2 * 1024 * 1024;
function direcoesCsp() {
  const direcoes = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    // script-src sem 'unsafe-inline': o tema anti-flash é theme-init.js externo
    "script-src 'self'",
    // 'unsafe-inline' em styles: atributos style inline (ex.: barra de uso)
    "style-src 'self' 'unsafe-inline'",
    // data: para o QR gerado localmente em ShareSection
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "worker-src 'self'"
  ];
  if (new URL(env.APP_URL).protocol === "https:") {
    direcoes.push("upgrade-insecure-requests");
  }
  return direcoes;
}
function cabecalhosSeguranca() {
  const headers = {
    "Content-Security-Policy": direcoesCsp().join("; "),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin"
  };
  if (new URL(env.APP_URL).protocol === "https:") {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }
  return headers;
}
var CABECALHOS_SEGURANCA = cabecalhosSeguranca();
function createApp() {
  const app = new Hono3();
  app.use("*", (c, next) => {
    for (const [nome, valor] of Object.entries(CABECALHOS_SEGURANCA)) {
      c.header(nome, valor);
    }
    return next();
  });
  app.use("/api/*", bodyLimit({ maxSize: LIMITE_CORPO_API }));
  app.get("/api/health", (c) => c.json({ ok: true, servico: "base-app" }));
  app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
  app.route("/api", syncRoutes);
  app.route("/api", termosRoutes);
  if (env.NODE_ENV === "production" && !process.env.VERCEL) {
    app.use("/assets/*", (c, next) => {
      c.header("Cache-Control", "public, max-age=31536000, immutable");
      return next();
    });
    for (const caminho of ["/sw.js", "/index.html", "/manifest.webmanifest", "/theme-init.js"]) {
      app.use(caminho, (c, next) => {
        c.header("Cache-Control", "no-cache");
        return next();
      });
    }
    app.use("/*", serveStatic({ root: "./dist" }));
    app.get("/*", serveStatic({ path: "./dist/index.html" }));
  }
  return app;
}

// server/vercel.ts
var vercel_default = getRequestListener(createApp().fetch);
export {
  vercel_default as default
};
