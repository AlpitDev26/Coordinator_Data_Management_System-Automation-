package com.ticclub.util;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;

@Component
public class PdfGeneratorUtil {

    public byte[] generateCertificate(String studentName, String eventTitle) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            
            document.open();
            
            Font titleFont = new Font(Font.HELVETICA, 24, Font.BOLD);
            Paragraph title = new Paragraph("Certificate of Completion", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(40f);
            document.add(title);
            
            Font bodyFont = new Font(Font.HELVETICA, 16, Font.NORMAL);
            Paragraph body = new Paragraph(
                "This certifies that " + studentName + 
                "\nhas successfully completed the event:\n\n" + eventTitle, 
                bodyFont);
            body.setAlignment(Element.ALIGN_CENTER);
            document.add(body);
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF certificate", e);
        }
    }
}
