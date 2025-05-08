
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ChatHistory
 * 
 */
export type ChatHistory = $Result.DefaultSelection<Prisma.$ChatHistoryPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ChatHistories
 * const chatHistories = await prisma.chatHistory.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ChatHistories
   * const chatHistories = await prisma.chatHistory.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.chatHistory`: Exposes CRUD operations for the **ChatHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChatHistories
    * const chatHistories = await prisma.chatHistory.findMany()
    * ```
    */
  get chatHistory(): Prisma.ChatHistoryDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.7.0
   * Query Engine version: 3cff47a7f5d65c3ea74883f1d736e41d68ce91ed
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ChatHistory: 'ChatHistory'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "chatHistory"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ChatHistory: {
        payload: Prisma.$ChatHistoryPayload<ExtArgs>
        fields: Prisma.ChatHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChatHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChatHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload>
          }
          findFirst: {
            args: Prisma.ChatHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChatHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload>
          }
          findMany: {
            args: Prisma.ChatHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload>[]
          }
          create: {
            args: Prisma.ChatHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload>
          }
          createMany: {
            args: Prisma.ChatHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChatHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload>[]
          }
          delete: {
            args: Prisma.ChatHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload>
          }
          update: {
            args: Prisma.ChatHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload>
          }
          deleteMany: {
            args: Prisma.ChatHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChatHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ChatHistoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload>[]
          }
          upsert: {
            args: Prisma.ChatHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatHistoryPayload>
          }
          aggregate: {
            args: Prisma.ChatHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChatHistory>
          }
          groupBy: {
            args: Prisma.ChatHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChatHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChatHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<ChatHistoryCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    chatHistory?: ChatHistoryOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model ChatHistory
   */

  export type AggregateChatHistory = {
    _count: ChatHistoryCountAggregateOutputType | null
    _min: ChatHistoryMinAggregateOutputType | null
    _max: ChatHistoryMaxAggregateOutputType | null
  }

  export type ChatHistoryMinAggregateOutputType = {
    id: string | null
    userId: string | null
    chatName: string | null
    history: string | null
    updatedAt: Date | null
  }

  export type ChatHistoryMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    chatName: string | null
    history: string | null
    updatedAt: Date | null
  }

  export type ChatHistoryCountAggregateOutputType = {
    id: number
    userId: number
    chatName: number
    history: number
    updatedAt: number
    _all: number
  }


  export type ChatHistoryMinAggregateInputType = {
    id?: true
    userId?: true
    chatName?: true
    history?: true
    updatedAt?: true
  }

  export type ChatHistoryMaxAggregateInputType = {
    id?: true
    userId?: true
    chatName?: true
    history?: true
    updatedAt?: true
  }

  export type ChatHistoryCountAggregateInputType = {
    id?: true
    userId?: true
    chatName?: true
    history?: true
    updatedAt?: true
    _all?: true
  }

  export type ChatHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatHistory to aggregate.
     */
    where?: ChatHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatHistories to fetch.
     */
    orderBy?: ChatHistoryOrderByWithRelationInput | ChatHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChatHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChatHistories
    **/
    _count?: true | ChatHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChatHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChatHistoryMaxAggregateInputType
  }

  export type GetChatHistoryAggregateType<T extends ChatHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateChatHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChatHistory[P]>
      : GetScalarType<T[P], AggregateChatHistory[P]>
  }




  export type ChatHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChatHistoryWhereInput
    orderBy?: ChatHistoryOrderByWithAggregationInput | ChatHistoryOrderByWithAggregationInput[]
    by: ChatHistoryScalarFieldEnum[] | ChatHistoryScalarFieldEnum
    having?: ChatHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChatHistoryCountAggregateInputType | true
    _min?: ChatHistoryMinAggregateInputType
    _max?: ChatHistoryMaxAggregateInputType
  }

  export type ChatHistoryGroupByOutputType = {
    id: string
    userId: string
    chatName: string
    history: string
    updatedAt: Date
    _count: ChatHistoryCountAggregateOutputType | null
    _min: ChatHistoryMinAggregateOutputType | null
    _max: ChatHistoryMaxAggregateOutputType | null
  }

  type GetChatHistoryGroupByPayload<T extends ChatHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChatHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChatHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChatHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], ChatHistoryGroupByOutputType[P]>
        }
      >
    >


  export type ChatHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    chatName?: boolean
    history?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["chatHistory"]>

  export type ChatHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    chatName?: boolean
    history?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["chatHistory"]>

  export type ChatHistorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    chatName?: boolean
    history?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["chatHistory"]>

  export type ChatHistorySelectScalar = {
    id?: boolean
    userId?: boolean
    chatName?: boolean
    history?: boolean
    updatedAt?: boolean
  }

  export type ChatHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "chatName" | "history" | "updatedAt", ExtArgs["result"]["chatHistory"]>

  export type $ChatHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChatHistory"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      chatName: string
      history: string
      updatedAt: Date
    }, ExtArgs["result"]["chatHistory"]>
    composites: {}
  }

  type ChatHistoryGetPayload<S extends boolean | null | undefined | ChatHistoryDefaultArgs> = $Result.GetResult<Prisma.$ChatHistoryPayload, S>

  type ChatHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChatHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChatHistoryCountAggregateInputType | true
    }

  export interface ChatHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChatHistory'], meta: { name: 'ChatHistory' } }
    /**
     * Find zero or one ChatHistory that matches the filter.
     * @param {ChatHistoryFindUniqueArgs} args - Arguments to find a ChatHistory
     * @example
     * // Get one ChatHistory
     * const chatHistory = await prisma.chatHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChatHistoryFindUniqueArgs>(args: SelectSubset<T, ChatHistoryFindUniqueArgs<ExtArgs>>): Prisma__ChatHistoryClient<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ChatHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChatHistoryFindUniqueOrThrowArgs} args - Arguments to find a ChatHistory
     * @example
     * // Get one ChatHistory
     * const chatHistory = await prisma.chatHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChatHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, ChatHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChatHistoryClient<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChatHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatHistoryFindFirstArgs} args - Arguments to find a ChatHistory
     * @example
     * // Get one ChatHistory
     * const chatHistory = await prisma.chatHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChatHistoryFindFirstArgs>(args?: SelectSubset<T, ChatHistoryFindFirstArgs<ExtArgs>>): Prisma__ChatHistoryClient<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ChatHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatHistoryFindFirstOrThrowArgs} args - Arguments to find a ChatHistory
     * @example
     * // Get one ChatHistory
     * const chatHistory = await prisma.chatHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChatHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, ChatHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChatHistoryClient<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ChatHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChatHistories
     * const chatHistories = await prisma.chatHistory.findMany()
     * 
     * // Get first 10 ChatHistories
     * const chatHistories = await prisma.chatHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const chatHistoryWithIdOnly = await prisma.chatHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChatHistoryFindManyArgs>(args?: SelectSubset<T, ChatHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ChatHistory.
     * @param {ChatHistoryCreateArgs} args - Arguments to create a ChatHistory.
     * @example
     * // Create one ChatHistory
     * const ChatHistory = await prisma.chatHistory.create({
     *   data: {
     *     // ... data to create a ChatHistory
     *   }
     * })
     * 
     */
    create<T extends ChatHistoryCreateArgs>(args: SelectSubset<T, ChatHistoryCreateArgs<ExtArgs>>): Prisma__ChatHistoryClient<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ChatHistories.
     * @param {ChatHistoryCreateManyArgs} args - Arguments to create many ChatHistories.
     * @example
     * // Create many ChatHistories
     * const chatHistory = await prisma.chatHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChatHistoryCreateManyArgs>(args?: SelectSubset<T, ChatHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ChatHistories and returns the data saved in the database.
     * @param {ChatHistoryCreateManyAndReturnArgs} args - Arguments to create many ChatHistories.
     * @example
     * // Create many ChatHistories
     * const chatHistory = await prisma.chatHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ChatHistories and only return the `id`
     * const chatHistoryWithIdOnly = await prisma.chatHistory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChatHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, ChatHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ChatHistory.
     * @param {ChatHistoryDeleteArgs} args - Arguments to delete one ChatHistory.
     * @example
     * // Delete one ChatHistory
     * const ChatHistory = await prisma.chatHistory.delete({
     *   where: {
     *     // ... filter to delete one ChatHistory
     *   }
     * })
     * 
     */
    delete<T extends ChatHistoryDeleteArgs>(args: SelectSubset<T, ChatHistoryDeleteArgs<ExtArgs>>): Prisma__ChatHistoryClient<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ChatHistory.
     * @param {ChatHistoryUpdateArgs} args - Arguments to update one ChatHistory.
     * @example
     * // Update one ChatHistory
     * const chatHistory = await prisma.chatHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChatHistoryUpdateArgs>(args: SelectSubset<T, ChatHistoryUpdateArgs<ExtArgs>>): Prisma__ChatHistoryClient<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ChatHistories.
     * @param {ChatHistoryDeleteManyArgs} args - Arguments to filter ChatHistories to delete.
     * @example
     * // Delete a few ChatHistories
     * const { count } = await prisma.chatHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChatHistoryDeleteManyArgs>(args?: SelectSubset<T, ChatHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChatHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChatHistories
     * const chatHistory = await prisma.chatHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChatHistoryUpdateManyArgs>(args: SelectSubset<T, ChatHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChatHistories and returns the data updated in the database.
     * @param {ChatHistoryUpdateManyAndReturnArgs} args - Arguments to update many ChatHistories.
     * @example
     * // Update many ChatHistories
     * const chatHistory = await prisma.chatHistory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ChatHistories and only return the `id`
     * const chatHistoryWithIdOnly = await prisma.chatHistory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ChatHistoryUpdateManyAndReturnArgs>(args: SelectSubset<T, ChatHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ChatHistory.
     * @param {ChatHistoryUpsertArgs} args - Arguments to update or create a ChatHistory.
     * @example
     * // Update or create a ChatHistory
     * const chatHistory = await prisma.chatHistory.upsert({
     *   create: {
     *     // ... data to create a ChatHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChatHistory we want to update
     *   }
     * })
     */
    upsert<T extends ChatHistoryUpsertArgs>(args: SelectSubset<T, ChatHistoryUpsertArgs<ExtArgs>>): Prisma__ChatHistoryClient<$Result.GetResult<Prisma.$ChatHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ChatHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatHistoryCountArgs} args - Arguments to filter ChatHistories to count.
     * @example
     * // Count the number of ChatHistories
     * const count = await prisma.chatHistory.count({
     *   where: {
     *     // ... the filter for the ChatHistories we want to count
     *   }
     * })
    **/
    count<T extends ChatHistoryCountArgs>(
      args?: Subset<T, ChatHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChatHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChatHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChatHistoryAggregateArgs>(args: Subset<T, ChatHistoryAggregateArgs>): Prisma.PrismaPromise<GetChatHistoryAggregateType<T>>

    /**
     * Group by ChatHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatHistoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChatHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChatHistoryGroupByArgs['orderBy'] }
        : { orderBy?: ChatHistoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChatHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChatHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChatHistory model
   */
  readonly fields: ChatHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChatHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChatHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChatHistory model
   */
  interface ChatHistoryFieldRefs {
    readonly id: FieldRef<"ChatHistory", 'String'>
    readonly userId: FieldRef<"ChatHistory", 'String'>
    readonly chatName: FieldRef<"ChatHistory", 'String'>
    readonly history: FieldRef<"ChatHistory", 'String'>
    readonly updatedAt: FieldRef<"ChatHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChatHistory findUnique
   */
  export type ChatHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * Filter, which ChatHistory to fetch.
     */
    where: ChatHistoryWhereUniqueInput
  }

  /**
   * ChatHistory findUniqueOrThrow
   */
  export type ChatHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * Filter, which ChatHistory to fetch.
     */
    where: ChatHistoryWhereUniqueInput
  }

  /**
   * ChatHistory findFirst
   */
  export type ChatHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * Filter, which ChatHistory to fetch.
     */
    where?: ChatHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatHistories to fetch.
     */
    orderBy?: ChatHistoryOrderByWithRelationInput | ChatHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatHistories.
     */
    cursor?: ChatHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatHistories.
     */
    distinct?: ChatHistoryScalarFieldEnum | ChatHistoryScalarFieldEnum[]
  }

  /**
   * ChatHistory findFirstOrThrow
   */
  export type ChatHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * Filter, which ChatHistory to fetch.
     */
    where?: ChatHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatHistories to fetch.
     */
    orderBy?: ChatHistoryOrderByWithRelationInput | ChatHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatHistories.
     */
    cursor?: ChatHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatHistories.
     */
    distinct?: ChatHistoryScalarFieldEnum | ChatHistoryScalarFieldEnum[]
  }

  /**
   * ChatHistory findMany
   */
  export type ChatHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * Filter, which ChatHistories to fetch.
     */
    where?: ChatHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatHistories to fetch.
     */
    orderBy?: ChatHistoryOrderByWithRelationInput | ChatHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChatHistories.
     */
    cursor?: ChatHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatHistories.
     */
    skip?: number
    distinct?: ChatHistoryScalarFieldEnum | ChatHistoryScalarFieldEnum[]
  }

  /**
   * ChatHistory create
   */
  export type ChatHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * The data needed to create a ChatHistory.
     */
    data: XOR<ChatHistoryCreateInput, ChatHistoryUncheckedCreateInput>
  }

  /**
   * ChatHistory createMany
   */
  export type ChatHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChatHistories.
     */
    data: ChatHistoryCreateManyInput | ChatHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChatHistory createManyAndReturn
   */
  export type ChatHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * The data used to create many ChatHistories.
     */
    data: ChatHistoryCreateManyInput | ChatHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChatHistory update
   */
  export type ChatHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * The data needed to update a ChatHistory.
     */
    data: XOR<ChatHistoryUpdateInput, ChatHistoryUncheckedUpdateInput>
    /**
     * Choose, which ChatHistory to update.
     */
    where: ChatHistoryWhereUniqueInput
  }

  /**
   * ChatHistory updateMany
   */
  export type ChatHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChatHistories.
     */
    data: XOR<ChatHistoryUpdateManyMutationInput, ChatHistoryUncheckedUpdateManyInput>
    /**
     * Filter which ChatHistories to update
     */
    where?: ChatHistoryWhereInput
    /**
     * Limit how many ChatHistories to update.
     */
    limit?: number
  }

  /**
   * ChatHistory updateManyAndReturn
   */
  export type ChatHistoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * The data used to update ChatHistories.
     */
    data: XOR<ChatHistoryUpdateManyMutationInput, ChatHistoryUncheckedUpdateManyInput>
    /**
     * Filter which ChatHistories to update
     */
    where?: ChatHistoryWhereInput
    /**
     * Limit how many ChatHistories to update.
     */
    limit?: number
  }

  /**
   * ChatHistory upsert
   */
  export type ChatHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * The filter to search for the ChatHistory to update in case it exists.
     */
    where: ChatHistoryWhereUniqueInput
    /**
     * In case the ChatHistory found by the `where` argument doesn't exist, create a new ChatHistory with this data.
     */
    create: XOR<ChatHistoryCreateInput, ChatHistoryUncheckedCreateInput>
    /**
     * In case the ChatHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChatHistoryUpdateInput, ChatHistoryUncheckedUpdateInput>
  }

  /**
   * ChatHistory delete
   */
  export type ChatHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
    /**
     * Filter which ChatHistory to delete.
     */
    where: ChatHistoryWhereUniqueInput
  }

  /**
   * ChatHistory deleteMany
   */
  export type ChatHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatHistories to delete
     */
    where?: ChatHistoryWhereInput
    /**
     * Limit how many ChatHistories to delete.
     */
    limit?: number
  }

  /**
   * ChatHistory without action
   */
  export type ChatHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatHistory
     */
    select?: ChatHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the ChatHistory
     */
    omit?: ChatHistoryOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ChatHistoryScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    chatName: 'chatName',
    history: 'history',
    updatedAt: 'updatedAt'
  };

  export type ChatHistoryScalarFieldEnum = (typeof ChatHistoryScalarFieldEnum)[keyof typeof ChatHistoryScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type ChatHistoryWhereInput = {
    AND?: ChatHistoryWhereInput | ChatHistoryWhereInput[]
    OR?: ChatHistoryWhereInput[]
    NOT?: ChatHistoryWhereInput | ChatHistoryWhereInput[]
    id?: StringFilter<"ChatHistory"> | string
    userId?: StringFilter<"ChatHistory"> | string
    chatName?: StringFilter<"ChatHistory"> | string
    history?: StringFilter<"ChatHistory"> | string
    updatedAt?: DateTimeFilter<"ChatHistory"> | Date | string
  }

  export type ChatHistoryOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    chatName?: SortOrder
    history?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChatHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ChatHistoryWhereInput | ChatHistoryWhereInput[]
    OR?: ChatHistoryWhereInput[]
    NOT?: ChatHistoryWhereInput | ChatHistoryWhereInput[]
    userId?: StringFilter<"ChatHistory"> | string
    chatName?: StringFilter<"ChatHistory"> | string
    history?: StringFilter<"ChatHistory"> | string
    updatedAt?: DateTimeFilter<"ChatHistory"> | Date | string
  }, "id">

  export type ChatHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    chatName?: SortOrder
    history?: SortOrder
    updatedAt?: SortOrder
    _count?: ChatHistoryCountOrderByAggregateInput
    _max?: ChatHistoryMaxOrderByAggregateInput
    _min?: ChatHistoryMinOrderByAggregateInput
  }

  export type ChatHistoryScalarWhereWithAggregatesInput = {
    AND?: ChatHistoryScalarWhereWithAggregatesInput | ChatHistoryScalarWhereWithAggregatesInput[]
    OR?: ChatHistoryScalarWhereWithAggregatesInput[]
    NOT?: ChatHistoryScalarWhereWithAggregatesInput | ChatHistoryScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChatHistory"> | string
    userId?: StringWithAggregatesFilter<"ChatHistory"> | string
    chatName?: StringWithAggregatesFilter<"ChatHistory"> | string
    history?: StringWithAggregatesFilter<"ChatHistory"> | string
    updatedAt?: DateTimeWithAggregatesFilter<"ChatHistory"> | Date | string
  }

  export type ChatHistoryCreateInput = {
    id?: string
    userId: string
    chatName?: string
    history: string
    updatedAt?: Date | string
  }

  export type ChatHistoryUncheckedCreateInput = {
    id?: string
    userId: string
    chatName?: string
    history: string
    updatedAt?: Date | string
  }

  export type ChatHistoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    chatName?: StringFieldUpdateOperationsInput | string
    history?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatHistoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    chatName?: StringFieldUpdateOperationsInput | string
    history?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatHistoryCreateManyInput = {
    id?: string
    userId: string
    chatName?: string
    history: string
    updatedAt?: Date | string
  }

  export type ChatHistoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    chatName?: StringFieldUpdateOperationsInput | string
    history?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatHistoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    chatName?: StringFieldUpdateOperationsInput | string
    history?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ChatHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    chatName?: SortOrder
    history?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChatHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    chatName?: SortOrder
    history?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChatHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    chatName?: SortOrder
    history?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}