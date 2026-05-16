package br.com.iwarecibos.api.core.repository;

import br.com.iwarecibos.api.core.entity.ClientJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SpringDataClientRepository extends JpaRepository<ClientJpaEntity, String> {

    @Query("""
            select c from ClientJpaEntity c
            where lower(c.name) like lower(concat('%', :query, '%'))
               or c.document = :query
            order by c.name
            """)
    List<ClientJpaEntity> search(String query);

    List<ClientJpaEntity> findAllByOrderByNameAsc();

    Optional<ClientJpaEntity> findByDocument(String document);

    boolean existsByDocumentAndIdNot(String document, String id);
}
