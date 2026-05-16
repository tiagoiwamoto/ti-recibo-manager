package br.com.iwarecibos.api.core.entity;

import br.com.iwarecibos.api.core.domain.DocumentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "app_config")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppPreferenceJpaEntity {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "issuer_name", nullable = false)
    private String issuerName;

    @Column(name = "issuer_document", nullable = false)
    private String issuerDocument;

    @Enumerated(EnumType.STRING)
    @Column(name = "issuer_document_type", nullable = false)
    private DocumentType issuerDocumentType;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "logo_path")
    private String logoPath;

    @Column(name = "receipt_template", nullable = false)
    private String receiptTemplate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIssuerName() {
        return issuerName;
    }

    public void setIssuerName(String issuerName) {
        this.issuerName = issuerName;
    }

    public String getIssuerDocument() {
        return issuerDocument;
    }

    public void setIssuerDocument(String issuerDocument) {
        this.issuerDocument = issuerDocument;
    }

    public DocumentType getIssuerDocumentType() {
        return issuerDocumentType;
    }

    public void setIssuerDocumentType(DocumentType issuerDocumentType) {
        this.issuerDocumentType = issuerDocumentType;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getLogoPath() {
        return logoPath;
    }

    public void setLogoPath(String logoPath) {
        this.logoPath = logoPath;
    }

    public String getReceiptTemplate() {
        return receiptTemplate;
    }

    public void setReceiptTemplate(String receiptTemplate) {
        this.receiptTemplate = receiptTemplate;
    }
}
