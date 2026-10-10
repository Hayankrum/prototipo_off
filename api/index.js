// server/vercel.ts
import { getRequestListener } from "@hono/node-server";

// server/app.ts
import { Hono as Hono2 } from "hono";
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
  "inlineSchema": '// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../server/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id            String         @id\n  name          String\n  email         String\n  emailVerified Boolean        @default(false)\n  image         String?\n  createdAt     DateTime       @default(now())\n  updatedAt     DateTime       @updatedAt\n  // Contador monot\xF4nico por usu\xE1rio: fonte do serverSeq/cursor de sync.\n  // Incrementado dentro da transa\xE7\xE3o de push (serializa as escritas do usu\xE1rio).\n  seq           BigInt         @default(0)\n  sessions      Session[]\n  accounts      Account[]\n  itens         Item[]\n  mutacoes      SyncMutation[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\n// Dados sincroniz\xE1veis. Epoch ms (BigInt) igual ao cliente; serverSeq \xE9 o\n// cursor por usu\xE1rio e tamb\xE9m o serverVersion devolvido ao cliente.\nmodel Item {\n  id        String  @id\n  userId    String\n  titulo    String\n  descricao String\n  concluido Boolean @default(false)\n  criadoEm  BigInt\n  updatedAt BigInt\n  deletedAt BigInt?\n  serverSeq BigInt\n  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId, serverSeq])\n  @@map("item")\n}\n\n// Log de idempot\xEAncia do push: cada id de muta\xE7\xE3o aplicada (ou avaliada como\n// "ignorada") aparece no m\xE1ximo uma vez \u2014 reenviar o mesmo lote n\xE3o duplica.\nmodel SyncMutation {\n  id        String @id\n  userId    String\n  appliedAt BigInt\n  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@map("sync_mutation")\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"seq","kind":"scalar","type":"BigInt"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"itens","kind":"object","type":"Item","relationName":"ItemToUser"},{"name":"mutacoes","kind":"object","type":"SyncMutation","relationName":"SyncMutationToUser"}],"dbName":"user","schema":null},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session","schema":null},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account","schema":null},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification","schema":null},"Item":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"titulo","kind":"scalar","type":"String"},{"name":"descricao","kind":"scalar","type":"String"},{"name":"concluido","kind":"scalar","type":"Boolean"},{"name":"criadoEm","kind":"scalar","type":"BigInt"},{"name":"updatedAt","kind":"scalar","type":"BigInt"},{"name":"deletedAt","kind":"scalar","type":"BigInt"},{"name":"serverSeq","kind":"scalar","type":"BigInt"},{"name":"user","kind":"object","type":"User","relationName":"ItemToUser"}],"dbName":"item","schema":null},"SyncMutation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"appliedAt","kind":"scalar","type":"BigInt"},{"name":"user","kind":"object","type":"User","relationName":"SyncMutationToUser"}],"dbName":"sync_mutation","schema":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","itens","mutacoes","_count","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_avg","_sum","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","Item.findUnique","Item.findUniqueOrThrow","Item.findFirst","Item.findFirstOrThrow","Item.findMany","Item.createOne","Item.createMany","Item.createManyAndReturn","Item.updateOne","Item.updateMany","Item.updateManyAndReturn","Item.upsertOne","Item.deleteOne","Item.deleteMany","Item.groupBy","Item.aggregate","SyncMutation.findUnique","SyncMutation.findUniqueOrThrow","SyncMutation.findFirst","SyncMutation.findFirstOrThrow","SyncMutation.findMany","SyncMutation.createOne","SyncMutation.createMany","SyncMutation.createManyAndReturn","SyncMutation.updateOne","SyncMutation.updateMany","SyncMutation.updateManyAndReturn","SyncMutation.upsertOne","SyncMutation.deleteOne","SyncMutation.deleteMany","SyncMutation.groupBy","SyncMutation.aggregate","AND","OR","NOT","id","userId","appliedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","titulo","descricao","concluido","criadoEm","updatedAt","deletedAt","serverSeq","identifier","value","expiresAt","createdAt","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","name","email","emailVerified","image","seq","every","some","none","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "zAI4YA8EAADFAQAgBQAAxgEAIAYAAMcBACAHAADIAQAgcQAAwQEAMHIAABgAEHMAAMEBADB0AQAAAAGGAUAAtwEAIYwBQAC3AQAhmQEBALYBACGaAQEAAAABmwEgAMIBACGcAQEAwwEAIZ0BBADEAQAhAQAAAAEAIAwDAADKAQAgcQAAzwEAMHIAAAMAEHMAAM8BADB0AQC2AQAhdQEAtgEAIYYBQAC3AQAhiwFAALcBACGMAUAAtwEAIZYBAQC2AQAhlwEBAMMBACGYAQEAwwEAIQMDAAC0AgAglwEAANkBACCYAQAA2QEAIAwDAADKAQAgcQAAzwEAMHIAAAMAEHMAAM8BADB0AQAAAAF1AQC2AQAhhgFAALcBACGLAUAAtwEAIYwBQAC3AQAhlgEBAAAAAZcBAQDDAQAhmAEBAMMBACEDAAAAAwAgAQAABAAwAgAABQAgEQMAAMoBACBxAADNAQAwcgAABwAQcwAAzQEAMHQBALYBACF1AQC2AQAhhgFAALcBACGMAUAAtwEAIY0BAQC2AQAhjgEBALYBACGPAQEAwwEAIZABAQDDAQAhkQEBAMMBACGSAUAAzgEAIZMBQADOAQAhlAEBAMMBACGVAQEAwwEAIQgDAAC0AgAgjwEAANkBACCQAQAA2QEAIJEBAADZAQAgkgEAANkBACCTAQAA2QEAIJQBAADZAQAglQEAANkBACARAwAAygEAIHEAAM0BADByAAAHABBzAADNAQAwdAEAAAABdQEAtgEAIYYBQAC3AQAhjAFAALcBACGNAQEAtgEAIY4BAQC2AQAhjwEBAMMBACGQAQEAwwEAIZEBAQDDAQAhkgFAAM4BACGTAUAAzgEAIZQBAQDDAQAhlQEBAMMBACEDAAAABwAgAQAACAAwAgAACQAgDQMAAMoBACBxAADLAQAwcgAACwAQcwAAywEAMHQBALYBACF1AQC2AQAhggEBALYBACGDAQEAtgEAIYQBIADCAQAhhQEEAMQBACGGAQQAxAEAIYcBBADMAQAhiAEEAMQBACECAwAAtAIAIIcBAADZAQAgDQMAAMoBACBxAADLAQAwcgAACwAQcwAAywEAMHQBAAAAAXUBALYBACGCAQEAtgEAIYMBAQC2AQAhhAEgAMIBACGFAQQAxAEAIYYBBADEAQAhhwEEAMwBACGIAQQAxAEAIQMAAAALACABAAAMADACAAANACAHAwAAygEAIHEAAMkBADByAAAPABBzAADJAQAwdAEAtgEAIXUBALYBACF2BADEAQAhAQMAALQCACAHAwAAygEAIHEAAMkBADByAAAPABBzAADJAQAwdAEAAAABdQEAtgEAIXYEAMQBACEDAAAADwAgAQAAEAAwAgAAEQAgAQAAAAMAIAEAAAAHACABAAAACwAgAQAAAA8AIAEAAAABACAPBAAAxQEAIAUAAMYBACAGAADHAQAgBwAAyAEAIHEAAMEBADByAAAYABBzAADBAQAwdAEAtgEAIYYBQAC3AQAhjAFAALcBACGZAQEAtgEAIZoBAQC2AQAhmwEgAMIBACGcAQEAwwEAIZ0BBADEAQAhBQQAALACACAFAACxAgAgBgAAsgIAIAcAALMCACCcAQAA2QEAIAMAAAAYACABAAAZADACAAABACADAAAAGAAgAQAAGQAwAgAAAQAgAwAAABgAIAEAABkAMAIAAAEAIAwEAACsAgAgBQAArQIAIAYAAK4CACAHAACvAgAgdAEAAAABhgFAAAAAAYwBQAAAAAGZAQEAAAABmgEBAAAAAZsBIAAAAAGcAQEAAAABnQEEAAAAAQEOAAAdACAIdAEAAAABhgFAAAAAAYwBQAAAAAGZAQEAAAABmgEBAAAAAZsBIAAAAAGcAQEAAAABnQEEAAAAAQEOAAAfADABDgAAHwAwDAQAAPgBACAFAAD5AQAgBgAA-gEAIAcAAPsBACB0AQDVAQAhhgFAAOYBACGMAUAA5gEAIZkBAQDVAQAhmgEBANUBACGbASAA3wEAIZwBAQDqAQAhnQEEANYBACECAAAAAQAgDgAAIgAgCHQBANUBACGGAUAA5gEAIYwBQADmAQAhmQEBANUBACGaAQEA1QEAIZsBIADfAQAhnAEBAOoBACGdAQQA1gEAIQIAAAAYACAOAAAkACACAAAAGAAgDgAAJAAgAwAAAAEAIBUAAB0AIBYAACIAIAEAAAABACABAAAAGAAgBggAAPMBACAbAAD0AQAgHAAA9wEAIB0AAPYBACAeAAD1AQAgnAEAANkBACALcQAAwAEAMHIAACsAEHMAAMABADB0AQCgAQAhhgFAALIBACGMAUAAsgEAIZkBAQCgAQAhmgEBAKABACGbASAAqQEAIZwBAQC5AQAhnQEEAKEBACEDAAAAGAAgAQAAKgAwGgAAKwAgAwAAABgAIAEAABkAMAIAAAEAIAEAAAAFACABAAAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgCQMAAPIBACB0AQAAAAF1AQAAAAGGAUAAAAABiwFAAAAAAYwBQAAAAAGWAQEAAAABlwEBAAAAAZgBAQAAAAEBDgAAMwAgCHQBAAAAAXUBAAAAAYYBQAAAAAGLAUAAAAABjAFAAAAAAZYBAQAAAAGXAQEAAAABmAEBAAAAAQEOAAA1ADABDgAANQAwCQMAAPEBACB0AQDVAQAhdQEA1QEAIYYBQADmAQAhiwFAAOYBACGMAUAA5gEAIZYBAQDVAQAhlwEBAOoBACGYAQEA6gEAIQIAAAAFACAOAAA4ACAIdAEA1QEAIXUBANUBACGGAUAA5gEAIYsBQADmAQAhjAFAAOYBACGWAQEA1QEAIZcBAQDqAQAhmAEBAOoBACECAAAAAwAgDgAAOgAgAgAAAAMAIA4AADoAIAMAAAAFACAVAAAzACAWAAA4ACABAAAABQAgAQAAAAMAIAUIAADuAQAgHQAA8AEAIB4AAO8BACCXAQAA2QEAIJgBAADZAQAgC3EAAL8BADByAABBABBzAAC_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_ACADAAAADQAgFQAAeAAgFgAAfQAgAQAAAA0AIAEAAAALACAGCAAA2gEAIBsAANsBACAcAADeAQAgHQAA3QEAIB4AANwBACCHAQAA2QEAIAxxAACoAQAwcgAAhgEAEHMAAKgBADB0AQCgAQAhdQEAoAEAIYIBAQCgAQAhgwEBAKABACGEASAAqQEAIYUBBAChAQAhhgEEAKEBACGHAQQAqgEAIYgBBAChAQAhAwAAAAsAIAEAAIUBADAaAACGAQAgAwAAAAsAIAEAAAwAMAIAAA0AIAEAAAARACABAAAAEQAgAwAAAA8AIAEAABAAMAIAABEAIAMAAAAPACABAAAQADACAAARACADAAAADwAgAQAAEAAwAgAAEQAgBAMAANgBACB0AQAAAAF1AQAAAAF2BAAAAAEBDgAAjgEAIAN0AQAAAAF1AQAAAAF2BAAAAAEBDgAAkAEAMAEOAACQAQAwBAMAANcBACB0AQDVAQAhdQEA1QEAIXYEANYBACECAAAAEQAgDgAAkwEAIAN0AQDVAQAhdQEA1QEAIXYEANYBACECAAAADwAgDgAAlQEAIAIAAAAPACAOAACVAQAgAwAAABEAIBUAAI4BACAWAACTAQAgAQAAABEAIAEAAAAPACAFCAAA0AEAIBsAANEBACAcAADUAQAgHQAA0wEAIB4AANIBACAGcQAAnwEAMHIAAJwBABBzAACfAQAwdAEAoAEAIXUBAKABACF2BAChAQAhAwAAAA8AIAEAAJsBADAaAACcAQAgAwAAAA8AIAEAABAAMAIAABEAIAZxAACfAQAwcgAAnAEAEHMAAJ8BADB0AQCgAQAhdQEAoAEAIXYEAKEBACEOCAAAowEAIB0AAKcBACAeAACnAQAgdwEAAAABeAEAAAAEeQEAAAAEegEAAAABewEAAAABfAEAAAABfQEAAAABfgEApgEAIX8BAAAAAYABAQAAAAGBAQEAAAABDQgAAKMBACAbAACkAQAgHAAApQEAIB0AAKUBACAeAAClAQAgdwQAAAABeAQAAAAEeQQAAAAEegQAAAABewQAAAABfAQAAAABfQQAAAABfgQAogEAIQ0IAACjAQAgGwAApAEAIBwAAKUBACAdAAClAQAgHgAApQEAIHcEAAAAAXgEAAAABHkEAAAABHoEAAAAAXsEAAAAAXwEAAAAAX0EAAAAAX4EAKIBACEIdwIAAAABeAIAAAAEeQIAAAAEegIAAAABewIAAAABfAIAAAABfQIAAAABfgIAowEAIQh3CAAAAAF4CAAAAAR5CAAAAAR6CAAAAAF7CAAAAAF8CAAAAAF9CAAAAAF-CACkAQAhCHcEAAAAAXgEAAAABHkEAAAABHoEAAAAAXsEAAAAAXwEAAAAAX0EAAAAAX4EAKUBACEOCAAAowEAIB0AAKcBACAeAACnAQAgdwEAAAABeAEAAAAEeQEAAAAEegEAAAABewEAAAABfAEAAAABfQEAAAABfgEApgEAIX8BAAAAAYABAQAAAAGBAQEAAAABC3cBAAAAAXgBAAAABHkBAAAABHoBAAAAAXsBAAAAAXwBAAAAAX0BAAAAAX4BAKcBACF_AQAAAAGAAQEAAAABgQEBAAAAAQxxAACoAQAwcgAAhgEAEHMAAKgBADB0AQCgAQAhdQEAoAEAIYIBAQCgAQAhgwEBAKABACGEASAAqQEAIYUBBAChAQAhhgEEAKEBACGHAQQAqgEAIYgBBAChAQAhBQgAAKMBACAdAACwAQAgHgAAsAEAIHcgAAAAAX4gAK8BACENCAAArAEAIBsAAK0BACAcAACuAQAgHQAArgEAIB4AAK4BACB3BAAAAAF4BAAAAAV5BAAAAAV6BAAAAAF7BAAAAAF8BAAAAAF9BAAAAAF-BACrAQAhDQgAAKwBACAbAACtAQAgHAAArgEAIB0AAK4BACAeAACuAQAgdwQAAAABeAQAAAAFeQQAAAAFegQAAAABewQAAAABfAQAAAABfQQAAAABfgQAqwEAIQh3AgAAAAF4AgAAAAV5AgAAAAV6AgAAAAF7AgAAAAF8AgAAAAF9AgAAAAF-AgCsAQAhCHcIAAAAAXgIAAAABXkIAAAABXoIAAAAAXsIAAAAAXwIAAAAAX0IAAAAAX4IAK0BACEIdwQAAAABeAQAAAAFeQQAAAAFegQAAAABewQAAAABfAQAAAABfQQAAAABfgQArgEAIQUIAACjAQAgHQAAsAEAIB4AALABACB3IAAAAAF-IACvAQAhAncgAAAAAX4gALABACEJcQAAsQEAMHIAAHAAEHMAALEBADB0AQCgAQAhhgFAALIBACGJAQEAoAEAIYoBAQCgAQAhiwFAALIBACGMAUAAsgEAIQsIAACjAQAgHQAAtAEAIB4AALQBACB3QAAAAAF4QAAAAAR5QAAAAAR6QAAAAAF7QAAAAAF8QAAAAAF9QAAAAAF-QACzAQAhCwgAAKMBACAdAAC0AQAgHgAAtAEAIHdAAAAAAXhAAAAABHlAAAAABHpAAAAAAXtAAAAAAXxAAAAAAX1AAAAAAX5AALMBACEId0AAAAABeEAAAAAEeUAAAAAEekAAAAABe0AAAAABfEAAAAABfUAAAAABfkAAtAEAIQlxAAC1AQAwcgAAXQAQcwAAtQEAMHQBALYBACGGAUAAtwEAIYkBAQC2AQAhigEBALYBACGLAUAAtwEAIYwBQAC3AQAhC3cBAAAAAXgBAAAABHkBAAAABHoBAAAAAXsBAAAAAXwBAAAAAX0BAAAAAX4BAKcBACF_AQAAAAGAAQEAAAABgQEBAAAAAQh3QAAAAAF4QAAAAAR5QAAAAAR6QAAAAAF7QAAAAAF8QAAAAAF9QAAAAAF-QAC0AQAhEHEAALgBADByAABXABBzAAC4AQAwdAEAoAEAIXUBAKABACGGAUAAsgEAIYwBQACyAQAhjQEBAKABACGOAQEAoAEAIY8BAQC5AQAhkAEBALkBACGRAQEAuQEAIZIBQAC6AQAhkwFAALoBACGUAQEAuQEAIZUBAQC5AQAhDggAAKwBACAdAAC-AQAgHgAAvgEAIHcBAAAAAXgBAAAABXkBAAAABXoBAAAAAXsBAAAAAXwBAAAAAX0BAAAAAX4BAL0BACF_AQAAAAGAAQEAAAABgQEBAAAAAQsIAACsAQAgHQAAvAEAIB4AALwBACB3QAAAAAF4QAAAAAV5QAAAAAV6QAAAAAF7QAAAAAF8QAAAAAF9QAAAAAF-QAC7AQAhCwgAAKwBACAdAAC8AQAgHgAAvAEAIHdAAAAAAXhAAAAABXlAAAAABXpAAAAAAXtAAAAAAXxAAAAAAX1AAAAAAX5AALsBACEId0AAAAABeEAAAAAFeUAAAAAFekAAAAABe0AAAAABfEAAAAABfUAAAAABfkAAvAEAIQ4IAACsAQAgHQAAvgEAIB4AAL4BACB3AQAAAAF4AQAAAAV5AQAAAAV6AQAAAAF7AQAAAAF8AQAAAAF9AQAAAAF-AQC9AQAhfwEAAAABgAEBAAAAAYEBAQAAAAELdwEAAAABeAEAAAAFeQEAAAAFegEAAAABewEAAAABfAEAAAABfQEAAAABfgEAvgEAIX8BAAAAAYABAQAAAAGBAQEAAAABC3EAAL8BADByAABBABBzAAC_AQAwdAEAoAEAIXUBAKABACGGAUAAsgEAIYsBQACyAQAhjAFAALIBACGWAQEAoAEAIZcBAQC5AQAhmAEBALkBACELcQAAwAEAMHIAACsAEHMAAMABADB0AQCgAQAhhgFAALIBACGMAUAAsgEAIZkBAQCgAQAhmgEBAKABACGbASAAqQEAIZwBAQC5AQAhnQEEAKEBACEPBAAAxQEAIAUAAMYBACAGAADHAQAgBwAAyAEAIHEAAMEBADByAAAYABBzAADBAQAwdAEAtgEAIYYBQAC3AQAhjAFAALcBACGZAQEAtgEAIZoBAQC2AQAhmwEgAMIBACGcAQEAwwEAIZ0BBADEAQAhAncgAAAAAX4gALABACELdwEAAAABeAEAAAAFeQEAAAAFegEAAAABewEAAAABfAEAAAABfQEAAAABfgEAvgEAIX8BAAAAAYABAQAAAAGBAQEAAAABCHcEAAAAAXgEAAAABHkEAAAABHoEAAAAAXsEAAAAAXwEAAAAAX0EAAAAAX4EAKUBACEDngEAAAMAIJ8BAAADACCgAQAAAwAgA54BAAAHACCfAQAABwAgoAEAAAcAIAOeAQAACwAgnwEAAAsAIKABAAALACADngEAAA8AIJ8BAAAPACCgAQAADwAgBwMAAMoBACBxAADJAQAwcgAADwAQcwAAyQEAMHQBALYBACF1AQC2AQAhdgQAxAEAIREEAADFAQAgBQAAxgEAIAYAAMcBACAHAADIAQAgcQAAwQEAMHIAABgAEHMAAMEBADB0AQC2AQAhhgFAALcBACGMAUAAtwEAIZkBAQC2AQAhmgEBALYBACGbASAAwgEAIZwBAQDDAQAhnQEEAMQBACGhAQAAGAAgogEAABgAIA0DAADKAQAgcQAAywEAMHIAAAsAEHMAAMsBADB0AQC2AQAhdQEAtgEAIYIBAQC2AQAhgwEBALYBACGEASAAwgEAIYUBBADEAQAhhgEEAMQBACGHAQQAzAEAIYgBBADEAQAhCHcEAAAAAXgEAAAABXkEAAAABXoEAAAAAXsEAAAAAXwEAAAAAX0EAAAAAX4EAK4BACERAwAAygEAIHEAAM0BADByAAAHABBzAADNAQAwdAEAtgEAIXUBALYBACGGAUAAtwEAIYwBQAC3AQAhjQEBALYBACGOAQEAtgEAIY8BAQDDAQAhkAEBAMMBACGRAQEAwwEAIZIBQADOAQAhkwFAAM4BACGUAQEAwwEAIZUBAQDDAQAhCHdAAAAAAXhAAAAABXlAAAAABXpAAAAAAXtAAAAAAXxAAAAAAX1AAAAAAX5AALwBACEMAwAAygEAIHEAAM8BADByAAADABBzAADPAQAwdAEAtgEAIXUBALYBACGGAUAAtwEAIYsBQAC3AQAhjAFAALcBACGWAQEAtgEAIZcBAQDDAQAhmAEBAMMBACEAAAAAAAGmAQEAAAABBaYBBAAAAAGsAQQAAAABrQEEAAAAAa4BBAAAAAGvAQQAAAABBRUAAMgCACAWAADLAgAgowEAAMkCACCkAQAAygIAIKkBAAABACADFQAAyAIAIKMBAADJAgAgqQEAAAEAIAAAAAAAAAGmASAAAAABBaYBBAAAAAGsAQQAAAABrQEEAAAAAa4BBAAAAAGvAQQAAAABBRUAAMMCACAWAADGAgAgowEAAMQCACCkAQAAxQIAIKkBAAABACADFQAAwwIAIKMBAADEAgAgqQEAAAEAIAAAAAGmAUAAAAABAAAAAaYBAQAAAAEBpgFAAAAAAQUVAAC-AgAgFgAAwQIAIKMBAAC_AgAgpAEAAMACACCpAQAAAQAgAxUAAL4CACCjAQAAvwIAIKkBAAABACAAAAAFFQAAuQIAIBYAALwCACCjAQAAugIAIKQBAAC7AgAgqQEAAAEAIAMVAAC5AgAgowEAALoCACCpAQAAAQAgAAAAAAALFQAAoAIAMBYAAKUCADCjAQAAoQIAMKQBAACiAgAwpQEAAKMCACCmAQAApAIAMKcBAACkAgAwqAEAAKQCADCpAQAApAIAMKoBAACmAgAwqwEAAKcCADALFQAAlAIAMBYAAJkCADCjAQAAlQIAMKQBAACWAgAwpQEAAJcCACCmAQAAmAIAMKcBAACYAgAwqAEAAJgCADCpAQAAmAIAMKoBAACaAgAwqwEAAJsCADALFQAAiAIAMBYAAI0CADCjAQAAiQIAMKQBAACKAgAwpQEAAIsCACCmAQAAjAIAMKcBAACMAgAwqAEAAIwCADCpAQAAjAIAMKoBAACOAgAwqwEAAI8CADALFQAA_AEAMBYAAIECADCjAQAA_QEAMKQBAAD-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_AEAMKMBAAD9AQAwpQEAAP8BACCpAQAAgAIAMAAAAAAFBAAAsAIAIAUAALECACAGAACyAgAgBwAAswIAIJwBAADZAQAgB3QBAAAAAYYBQAAAAAGLAUAAAAABjAFAAAAAAZYBAQAAAAGXAQEAAAABmAEBAAAAAQx0AQAAAAGGAUAAAAABjAFAAAAAAY0BAQAAAAGOAQEAAAABjwEBAAAAAZABAQAAAAGRAQEAAAABkgFAAAAAAZMBQAAAAAGUAQEAAAABlQEBAAAAAQh0AQAAAAGCAQEAAAABgwEBAAAAAYQBIAAAAAGFAQQAAAABhgEEAAAAAYcBBAAAAAGIAQQAAAABAnQBAAAAAXYEAAAAAQsFAACtAgAgBgAArgIAIAcAAK8CACB0AQAAAAGGAUAAAAABjAFAAAAAAZkBAQAAAAGaAQEAAAABmwEgAAAAAZwBAQAAAAGdAQQAAAABAgAAAAEAIBUAALkCACADAAAAGAAgFQAAuQIAIBYAAL0CACANAAAAGAAgBQAA-QEAIAYAAPoBACAHAAD7AQAgDgAAvQIAIHQBANUBACGGAUAA5gEAIYwBQADmAQAhmQEBANUBACGaAQEA1QEAIZsBIADfAQAhnAEBAOoBACGdAQQA1gEAIQsFAAD5AQAgBgAA-gEAIAcAAPsBACB0AQDVAQAhhgFAAOYBACGMAUAA5gEAIZkBAQDVAQAhmgEBANUBACGbASAA3wEAIZwBAQDqAQAhnQEEANYBACELBAAArAIAIAYAAK4CACAHAACvAgAgdAEAAAABhgFAAAAAAYwBQAAAAAGZAQEAAAABmgEBAAAAAZsBIAAAAAGcAQEAAAABnQEEAAAAAQIAAAABACAVAAC-AgAgAwAAABgAIBUAAL4CACAWAADCAgAgDQAAABgAIAQAAPgBACAGAAD6AQAgBwAA-wEAIA4AAMICACB0AQDVAQAhhgFAAOYBACGMAUAA5gEAIZkBAQDVAQAhmgEBANUBACGbASAA3wEAIZwBAQDqAQAhnQEEANYBACELBAAA-AEAIAYAAPoBACAHAAD7AQAgdAEA1QEAIYYBQADmAQAhjAFAAOYBACGZAQEA1QEAIZoBAQDVAQAhmwEgAN8BACGcAQEA6gEAIZ0BBADWAQAhCwQAAKwCACAFAACtAgAgBwAArwIAIHQBAAAAAYYBQAAAAAGMAUAAAAABmQEBAAAAAZoBAQAAAAGbASAAAAABnAEBAAAAAZ0BBAAAAAECAAAAAQAgFQAAwwIAIAMAAAAYACAVAADDAgAgFgAAxwIAIA0AAAAYACAEAAD4AQAgBQAA-QEAIAcAAPsBACAOAADHAgAgdAEA1QEAIYYBQADmAQAhjAFAAOYBACGZAQEA1QEAIZoBAQDVAQAhmwEgAN8BACGcAQEA6gEAIZ0BBADWAQAhCwQAAPgBACAFAAD5AQAgBwAA-wEAIHQBANUBACGGAUAA5gEAIYwBQADmAQAhmQEBANUBACGaAQEA1QEAIZsBIADfAQAhnAEBAOoBACGdAQQA1gEAIQsEAACsAgAgBQAArQIAIAYAAK4CACB0AQAAAAGGAUAAAAABjAFAAAAAAZkBAQAAAAGaAQEAAAABmwEgAAAAAZwBAQAAAAGdAQQAAAABAgAAAAEAIBUAAMgCACADAAAAGAAgFQAAyAIAIBYAAMwCACANAAAAGAAgBAAA-AEAIAUAAPkBACAGAAD6AQAgDgAAzAIAIHQBANUBACGGAUAA5gEAIYwBQADmAQAhmQEBANUBACGaAQEA1QEAIZsBIADfAQAhnAEBAOoBACGdAQQA1gEAIQsEAAD4AQAgBQAA-QEAIAYAAPoBACB0AQDVAQAhhgFAAOYBACGMAUAA5gEAIZkBAQDVAQAhmgEBANUBACGbASAA3wEAIZwBAQDqAQAhnQEEANYBACEFBAYCBQoDBg4EBxIFCAAGAQMAAQEDAAEBAwABAQMAAQQEEwAFFAAGFQAHFgAAAAAFCAALGwAMHAANHQAOHgAPAAAAAAAFCAALGwAMHAANHQAOHgAPAQMAAQEDAAEDCAAUHQAVHgAWAAAAAwgAFB0AFR4AFgEDAAEBAwABAwgAGx0AHB4AHQAAAAMIABsdABweAB0AAAADCAAjHQAkHgAlAAAAAwgAIx0AJB4AJQEDAAEBAwABBQgAKhsAKxwALB0ALR4ALgAAAAAABQgAKhsAKxwALB0ALR4ALgEDAAEBAwABBQgAMxsANBwANR0ANh4ANwAAAAAABQgAMxsANBwANR0ANh4ANwkCAQoXAQsaAQwbAQ0cAQ8eARAgBxEhCBIjARMlBxQmCRcnARgoARkpBx8sCiAtECEuAiIvAiMwAiQxAiUyAiY0Aic2Byg3ESk5Aio7Bys8Eiw9Ai0-Ai4_By9CEzBDFzFEAzJFAzNGAzRHAzVIAzZKAzdMBzhNGDlPAzpRBztSGTxTAz1UAz5VBz9YGkBZHkFbH0JcH0NfH0RgH0VhH0ZjH0dlB0hmIEloH0pqB0trIUxsH01tH05uB09xIlByJlFzBFJ0BFN1BFR2BFV3BFZ5BFd7B1h8J1l-BFqAAQdbgQEoXIIBBF2DAQRehAEHX4cBKWCIAS9hiQEFYooBBWOLAQVkjAEFZY0BBWaPAQVnkQEHaJIBMGmUAQVqlgEHa5cBMWyYAQVtmQEFbpoBB2-dATJwngE4"
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
import { Hono } from "hono";

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
var syncRoutes = new Hono();
syncRoutes.post("/sync/push", async (c) => {
  const sessao = await exigirSessao(c);
  if (!sessao) return c.json({ erro: "N\xE3o autenticado" }, 401);
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
  if (!sessao) return c.json({ erro: "N\xE3o autenticado" }, 401);
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
  const app = new Hono2();
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
