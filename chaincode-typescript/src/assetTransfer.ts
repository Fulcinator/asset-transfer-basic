/*
 * SPDX-License-Identifier: Apache-2.0
 */
// Deterministic JSON.stringify()
import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Payment} from './payment';

@Info({title: 'PaymentTransfer', description: 'Smart contract for trading payment'})
export class PaymentTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const payments: Payment[] = [
            {
                paymentID: 'payment1',
                orderID: 'ord1',
                paymentType: 'contanti',
                paymentDateTime: new Date(2000,1,1,3,3,3,0),
                paymentReceiptURI: 'Tomoko.com',
                paymentReceiptHash: 'Tomoko',
                paymentTotal: 300.0,
            },
            {
                paymentID: 'payment2',
                orderID: 'ord2',
                paymentType: 'POS',
                paymentDateTime: new Date(2020,1,1,3,3,3,0),
                paymentReceiptURI: 'Tomoko.com',
                paymentReceiptHash: 'Tomoko',
                paymentTotal: 30.0,
            },
            {
                paymentID: 'payment3',
                orderID: 'ord3',
                paymentType: 'rate',
                paymentDateTime: new Date(2023,1,1,3,3,3,0),
                paymentReceiptURI: 'Tomoko.com',
                paymentReceiptHash: 'Tomoko',
                paymentTotal: 300.0,
            },
            {
                paymentID: 'payment5',
                orderID: 'ord5',
                paymentType: 'contanti',
                paymentDateTime: new Date(2000,1,1,3,3,3,0),
                paymentReceiptURI: 'Tomoko.com',
                paymentReceiptHash: 'Tomoko',
                paymentTotal: 300.0,
            },
            {
                paymentID: 'payment6',
                orderID: 'ord6',
                paymentType: 'POS',
                paymentDateTime: new Date(2020,1,1,3,3,3,0),
                paymentReceiptURI: 'Tomoko.com',
                paymentReceiptHash: 'Tomoko',
                paymentTotal: 30.0,
            },
            {
                paymentID: 'payment4',
                orderID: 'ord4',
                paymentType: 'rate',
                paymentDateTime: new Date(2023,1,1,3,3,3,0),
                paymentReceiptURI: 'Tomoko.com',
                paymentReceiptHash: 'Tomoko',
                paymentTotal: 300.0,
            }
        ];

        for (const payment of payments) {
            payment.docType = 'payment';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(payment.paymentID, Buffer.from(stringify(sortKeysRecursive(payment))));
            console.info(`Asset ${payment.paymentID} initialized`);
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    @Transaction()
    public async CreatePayment(ctx: Context, paymentID: string, orderID: string, paymentType: string, paymentDate:String, uri: string, hash: string, total: number): Promise<void> {
        const exists = await this.PaymentExists(ctx, paymentID);
        if (exists) {
            throw new Error(`The asset ${paymentID} already exists`);
        }

        const asset = {
            paymentID: paymentID,
            orderID: orderID,
            paymentType: paymentType,
            paymentDateTime: paymentDate,
            paymentReceiptURI: uri,
            paymentReceiptHash: hash,
            paymentTotal: total,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(paymentID, Buffer.from(stringify(sortKeysRecursive(asset))));
    }

    // ReadAsset returns the asset stored in the world state with given id.
    @Transaction(false)
    public async ReadPayment(ctx: Context, id: string): Promise<string> {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    @Transaction()
    public async UpdatePayment(ctx: Context, paymentID: string, orderID: string, paymentType: string, paymentDate:String, uri: string, hash: string, total: number): Promise<void> {
        const exists = await this.PaymentExists(ctx, paymentID);
        if (!exists) {
            throw new Error(`The asset ${paymentID} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            paymentID: paymentID,
            orderID: orderID,
            paymentType: paymentType,
            paymentDateTime: paymentDate,
            paymentReceiptURI: uri,
            paymentReceiptHash: hash,
            paymentTotal: total,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(paymentID, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeletePayment(ctx: Context, id: string): Promise<void> {
        const exists = await this.PaymentExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async PaymentExists(ctx: Context, id: string): Promise<boolean> {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferPayment(ctx: Context, id: string, newOwner: string): Promise<string> {
        const assetString = await this.ReadPayment(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllPayments(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

}
