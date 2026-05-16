package br.com.iwarecibos.api.core.usecase;

import br.com.iwarecibos.api.core.domain.AppPreference;
import br.com.iwarecibos.api.core.entity.AppPreferenceJpaEntity;
import br.com.iwarecibos.api.core.repository.SpringDataAppPreferenceRepository;
import br.com.iwarecibos.api.entrypoint.dto.AppConfigRequest;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AppPreferenceUsecase {

    private final SpringDataAppPreferenceRepository appPreferenceRepository;


    public AppPreference get() {
        return appPreferenceRepository.findById(1L)
                .map(this::toDomain)
                .orElseGet(this::defaultConfig);
    }

    public AppPreference update(AppConfigRequest request) {
        AppPreferenceJpaEntity config = new AppPreferenceJpaEntity(
                1L,
                request.issuerName().trim(),
                request.issuerDocument().replaceAll("[^0-9]", ""),
                request.issuerDocumentType(),
                request.city().trim(),
                blankToNull(request.logoPath()),
                request.receiptTemplate().trim()
        );
        appPreferenceRepository.save(config);
        return toDomain(config);
    }

    public String receiptTemplate() {
        return get().receiptTemplate();
    }

    private AppPreference toDomain(AppPreferenceJpaEntity entity) {
        return new AppPreference(
                entity.getId(),
                entity.getIssuerName(),
                entity.getIssuerDocument(),
                entity.getIssuerDocumentType(),
                entity.getCity(),
                entity.getLogoPath(),
                entity.getReceiptTemplate()
        );
    }

    private AppPreference defaultConfig() {
        return new AppPreference(
                1L,
                "Emitente padrao",
                "00000000000",
                br.com.iwarecibos.api.core.domain.DocumentType.CPF,
                "Sao Paulo",
                null,
                "Moderno"
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
