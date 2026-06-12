import { Injectable } from '@angular/core';
import { ReceiptPreviewResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ReceiptTemplateService {
  renderReceipt(data: ReceiptPreviewResponse): string {
    switch (data.template) {
      case 'Padrao':
        return this.renderPadrao(data);
      case 'Completo':
        return this.renderCompleto(data);
      case 'Moderno':
        return this.renderModerno(data);
      case 'Simples':
        return this.renderSimples(data);
      case 'SimplesDuplo':
        return this.renderSimplesDuplo(data);
      case 'Aurora':
        return this.renderAurora(data);
      case 'Atlas':
        return this.renderAtlas(data);
      case 'Horizonte':
        return this.renderHorizonte(data);
      default:
        return this.renderPadrao(data);
    }
  }

  private escapeHtml(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private renderPadrao(data: ReceiptPreviewResponse): string {
    const id = data.id || '';
    const dataFormatada = data.formattedIssueDate || '';
    const pagador = data.payerName || '';
    const docPagador = data.formattedPayerDocument || '';
    const valorFormatado = data.formattedAmount || '';
    const valorPorExtenso = data.amountInWords || '';
    const referencia = data.reference || '';
    const recebedor = data.receiverName || '';
    const docRecebedor = data.formattedReceiverDocument || '';

    return `
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
        <h1>RECIBO - ${id}</h1>
    </div>

    <div class="info">
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Recebido de:</strong> ${pagador}</p>
        <p><strong>CPF/CNPJ:</strong> ${docPagador}</p>
    </div>

    <div class="descricao">
        Recebi a quantia de <strong>R$ ${valorFormatado}</strong> (${valorPorExtenso}),
        referente a ${referencia}.
    </div>

    <div class="valor">
        Total: R$ ${valorFormatado}
    </div>

    <div class="assinatura">
        <div class="linha"></div>
        <p>${recebedor} - ${docRecebedor}</p>
    </div>
    <div class="assinatura">
        <div class="linha"></div>
        <p>${pagador} - ${docPagador}</p>
    </div>
</div>

</body>
</html>`;
  }

  private renderCompleto(data: ReceiptPreviewResponse): string {
    const id = data.id || '';
    const emitente = data.issuerName || '';
    const docEmitente = data.issuerDocument || '';
    const cidade = data.issuerCity || '';
    const dataFormatada = data.formattedIssueDate || '';
    const destinatario = data.payerName || '';
    const docDestinatario = data.formattedPayerDocument || '';
    const valorFormatado = data.formattedAmount || '';
    const referencia = data.reference || '';

    return `
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
    <div class="title">RECIBO - ${id}</div>

    <div class="header row">
        <div class="box">
            <strong>Emitente</strong><br>
            ${emitente}<br>
            DOCUMENTO: ${docEmitente}<br>
            ${cidade}<br>
            ${cidade} - ${cidade}
        </div>

        <div class="box">
            <strong>Dados da Nota</strong><br>
            Nº: ${id}<br>
            Série: 1<br>
            Emissão: ${dataFormatada}<br>
            Saída: ${dataFormatada}
        </div>
    </div>

    <div class="section box">
        <strong>Destinatário</strong><br>
        ${destinatario}<br>
        DOCUMENTO: ${docDestinatario}<br>
        ${cidade}<br>
        ${cidade} - ${cidade}
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
                <td>${referencia}</td>
                <td>1</td>
                <td>${valorFormatado}</td>
                <td>${valorFormatado}</td>
            </tr>
            </tbody>
        </table>
    </div>

    <div class="totals">
        Valor dos Produtos: R$ ${valorFormatado}<br>
        Frete: R$ 0,00<br>
        Desconto: R$ 0,00<br>
        <strong>Total da Nota: R$ ${valorFormatado}</strong>
    </div>

    <div class="footer">
        Forma de pagamento: A VISTA<br>
        Documento apenas para demonstração.
    </div>
</div>

</body>
</html>`;
  }

  private renderModerno(data: ReceiptPreviewResponse): string {
    const id = data.id || '';
    const dataFormatada = data.formattedIssueDate || '';
    const pagador = data.payerName || '';
    const docPagador = data.formattedPayerDocument || '';
    const valorFormatado = data.formattedAmount || '';
    const valorPorExtenso = data.amountInWords || '';
    const referencia = data.reference || '';
    const recebedor = data.receiverName || '';
    const docRecebedor = data.formattedReceiverDocument || '';
    const emitentePadrao = data.issuerName || '';
    const observacoes = data.notes || '-';
    const local = data.place || '';

    return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recibo ${id}</title>
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
      <div class="id">Recibo nº ${id}</div>
    </section>
    <section>
      <p>
        Recebi(emos) de <span class="field">${pagador}</span>, inscrito(a) no documento
        <span class="field highlight">${docPagador}</span>, a quantia de
        <span class="field highlight">${valorFormatado}</span> (<span class="field">${valorPorExtenso}</span>),
        referente a <span class="field highlight">${referencia}</span>.
      </p>
      <p>Para clareza e quitacao, firmo(amos) o presente recibo.</p>
      <div class="summary">
        <div class="summary-row"><span class="field">Valor:</span> ${valorFormatado}</div>
        <div class="summary-row"><span class="field">Recebedor:</span> ${recebedor}</div>
        <div class="summary-row"><span class="field">Documento do recebedor:</span> ${docRecebedor}</div>
        <div class="summary-row"><span class="field">Emitente padrao:</span> ${emitentePadrao}</div>
        <div class="summary-row"><span class="field">Observacoes:</span> ${observacoes}</div>
      </div>
      <p class="location-date">${local}, <span class="highlight">${dataFormatada}</span>.</p>
    </section>
    <section class="signatures">
      <div class="signature-card">
        <div class="signature-line">
          ${pagador}<br>
          ${docPagador}
          <span class="signature-role">Assinatura do Pagador</span>
        </div>
      </div>
      <div class="signature-card">
        <div class="signature-line">
          ${recebedor}<br>
          ${docRecebedor}
          <span class="signature-role">Assinatura do Recebedor</span>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;
  }

  private renderSimples(data: ReceiptPreviewResponse): string {
    const id = data.id || '';
    const dataFormatada = data.formattedIssueDate || '';
    const pagador = data.payerName || '';
    const docPagador = data.formattedPayerDocument || '';
    const valorFormatado = data.formattedAmount || '';
    const valorPorExtenso = data.amountInWords || '';
    const referencia = data.reference || '';
    const recebedor = data.receiverName || '';
    const docRecebedor = data.formattedReceiverDocument || '';
    const local = data.place || '';

    return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recibo ${id}</title>
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
      <span class="value-tag">${valorFormatado}</span>
    </section>
    <p>
      Recebi de <span class="b">${pagador}</span> (documento <span class="b">${docPagador}</span>) a importancia de
      <span class="b">${valorFormatado}</span> (${valorPorExtenso}), referente a <span class="b">${referencia}</span>.
    </p>
    <p>E para maior clareza firmo o presente recibo, dando plena quitacao.</p>
    <p class="place-date">${local}, ${dataFormatada}.</p>
    <section class="signatures single">
      <div class="signature">
        <div class="line"></div>
        <div class="name">${recebedor}</div>
        <div class="role">Recebedor</div>
      </div>
    </section>
  </main>
</body>
</html>`;
  }

  private renderSimplesDuplo(data: ReceiptPreviewResponse): string {
    const id = data.id || '';
    const dataFormatada = data.formattedIssueDate || '';
    const pagador = data.payerName || '';
    const docPagador = data.formattedPayerDocument || '';
    const valorFormatado = data.formattedAmount || '';
    const valorPorExtenso = data.amountInWords || '';
    const referencia = data.reference || '';
    const recebedor = data.receiverName || '';
    const docRecebedor = data.formattedReceiverDocument || '';
    const local = data.place || '';

    return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recibo ${id}</title>
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
      <span class="value-tag">${valorFormatado}</span>
    </section>
    <p>
      Recebi de <span class="b">${pagador}</span> (documento <span class="b">${docPagador}</span>) a importancia de
      <span class="b">${valorFormatado}</span> (${valorPorExtenso}), referente a <span class="b">${referencia}</span>.
    </p>
    <p>E para maior clareza firmo o presente recibo, dando plena quitacao.</p>
    <p class="place-date">${local}, ${dataFormatada}.</p>
    <section class="signatures dual">
      <div class="signature">
        <div class="line"></div>
        <div class="name">${pagador}</div>
        <div class="role">Pagador</div>
      </div>
      <div class="signature">
        <div class="line"></div>
        <div class="name">${recebedor}</div>
        <div class="role">Recebedor</div>
      </div>
    </section>
  </main>
</body>
</html>`;
  }

  private renderAurora(data: ReceiptPreviewResponse): string {
    const id = data.id || '';
    const dataFormatada = data.formattedIssueDate || '';
    const pagador = data.payerName || '';
    const docPagador = data.formattedPayerDocument || '';
    const valorFormatado = data.formattedAmount || '';
    const valorPorExtenso = data.amountInWords || '';
    const referencia = data.reference || '';
    const recebedor = data.receiverName || '';
    const docRecebedor = data.formattedReceiverDocument || '';
    const emitentePadrao = data.issuerName || '';
    const observacoes = data.notes || '-';
    const local = data.place || '';

    return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recibo ${id}</title>
  <style>
    :root { --ink: #18212b; --muted: #667085; --line: rgba(24, 33, 43, 0.14); --accent: #0f766e; --accent-soft: #ecfdf5; --paper: #fffefb; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; background: linear-gradient(180deg, #f6efe6 0%, #eef7f4 100%); color: var(--ink); font-family: "Inter", "Segoe UI", Arial, sans-serif; }
    .page { max-width: 860px; margin: 0 auto; background: var(--paper); border: 1px solid var(--line); border-radius: 28px; overflow: hidden; box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12); }
    .hero { padding: 28px 34px 22px; background: radial-gradient(circle at top right, rgba(15, 118, 110, 0.12), transparent 32%), linear-gradient(135deg, #fff7ed 0%, #ffffff 58%); border-bottom: 1px solid var(--line); }
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
          <span>Recibo ${id}</span>
          <strong>${valorFormatado}</strong>
        </div>
      </div>
    </section>
    <section class="content">
      <p>
        Recebi(emos) de <span class="field">${pagador}</span>, inscrito(a) no documento <span class="field">${docPagador}</span>,
        a quantia de <span class="field">${valorFormatado}</span> (<span class="field">${valorPorExtenso}</span>), referente a
        <span class="field">${referencia}</span>.
      </p>
      <p>Para producao de efeitos de quitacao e comprovacao, este recibo segue assinado pelas partes indicadas abaixo.</p>
      <div class="chips">
        <div class="chip">
          <span class="chip-label">Recebedor</span>
          <div class="chip-value">${recebedor}<br>${docRecebedor}</div>
        </div>
        <div class="chip">
          <span class="chip-label">Emitente padrao</span>
          <div class="chip-value">${emitentePadrao}</div>
        </div>
        <div class="chip">
          <span class="chip-label">Observacoes</span>
          <div class="chip-value">${observacoes}</div>
        </div>
      </div>
      <div class="meta">
        <div class="meta-card">
          <strong>Referencia</strong>
          <div>${referencia}</div>
        </div>
        <div class="meta-card date-box">
          <div>${local}<br>${dataFormatada}</div>
        </div>
      </div>
      <section class="signatures">
        <div class="signature-flow">
          <div class="signature-bar">
            <div class="signature-name">${pagador}</div>
            <div class="signature-doc">${docPagador}</div>
            <div class="signature-role">Fluxo de assinatura do pagador</div>
          </div>
        </div>
        <div class="signature-flow">
          <div class="signature-bar">
            <div class="signature-name">${recebedor}</div>
            <div class="signature-doc">${docRecebedor}</div>
            <div class="signature-role">Fluxo de assinatura do recebedor</div>
          </div>
        </div>
      </section>
    </section>
  </main>
</body>
</html>`;
  }

  private renderAtlas(data: ReceiptPreviewResponse): string {
    const id = data.id || '';
    const dataFormatada = data.formattedIssueDate || '';
    const pagador = data.payerName || '';
    const docPagador = data.formattedPayerDocument || '';
    const valorFormatado = data.formattedAmount || '';
    const valorPorExtenso = data.amountInWords || '';
    const referencia = data.reference || '';
    const recebedor = data.receiverName || '';
    const docRecebedor = data.formattedReceiverDocument || '';
    const emitentePadrao = data.issuerName || '';
    const observacoes = data.notes || '-';
    const local = data.place || '';

    return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recibo ${id}</title>
  <style>
    :root { --ink: #101828; --muted: #475467; --line: rgba(16, 24, 40, 0.12); --accent: #9a3412; --accent-deep: #7c2d12; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 30px; background: #f8f5f0; color: var(--ink); font-family: "Inter", "Segoe UI", Arial, sans-serif; }
    .page { max-width: 880px; margin: 0 auto; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 22px 56px rgba(15, 23, 42, 0.1); }
    .band { height: 14px; background: linear-gradient(90deg, #9a3412 0%, #ea580c 50%, #fdba74 100%); }
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
          <strong>${id}</strong>
        </div>
      </section>
      <p class="body-copy">
        Recebi(emos) de <strong>${pagador}</strong>, documento <strong>${docPagador}</strong>, o valor de
        <strong>${valorFormatado}</strong> (<strong>${valorPorExtenso}</strong>), referente a <strong>${referencia}</strong>.
      </p>
      <div class="grid">
        <div class="grid-card">
          <span class="label">Pagador</span>
          <div class="value">${pagador}<br>${docPagador}</div>
        </div>
        <div class="grid-card">
          <span class="label">Recebedor</span>
          <div class="value">${recebedor}<br>${docRecebedor}</div>
        </div>
        <div class="grid-card">
          <span class="label">Valor</span>
          <div class="value">${valorFormatado}</div>
        </div>
        <div class="grid-card">
          <span class="label">Emitente padrao</span>
          <div class="value">${emitentePadrao}</div>
        </div>
        <div class="grid-card full">
          <span class="label">Observacoes</span>
          <div class="value">${observacoes}</div>
        </div>
      </div>
      <div class="footer-note">
        <div><strong>Local:</strong> ${local}</div>
        <div><strong>Data:</strong> ${dataFormatada}</div>
      </div>
      <section class="signatures">
        <div class="signature-flow">
          <div class="signature-topline">
            <div class="signature-name">${pagador}</div>
            <div class="signature-doc">${docPagador}</div>
            <div class="signature-role">Assinatura do pagador</div>
          </div>
        </div>
        <div class="signature-flow">
          <div class="signature-topline">
            <div class="signature-name">${recebedor}</div>
            <div class="signature-doc">${docRecebedor}</div>
            <div class="signature-role">Assinatura do recebedor</div>
          </div>
        </div>
      </section>
    </section>
  </main>
</body>
</html>`;
  }

  private renderHorizonte(data: ReceiptPreviewResponse): string {
    const id = data.id || '';
    const dataFormatada = data.formattedIssueDate || '';
    const pagador = data.payerName || '';
    const docPagador = data.formattedPayerDocument || '';
    const valorFormatado = data.formattedAmount || '';
    const valorPorExtenso = data.amountInWords || '';
    const referencia = data.reference || '';
    const recebedor = data.receiverName || '';
    const docRecebedor = data.formattedReceiverDocument || '';
    const emitentePadrao = data.issuerName || '';
    const observacoes = data.notes || '-';
    const local = data.place || '';

    return `
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recibo ${id}</title>
  <style>
    :root { --ink: #14213d; --muted: #526077; --line: rgba(20, 33, 61, 0.14); --accent: #1d4ed8; --panel: #f8fbff; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 30px; background: linear-gradient(160deg, #edf4ff 0%, #f8fafc 52%, #eef7ff 100%); color: var(--ink); font-family: "Inter", "Segoe UI", Arial, sans-serif; }
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
      <strong>Documento ${id}</strong>
    </div>
    <section class="content">
      <section class="lead">
        <div>
          <h1>Comprovante de recebimento</h1>
          <p class="subtitle">Modelo atual com painel de valor, blocos verticais de leitura e area de assinaturas destacada ao final.</p>
        </div>
        <div class="amount-panel">
          <span>Valor recebido</span>
          <strong>${valorFormatado}</strong>
          <small>${valorPorExtenso}</small>
        </div>
      </section>
      <p class="copy">
        Declaro(amos) ter recebido de <strong>${pagador}</strong>, inscrito(a) no documento <strong>${docPagador}</strong>,
        a importancia de <strong>${valorFormatado}</strong>, referente a <strong>${referencia}</strong>.
      </p>
      <p class="copy">O presente recibo e emitido para fins de comprovacao e plena quitacao da operacao descrita.</p>
      <div class="stack">
        <div class="stack-card">
          <span class="label">Recebedor</span>
          <div class="value">${recebedor}<br>${docRecebedor}</div>
        </div>
        <div class="stack-card">
          <span class="label">Emitente padrao e observacoes</span>
          <div class="value">${emitentePadrao}<br>${observacoes}</div>
        </div>
        <div class="stack-card">
          <span class="label">Local e data</span>
          <div class="value">${local}, ${dataFormatada}</div>
        </div>
      </div>
      <section class="signature-zone">
        <div class="signature-flow">
          <div class="signature-stroke">
            <div class="name">${pagador}</div>
            <div class="doc">${docPagador}</div>
            <div class="role">Assinatura do pagador</div>
          </div>
        </div>
        <div class="signature-flow">
          <div class="signature-stroke">
            <div class="name">${recebedor}</div>
            <div class="doc">${docRecebedor}</div>
            <div class="role">Assinatura do recebedor</div>
          </div>
        </div>
      </section>
    </section>
  </main>
</body>
</html>`;
  }
}