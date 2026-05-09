import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates a multi-page PDF report of the current financial state.
 */
export const generatePDFReport = async (
    elementIds: string[], 
    metadata: { name: string, date: string, currency: string, netWorth: string }
) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // --- Page 1: Cover & Summary ---
    doc.setFillColor(29, 29, 31); // Apple Dark
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FinnaFlow Health Report', margin, 35);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${metadata.date}`, margin, 45);
    doc.text(`Currency: ${metadata.currency}`, margin, 50);

    doc.setTextColor(29, 29, 31);
    doc.setFontSize(16);
    doc.text('Summary', margin, 80);
    
    doc.setFontSize(12);
    doc.text(`Total Net Worth: ${metadata.netWorth}`, margin, 95);
    
    let currentY = 110;

    // --- Process Visualizations ---
    for (const id of elementIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        // Capture element
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });
        
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if we need a new page
        if (currentY + imgHeight > pageHeight - margin) {
            doc.addPage();
            currentY = margin;
        }

        doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
    }

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`FinnaFlow · Local-First Personal Finance · Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(`finnaflow-report-${metadata.date.split(' ')[0]}.pdf`);
};
