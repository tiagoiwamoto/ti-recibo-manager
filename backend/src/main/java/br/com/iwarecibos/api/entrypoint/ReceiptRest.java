package br.com.iwarecibos.api.entrypoint;

import br.com.iwarecibos.api.core.domain.Receipt;
import br.com.iwarecibos.api.core.usecase.ReceiptService;
import br.com.iwarecibos.api.entrypoint.dto.ReceiptPreviewData;
import br.com.iwarecibos.api.entrypoint.dto.ReceiptRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Map;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/v1/receipts")
public class ReceiptRest {

    private final ReceiptService receiptService;


    @GetMapping
    public List<Receipt> list(@RequestParam(required = false) String q) {
        return receiptService.list(q);
    }

    @GetMapping("/{id}")
    public Receipt get(@PathVariable String id) {
        return receiptService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Receipt create(@Valid @RequestBody ReceiptRequest request) {
        return receiptService.create(request);
    }

    @PutMapping("/{id}")
    public Receipt update(@PathVariable String id, @Valid @RequestBody ReceiptRequest request) {
        return receiptService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        receiptService.delete(id);
    }

    @GetMapping(value = "/{id}/preview", produces = MediaType.APPLICATION_JSON_VALUE)
    public ReceiptPreviewData preview(@PathVariable String id,
                                       @RequestParam(required = false) String template) {
        return receiptService.getPreviewData(id, template);
    }

    @PostMapping(value = "/preview", produces = MediaType.APPLICATION_JSON_VALUE)
    public ReceiptPreviewData previewDraft(@RequestBody ReceiptRequest request,
                                            @RequestParam(required = false) String template) {
        return receiptService.getPreviewDataFromRequest(request, template);
    }
}
