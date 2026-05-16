package br.com.iwarecibos.api.core.domain;

import java.time.LocalDate;

public record Client(
        String id,
        String name,
        String document,
        DocumentType documentType,
        String rg,
        LocalDate birthDate,
        String driverLicense,
        String address,
        String city,
        String state,
        String postalCode,
        String country,
        String notes
) {
}
