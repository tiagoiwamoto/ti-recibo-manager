package br.com.iwarecibos.api.core.usecase;

import br.com.iwarecibos.api.core.domain.AppPreference;
import br.com.iwarecibos.api.core.domain.DocumentType;
import br.com.iwarecibos.api.core.domain.Receipt;
import br.com.iwarecibos.api.core.entity.ReceiptJpaEntity;
import br.com.iwarecibos.api.core.repository.SpringDataReceiptRepository;
import br.com.iwarecibos.api.entrypoint.dto.ReceiptPreviewData;
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
        return renderPreview(id, null);
    }

    public String renderPreview(String id, String templateOverride) {
        Receipt receipt = get(id);
        String template = (templateOverride != null && !templateOverride.isBlank())
                ? templateOverride
                : receipt.template();
        return render(receipt, template);
    }

    public String renderPreviewFromRequest(ReceiptRequest request, String templateOverride) {
        Receipt receipt = transientReceipt(request);
        String template = (templateOverride != null && !templateOverride.isBlank())
                ? templateOverride
                : request.template();
        return render(receipt, template);
    }

    public ReceiptPreviewData getPreviewData(String id) {
        return getPreviewData(id, null);
    }

    public ReceiptPreviewData getPreviewData(String id, String templateOverride) {
        Receipt receipt = get(id);
        String template = (templateOverride != null && !templateOverride.isBlank())
                ? templateOverride
                : receipt.template();
        return buildPreviewData(receipt, template);
    }

    public ReceiptPreviewData getPreviewDataFromRequest(ReceiptRequest request, String templateOverride) {
        Receipt receipt = transientReceipt(request);
        String template = (templateOverride != null && !templateOverride.isBlank())
                ? templateOverride
                : request.template();
        return buildPreviewData(receipt, template);
    }

    private Receipt transientReceipt(ReceiptRequest request) {
        LocalDate issueDate = parseDateOrNow(request.issueDate());
        BigDecimal amount = request.amount() == null
                ? BigDecimal.ZERO
                : request.amount().setScale(2, RoundingMode.HALF_UP);

        return new Receipt(
                "PREVIEW",
                request.receiptType(),
                amount,
                nz(request.payerName()),
                nz(request.payerDocument()),
                request.payerDocumentType() == null ? DocumentType.CPF : request.payerDocumentType(),
                resolveAmountInWords(amount, request.amountInWords()),
                nz(request.reference()),
                blankToNull(request.notes()),
                issueDate,
                nz(request.place()),
                resolveIssueDateText(issueDate, request.issueDateText()),
                nz(request.receiverName()),
                nz(request.receiverDocument()),
                request.receiverDocumentType() == null ? DocumentType.CPF : request.receiverDocumentType(),
                resolveTemplate(request.template())
        );
    }

    private ReceiptPreviewData buildPreviewData(Receipt receipt, String template) {
        var config = appPreferenceUsecase.get();
        String valorFormatado = formatCurrency(receipt.amount());
        String dataFormatada = formatDate(receipt.issueDate());
        String docPagador = formatDocument(receipt.payerDocument(), receipt.payerDocumentType().name());
        String docRecebedor = formatDocument(receipt.receiverDocument(), receipt.receiverDocumentType().name());

        return new ReceiptPreviewData(
                receipt.id(),
                receipt.receiptType(),
                receipt.amount(),
                valorFormatado,
                receipt.payerName(),
                receipt.payerDocument(),
                docPagador,
                receipt.payerDocumentType(),
                receipt.amountInWords(),
                receipt.reference(),
                receipt.notes(),
                receipt.issueDate().toString(),
                dataFormatada,
                receipt.place(),
                receipt.issueDateText(),
                receipt.receiverName(),
                receipt.receiverDocument(),
                docRecebedor,
                receipt.receiverDocumentType(),
                template,
                config.issuerName(),
                config.issuerDocument(),
                config.city()
        );
    }

    private String render(Receipt receipt, String template) {
        var config = appPreferenceUsecase.get();
        String valorFormatado = formatCurrency(receipt.amount());
        String dataFormatada = formatDate(receipt.issueDate());
        String docPagador = formatDocument(receipt.payerDocument(), receipt.payerDocumentType().name());
        String docRecebedor = formatDocument(receipt.receiverDocument(), receipt.receiverDocumentType().name());

        return switch (resolveTemplate(template)) {
            case "Padrao" -> renderReciboPadrao(receipt, valorFormatado, dataFormatada, docPagador, docRecebedor);
            case "Completo" -> renderReciboCompleto(receipt, config, valorFormatado, dataFormatada, docPagador, docRecebedor);
            default -> renderReciboPadrao(receipt, valorFormatado, dataFormatada, docPagador, docRecebedor);
        };
    }

    private String renderReciboPadrao(Receipt receipt, String valorFormatado,
                                      String dataFormatada, String docPagador, String docRecebedor){
        return """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Recibo</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background: #f5f5f5;
                        padding: 20px;
                    }
            
                    .recibo {
                        background: #fff;
                        max-width: 600px;
                        margin: auto;
                        padding: 20px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                    }
            
                    .header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
            
                    .header h1 {
                        margin: 0;
                    }
            
                    .info {
                        margin-bottom: 10px;
                    }
            
                    .info strong {
                        display: inline-block;
                        width: 120px;
                    }
            
                    .descricao {
                        margin: 20px 0;
                        line-height: 1.5;
                    }
            
                    .valor {
                        font-size: 20px;
                        font-weight: bold;
                        text-align: right;
                        margin-top: 20px;
                    }
            
                    .assinatura {
                        margin-top: 40px;
                        text-align: center;
                    }
            
                    .linha {
                        border-top: 1px solid #000;
                        width: 200px;
                        margin: 10px auto;
                    }
            
                    @media print {
                        body {
                            background: white;
                        }
                        .recibo {
                            border: none;
                        }
                    }
                </style>
            </head>
            <body>
            
            <div class="recibo">
                <div class="header">
                    <h1>RECIBO - %s</h1>
                </div>
            
                <div class="info">
                    <p><strong>Data:</strong> %s</p>
                    <p><strong>Recebido de:</strong> %s</p>
                    <p><strong>CPF/CNPJ:</strong> %s</p>
                </div>
            
                <div class="descricao">
                    Recebi a quantia de <strong>R$ %s</strong> (%s),
                    referente a %s.
                </div>
            
                <div class="valor">
                    Total: R$ %s
                </div>
            
                <div class="assinatura">
                    <div class="linha"></div>
                    <p>%s - %s</p>
                </div>
                <div class="assinatura">
                    <div class="linha"></div>
                    <p>%s - %s</p>
                </div>
            </div>
            
            </body>
            </html>
            """.formatted(
                escape(receipt.id()),
                escape(dataFormatada),
                escape(receipt.payerName()),
                escape(docPagador),
                escape(valorFormatado),
                escape(receipt.amountInWords()),
                escape(receipt.reference()),
                escape(valorFormatado),
                escape(receipt.receiverName()),
                escape(docRecebedor),
                escape(receipt.payerName()),
                escape(docPagador)
        );
    }

    private String renderReciboCompleto(Receipt receipt, AppPreference config, String valorFormatado,
                                      String dataFormatada, String docPagador, String docRecebedor){
        return """
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <title>Recibo</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        color: #000;
                    }
                    .container {
                        border: 1px solid #000;
                        padding: 15px;
                    }
                    .header, .section {
                        margin-bottom: 15px;
                    }
                    .title {
                        text-align: center;
                        font-weight: bold;
                        font-size: 20px;
                        margin-bottom: 10px;
                    }
                    .row {
                        display: flex;
                        justify-content: space-between;
                    }
                    .box {
                        width: 48%;
                        border: 1px solid #000;
                        padding: 8px;
                        font-size: 12px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                    }
                    table, th, td {
                        border: 1px solid #000;
                    }
                    th, td {
                        padding: 5px;
                        text-align: center;
                    }
                    .totals {
                        text-align: right;
                        margin-top: 10px;
                        font-size: 13px;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 11px;
                    }
                </style>
            </head>
            <body>
            
            <div class="container">
                <div class="title">RECIBO - %s</div>
            
                <div class="header row">
                    <div class="box">
                        <strong>Emitente</strong><br>
                        %s<br>
                        DOCUMENTO: %s<br>
                        %s<br>
                        %s - %s
                    </div>
            
                    <div class="box">
                        <strong>Dados da Nota</strong><br>
                        Nº: %s<br>
                        Série: 1<br>
                        Emissão: %s<br>
                        Saída: %s
                    </div>
                </div>
            
                <div class="section box">
                    <strong>Destinatário</strong><br>
                    %s<br>
                    DOCUMENTO: %s<br>
                    %s<br>
                    %s - %s
                </div>
            
                <div class="section">
                    <table>
                        <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descrição</th>
                            <th>Qtd</th>
                            <th>Valor Unitário (R$)</th>
                            <th>Valor Total (R$)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>001</td>
                            <td>%s</td>
                            <td>1</td>
                            <td>%s</td>
                            <td>%s</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            
                <div class="totals">
                    Valor dos Produtos: R$ %s<br>
                    Frete: R$ 0,00<br>
                    Desconto: R$ 0,00<br>
                    <strong>Total da Nota: R$ %s</strong>
                </div>
            
                <div class="footer">
                    Forma de pagamento: A VISTA<br>
                    Documento apenas para demonstração.
                </div>
            </div>
            
            </body>
            </html>
            """.formatted(
                escape(receipt.id()),
                escape(receipt.payerName()),
                escape(docPagador),
                escape(receipt.place()),
                escape(receipt.place()),
                escape(receipt.id()),
                escape(dataFormatada),
                escape(dataFormatada),
                escape(receipt.payerName()),
                escape(docPagador),
                escape(receipt.place()),
                escape(receipt.place()),
                escape(receipt.reference()),
                escape(valorFormatado),
                escape(valorFormatado),
                escape(valorFormatado),
                escape(valorFormatado)
        );
    }

    private String renderModerno(Receipt receipt, AppPreference config, String valorFormatado,
                                 String dataFormatada, String docPagador, String docRecebedor) {
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

    private String renderSimples(Receipt receipt, AppPreference config, String valorFormatado,
                                 String dataFormatada, String docPagador, String docRecebedor,
                                 boolean doubleSignature) {
        String signatures = doubleSignature
                ? """
                    <section class="signatures dual">
                      <div class="signature">
                        <div class="line"></div>
                        <div class="name">%s</div>
                        <div class="role">Pagador</div>
                      </div>
                      <div class="signature">
                        <div class="line"></div>
                        <div class="name">%s</div>
                        <div class="role">Recebedor</div>
                      </div>
                    </section>
                    """.formatted(escape(receipt.payerName()), escape(receipt.receiverName()))
                : """
                    <section class="signatures single">
                      <div class="signature">
                        <div class="line"></div>
                        <div class="name">%s</div>
                        <div class="role">Recebedor</div>
                      </div>
                    </section>
                    """.formatted(escape(receipt.receiverName()));

        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Recibo %s</title>
                  <style>
                    body { font-family: "Courier New", "Georgia", serif; color: #111; margin: 0; padding: 32px; background: #f3f4f6; }
                    .page { max-width: 760px; margin: 0 auto; background: #fff; border: 1px solid #111; padding: 40px 44px; }
                    .top { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #111; padding-bottom: 10px; margin-bottom: 24px; }
                    .top h1 { margin: 0; font-size: 1.7rem; letter-spacing: .18em; }
                    .value-tag { font-size: 1.2rem; font-weight: 700; border: 2px solid #111; padding: 4px 12px; }
                    p { font-size: 1.05rem; line-height: 1.95; text-align: justify; margin: 0 0 16px; }
                    .b { font-weight: 700; }
                    .place-date { margin-top: 28px; text-align: right; }
                    .signatures { margin-top: 80px; }
                    .signatures.dual { display: grid; grid-template-columns: 1fr 1fr; column-gap: 64px; }
                    .signature .line { border-top: 1.5px solid #111; }
                    .signature .name { text-align: center; margin-top: 6px; font-weight: 700; }
                    .signature .role { text-align: center; font-size: .82rem; text-transform: uppercase; letter-spacing: .12em; color: #555; }
                    @media print { body { padding: 0; background: #fff; } .page { border: none; max-width: none; padding: 0; } }
                  </style>
                </head>
                <body>
                  <main class="page">
                    <section class="top">
                      <h1>RECIBO</h1>
                      <span class="value-tag">%s</span>
                    </section>
                    <p>
                      Recebi de <span class="b">%s</span> (documento <span class="b">%s</span>) a importancia de
                      <span class="b">%s</span> (%s), referente a <span class="b">%s</span>.
                    </p>
                    <p>E para maior clareza firmo o presente recibo, dando plena quitacao.</p>
                    <p class="place-date">%s, %s.</p>
                    %s
                  </main>
                </body>
                </html>
                """.formatted(
                escape(receipt.id()),
                escape(valorFormatado),
                escape(receipt.payerName()),
                escape(docPagador),
                escape(valorFormatado),
                escape(receipt.amountInWords()),
                escape(receipt.reference()),
                escape(receipt.place()),
                escape(dataFormatada),
                signatures
        );
    }

    private String renderAurora(Receipt receipt, AppPreference config, String valorFormatado,
                                String dataFormatada, String docPagador, String docRecebedor) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Recibo %s</title>
                  <style>
                    :root { --ink: #18212b; --muted: #667085; --line: rgba(24, 33, 43, 0.14); --accent: #0f766e; --accent-soft: #ecfdf5; --paper: #fffefb; }
                    * { box-sizing: border-box; }
                    body { margin: 0; padding: 28px; background: linear-gradient(180deg, #f6efe6 0%%, #eef7f4 100%%); color: var(--ink); font-family: "Inter", "Segoe UI", Arial, sans-serif; }
                    .page { max-width: 860px; margin: 0 auto; background: var(--paper); border: 1px solid var(--line); border-radius: 28px; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); }
                    .hero { padding: 28px 34px 22px; background: radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 32%%), linear-gradient(135deg, #fff7ed 0%%, #ffffff 58%%); border-bottom: 1px solid var(--line); }
                    .eyebrow { margin: 0 0 10px; text-transform: uppercase; letter-spacing: .18em; font-size: .74rem; font-weight: 800; color: var(--accent); }
                    .hero-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
                    h1 { margin: 0; font-size: 2rem; letter-spacing: .06em; }
                    .hero p { margin: 10px 0 0; max-width: 28rem; color: var(--muted); line-height: 1.6; }
                    .value-card { min-width: 220px; padding: 18px 20px; border-radius: 22px; background: #0f172a; color: #f8fafc; text-align: right; }
                    .value-card span { display: block; font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; opacity: .72; }
                    .value-card strong { display: block; margin-top: 8px; font-size: 1.8rem; line-height: 1.1; }
                    .content { padding: 30px 34px 34px; }
                    .content p { margin: 0 0 16px; font-size: 1.03rem; line-height: 1.85; text-align: justify; }
                    .field { font-weight: 700; }
                    .chips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin: 22px 0; }
                    .chip { border: 1px solid var(--line); background: #fff; border-radius: 18px; padding: 14px 16px; }
                    .chip-label { display: block; font-size: .72rem; text-transform: uppercase; letter-spacing: .14em; color: var(--muted); margin-bottom: 8px; }
                    .chip-value { font-weight: 700; line-height: 1.5; }
                    .meta { display: grid; grid-template-columns: 1.2fr .8fr; gap: 14px; margin-top: 26px; }
                    .meta-card { border: 1px solid var(--line); background: var(--accent-soft); border-radius: 20px; padding: 16px 18px; }
                    .meta-card strong { display: block; margin-bottom: 8px; font-size: .78rem; letter-spacing: .14em; text-transform: uppercase; color: var(--accent); }
                    .date-box { display: flex; align-items: end; justify-content: center; text-align: center; }
                    .date-box div { font-size: 1rem; line-height: 1.7; }
                    .signatures { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 44px; margin-top: 62px; }
                    .signature-flow { min-height: 96px; display: flex; flex-direction: column; justify-content: flex-end; }
                    .signature-bar { border-top: 2px solid #18212b; padding-top: 10px; text-align: center; }
                    .signature-name { font-weight: 800; font-size: 1rem; }
                    .signature-doc { margin-top: 4px; color: var(--muted); font-size: .9rem; }
                    .signature-role { margin-top: 8px; text-transform: uppercase; letter-spacing: .14em; font-size: .74rem; color: var(--accent); }
                    @media print {
                      body { padding: 0; background: #fff; }
                      .page { border: none; border-radius: 0; box-shadow: none; max-width: none; }
                    }
                  </style>
                </head>
                <body>
                  <main class="page">
                    <section class="hero">
                      <p class="eyebrow">Recibo contemporaneo</p>
                      <div class="hero-row">
                        <div>
                          <h1>Quitacao registrada</h1>
                          <p>Documento financeiro com composicao moderna, leitura leve e assinatura em fluxo separado para pagador e recebedor.</p>
                        </div>
                        <div class="value-card">
                          <span>Recibo %s</span>
                          <strong>%s</strong>
                        </div>
                      </div>
                    </section>
                    <section class="content">
                      <p>
                        Recebi(emos) de <span class="field">%s</span>, inscrito(a) no documento <span class="field">%s</span>,
                        a quantia de <span class="field">%s</span> (<span class="field">%s</span>), referente a
                        <span class="field">%s</span>.
                      </p>
                      <p>Para producao de efeitos de quitacao e comprovacao, este recibo segue assinado pelas partes indicadas abaixo.</p>
                      <div class="chips">
                        <div class="chip">
                          <span class="chip-label">Recebedor</span>
                          <div class="chip-value">%s<br>%s</div>
                        </div>
                        <div class="chip">
                          <span class="chip-label">Emitente padrao</span>
                          <div class="chip-value">%s</div>
                        </div>
                        <div class="chip">
                          <span class="chip-label">Observacoes</span>
                          <div class="chip-value">%s</div>
                        </div>
                      </div>
                      <div class="meta">
                        <div class="meta-card">
                          <strong>Referencia</strong>
                          <div>%s</div>
                        </div>
                        <div class="meta-card date-box">
                          <div>%s<br>%s</div>
                        </div>
                      </div>
                      <section class="signatures">
                        <div class="signature-flow">
                          <div class="signature-bar">
                            <div class="signature-name">%s</div>
                            <div class="signature-doc">%s</div>
                            <div class="signature-role">Fluxo de assinatura do pagador</div>
                          </div>
                        </div>
                        <div class="signature-flow">
                          <div class="signature-bar">
                            <div class="signature-name">%s</div>
                            <div class="signature-doc">%s</div>
                            <div class="signature-role">Fluxo de assinatura do recebedor</div>
                          </div>
                        </div>
                      </section>
                    </section>
                  </main>
                </body>
                </html>
                """.formatted(
                escape(receipt.id()),
                escape(receipt.id()),
                escape(valorFormatado),
                escape(receipt.payerName()),
                escape(docPagador),
                escape(valorFormatado),
                escape(receipt.amountInWords()),
                escape(receipt.reference()),
                escape(receipt.receiverName()),
                escape(docRecebedor),
                escape(config.issuerName()),
                escape(receipt.notes() == null ? "-" : receipt.notes()),
                escape(receipt.reference()),
                escape(receipt.place()),
                escape(dataFormatada),
                escape(receipt.payerName()),
                escape(docPagador),
                escape(receipt.receiverName()),
                escape(docRecebedor)
        );
    }

    private String renderAtlas(Receipt receipt, AppPreference config, String valorFormatado,
                               String dataFormatada, String docPagador, String docRecebedor) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Recibo %s</title>
                  <style>
                    :root { --ink: #101828; --muted: #475467; --line: rgba(16, 24, 40, 0.12); --accent: #9a3412; --accent-deep: #7c2d12; }
                    * { box-sizing: border-box; }
                    body { margin: 0; padding: 30px; background: #f8f5f0; color: var(--ink); font-family: "Inter", "Segoe UI", Arial, sans-serif; }
                    .page { max-width: 880px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 22px 56px rgba(15, 23, 42, 0.1); }
                    .band { height: 14px; background: linear-gradient(90deg, #9a3412 0%%, #ea580c 50%%, #fdba74 100%%); }
                    .content { padding: 30px 36px 34px; }
                    .header { display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: end; margin-bottom: 26px; }
                    .kicker { margin: 0 0 8px; font-size: .76rem; text-transform: uppercase; letter-spacing: .18em; color: var(--accent); font-weight: 800; }
                    h1 { margin: 0; font-size: 1.9rem; letter-spacing: .04em; }
                    .header p { margin: 10px 0 0; color: var(--muted); line-height: 1.65; max-width: 32rem; }
                    .number-box { border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; min-width: 210px; background: #fffaf5; text-align: right; }
                    .number-box span { display: block; color: var(--muted); font-size: .76rem; text-transform: uppercase; letter-spacing: .14em; }
                    .number-box strong { display: block; margin-top: 8px; font-size: 1.7rem; color: var(--accent-deep); }
                    .body-copy { margin: 0 0 20px; font-size: 1.04rem; line-height: 1.9; text-align: justify; }
                    .body-copy strong { color: #111827; }
                    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 26px 0; }
                    .grid-card { border: 1px solid var(--line); border-radius: 18px; padding: 16px 18px; background: #fff; }
                    .grid-card.full { grid-column: 1 / -1; }
                    .grid-card .label { display: block; margin-bottom: 8px; font-size: .74rem; text-transform: uppercase; letter-spacing: .14em; color: var(--muted); }
                    .grid-card .value { font-weight: 700; line-height: 1.6; }
                    .footer-note { display: flex; justify-content: space-between; gap: 20px; margin-top: 14px; color: var(--muted); }
                    .footer-note strong { color: var(--ink); }
                    .signatures { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 52px; margin-top: 68px; }
                    .signature-flow { min-height: 100px; display: flex; flex-direction: column; justify-content: flex-end; }
                    .signature-topline { border-top: 2px solid #111827; padding-top: 12px; }
                    .signature-name { text-align: center; font-weight: 800; font-size: 1rem; }
                    .signature-doc { text-align: center; font-size: .9rem; color: var(--muted); margin-top: 4px; }
                    .signature-role { text-align: center; margin-top: 8px; font-size: .74rem; letter-spacing: .16em; text-transform: uppercase; color: var(--accent); }
                    @media print {
                      body { padding: 0; background: #fff; }
                      .page { border-radius: 0; box-shadow: none; max-width: none; }
                    }
                  </style>
                </head>
                <body>
                  <main class="page">
                    <div class="band"></div>
                    <section class="content">
                      <section class="header">
                        <div>
                          <p class="kicker">Modelo executivo</p>
                          <h1>Recibo de quitacao</h1>
                          <p>Estrutura em grade para dados essenciais, leitura rapida e fechamento com fluxos de assinatura distintos.</p>
                        </div>
                        <div class="number-box">
                          <span>Identificacao</span>
                          <strong>%s</strong>
                        </div>
                      </section>
                      <p class="body-copy">
                        Recebi(emos) de <strong>%s</strong>, documento <strong>%s</strong>, o valor de
                        <strong>%s</strong> (<strong>%s</strong>), referente a <strong>%s</strong>.
                      </p>
                      <div class="grid">
                        <div class="grid-card">
                          <span class="label">Pagador</span>
                          <div class="value">%s<br>%s</div>
                        </div>
                        <div class="grid-card">
                          <span class="label">Recebedor</span>
                          <div class="value">%s<br>%s</div>
                        </div>
                        <div class="grid-card">
                          <span class="label">Valor</span>
                          <div class="value">%s</div>
                        </div>
                        <div class="grid-card">
                          <span class="label">Emitente padrao</span>
                          <div class="value">%s</div>
                        </div>
                        <div class="grid-card full">
                          <span class="label">Observacoes</span>
                          <div class="value">%s</div>
                        </div>
                      </div>
                      <div class="footer-note">
                        <div><strong>Local:</strong> %s</div>
                        <div><strong>Data:</strong> %s</div>
                      </div>
                      <section class="signatures">
                        <div class="signature-flow">
                          <div class="signature-topline">
                            <div class="signature-name">%s</div>
                            <div class="signature-doc">%s</div>
                            <div class="signature-role">Assinatura do pagador</div>
                          </div>
                        </div>
                        <div class="signature-flow">
                          <div class="signature-topline">
                            <div class="signature-name">%s</div>
                            <div class="signature-doc">%s</div>
                            <div class="signature-role">Assinatura do recebedor</div>
                          </div>
                        </div>
                      </section>
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
                escape(receipt.payerName()),
                escape(docPagador),
                escape(receipt.receiverName()),
                escape(docRecebedor),
                escape(valorFormatado),
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

    private String renderHorizonte(Receipt receipt, AppPreference config, String valorFormatado,
                                   String dataFormatada, String docPagador, String docRecebedor) {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Recibo %s</title>
                  <style>
                    :root { --ink: #14213d; --muted: #526077; --line: rgba(20, 33, 61, 0.14); --accent: #1d4ed8; --panel: #f8fbff; }
                    * { box-sizing: border-box; }
                    body { margin: 0; padding: 30px; background: linear-gradient(160deg, #edf4ff 0%%, #f8fafc 52%%, #eef7ff 100%%); color: var(--ink); font-family: "Inter", "Segoe UI", Arial, sans-serif; }
                    .page { max-width: 880px; margin: 0 auto; background: #fff; border: 1px solid var(--line); border-radius: 26px; overflow: hidden; box-shadow: 0 24px 58px rgba(29, 78, 216, 0.08); }
                    .topbar { padding: 18px 34px; background: #14213d; color: #eff6ff; display: flex; justify-content: space-between; align-items: center; gap: 20px; }
                    .topbar span { text-transform: uppercase; letter-spacing: .18em; font-size: .76rem; opacity: .78; }
                    .topbar strong { font-size: .96rem; letter-spacing: .08em; }
                    .content { padding: 30px 34px 36px; }
                    .lead { display: grid; grid-template-columns: 1.1fr .9fr; gap: 24px; align-items: start; margin-bottom: 24px; }
                    h1 { margin: 0; font-size: 2rem; letter-spacing: .05em; }
                    .subtitle { margin: 10px 0 0; color: var(--muted); line-height: 1.7; max-width: 34rem; }
                    .amount-panel { border-radius: 24px; background: var(--panel); border: 1px solid var(--line); padding: 22px 24px; }
                    .amount-panel span { display: block; font-size: .75rem; text-transform: uppercase; letter-spacing: .16em; color: var(--accent); }
                    .amount-panel strong { display: block; margin-top: 10px; font-size: 2rem; line-height: 1.1; }
                    .amount-panel small { display: block; margin-top: 10px; color: var(--muted); line-height: 1.6; }
                    .copy { margin: 0 0 18px; font-size: 1.03rem; line-height: 1.9; text-align: justify; }
                    .copy strong { color: #0f172a; }
                    .stack { display: grid; gap: 14px; margin-top: 24px; }
                    .stack-card { border: 1px solid var(--line); border-radius: 20px; padding: 16px 18px; background: #fff; }
                    .stack-card .label { display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: .14em; font-size: .74rem; color: var(--muted); }
                    .stack-card .value { line-height: 1.7; font-weight: 700; }
                    .signature-zone { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 46px; margin-top: 70px; }
                    .signature-flow { min-height: 102px; display: flex; flex-direction: column; justify-content: flex-end; }
                    .signature-stroke { border-top: 2px solid #14213d; padding-top: 12px; text-align: center; }
                    .signature-stroke .name { font-size: 1rem; font-weight: 800; }
                    .signature-stroke .doc { margin-top: 4px; font-size: .9rem; color: var(--muted); }
                    .signature-stroke .role { margin-top: 8px; font-size: .74rem; color: var(--accent); letter-spacing: .16em; text-transform: uppercase; }
                    @media print {
                      body { padding: 0; background: #fff; }
                      .page { max-width: none; border: none; border-radius: 0; box-shadow: none; }
                    }
                  </style>
                </head>
                <body>
                  <main class="page">
                    <div class="topbar">
                      <span>Recibo formal</span>
                      <strong>Documento %s</strong>
                    </div>
                    <section class="content">
                      <section class="lead">
                        <div>
                          <h1>Comprovante de recebimento</h1>
                          <p class="subtitle">Modelo atual com painel de valor, blocos verticais de leitura e area de assinaturas destacada ao final.</p>
                        </div>
                        <div class="amount-panel">
                          <span>Valor recebido</span>
                          <strong>%s</strong>
                          <small>%s</small>
                        </div>
                      </section>
                      <p class="copy">
                        Declaro(amos) ter recebido de <strong>%s</strong>, inscrito(a) no documento <strong>%s</strong>,
                        a importancia de <strong>%s</strong>, referente a <strong>%s</strong>.
                      </p>
                      <p class="copy">O presente recibo e emitido para fins de comprovacao e plena quitacao da operacao descrita.</p>
                      <div class="stack">
                        <div class="stack-card">
                          <span class="label">Recebedor</span>
                          <div class="value">%s<br>%s</div>
                        </div>
                        <div class="stack-card">
                          <span class="label">Emitente padrao e observacoes</span>
                          <div class="value">%s<br>%s</div>
                        </div>
                        <div class="stack-card">
                          <span class="label">Local e data</span>
                          <div class="value">%s, %s</div>
                        </div>
                      </div>
                      <section class="signature-zone">
                        <div class="signature-flow">
                          <div class="signature-stroke">
                            <div class="name">%s</div>
                            <div class="doc">%s</div>
                            <div class="role">Assinatura do pagador</div>
                          </div>
                        </div>
                        <div class="signature-flow">
                          <div class="signature-stroke">
                            <div class="name">%s</div>
                            <div class="doc">%s</div>
                            <div class="role">Assinatura do recebedor</div>
                          </div>
                        </div>
                      </section>
                    </section>
                  </main>
                </body>
                </html>
                """.formatted(
                escape(receipt.id()),
                escape(receipt.id()),
                escape(valorFormatado),
                escape(receipt.amountInWords()),
                escape(receipt.payerName()),
                escape(docPagador),
                escape(valorFormatado),
                escape(receipt.reference()),
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
                request.receiverDocumentType(),
                resolveTemplate(request.template())
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
                entity.getReceiverDocumentType(),
                resolveTemplate(entity.getTemplate())
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

    private String nz(String value) {
        return value == null ? "" : value;
    }

    private String resolveTemplate(String template) {
        if (template == null || template.isBlank()) {
            return "Moderno";
        }
        return switch (template.trim()) {
            case "Simples" -> "Simples";
            case "SimplesDuplo" -> "SimplesDuplo";
            case "Aurora" -> "Aurora";
            case "Atlas" -> "Atlas";
            case "Horizonte" -> "Horizonte";
            default -> "Moderno";
        };
    }

    private LocalDate parseDateOrNow(String value) {
        if (value == null || value.isBlank()) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(value);
        } catch (RuntimeException ex) {
            return LocalDate.now();
        }
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
