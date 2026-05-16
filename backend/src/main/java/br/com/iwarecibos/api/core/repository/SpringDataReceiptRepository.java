package br.com.iwarecibos.api.core.repository;

import br.com.iwarecibos.api.core.entity.ReceiptJpaEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface SpringDataReceiptRepository extends JpaRepository<ReceiptJpaEntity, String> {

    @Query("""
            select r from ReceiptJpaEntity r
            where lower(r.payerName) like lower(concat('%', :query, '%'))
               or lower(r.receiverName) like lower(concat('%', :query, '%'))
               or r.payerDocument = :query
               or r.receiverDocument = :query
            order by r.issueDate desc, r.id desc
            """)
    List<ReceiptJpaEntity> search(String query);

    List<ReceiptJpaEntity> findAllByOrderByIssueDateDescIdDesc();

    @Query("select r from ReceiptJpaEntity r order by r.issueDate desc, r.id desc")
    List<ReceiptJpaEntity> findRecent(Pageable pageable);

    @Query("select coalesce(sum(r.amount), 0) from ReceiptJpaEntity r")
    BigDecimal sumAmount();

    @Query(value = "select coalesce(max(cast(id as integer)), 0) from receipts where regexp_like(id, '^[0-9]+$')", nativeQuery = true)
    Integer findMaxNumericId();
}
