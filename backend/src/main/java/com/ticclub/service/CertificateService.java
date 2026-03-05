package com.ticclub.service;

import com.ticclub.util.PdfGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;

@Service
public class CertificateService {
    @Autowired
    private PdfGenerator pdfGenerator;

    public ByteArrayInputStream generateCertificate(String studentName, String eventName) {
        return pdfGenerator.generateDummyPdf("Certificate for " + studentName + " for attending " + eventName);
    }
}
