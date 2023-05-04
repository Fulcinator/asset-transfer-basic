/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';



@Object()
export class ProductInstance {

    @Property()
    public docType?: string;

    @Property()
    public productInstanceID: string; //paymentID

    @Property()
    public productID: string;

    @Property()
    public name: string;

    @Property()
    public measure: string;

    @Property()
    public amount: number;
}
