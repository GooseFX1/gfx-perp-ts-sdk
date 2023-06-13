import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface usizeFields {
  value: BN
}

export interface usizeJSON {
  value: string
}

export class usize {
  readonly value: BN

  constructor(fields: usizeFields) {
    this.value = fields.value
  }

  static layout(property?: string) {
    return borsh.struct([borsh.i64("value")], property)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new usize({
      value: obj.value,
    })
  }

  static toEncodable(fields: usizeFields) {
    return {
      value: fields.value,
    }
  }

  toJSON(): usizeJSON {
    return {
      value: this.value.toString(),
    }
  }

  static fromJSON(obj: usizeJSON): usize {
    return new usize({
      value: new BN(obj.value),
    })
  }

  toEncodable() {
    return usize.toEncodable(this)
  }
}
