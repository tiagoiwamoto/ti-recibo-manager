package br.com.iwarecibos.api.core.entity;

import br.com.iwarecibos.api.core.domain.DocumentType;
import br.com.iwarecibos.api.core.domain.ReceiptType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "receipts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReceiptJpaEntity {

    @Id
    @Column(name = "id")
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "receipt_type", nullable = false)
    private ReceiptType receiptType;

    @Column(name = "amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "payer_name", nullable = false)
    private String payerName;

    @Column(name = "payer_document", nullable = false)
    private String payerDocument;

    @Enumerated(EnumType.STRING)
    @Column(name = "payer_document_type", nullable = false)
    private DocumentType payerDocumentType;

    @Column(name = "amount_in_words", nullable = false)
    private String amountInWords;

    @Column(name = "reference", nullable = false)
    private String reference;

    @Column(name = "notes")
    private String notes;

    @Column(name = "issue_date", nullable = false)
    private String issueDate;

    @Column(name = "place", nullable = false)
    private String place;

    @Column(name = "issue_date_text", nullable = false)
    private String issueDateText;

    @Column(name = "receiver_name", nullable = false)
    private String receiverName;

    @Column(name = "receiver_document", nullable = false)
    private String receiverDocument;

    @Enumerated(EnumType.STRING)
    @Column(name = "receiver_document_type", nullable = false)
    private DocumentType receiverDocumentType;

    @Column(name = "template", nullable = false)
    private String template;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ReceiptType getReceiptType() {
        return receiptType;
    }

    public void setReceiptType(ReceiptType receiptType) {
        this.receiptType = receiptType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPayerName() {
        return payerName;
    }

    public void setPayerName(String payerName) {
        this.payerName = payerName;
    }

    public String getPayerDocument() {
        return payerDocument;
    }

    public void setPayerDocument(String payerDocument) {
        this.payerDocument = payerDocument;
    }

    public DocumentType getPayerDocumentType() {
        return payerDocumentType;
    }

    public void setPayerDocumentType(DocumentType payerDocumentType) {
        this.payerDocumentType = payerDocumentType;
    }

    public String getAmountInWords() {
        return amountInWords;
    }

    public void setAmountInWords(String amountInWords) {
        this.amountInWords = amountInWords;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(String issueDate) {
        this.issueDate = issueDate;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public String getIssueDateText() {
        return issueDateText;
    }

    public void setIssueDateText(String issueDateText) {
        this.issueDateText = issueDateText;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverDocument() {
        return receiverDocument;
    }

    public void setReceiverDocument(String receiverDocument) {
        this.receiverDocument = receiverDocument;
    }

    public DocumentType getReceiverDocumentType() {
        return receiverDocumentType;
    }

    public void setReceiverDocumentType(DocumentType receiverDocumentType) {
        this.receiverDocumentType = receiverDocumentType;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }
}
