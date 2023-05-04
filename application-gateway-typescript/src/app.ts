/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';

const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));

// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'keystore'));

// Path to user certificate.
const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts', 'cert.pem'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();
const paymentId = `payment${Date.now()}`;

async function main(): Promise<void> {

    await displayInputParameters();

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName);

        // Initialize a set of payment data on the ledger using the chaincode 'InitLedger' function.
        await initLedger(contract);

        //Creo Aldo Giovanni e Giacomo.
        await createSubject(contract, 'Aldo', 'A1');
        await createSubject(contract, 'Giovanni', 'G1');
        await createSubject(contract, 'Giacomo', 'G2');

        // Create a new payment on the ledger.
        await createPayment(contract);

        await getAllPayments(contract);

        console.log('****************************************');
        console.log('VEDIAMO SE DIFFERENZIA GLI OGGETTI');
        console.log('****************************************');
        await getAllSubjects(contract);

        // Update an existing payment asynchronously.
        await transferPaymentAsync(contract);

        // Get the payment details by paymentID.
        await readPaymentByID(contract);

        // Update an payment which does not exist.
        await updateNonExistentPayment(contract)
    } finally {
        gateway.close();
        client.close();
    }
}

main().catch(error => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner(): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of payments on the ledger');

    await contract.submitTransaction('InitLedger');

    console.log('*** Transaction committed successfully');
}

async function getAllSubjects(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current subjects on the ledger');

    const resultBytes = await contract.evaluateTransaction('GetAllAssets');

    const resultJson = utf8Decoder.decode(resultBytes);

    const parsed = JSON.parse(resultJson);

    //const result = Object.fromEntries(Object.entries(parsed).filter( ([key]) => key.includes('taxPayerID')));

    //console.log('*** Questi sono gli utenti:', result);

    const array =[];
    for(let i = 0; i < parsed.length; i++){
        const elem = parsed[i];

        if(Object.keys(elem).includes('taxPayerID')){
            console.log('+++++++++ è un utente +++++++++');
            array.push(elem);
        }
    }

    console.log('*** Questi altri sono gli utenti:', array);
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function createSubject(contract: Contract, username : string, taxPayerID:string): Promise<void> {
    console.log(`\n--> Submit Transaction: CreateSubject, creates new user: ${username}`);

    await contract.submitTransaction(
        'CreateSubjects',
        `subject${Date.now()}`,
        username,
        taxPayerID
    );

    console.log('*** Transazione di creazione subject committed successfully');
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getAllPayments(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: GetAllAssets, function returns all the current payments on the ledger');

    const resultBytes = await contract.evaluateTransaction('GetAllAssets');

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function createPayment(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: CreatePayment, creates new payment with ID, Color, Size, Owner and AppraisedValue arguments');

    const date : Date = new Date(2023,5,2,0,0,0,0)

    console.log(`to ISO String ${date.toISOString()}`);
    console.log(`to UTC String ${date.toUTCString()}`);
    console.log(`simple to String ${date.toString()}`);

    await contract.submitTransaction(
        'CreatePayment',
        paymentId,
        'ordine15',
        'contanti',
        date.toISOString(),
        'Tomoko.com',
        'Tomoko',
        '3000',
    );

    console.log('*** Transaction committed successfully');
}

/**
 * Submit transaction asynchronously, allowing the application to process the smart contract response (e.g. update a UI)
 * while waiting for the commit notification.
 */
async function transferPaymentAsync(contract: Contract): Promise<void> {
    console.log('\n--> Async Submit Transaction: TransferPayment, updates existing payment owner');

    const commit = await contract.submitAsync('TransferPayment', {
        arguments: [paymentId, 'Saptha'],
    });
    const oldOwner = utf8Decoder.decode(commit.getResult());

    console.log(`*** Successfully submitted transaction to transfer ownership from ${oldOwner} to Saptha`);
    console.log('*** Waiting for transaction commit');

    const status = await commit.getStatus();
    if (!status.successful) {
        throw new Error(`Transaction ${status.transactionId} failed to commit with status code ${status.code}`);
    }

    console.log('*** Transaction committed successfully');
}

async function readPaymentByID(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: ReadPayment, function returns payment attributes');

    const resultBytes = await contract.evaluateTransaction('ReadPayment', paymentId);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * submitTransaction() will throw an error containing details of any error responses from the smart contract.
 */
async function updateNonExistentPayment(contract: Contract): Promise<void>{
    console.log('\n--> Submit Transaction: UpdatePayment payment70, payment70 does not exist and should return an error');

    try {
        await contract.submitTransaction(
            'UpdatePayment',
            'payment70',
            'blue',
            '5',
            Date.now().toString(),
            'Tomoko.com',
            'Tomoko',
            '300',
        );
        console.log('******** FAILED to return an error');
    } catch (error) {
        console.log('*** Successfully caught the error: \n', error);
    }
}

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
async function displayInputParameters(): Promise<void> {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certPath:          ${certPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}