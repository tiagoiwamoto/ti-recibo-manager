package br.com.iwarecibos.api.core.domain;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Receipt(
        String id,
        ReceiptType receiptType,
        BigDecimal amount,
        String payerName,
        String payerDocument,
        DocumentType payerDocumentType,
        String amountInWords,
        String reference,
        String notes,
        LocalDate issueDate,
        String place,
        String issueDateText,
        String receiverName,
        String receiverDocument,
        DocumentType receiverDocumentType
) {
}
