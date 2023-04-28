/*
 * SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric.samples.assettransfer;

import java.util.ArrayList;
import java.util.List;

import org.hyperledger.fabric.contract.Context;
import org.hyperledger.fabric.contract.ContractInterface;
import org.hyperledger.fabric.contract.annotation.Contact;
import org.hyperledger.fabric.contract.annotation.Contract;
import org.hyperledger.fabric.contract.annotation.Default;
import org.hyperledger.fabric.contract.annotation.Info;
import org.hyperledger.fabric.contract.annotation.License;
import org.hyperledger.fabric.contract.annotation.Transaction;
import org.hyperledger.fabric.shim.ChaincodeException;
import org.hyperledger.fabric.shim.ChaincodeStub;
import org.hyperledger.fabric.shim.ledger.KeyValue;
import org.hyperledger.fabric.shim.ledger.QueryResultsIterator;
import org.joda.time.DateTime;

import com.owlike.genson.Genson;

@Contract(name = "basic", info = @Info(title = "Payment Transfer", description = "The hyperlegendary asset transfer", version = "0.0.1-SNAPSHOT", license = @License(name = "Apache 2.0 License", url = "http://www.apache.org/licenses/LICENSE-2.0.html"), contact = @Contact(email = "a.transfer@example.com", name = "Adrian Transfer", url = "https://hyperledger.example.com")))
@Default
public final class PaymentTransfer implements ContractInterface {

    private final Genson genson = new Genson();

    private enum PaymentTransferErrors {
        ASSET_NOT_FOUND,
        ASSET_ALREADY_EXISTS
    }

    /**
     * Creates some initial payments on the ledger.
     *
     * @param ctx the transaction context
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public void InitLedger(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();

        DateTime date1 = new DateTime(1996, 10, 20, 12, 30);

        CreatePayment(ctx, "payment1", "ordine1", date1, "Carta",
                30.0, "hhtp://www.google.com", "de");
        CreatePayment(ctx, "payment2", "ordine1", date1, "Contanti",
                50.0, "hhtp://www.google.com", "de");
        /*
         * CreatePayment(ctx, "payment2", "red", 5, "Brad", 400);
         * CreatePayment(ctx, "payment3", "green", 10, "Jin Soo", 500);
         * CreatePayment(ctx, "payment4", "yellow", 10, "Max", 600);
         * CreatePayment(ctx, "payment5", "black", 15, "Adrian", 700);
         * CreatePayment(ctx, "payment6", "white", 15, "Michel", 700);
         */

    }

    /**
     * Creates a new payment on the ledger.
     *
     * @param ctx             the transaction context
     * @param paymentID       the ID of the new payment
     * @param orderID         the orderID of the new payment
     * @param paymentDateTime the paymentDateTime for the new payment
     * @param paymentType     the paymentType of the new payment
     * @param paymentTotal    the paymentTotal of the new payment
     * @return the created payment
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public Payment CreatePayment(final Context ctx, final String paymentID, final String orderID,
            final DateTime paymentDateTime,
            final String paymentType, final double paymentTotal, final String paymentReceiptURI,
            final String paymentReceiptHash) {
        ChaincodeStub stub = ctx.getStub();

        if (PaymentExists(ctx, paymentID)) {
            String errorMessage = String.format("Payment %s already exists", paymentID);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, PaymentTransferErrors.ASSET_ALREADY_EXISTS.toString());
        }

        Payment payment = new Payment(paymentID, orderID, paymentDateTime, paymentType, paymentTotal, paymentReceiptURI,
                paymentReceiptHash);
        // Use Genson to convert the Payment into string, sort it alphabetically and
        // serialize it into a json string
        String sortedJson = genson.serialize(payment);
        stub.putStringState(paymentID, sortedJson);

        return payment;
    }

    /**
     * Retrieves an payment with the specified ID from the ledger.
     *
     * @param ctx       the transaction context
     * @param paymentID the ID of the payment
     * @return the payment found on the ledger if there was one
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public Payment ReadPayment(final Context ctx, final String paymentID) {
        ChaincodeStub stub = ctx.getStub();
        String paymentJSON = stub.getStringState(paymentID);

        if (paymentJSON == null || paymentJSON.isEmpty()) {
            String errorMessage = String.format("Payment %s does not exist", paymentID);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, PaymentTransferErrors.ASSET_NOT_FOUND.toString());
        }

        Payment payment = genson.deserialize(paymentJSON, Payment.class);
        return payment;
    }

    /**
     * Updates the properties of an payment on the ledger.
     *
     * @param ctx                the transaction context
     * @param paymentID          the ID of the payment being updated
     * @param orderID            the orderID of the payment being updated
     * @param paymentDateTime    the paymentDateTime of the payment being updated
     * @param paymentType        the paymentType of the payment being updated
     * @param paymentTotal       the paymentTotal of the payment being updated
     * @param paymentReceiptURI  the paymentReceiptURI of the payment being updated
     * @param paymentReceiptHash the paymentReceiptHash of the payment being updated
     * @return the transferred payment
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public Payment UpdatePayment(final Context ctx, final String paymentID, final String orderID,
            final DateTime paymentDateTime,
            final String paymentType, final double paymentTotal, final String paymentReceiptURI,
            final String paymentReceiptHash) {
        ChaincodeStub stub = ctx.getStub();

        if (!PaymentExists(ctx, paymentID)) {
            String errorMessage = String.format("Payment %s does not exist", paymentID);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, PaymentTransferErrors.ASSET_NOT_FOUND.toString());
        }

        Payment newPayment = new Payment(paymentID, orderID, paymentDateTime, paymentType, paymentTotal,
                paymentReceiptURI, paymentReceiptHash);
        // Use Genson to convert the Payment into string, sort it alphabetically and
        // serialize it into a json string
        String sortedJson = genson.serialize(newPayment);
        stub.putStringState(paymentID, sortedJson);
        return newPayment;
    }

    /**
     * Deletes payment on the ledger.
     *
     * @param ctx       the transaction context
     * @param paymentID the ID of the payment being deleted
     */
    @Transaction(intent = Transaction.TYPE.SUBMIT)
    public void DeletePayment(final Context ctx, final String paymentID) {
        ChaincodeStub stub = ctx.getStub();

        if (!PaymentExists(ctx, paymentID)) {
            String errorMessage = String.format("Payment %s does not exist", paymentID);
            System.out.println(errorMessage);
            throw new ChaincodeException(errorMessage, PaymentTransferErrors.ASSET_NOT_FOUND.toString());
        }

        stub.delState(paymentID);
    }

    /**
     * Checks the existence of the payment on the ledger
     *
     * @param ctx       the transaction context
     * @param paymentID the ID of the payment
     * @return boolean indicating the existence of the payment
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public boolean PaymentExists(final Context ctx, final String paymentID) {
        ChaincodeStub stub = ctx.getStub();
        String paymentJSON = stub.getStringState(paymentID);

        return (paymentJSON != null && !paymentJSON.isEmpty());
    }

    /**
     * Changes the paymentType of a payment on the ledger.
     *
     * @param ctx       the transaction context
     * @param paymentID the ID of the payment being transferred
     * @param newOwner  the new paymentType
     * @return the old paymentType
     */
    /*
     * @Transaction(intent = Transaction.TYPE.SUBMIT)
     * public String TransferPayment(final Context ctx, final String paymentID,
     * final String newOwner) {
     * ChaincodeStub stub = ctx.getStub();
     * String paymentJSON = stub.getStringState(paymentID);
     * 
     * if (paymentJSON == null || paymentJSON.isEmpty()) {
     * String errorMessage = String.format("Payment %s does not exist", paymentID);
     * System.out.println(errorMessage);
     * throw new ChaincodeException(errorMessage,
     * PaymentTransferErrors.ASSET_NOT_FOUND.toString());
     * }
     * 
     * Payment payment = genson.deserialize(paymentJSON, Payment.class);
     * 
     * Payment newPayment = new Payment(payment.getPaymentID(),
     * payment.getOrderID(), payment.getPaymentDateTime(), newOwner,
     * payment.getPaymentTotal());
     * // Use a Genson to conver the Payment into string, sort it alphabetically and
     * // serialize it into a json string
     * String sortedJson = genson.serialize(newPayment);
     * stub.putStringState(paymentID, sortedJson);
     * 
     * return payment.getPaymentType();
     * }
     */

    /**
     * Retrieves all payments from the ledger.
     *
     * @param ctx the transaction context
     * @return array of payments found on the ledger
     */
    @Transaction(intent = Transaction.TYPE.EVALUATE)
    public String GetAllPayments(final Context ctx) {
        ChaincodeStub stub = ctx.getStub();

        List<Payment> queryResults = new ArrayList<Payment>();

        // To retrieve all payments from the ledger use getStateByRange with empty
        // startKey & endKey.
        // Giving empty startKey & endKey is interpreted as all the keys from beginning
        // to end.
        // As another example, if you use startKey = 'payment0', endKey = 'payment9' ,
        // then getStateByRange will retrieve payment with keys between payment0
        // (inclusive)
        // and payment9 (exclusive) in lexical order.
        QueryResultsIterator<KeyValue> results = stub.getStateByRange("", "");

        for (KeyValue result : results) {
            Payment payment = genson.deserialize(result.getStringValue(), Payment.class);
            System.out.println(payment);
            queryResults.add(payment);
        }

        final String response = genson.serialize(queryResults);

        return response;
    }
}
