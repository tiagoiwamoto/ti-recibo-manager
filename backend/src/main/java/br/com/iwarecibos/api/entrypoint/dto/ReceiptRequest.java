package br.com.iwarecibos.api.entrypoint.dto;

import br.com.iwarecibos.api.core.domain.DocumentType;
import br.com.iwarecibos.api.core.domain.ReceiptType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ReceiptRequest(
        @NotNull ReceiptType receiptType,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotBlank @Size(min = 5, max = 160) String payerName,
        @NotBlank @Size(min = 11, max = 20) String payerDocument,
        @NotNull DocumentType payerDocumentType,
        @Size(max = 255) String amountInWords,
        @NotBlank @Size(min = 5, max = 255) String reference,
        String notes,
        @NotBlank String issueDate,
        @NotBlank @Size(min = 2, max = 120) String place,
        @Size(max = 120) String issueDateText,
        @NotBlank @Size(min = 5, max = 160) String receiverName,
        @NotBlank @Size(min = 11, max = 20) String receiverDocument,
        @NotNull DocumentType receiverDocumentType
) {
}
