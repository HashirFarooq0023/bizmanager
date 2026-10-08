import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Format currency for display and export
 */
export const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `Rs ${num.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            month: '2-digit',
            year: '2-digit'
        });
    } catch {
        return String(dateVal);
    }
};

/**
 * Clean text for standard PDF fonts (strips non-renderable characters to avoid mojibake)
 */
const sanitizePDFText = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/[^\x00-\x7F\u00A0-\u00FF]/g, '')
        .trim();
};

/**
 * Extract clean English title (strips Urdu/bilingual split parts if present)
 */
const getCleanTitle = (title) => {
    if (!title) return 'Business Report';
    const firstPart = title.split('/')[0].trim();
    return sanitizePDFText(firstPart) || 'Business Report';
};

/**
 * Format date range for subtitle
 */
const getDateRangeSubtitle = (dateRange) => {
    if (!dateRange) return 'All Records';
    if (typeof dateRange === 'string') return sanitizePDFText(dateRange) || 'This Month';

    if (dateRange.label) {
        const cleanLabel = sanitizePDFText(dateRange.label.split('/')[0].trim());
        if (cleanLabel) return cleanLabel;
    }

    if (dateRange.startDate && dateRange.endDate) {
        return `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`;
    }

    return 'This Month';
};

/**
 * Export data to PDF using jsPDF and jspdf-autotable
 * Matches the neat, clean, enterprise audit-ready PDF layout
 */
export const exportReportToPDF = ({
    title = 'Business Report',
    dateRange = null,
    summaryCards = [],
    columns = [],
    data = [],
    fileName = 'report',
    orientation = 'portrait', // 'portrait' or 'landscape'
    tableHeading = 'Transaction Details',
}) => {
    try {
        const doc = new jsPDF({
            orientation,
            unit: 'pt',
            format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Standard margins (15mm left/right, 20mm top/bottom in points)
        const marginLeft = 42.52;
        const marginRight = 42.52;
        const marginTop = 50.0;
        const marginBottom = 50.0;
        const contentWidth = pageWidth - marginLeft - marginRight;

        let yPosition = marginTop;

        // User / Shop info from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const shopName = sanitizePDFText(user?.shopName || user?.name || 'Business Report');
        const shopAddress = sanitizePDFText(user?.shopAddress || user?.address || '');
        const phone = sanitizePDFText(user?.phone || '');

        // ========== 1. HEADER SECTION (Clean, Centered) ==========
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.setTextColor(17, 24, 39); // #111827
        doc.text(shopName, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 18;

        if (shopAddress) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99); // #4b5563
            doc.text(shopAddress, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 13;
        }

        if (phone) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);
            doc.text(`Phone: ${phone}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 13;
        }

        // Top horizontal divider
        yPosition += 6;
        doc.setLineWidth(0.5);
        doc.setDrawColor(209, 213, 219); // #d1d5db
        doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
        yPosition += 24;

        // ========== 2. REPORT TITLE & PERIOD SUBTITLE ==========
        const cleanTitle = getCleanTitle(title);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(17, 24, 39);
        doc.text(cleanTitle, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 18;

        const dateRangeText = getDateRangeSubtitle(dateRange);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(75, 85, 99);
        doc.text(dateRangeText, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Second horizontal divider
        doc.setLineWidth(0.5);
        doc.setDrawColor(209, 213, 219);
        doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
        yPosition += 22;

        // ========== 3. SUMMARY SECTION (Two-Column Clean Grid) ==========
        if (summaryCards && summaryCards.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(17, 24, 39);
            doc.text('Summary', marginLeft, yPosition);
            yPosition += 18;

            const halfIndex = Math.ceil(summaryCards.length / 2);
            const leftCol = summaryCards.slice(0, halfIndex);
            const rightCol = summaryCards.slice(halfIndex);

            const col1X = marginLeft;
            const col2X = marginLeft + (contentWidth / 2) + 20;
            const colWidth = (contentWidth / 2) - 30;
            const rowHeight = 16;

            let startSummaryY = yPosition;
            let currentLeftY = startSummaryY;
            let currentRightY = startSummaryY;

            // Render Left Column
            leftCol.forEach((card) => {
                const label = sanitizePDFText(card.label.split('/')[0].trim());
                const val = sanitizePDFText(String(card.value));
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(55, 65, 81);
                doc.text(`${label}:`, col1X, currentLeftY);

                doc.setFont('helvetica', 'bold');
                doc.setTextColor(17, 24, 39);
                doc.text(val, col1X + colWidth, currentLeftY, { align: 'right' });
                currentLeftY += rowHeight;
            });

            // Render Right Column
            rightCol.forEach((card) => {
                const label = sanitizePDFText(card.label.split('/')[0].trim());
                const val = sanitizePDFText(String(card.value));
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(55, 65, 81);
                doc.text(`${label}:`, col2X, currentRightY);

                doc.setFont('helvetica', 'bold');
                doc.setTextColor(17, 24, 39);
                doc.text(val, col2X + colWidth, currentRightY, { align: 'right' });
                currentRightY += rowHeight;
            });

            yPosition = Math.max(currentLeftY, currentRightY) + 16;
        }

        // ========== 4. TRANSACTION / DATA DETAILS TABLE ==========
        if (columns.length > 0 && data.length > 0) {
            // Check if we need to start table on fresh page
            if (yPosition > pageHeight - marginBottom - 100) {
                doc.addPage();
                yPosition = marginTop;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(17, 24, 39);
            doc.text(sanitizePDFText(tableHeading) || 'Transaction Details', marginLeft, yPosition);
            yPosition += 12;

            const tableHeaders = columns.map(col => sanitizePDFText(col.header.split('/')[0].trim()));
            const tableRows = data.map(row =>
                columns.map(col => {
                    const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                    return val !== undefined && val !== null ? sanitizePDFText(String(val)) : '-';
                })
            );

            // Compute dynamic column alignment
            const columnStyles = {};
            columns.forEach((col, idx) => {
                const h = (col.header || '').toLowerCase();
                if (
                    h.includes('amount') ||
                    h.includes('total') ||
                    h.includes('tax') ||
                    h.includes('discount') ||
                    h.includes('profit') ||
                    h.includes('inflow') ||
                    h.includes('outflow') ||
                    h.includes('rate') ||
                    h.includes('price') ||
                    h.includes('balance') ||
                    h.includes('due') ||
                    h.includes('debit') ||
                    h.includes('credit') ||
                    h.includes('cost') ||
                    h.includes('margin') ||
                    h.includes('qty') ||
                    h.includes('quantity') ||
                    h.includes('%')
                ) {
                    columnStyles[idx] = { halign: 'right' };
                } else if (h.includes('date') || h.includes('status') || h.includes('mode') || h.includes('type')) {
                    columnStyles[idx] = { halign: 'center' };
                } else {
                    columnStyles[idx] = { halign: 'left' };
                }
            });

            autoTable(doc, {
                head: [tableHeaders],
                body: tableRows,
                startY: yPosition,
                margin: { left: marginLeft, right: marginRight, bottom: marginBottom },
                theme: 'plain',
                headStyles: {
                    fillColor: [240, 240, 240], // Light clean gray #f0f0f0
                    textColor: [31, 41, 55],    // Dark gray #1f2937
                    fontSize: 9,
                    fontStyle: 'bold',
                    lineColor: [209, 213, 219],
                    lineWidth: { top: 0, bottom: 0.5, left: 0, right: 0 },
                    cellPadding: { top: 5, bottom: 5, left: 4, right: 4 },
                },
                bodyStyles: {
                    fontSize: 8.5,
                    textColor: [31, 41, 55],
                    cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
                    lineColor: [243, 244, 246],
                    lineWidth: { top: 0, bottom: 0, left: 0, right: 0 },
                },
                alternateRowStyles: {
                    fillColor: [252, 252, 252], // Subtle alternating row tint #fcfcfc
                },
                columnStyles,
                styles: {
                    overflow: 'linebreak',
                },
                didDrawPage: (dataHook) => {
                    const totalPages = doc.internal.getNumberOfPages();

                    // Footer divider line
                    doc.setLineWidth(0.3);
                    doc.setDrawColor(209, 213, 219);
                    doc.line(marginLeft, pageHeight - marginBottom + 10, pageWidth - marginRight, pageHeight - marginBottom + 10);

                    // Page number (Centered)
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(107, 114, 128); // #6b7280
                    doc.text(
                        `Page ${dataHook.pageNumber} of ${totalPages}`,
                        pageWidth / 2,
                        pageHeight - marginBottom + 20,
                        { align: 'center' }
                    );

                    // Generated Timestamp (Right aligned)
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('en-GB');
                    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
                    const timestamp = `Generated on ${dateStr} at ${timeStr}`;
                    doc.text(
                        timestamp,
                        pageWidth - marginRight,
                        pageHeight - marginBottom + 20,
                        { align: 'right' }
                    );
                },
            });
        }

        // Save PDF
        const cleanFileBase = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const finalFileName = `${cleanFileBase || 'report'}-${Date.now()}.pdf`;
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
                const header = col.header.split('/')[0].trim();
                const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                obj[header] = val !== undefined && val !== null ? val : '';
            });
            return obj;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Auto-size columns
        const colWidths = columns.map(col => {
            const header = col.header.split('/')[0].trim();
            const headerLen = header.length;
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
        const cleanTitle = title.split('/')[0].trim().slice(0, 30);
        XLSX.utils.book_append_sheet(workbook, worksheet, cleanTitle || 'Report');

        const cleanFileBase = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const finalFileName = `${cleanFileBase || 'report'}-${new Date().toISOString().split('T')[0]}.xlsx`;
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
        const headers = columns.map(c => `"${c.header.split('/')[0].trim().replace(/"/g, '""')}"`).join(',');
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
        const cleanFileBase = fileName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        link.setAttribute('download', `${cleanFileBase || 'report'}-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
    } catch (err) {
        console.error('CSV Export Error:', err);
        throw err;
    }
};
