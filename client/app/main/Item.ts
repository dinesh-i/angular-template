/// <reference path="../../typings/tsd.d.ts" />

module main {
  export class Item {

    constructor(public content:string) {
      this.createdAt = new Date();
    }

    createdAt:Date;
  }
}
