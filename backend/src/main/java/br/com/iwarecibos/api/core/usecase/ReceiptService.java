package br.com.iwarecibos.api.core.usecase;

import br.com.iwarecibos.api.core.domain.Receipt;
import br.com.iwarecibos.api.core.entity.ReceiptJpaEntity;
import br.com.iwarecibos.api.core.repository.SpringDataReceiptRepository;
import br.com.iwarecibos.api.entrypoint.dto.ReceiptRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ReceiptService {

    private final SpringDataReceiptRepository receiptRepository;
    private final AppPreferenceUsecase appPreferenceUsecase;

    public List<Receipt> list(String q) {
        List<ReceiptJpaEntity> entities = q == null || q.isBlank()
                ? receiptRepository.findAllByOrderByIssueDateDescIdDesc()
                : receiptRepository.search(sanitizeDocument(q).isBlank() ? q.trim() : sanitizeDocument(q));
        return entities.stream().map(this::toDomain).toList();
    }

    public Receipt get(String id) {
        return receiptRepository.findById(id)
                .map(this::toDomain)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recibo nao encontrado"));
    }

    public Receipt create(ReceiptRequest request) {
        ReceiptJpaEntity receipt = toEntity(nextSequentialId(), request);
        receiptRepository.save(receipt);
        return toDomain(receipt);
    }

    public Receipt update(String id, ReceiptRequest request) {
        get(id);
        ReceiptJpaEntity receipt = toEntity(id, request);
        receiptRepository.save(receipt);
        return toDomain(receipt);
    }

    public void delete(String id) {
        get(id);
        receiptRepository.deleteById(id);
    }

    public String renderPreview(String id) {
        var config = appPreferenceUsecase.get();
        Receipt receipt = get(id);
        String valorFormatado = formatCurrency(receipt.amount());
        String dataFormatada = formatDate(receipt.issueDate());
        String docPagador = formatDocument(receipt.payerDocument(), receipt.payerDocumentType().name());
        String docRecebedor = formatDocument(receipt.receiverDocument(), receipt.receiverDocumentType().name());

        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Recibo %s</title>
                  <style>
                    :root { --ink: #1f2937; --muted: #6b7280; --line: #d1d5db; --accent: #0f172a; --bg: #f8fafc; }
                    body { font-family: "Inter", "Segoe UI", Arial, sans-serif; background: var(--bg); color: var(--ink); margin: 0; padding: 28px; }
                    .page { max-width: 860px; margin: 0 auto; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 34px 38px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08); }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 22px; }
                    .title-wrap h1 { margin: 0; font-size: 1.5rem; letter-spacing: .04em; color: var(--accent); }
                    .subtitle { margin-top: 6px; color: var(--muted); font-size: .92rem; text-transform: uppercase; letter-spacing: .08em; }
                    .id { text-align: right; font-size: .95rem; font-weight: 600; color: var(--accent); }
                    p { font-size: 1.02rem; line-height: 1.82; margin: 0 0 12px; text-align: justify; }
                    .field { font-weight: 700; color: #111827; }
                    .summary { margin-top: 18px; border: 1px solid var(--line); border-radius: 10px; padding: 12px 14px; background: #fcfcfd; }
                    .summary-row { margin: 6px 0; }
                    .location-date { margin-top: 22px; text-align: right; font-weight: 500; }
                    .signatures { margin-top: 74px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 72px; }
                    .signature-card { min-height: 96px; display: flex; flex-direction: column; justify-content: flex-end; }
                    .signature-line { border-top: 2px solid #111827; padding-top: 8px; text-align: center; font-size: .95rem; line-height: 1.45; }
                    .signature-role { display: block; color: var(--muted); font-size: .82rem; text-transform: uppercase; letter-spacing: .08em; margin-top: 3px; }
                    .highlight { font-weight: 800; }
                    @media print {
                      body { padding: 0; background: #fff; }
                      .page { border: none; border-radius: 0; max-width: none; padding: 0; box-shadow: none; }
                    }
                  </style>
                </head>
                <body>
                  <main class="page">
                    <section class="header">
                      <div class="title-wrap">
                        <h1>RECIBO</h1>
                        <div class="subtitle">Comprovante de Quitacao</div>
                      </div>
                      <div class="id">Recibo nº %s</div>
                    </section>
                    <section>
                      <p>
                        Recebi(emos) de <span class="field">%s</span>, inscrito(a) no documento
                        <span class="field highlight">%s</span>, a quantia de
                        <span class="field highlight">%s</span> (<span class="field">%s</span>),
                        referente a <span class="field highlight">%s</span>.
                      </p>
                      <p>Para clareza e quitacao, firmo(amos) o presente recibo.</p>
                      <div class="summary">
                        <div class="summary-row"><span class="field">Valor:</span> %s</div>
                        <div class="summary-row"><span class="field">Recebedor:</span> %s</div>
                        <div class="summary-row"><span class="field">Documento do recebedor:</span> %s</div>
                        <div class="summary-row"><span class="field">Emitente padrao:</span> %s</div>
                        <div class="summary-row"><span class="field">Observacoes:</span> %s</div>
                      </div>
                      <p class="location-date">%s, <span class="highlight">%s</span>.</p>
                    </section>
                    <section class="signatures">
                      <div class="signature-card">
                        <div class="signature-line">
                          %s<br>
                          %s
                          <span class="signature-role">Assinatura do Pagador</span>
                        </div>
                      </div>
                      <div class="signature-card">
                        <div class="signature-line">
                          %s<br>
                          %s
                          <span class="signature-role">Assinatura do Recebedor</span>
                        </div>
                      </div>
                    </section>
                  </main>
                </body>
                </html>
                """.formatted(
                escape(receipt.id()),
                escape(receipt.id()),
                escape(receipt.payerName()),
                escape(docPagador),
                escape(valorFormatado),
                escape(receipt.amountInWords()),
                escape(receipt.reference()),
                escape(valorFormatado),
                escape(receipt.receiverName()),
                escape(docRecebedor),
                escape(config.issuerName()),
                escape(receipt.notes() == null ? "-" : receipt.notes()),
                escape(receipt.place()),
                escape(dataFormatada),
                escape(receipt.payerName()),
                escape(docPagador),
                escape(receipt.receiverName()),
                escape(docRecebedor)
        );
    }

    private String formatCurrency(BigDecimal amount) {
        NumberFormat formatter = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));
        return formatter.format(amount);
    }

    private String formatDate(LocalDate date) {
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    private String formatDocument(String document, String type) {
        String digits = sanitizeDocument(document);
        if ("CPF".equals(type) && digits.length() == 11) {
            return digits.replaceFirst("(\\d{3})(\\d{3})(\\d{3})(\\d{2})", "$1.$2.$3-$4");
        }
        if ("CNPJ".equals(type) && digits.length() == 14) {
            return digits.replaceFirst("(\\d{2})(\\d{3})(\\d{3})(\\d{4})(\\d{2})", "$1.$2.$3/$4-$5");
        }
        return digits;
    }

    private ReceiptJpaEntity toEntity(String id, ReceiptRequest request) {
        LocalDate issueDate = LocalDate.parse(request.issueDate());
        BigDecimal amount = request.amount().setScale(2, RoundingMode.HALF_UP);

        return new ReceiptJpaEntity(
                id,
                request.receiptType(),
                amount,
                request.payerName().trim(),
                sanitizeDocument(request.payerDocument()),
                request.payerDocumentType(),
                resolveAmountInWords(amount, request.amountInWords()),
                request.reference().trim(),
                blankToNull(request.notes()),
                request.issueDate(),
                request.place().trim(),
                resolveIssueDateText(issueDate, request.issueDateText()),
                request.receiverName().trim(),
                sanitizeDocument(request.receiverDocument()),
                request.receiverDocumentType()
        );
    }

    private Receipt toDomain(ReceiptJpaEntity entity) {
        return new Receipt(
                entity.getId(),
                entity.getReceiptType(),
                entity.getAmount(),
                entity.getPayerName(),
                entity.getPayerDocument(),
                entity.getPayerDocumentType(),
                entity.getAmountInWords(),
                entity.getReference(),
                entity.getNotes(),
                LocalDate.parse(entity.getIssueDate()),
                entity.getPlace(),
                entity.getIssueDateText(),
                entity.getReceiverName(),
                entity.getReceiverDocument(),
                entity.getReceiverDocumentType()
        );
    }

    private String nextSequentialId() {
        Integer max = receiptRepository.findMaxNumericId();
        return String.valueOf((max == null ? 0 : max) + 1);
    }

    private String sanitizeDocument(String value) {
        return value.replaceAll("[^0-9]", "");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String resolveAmountInWords(BigDecimal amount, String value) {
        if (value != null && !value.isBlank()) {
            return value.trim();
        }
        return amountToWords(amount);
    }

    private String resolveIssueDateText(LocalDate issueDate, String value) {
        if (value != null && !value.isBlank()) {
            return value.trim();
        }
        return dateToWords(issueDate);
    }

    private String amountToWords(BigDecimal amount) {
        long inteiro = amount.longValue();
        int centavos = amount.remainder(BigDecimal.ONE).movePointRight(2).abs().intValue();

        String reais = numberToWords(inteiro) + (inteiro == 1 ? " real" : " reais");
        if (centavos == 0) {
            return reais;
        }

        String centavosTexto = numberToWords(centavos) + (centavos == 1 ? " centavo" : " centavos");
        return reais + " e " + centavosTexto;
    }

    private String dateToWords(LocalDate date) {
        String[] meses = {
                "janeiro", "fevereiro", "marco", "abril", "maio", "junho",
                "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
        };

        return date.getDayOfMonth() + " de " + meses[date.getMonthValue() - 1] + " de " + numberToWords(date.getYear());
    }

    private String numberToWords(long value) {
        if (value == 0) {
            return "zero";
        }

        if (value < 0) {
            return "menos " + numberToWords(Math.abs(value));
        }

        if (value < 1000) {
            return belowOneThousand((int) value);
        }

        if (value < 1_000_000) {
            long milhares = value / 1000;
            long resto = value % 1000;
            String prefixo = milhares == 1 ? "mil" : belowOneThousand((int) milhares) + " mil";
            return resto == 0 ? prefixo : prefixo + connector(resto) + belowOneThousand((int) resto);
        }

        long milhoes = value / 1_000_000;
        long resto = value % 1_000_000;
        String prefixo = milhoes == 1 ? "um milhao" : numberToWords(milhoes) + " milhoes";
        return resto == 0 ? prefixo : prefixo + connector(resto) + numberToWords(resto);
    }

    private String belowOneThousand(int value) {
        if (value == 100) {
            return "cem";
        }

        int centenas = value / 100;
        int resto = value % 100;

        String[] centenasTexto = {
                "", "cento", "duzentos", "trezentos", "quatrocentos",
                "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"
        };

        if (centenas == 0) {
            return belowOneHundred(resto);
        }

        return resto == 0 ? centenasTexto[centenas] : centenasTexto[centenas] + " e " + belowOneHundred(resto);
    }

    private String belowOneHundred(int value) {
        String[] especiais = {
                "dez", "onze", "doze", "treze", "quatorze",
                "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"
        };
        String[] dezenas = {
                "", "", "vinte", "trinta", "quarenta",
                "cinquenta", "sessenta", "setenta", "oitenta", "noventa"
        };
        String[] unidades = {
                "", "um", "dois", "tres", "quatro",
                "cinco", "seis", "sete", "oito", "nove"
        };

        if (value < 10) {
            return unidades[value];
        }

        if (value < 20) {
            return especiais[value - 10];
        }

        int dezena = value / 10;
        int unidade = value % 10;
        return unidade == 0 ? dezenas[dezena] : dezenas[dezena] + " e " + unidades[unidade];
    }

    private String connector(long remainder) {
        return remainder < 100 || remainder % 100 == 0 ? " e " : ", ";
    }

    private String escape(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
