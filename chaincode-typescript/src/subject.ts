/*
  SPDX-License-Identifier: Apache-2.0
*/

import {Object, Property} from 'fabric-contract-api';

@Object()
export class Subject {

    @Property()
    public docType?: string;

    @Property()
    public userID: string;

    @Property()
    public username: string;

    @Property()
    public taxPayerID: string;
}
