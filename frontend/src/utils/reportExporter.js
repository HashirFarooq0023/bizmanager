import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Format currency for display and export
 */
export const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `Rs. ${num.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date for display and export
 */
export const formatDate = (dateVal) => {
    if (!dateVal) return '-';
    try {
        const d = new Date(dateVal);
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return String(dateVal);
    }
};

/**
 * Export data to PDF using jsPDF and jspdf-autotable
 */
export const exportReportToPDF = ({
    title = 'Business Report',
    dateRange = null,
    summaryCards = [],
    columns = [],
    data = [],
    fileName = 'report',
    orientation = 'portrait', // 'portrait' or 'landscape'
}) => {
    try {
        const doc = new jsPDF({
            orientation,
            unit: 'mm',
            format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let currentY = 15;

        // User info from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const shopName = user?.shopName || user?.name || 'BizManager Business ERP';
        const shopAddress = user?.shopAddress || user?.address || '';
        const phone = user?.phone || '';

        // 1. Business Header
        doc.setFillColor(30, 41, 59); // Slate-800
        doc.rect(0, 0, pageWidth, 28, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(shopName, 14, 12);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(203, 213, 225);
        if (shopAddress || phone) {
            doc.text([shopAddress, phone].filter(Boolean).join(' | '), 14, 18);
        }
        doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth - 14, 18, { align: 'right' });

        currentY = 36;

        // 2. Report Title & Date Range
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 14, currentY);

        if (dateRange?.startDate && dateRange?.endDate) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(100, 116, 139);
            const rangeStr = `Period: ${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
            doc.text(rangeStr, pageWidth - 14, currentY, { align: 'right' });
        }

        currentY += 8;

        // 3. Summary Cards (if any)
        if (summaryCards && summaryCards.length > 0) {
            const cardWidth = (pageWidth - 28 - (summaryCards.length - 1) * 4) / summaryCards.length;
            const cardHeight = 16;

            summaryCards.forEach((card, index) => {
                const cardX = 14 + index * (cardWidth + 4);
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(226, 232, 240);
                doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(100, 116, 139);
                doc.text(card.label.toUpperCase(), cardX + 3, currentY + 5);

                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(15, 23, 42);
                doc.text(String(card.value), cardX + 3, currentY + 12);
            });

            currentY += cardHeight + 8;
        }

        // 4. Data Table
        if (columns.length > 0 && data.length > 0) {
            const tableHeaders = columns.map(col => col.header);
            const tableRows = data.map(row =>
                columns.map(col => {
                    const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                    return val !== undefined && val !== null ? String(val) : '-';
                })
            );

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: currentY,
                margin: { left: 14, right: 14, bottom: 18 },
                theme: 'striped',
                headStyles: {
                    fillColor: [79, 70, 229], // Indigo 600
                    textColor: 255,
                    fontSize: 8.5,
                    fontStyle: 'bold',
                    halign: 'left',
                },
                bodyStyles: {
                    fontSize: 8,
                    textColor: [51, 65, 85],
                },
                alternateRowStyles: {
                    fillColor: [248, 250, 252],
                },
                styles: {
                    cellPadding: 2.5,
                    overflow: 'linebreak',
                },
                didDrawPage: (data) => {
                    // Footer
                    const totalPages = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(
                        `Page ${data.pageNumber} of ${totalPages}`,
                        pageWidth - 14,
                        pageHeight - 8,
                        { align: 'right' }
                    );
                    doc.text('BizManager Cloud Business ERP', 14, pageHeight - 8);
                },
            });
        }

        // Save PDF
        const finalFileName = `${fileName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(finalFileName);
        return true;
    } catch (err) {
        console.error('PDF Export Error:', err);
        throw err;
    }
};

/**
 * Export data to Excel (.xlsx) using xlsx
 */
export const exportReportToExcel = ({
    title = 'Report',
    columns = [],
    data = [],
    summaryCards = [],
    fileName = 'report',
}) => {
    try {
        const rows = data.map(row => {
            const obj = {};
            columns.forEach(col => {
                const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                obj[col.header] = val !== undefined && val !== null ? val : '';
            });
            return obj;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Auto-size columns
        const colWidths = columns.map(col => {
            const headerLen = col.header.length;
            const maxValLen = Math.max(
                ...data.map(row => {
                    const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                    return String(val || '').length;
                }),
                0
            );
            return { wch: Math.min(Math.max(headerLen, maxValLen) + 4, 40) };
        });
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 30));

        const finalFileName = `${fileName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(workbook, finalFileName);
        return true;
    } catch (err) {
        console.error('Excel Export Error:', err);
        throw err;
    }
};

/**
 * Export data to CSV
 */
export const exportReportToCSV = ({
    columns = [],
    data = [],
    fileName = 'report',
}) => {
    try {
        const headers = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
        const rows = data.map(row =>
            columns.map(col => {
                const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                const str = val !== undefined && val !== null ? String(val) : '';
                return `"${str.replace(/"/g, '""')}"`;
            }).join(',')
        );

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return true;
    } catch (err) {
        console.error('CSV Export Error:', err);
        throw err;
    }
};
