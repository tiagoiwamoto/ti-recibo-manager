package br.com.iwarecibos.api.entrypoint;

import br.com.iwarecibos.api.core.domain.DashboardSummary;
import br.com.iwarecibos.api.core.usecase.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/dashboard")
public class DashboardRest {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardSummary summary() {
        return dashboardService.getSummary();
    }
}
