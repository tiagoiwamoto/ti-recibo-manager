package br.com.iwarecibos.api.core.domain;

public record AppPreference(
        long id,
        String issuerName,
        String issuerDocument,
        DocumentType issuerDocumentType,
        String city,
        String logoPath,
        String receiptTemplate
) {
}
