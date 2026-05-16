package br.com.iwarecibos.api.core.domain;

import br.com.iwarecibos.api.core.entity.ReceiptJpaEntity;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummary(
        long clientCount,
        long receiptCount,
        BigDecimal totalReceiptAmount,
        List<ReceiptJpaEntity> recentReceipts
) {
}
