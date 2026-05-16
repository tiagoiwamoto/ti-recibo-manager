package br.com.iwarecibos.api.entrypoint;

import br.com.iwarecibos.api.core.domain.AppPreference;
import br.com.iwarecibos.api.core.usecase.AppPreferenceUsecase;
import br.com.iwarecibos.api.entrypoint.dto.AppConfigRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/config")
public class AppConfigRest {

    private final AppPreferenceUsecase appPreferenceUsecase;

    @GetMapping
    public AppPreference get() {
        return appPreferenceUsecase.get();
    }

    @PutMapping
    public AppPreference update(@Valid @RequestBody AppConfigRequest request) {
        return appPreferenceUsecase.update(request);
    }
}
