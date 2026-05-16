package br.com.iwarecibos.api.core.repository;

import br.com.iwarecibos.api.core.entity.AppPreferenceJpaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpringDataAppPreferenceRepository extends JpaRepository<AppPreferenceJpaEntity, Long> {
}
