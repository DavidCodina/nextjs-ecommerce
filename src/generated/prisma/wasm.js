
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
  createParam,
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  category: 'category',
  images: 'images',
  brand: 'brand',
  description: 'description',
  stock: 'stock',
  price: 'price',
  rating: 'rating',
  numReviews: 'numReviews',
  isFeatured: 'isFeatured',
  banner: 'banner',
  createdAt: 'createdAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  password: 'password',
  role: 'role',
  address: 'address',
  paymentMethod: 'paymentMethod',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  Product: 'Product',
  User: 'User',
  Account: 'Account'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/davidcodina/Desktop/nextjs_ecommerce/src/generated/prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "/Users/davidcodina/Desktop/nextjs_ecommerce/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "6.6.0",
  "engineVersion": "f676762280b54cd07c770017ed3711ddde35f37a",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": "postgres://neondb_owner:npg_4hNme0POTcEK@ep-mute-band-a6u6h7k3-pooler.us-west-2.aws.neon.tech/neondb?sslmode=require"
      }
    }
  },
  "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  // Prisma has recently updated its default configuration. \n  // The Prisma Client is no longer generated inside node_modules/.prisma/client \n  // by default. Instead, users are required to explicitly define an output path.\n  // Prisma now strongly recommends specifying an output location, and common \n  // choices include app/generated, src/generated, or even the project root.\n  output          = \"../src/generated/prisma\"\n  previewFeatures = [\"driverAdapters\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel Product {\n  // This id definition is more complex that usual.\n  // How does it differ from just: id  String @id @default(uuid()) ?\n  // This delegates UUID generation to the database using gen_random_uuid().\n  // The advantage is that the database ensures unique IDs without relying on Prisma or the application layer.\n  // @db.Uuid is a Prisma database type annotation that ensures the underlying database stores the field \n  // as a UUID type rather than a generic string.\n  id String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n\n  name        String\n  slug        String   @unique(map: \"product_slug_index\")\n  category    String\n  images      String[]\n  brand       String\n  description String\n  stock       Int\n\n  ///////////////////////////////////////////////////////////////////////////\n  //\n  // ⚠️ Brad is using the Prisma Decimal type for price and rating.\n  // This converts to the numeric data type in Postgres. More importantly, \n  // it converts to type string in javascript after manual serialization.\n  //\n  // This approach of using what is essentially a string rather than a number \n  // feels extremely unintuitive to me. However, the goal is ultimately to avoid\n  // floating point errors while also maintaining a formatted version of the price.\n  //\n  // Using the Prisma Decimal type will not throw an error if the value is not limited\n  // to two decimal places. Apparently, PostgreSQL will automatically round the value \n  // to match the specified scale, based on its internal rounding rules (typically round-half-up).\n  // Ultimately, the server logic should manually control what gets input into the database prior\n  // to insertion. For example, there is a Zod schema that does this:\n  // \n  //   const currency = z.string().refine(\n  //     (value) => /^\\d+(\\.\\d{2})?$/.test(formatNumberWithDecimal(Number(value))),\n  //     'Price must have exactly two decimal places'\n  //   )\n  //\n  ///////////////////////////////////////////////////////////////////////////\n\n  // Note: PostgreSQL will automatically round the value to match the specified scale,\n  // based on its internal rounding rules (typically round-half-up).\n  price      Decimal  @default(0) @db.Decimal(12, 2)\n  //^ Does this mean that he has a max of three star ratings?\n  rating     Decimal  @default(0) @db.Decimal(3, 2)\n  numReviews Int      @default(0)\n  isFeatured Boolean  @default(false)\n  banner     String?\n  // Brad appends @db.Timestamp(6). I don't think it's necessary.\n  createdAt  DateTime @default(now())\n  // OrderItem   OrderItem[]\n  // Review      Review[]\n\n  @@map(\"products\")\n}\n\nmodel User {\n  id   String @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  // Eventually switch to fistName and lastName\n  // Brad does this:\n  // name String @default(\"NO_NAME\")\n  name String\n\n  // Brad does this, but I don't think it's necessary.\n  // email         String    @unique(map: \"user_email_index\")\n  email         String    @unique\n  // Brad does this:\n  // emailVerified DateTime? @db.Timestamp(6)\n  emailVerified DateTime?\n  image         String?\n  accounts      Account[]\n\n  // ⚠️ At 1:52:30 Coding with Antionio removes sessions.\n  // sessions Session[]\n\n  password      String?\n  //# Not loving this. It's preferable to have an array of roles.\n  role          String   @default(\"user\")\n  address       Json?    @db.Json // @db.Json may be redundant when using Postgres.\n  paymentMethod String?\n  createdAt     DateTime @default(now())\n  updatedAt     DateTime @updatedAt\n\n  // Cart          Cart[]\n  // Order         Order[]\n  // Review        Review[]\n\n  @@map(\"users\")\n}\n\nmodel Account {\n  id                String  @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  userId            String  @db.Uuid\n  type              String\n  provider          String\n  providerAccountId String\n  refresh_token     String? @db.Text\n  access_token      String? @db.Text\n  expires_at        Int?\n  token_type        String?\n  scope             String?\n  id_token          String? @db.Text\n  session_state     String?\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([provider, providerAccountId])\n  @@map(\"accounts\")\n}\n\n///////////////////////////////////////////////////////////////////////////\n//\n// ⚠️ Since you're using a JWT strategy, you don’t necessarily need the Session model.\n// With JWT, authentication tokens are stored client-side (like in localStorage or cookies) \n// rather than in a database. The token itself contains everything needed for authentication, \n// so the server doesn’t need to track active sessions.\n//\n///////////////////////////////////////////////////////////////////////////\n\n// model Session {\n//   id           String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n//   sessionToken String   @unique\n//   userId       String   @db.Uuid\n//   expires      DateTime\n//   user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n//   @@map(\"sessions\")\n// }\n\n///////////////////////////////////////////////////////////////////////////\n//\n// ⚠️ At 1:53:45 Coding with Antonio discusses omitting this.\n// He says that we will later implement our own.\n// He says it's kind of misleading and not actually intended for\n// the credentials provider. Instead, it's actually intended to be\n// used with the email provider (i.e., magic link). Hence the `token` part.\n// Magic links work by sending a temporary token via email, allowing the \n// user to sign in without a password. The VerificationToken model stores \n// that token and expiration timestamp for this passwordless login flow.\n//\n///////////////////////////////////////////////////////////////////////////\n\n// model VerificationToken {\n//   identifier String\n//   token      String\n//   expires    DateTime\n//   @@unique([identifier, token])\n//   @@map(\"verification_tokens\")\n// }\n\n// model Cart {\n//   id            String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n//   userId        String?  @db.Uuid\n//   sessionCartId String\n//   items         Json[]   @default([]) @db.Json\n//   itemsPrice    Decimal  @db.Decimal(12, 2)\n//   totalPrice    Decimal  @db.Decimal(12, 2)\n//   shippingPrice Decimal  @db.Decimal(12, 2)\n//   taxPrice      Decimal  @db.Decimal(12, 2)\n//   createdAt     DateTime @default(now()) @db.Timestamp(6)\n//   user          User?    @relation(fields: [userId], references: [id], onDelete: Cascade)\n// }\n\n// model Order {\n//   id              String      @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n//   userId          String      @db.Uuid\n//   shippingAddress Json        @db.Json\n//   paymentMethod   String\n//   paymentResult   Json?       @db.Json\n//   itemsPrice      Decimal     @db.Decimal(12, 2)\n//   shippingPrice   Decimal     @db.Decimal(12, 2)\n//   taxPrice        Decimal     @db.Decimal(12, 2)\n//   totalPrice      Decimal     @db.Decimal(12, 2)\n//   isPaid          Boolean     @default(false)\n//   paidAt          DateTime?   @db.Timestamp(6)\n//   isDelivered     Boolean     @default(false)\n//   deliveredAt     DateTime?   @db.Timestamp(6)\n//   createdAt       DateTime    @default(now()) @db.Timestamp(6)\n//   user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)\n//   orderitems      OrderItem[]\n// }\n\n// model OrderItem {\n//   orderId   String  @db.Uuid\n//   productId String  @db.Uuid\n//   qty       Int\n//   price     Decimal @db.Decimal(12, 2)\n//   name      String\n//   slug      String\n//   image     String\n//   order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)\n//   product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)\n\n//   @@id([orderId, productId], map: \"orderitems_orderId_productId_pk\")\n// }\n\n// model Review {\n//   id                 String   @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n//   userId             String   @db.Uuid\n//   productId          String   @db.Uuid\n//   rating             Int\n//   title              String\n//   description        String\n//   isVerifiedPurchase Boolean  @default(true)\n//   createdAt          DateTime @default(now()) @db.Timestamp(6)\n//   product            Product  @relation(fields: [productId], references: [id], onDelete: Cascade)\n//   user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n// }\n",
  "inlineSchemaHash": "36787170b6abdbcbc163f9d339fe9fde5701c81dfb364a4826b0a2e7f6cd45d9",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Product\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"slug\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"category\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"images\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"brand\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stock\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"price\",\"kind\":\"scalar\",\"type\":\"Decimal\"},{\"name\":\"rating\",\"kind\":\"scalar\",\"type\":\"Decimal\"},{\"name\":\"numReviews\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"isFeatured\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"banner\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":\"products\"},\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"emailVerified\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"image\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"accounts\",\"kind\":\"object\",\"type\":\"Account\",\"relationName\":\"AccountToUser\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"address\",\"kind\":\"scalar\",\"type\":\"Json\"},{\"name\":\"paymentMethod\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":\"users\"},\"Account\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"provider\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"providerAccountId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"refresh_token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"access_token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"expires_at\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"token_type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"scope\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"id_token\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"session_state\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"AccountToUser\"}],\"dbName\":\"accounts\"}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: async () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine
  }
}
config.compilerWasm = undefined

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

