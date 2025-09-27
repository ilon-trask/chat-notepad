import { LocalDBService } from "@/data/localDB/localDBService";
import { Entity } from "../interface";
import { Data } from "@/types/data/data";

export class DefaultDB extends LocalDBService<Data> implements Entity {}
