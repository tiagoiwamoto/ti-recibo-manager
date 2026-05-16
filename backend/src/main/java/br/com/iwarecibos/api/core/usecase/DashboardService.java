package br.com.iwarecibos.api.core.usecase;

import br.com.iwarecibos.api.core.domain.DashboardSummary;
import br.com.iwarecibos.api.core.repository.SpringDataClientRepository;
import br.com.iwarecibos.api.core.repository.SpringDataReceiptRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardService {

    private final SpringDataClientRepository clientRepository;
    private final SpringDataReceiptRepository receiptRepository;


    public DashboardSummary getSummary() {
        return new DashboardSummary(
                clientRepository.count(),
                receiptRepository.count(),
                receiptRepository.sumAmount(),
                receiptRepository.findRecent(Pageable.ofSize(5))
        );
    }
}
