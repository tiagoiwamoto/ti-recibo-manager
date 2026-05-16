export function amountToWords(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return '';
  }

  const inteiro = Math.floor(amount);
  const centavos = Math.round((amount - inteiro) * 100);
  const reais = `${numberToWords(inteiro)} ${inteiro === 1 ? 'real' : 'reais'}`;

  if (centavos === 0) {
    return reais;
  }

  return `${reais} e ${numberToWords(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`;
}

export function dateToWords(value: string | null | undefined): string {
  if (!value) {
    return '';
  }

  const date = new Date(`${value}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const months = [
    'janeiro',
    'fevereiro',
    'marco',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro'
  ];

  return `${date.getDate()} de ${months[date.getMonth()]} de ${numberToWords(date.getFullYear())}`;
}

function numberToWords(value: number): string {
  if (value === 0) {
    return 'zero';
  }

  if (value < 0) {
    return `menos ${numberToWords(Math.abs(value))}`;
  }

  if (value < 1000) {
    return belowOneThousand(value);
  }

  if (value < 1000000) {
    const thousands = Math.floor(value / 1000);
    const rest = value % 1000;
    const prefix = thousands === 1 ? 'mil' : `${belowOneThousand(thousands)} mil`;
    return rest === 0 ? prefix : `${prefix}${connector(rest)}${belowOneThousand(rest)}`;
  }

  const millions = Math.floor(value / 1000000);
  const rest = value % 1000000;
  const prefix = millions === 1 ? 'um milhao' : `${numberToWords(millions)} milhoes`;
  return rest === 0 ? prefix : `${prefix}${connector(rest)}${numberToWords(rest)}`;
}

function belowOneThousand(value: number): string {
  if (value === 100) {
    return 'cem';
  }

  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  const hundredsText = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  if (hundreds === 0) {
    return belowOneHundred(rest);
  }

  return rest === 0 ? hundredsText[hundreds] : `${hundredsText[hundreds]} e ${belowOneHundred(rest)}`;
}

function belowOneHundred(value: number): string {
  const teen = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const units = ['', 'um', 'dois', 'tres', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];

  if (value < 10) {
    return units[value];
  }

  if (value < 20) {
    return teen[value - 10];
  }

  const ten = Math.floor(value / 10);
  const unit = value % 10;
  return unit === 0 ? tens[ten] : `${tens[ten]} e ${units[unit]}`;
}

function connector(rest: number): string {
  return rest < 100 || rest % 100 === 0 ? ' e ' : ', ';
}

