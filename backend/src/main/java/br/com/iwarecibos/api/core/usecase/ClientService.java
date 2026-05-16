package br.com.iwarecibos.api.core.usecase;

import br.com.iwarecibos.api.core.domain.Client;
import br.com.iwarecibos.api.core.entity.ClientJpaEntity;
import br.com.iwarecibos.api.core.repository.SpringDataClientRepository;
import br.com.iwarecibos.api.entrypoint.dto.ClientRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClientService {

    private final SpringDataClientRepository clientRepository;


    public List<Client> list(String q) {
        List<ClientJpaEntity> entities = q == null || q.isBlank()
                ? clientRepository.findAllByOrderByNameAsc()
                : clientRepository.search(sanitizeDocument(q).isBlank() ? q.trim() : sanitizeDocument(q));
        return entities.stream().map(this::toDomain).toList();
    }

    public Client get(String id) {
        return clientRepository.findById(id)
                .map(this::toDomain)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));
    }

    public Client create(ClientRequest request) {
        ClientJpaEntity client = toDomain(UUID.randomUUID().toString(), request);
        clientRepository.save(client);
        return toDomain(client);
    }

    public Client update(String id, ClientRequest request) {
        get(id);
        ClientJpaEntity client = toDomain(id, request);
        clientRepository.save(client);
        return toDomain(client);
    }

    public void delete(String id) {
        get(id);
        clientRepository.deleteById(id);
    }

    private ClientJpaEntity toDomain(String id, ClientRequest request) {
        return new ClientJpaEntity(
                id,
                request.name().trim(),
                sanitizeDocument(request.document()),
                request.documentType(),
                blankToNull(request.rg()),
                request.birthDate(),
                blankToNull(request.driverLicense()),
                request.address().trim(),
                request.city().trim(),
                blankToNull(request.state()),
                blankToNull(request.postalCode()),
                blankToNull(request.country()),
                blankToNull(request.notes())
        );
    }

    private String sanitizeDocument(String value) {
        return value.replaceAll("[^0-9]", "");
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Client toDomain(ClientJpaEntity entity) {
        return new Client(
                entity.getId(),
                entity.getName(),
                entity.getDocument(),
                entity.getDocumentType(),
                entity.getRg(),
                entity.getBirthDate() == null || entity.getBirthDate().isBlank() ? null : java.time.LocalDate.parse(entity.getBirthDate()),
                entity.getDriverLicense(),
                entity.getAddress(),
                entity.getCity(),
                entity.getState(),
                entity.getPostalCode(),
                entity.getCountry(),
                entity.getNotes()
        );
    }
}
