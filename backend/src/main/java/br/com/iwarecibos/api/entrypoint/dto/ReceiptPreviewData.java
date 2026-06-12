package br.com.iwarecibos.api.entrypoint.dto;

import br.com.iwarecibos.api.core.domain.DocumentType;
import br.com.iwarecibos.api.core.domain.ReceiptType;

import java.math.BigDecimal;

public record ReceiptPreviewData(
        String id,
        ReceiptType receiptType,
        BigDecimal amount,
        String formattedAmount,
        String payerName,
        String payerDocument,
        String formattedPayerDocument,
        DocumentType payerDocumentType,
        String amountInWords,
        String reference,
        String notes,
        String issueDate,
        String formattedIssueDate,
        String place,
        String issueDateText,
        String receiverName,
        String receiverDocument,
        String formattedReceiverDocument,
        DocumentType receiverDocumentType,
        String template,
        String issuerName,
        String issuerDocument,
        String issuerCity
) {
}