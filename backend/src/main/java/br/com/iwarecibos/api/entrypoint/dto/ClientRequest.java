package br.com.iwarecibos.api.entrypoint.dto;

import br.com.iwarecibos.api.core.domain.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ClientRequest(
        @NotBlank @Size(min = 5, max = 160) String name,
        @NotBlank @Size(min = 11, max = 20) String document,
        @NotNull DocumentType documentType,
        String rg,
        String birthDate,
        String driverLicense,
        @NotBlank @Size(min = 5, max = 255) String address,
        @NotBlank @Size(min = 2, max = 80) String city,
        String state,
        String postalCode,
        String country,
        String notes
) {
}
