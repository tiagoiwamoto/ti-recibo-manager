package br.com.iwarecibos.api.core.usecase;

import br.com.iwarecibos.api.entrypoint.dto.CepResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@Slf4j
public class CepService {

    private final RestTemplate restTemplate = new RestTemplate();

    public CepResponse fetch(String cep) {
        String digits = sanitizeCep(cep);
        if (digits.length() != 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "CEP invalido");
        }

        String url = "https://viacep.com.br/ws/" + digits + "/json";
        try {
            Map<String, Object> body = restTemplate.getForObject(url, Map.class);
            if (body == null || Boolean.TRUE.equals(body.get("erro"))) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "CEP nao encontrado");
            }
            return new CepResponse(
                    toString(body.get("cep")),
                    toString(body.get("logradouro")),
                    toString(body.get("complemento")),
                    toString(body.get("bairro")),
                    toString(body.get("localidade")),
                    toString(body.get("uf")),
                    false
            );
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Falha ao consultar ViaCEP para {}", digits, ex);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Falha ao consultar ViaCEP");
        }
    }

    private String sanitizeCep(String value) {
        return value == null ? "" : value.replaceAll("[^0-9]", "");
    }

    private String toString(Object value) {
        return value == null ? "" : value.toString();
    }
}
