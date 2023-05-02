/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Payment {

    @Property()
    public docType?: string;

    @Property()
    public paymentID: string; //paymentID

    @Property()
    public orderID: string;

    @Property()
    public paymentType: string;

    @Property()
    public paymentDateTime: Date;

    @Property()
    public paymentReceiptURI: string;

    @Property()
    public paymentReceiptHash: string;

    @Property()
    public paymentTotal: number;
}
