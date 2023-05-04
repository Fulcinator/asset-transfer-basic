/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

export class ProductIdentifier {
    productInstanceID: string;
}

export enum PaymentState {
    WAITING_FOR_PAYMENT,
    COMPLETED
}

@Object()
export class Order {

    @Property()
    public docType?: string;

    @Property()
    public orderID: string;

    @Property()
    public sellerSubjectID: string;

    @Property()
    public buyerSubjectID: string;

    @Property()
    public total: number;

    @Property()
    public paymentAdvanced: number;

    @Property()
    public dueDate: Date;

    @Property()
    public dateTime: Date;

    @Property()
    public contractHash: string;

    @Property()
    public contractURI: string;

    @Property()
    public state: PaymentState;

    @Property()
    public products: ProductIdentifier[];
}
