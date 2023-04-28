/*
 * SPDX-License-Identifier: Apache-2.0
 */

package org.hyperledger.fabric.samples.assettransfer;

import static org.assertj.core.api.Assertions.assertThat;

import org.joda.time.DateTime;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

public final class AssetTest {

    @Nested
    class Equality {

        @Test
        public void isReflexive() {
            DateTime date1 = new DateTime(2000, 1, 1, 11, 11, 11);
            Payment asset = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");

            assertThat(asset).isEqualTo(asset);
        }

        @Test
        public void isSymmetric() {
            DateTime date1 = new DateTime(2000, 1, 1, 11, 11, 11);
            Payment assetA = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");
            Payment assetB = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");

            assertThat(assetA).isEqualTo(assetB);
            assertThat(assetB).isEqualTo(assetA);
        }

        @Test
        public void isTransitive() {
            DateTime date1 = new DateTime(2000, 1, 1, 11, 11, 11);
            Payment assetA = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");
            Payment assetB = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");
            Payment assetC = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");

            assertThat(assetA).isEqualTo(assetB);
            assertThat(assetB).isEqualTo(assetC);
            assertThat(assetA).isEqualTo(assetC);
        }

        @Test
        public void handlesInequality() {
            DateTime date1 = new DateTime(2000, 1, 1, 11, 11, 11);
            DateTime date2 = new DateTime(2001, 2, 2, 22, 22, 22);
            Payment assetA = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");
            Payment assetB = new Payment("payment2", "ordine2", date2, "Contanti",40.0, "hhtp://www.google.it", "do");

            assertThat(assetA).isNotEqualTo(assetB);
        }

        @Test
        public void handlesOtherObjects() {
            DateTime date1 = new DateTime(2000, 1, 1, 11, 11, 11);
            Payment assetA = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");
            String assetB = "not a asset";

            assertThat(assetA).isNotEqualTo(assetB);
        }

        @Test
        public void handlesNull() {
            DateTime date1 = new DateTime(2000, 1, 1, 11, 11, 11);
            Payment asset = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");

            assertThat(asset).isNotEqualTo(null);
        }
    }

    @Test
    public void toStringIdentifiesAsset() {
        DateTime date1 = new DateTime(2000, 1, 1, 11, 11, 11);
        Payment asset = new Payment("payment1", "ordine1", date1, "Carta",30.0, "hhtp://www.google.com", "de");

        assertThat(asset.toString())
                .isNotEqualTo("Asset@e04f6c53 [assetID=asset1, color=Blue, size=20, owner=Guy, appraisedValue=100]");
    }
}
