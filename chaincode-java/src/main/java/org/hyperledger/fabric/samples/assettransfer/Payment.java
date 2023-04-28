/*
 * SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric.samples.assettransfer;

import java.util.Objects;

import org.hyperledger.fabric.contract.annotation.DataType;
import org.hyperledger.fabric.contract.annotation.Property;
import org.joda.time.DateTime;

import com.owlike.genson.annotation.JsonProperty;

@DataType()
public final class Payment {

    @Property()
    private final String paymentID;

    @Property()
    private final String orderID;

    @Property()
    private final String paymentType;

    @Property()
    private final String paymentReceiptURI;

    @Property()
    private final String paymentReceiptHash;

    @Property()
    private final DateTime paymentDateTime;

    @Property()
    private final Double paymentTotal;

    public String getPaymentID() {
        return paymentID;
    }

    public String getOrderID() {
        return orderID;
    }

    public DateTime getPaymentDateTime() {
        return paymentDateTime;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public Double getPaymentTotal() {
        return paymentTotal;
    }

    public String getPaymentReceiptURI() {
        return paymentReceiptURI;
    }

    public String getPaymentReceiptHash() {
        return paymentReceiptHash;
    }

    public Payment(@JsonProperty("paymentID") final String paymentID, @JsonProperty("orderID") final String orderID,
            @JsonProperty("paymentDateTime") final DateTime paymentDateTime,
            @JsonProperty("paymentType") final String paymentType,
            @JsonProperty("paymentTotal") final double paymentTotal,
            @JsonProperty("paymentReceiptURI") final String paymentReceiptURI,
            @JsonProperty("paymentReceiptHash") final String paymentReceiptHash) {
        this.paymentID = paymentID;
        this.orderID = orderID;
        this.paymentType = paymentType;
        this.paymentDateTime = paymentDateTime;
        this.paymentReceiptURI = paymentReceiptURI;
        this.paymentReceiptHash = paymentReceiptHash;
        this.paymentTotal = paymentTotal;
    }

    @Override
    public boolean equals(final Object obj) {
        if (this == obj) {
            return true;
        }

        if ((obj == null) || (getClass() != obj.getClass())) {
            return false;
        }

        Payment other = (Payment) obj;

        return Objects.deepEquals(
                new String[] { getPaymentID(), getOrderID(), getPaymentType(), getPaymentReceiptHash(),
                        getPaymentReceiptURI() },
                new String[] { other.getPaymentID(), other.getOrderID(),
                        other.getPaymentReceiptHash(), other.getPaymentReceiptURI() })
                &&
                Objects.deepEquals(
                        new DateTime[] { getPaymentDateTime() },
                        new DateTime[] { other.getPaymentDateTime() })
                && Objects.deepEquals(
                        new Double[] { getPaymentTotal() },
                        new Double[] { other.getPaymentTotal() });
    }

    @Override
    public int hashCode() {
        return Objects.hash(getPaymentID(), getOrderID(), getPaymentDateTime(), getPaymentType(), getPaymentTotal(),
                getPaymentReceiptHash(), getPaymentReceiptURI());
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + "@" + Integer.toHexString(hashCode()) + " [paymentID=" + paymentID
                + ", orderID=" + orderID + ", paymentReceiptHash=" + paymentReceiptHash + ", paymentReceiptURI="
                + paymentReceiptURI
                + ", paymentDateTime=" + paymentDateTime + ", paymentType=" + paymentType + ", paymentTotal="
                + paymentTotal + "]";
    }
}
