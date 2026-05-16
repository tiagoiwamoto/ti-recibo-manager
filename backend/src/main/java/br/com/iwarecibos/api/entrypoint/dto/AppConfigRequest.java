package br.com.iwarecibos.api.entrypoint.dto;

import br.com.iwarecibos.api.core.domain.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AppConfigRequest(
        @NotBlank @Size(min = 5, max = 160) String issuerName,
        @NotBlank @Size(min = 11, max = 20) String issuerDocument,
        @NotNull DocumentType issuerDocumentType,
        @NotBlank @Size(min = 2, max = 80) String city,
        String logoPath,
        @NotBlank @Size(min = 3, max = 40) String receiptTemplate
) {
}
