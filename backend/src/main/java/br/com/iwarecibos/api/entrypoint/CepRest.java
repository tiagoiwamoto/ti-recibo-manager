package br.com.iwarecibos.api.entrypoint;

import br.com.iwarecibos.api.core.usecase.CepService;
import br.com.iwarecibos.api.entrypoint.dto.CepResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/cep")
public class CepRest {

    private final CepService cepService;

    @GetMapping("/{cep}")
    public CepResponse get(@PathVariable String cep) {
        return cepService.fetch(cep);
    }
}
