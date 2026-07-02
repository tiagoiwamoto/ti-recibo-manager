package br.com.iwarecibos.api.entrypoint.dto;

public record CepResponse(
        String cep,
        String logradouro,
        String complemento,
        String bairro,
        String localidade,
        String uf,
        boolean erro
) {
}
