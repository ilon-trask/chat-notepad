/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as change from "../change.js";
import type * as data from "../data.js";
import type * as entities_chatServer from "../entities/chatServer.js";
import type * as entities_deafultServer from "../entities/deafultServer.js";
import type * as entities_entities from "../entities/entities.js";
import type * as entities_fileServer from "../entities/fileServer.js";
import type * as entities_interface from "../entities/interface.js";
import type * as entities_messageServer from "../entities/messageServer.js";
import type * as files from "../files.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  change: typeof change;
  data: typeof data;
  "entities/chatServer": typeof entities_chatServer;
  "entities/deafultServer": typeof entities_deafultServer;
  "entities/entities": typeof entities_entities;
  "entities/fileServer": typeof entities_fileServer;
  "entities/interface": typeof entities_interface;
  "entities/messageServer": typeof entities_messageServer;
  files: typeof files;
  helpers: typeof helpers;
  http: typeof http;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
