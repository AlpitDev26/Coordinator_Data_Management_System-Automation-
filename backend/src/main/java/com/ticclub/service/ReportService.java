package com.ticclub.service;

import com.ticclub.util.PdfGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.ByteArrayInputStream;

@Service
public class ReportService {
    @Autowired
    private PdfGenerator pdfGenerator;

    public ByteArrayInputStream generateAttendanceReport(Long eventId) {
        return pdfGenerator.generateDummyPdf("Attendance Report for Event " + eventId);
    }
}
