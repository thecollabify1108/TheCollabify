import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaDownload, FaFilePdf, FaFileCsv, FaFileExcel } from 'react-icons/fa';
import { HiDocumentReport } from 'react-icons/hi';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export Reports Component
 * Allows users to download campaign data, earnings, and analytics
 */
const ExportReports = ({ data, type = 'campaign', title }) => {
    const [isExporting, setIsExporting] = useState(false);

    // Export to CSV
    const exportToCSV = () => {
        try {
            setIsExporting(true);

            let csvContent = '';
            let filename = '';

            if (type === 'campaign') {
                // Campaign export
                csvContent = 'Campaign Title,Budget,Status,Applications,Created Date\n';
                data.forEach(item => {
                    csvContent += `"${item.title}","₹${item.budget}","${item.status}","${item.applicationsCount}","${new Date(item.createdAt).toLocaleDateString()}"\n`;
                });
                filename = `campaigns_${Date.now()}.csv`;
            } else if (type === 'earnings') {
                // Earnings export
                csvContent = 'Date,Campaign,Brand,Amount,Status\n';
                data.forEach(item => {
                    csvContent += `"${new Date(item.date).toLocaleDateString()}","${item.campaign}","${item.brand}","₹${item.amount}","${item.status}"\n`;
                });
                filename = `earnings_${Date.now()}.csv`;
            } else if (type === 'applications') {
                // Applications export
                csvContent = 'Campaign,Brand,Status,Applied Date,Match Score\n';
                data.forEach(item => {
                    csvContent += `"${item.campaignTitle}","${item.brandName}","${item.status}","${new Date(item.appliedAt).toLocaleDateString()}","${item.matchScore}%"\n`;
                });
                filename = `applications_${Date.now()}.csv`;
            }

            // Create and download CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            toast.success('CSV file downloaded successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export CSV');
        } finally {
            setIsExporting(false);
        }
    };

    // Export to PDF
    const exportToPDF = () => {
        try {
            setIsExporting(true);

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(139, 92, 246); // Primary color
            doc.text('TheCollabify', pageWidth / 2, 20, { align: 'center' });

            doc.setFontSize(16);
            doc.setTextColor(0, 0, 0);
            doc.text(title || 'Report', pageWidth / 2, 30, { align: 'center' });

            doc.setFontSize(10);
            doc.setTextColor(128, 128, 128);
            doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 37, { align: 'center' });

            // Table data
            let tableData = [];
            let tableHeaders = [];

            if (type === 'campaign') {
                tableHeaders = ['Campaign', 'Budget', 'Status', 'Applications', 'Date'];
                tableData = data.map(item => [
                    item.title,
                    `₹${item.budget}`,
                    item.status,
                    item.applicationsCount,
                    new Date(item.createdAt).toLocaleDateString()
                ]);
            } else if (type === 'earnings') {
                tableHeaders = ['Date', 'Campaign', 'Brand', 'Amount', 'Status'];
                tableData = data.map(item => [
                    new Date(item.date).toLocaleDateString(),
                    item.campaign,
                    item.brand,
                    `₹${item.amount}`,
                    item.status
                ]);
            } else if (type === 'applications') {
                tableHeaders = ['Campaign', 'Brand', 'Status', 'Date', 'Score'];
                tableData = data.map(item => [
                    item.campaignTitle,
                    item.brandName,
                    item.status,
                    new Date(item.appliedAt).toLocaleDateString(),
                    `${item.matchScore}%`
                ]);
            }

            // Add table
            doc.autoTable({
                head: [tableHeaders],
                body: tableData,
                startY: 45,
                theme: 'striped',
                headStyles: {
                    fillColor: [139, 92, 246],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                }
            });

            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            // Download
            const filename = `${type}_report_${Date.now()}.pdf`;
            doc.save(filename);

            toast.success('PDF report downloaded successfully!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to generate PDF');
        } finally {
            setIsExporting(false);
        }
    };

    // Export to Excel (actually CSV with .xlsx extension for compatibility)
    const exportToExcel = () => {
        exportToCSV(); // For now, use CSV. Can upgrade to actual Excel with xlsx library
    };

    return (
        <div className="flex gap-2">
            {/* CSV Export */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToCSV}
                disabled={isExporting || !data || data.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-dark-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                title="Export to CSV"
            >
                <FaFileCsv />
                <span className="hidden sm:inline">CSV</span>
            </motion.button>

            {/* PDF Export */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToPDF}
                disabled={isExporting || !data || data.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-dark-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                title="Export to PDF"
            >
                <FaFilePdf />
                <span className="hidden sm:inline">PDF</span>
            </motion.button>

            {/* Excel Export */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToExcel}
                disabled={isExporting || !data || data.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-dark-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                title="Export to Excel"
            >
                <FaFileExcel />
                <span className="hidden sm:inline">Excel</span>
            </motion.button>
        </div>
    );
};

export default ExportReports;
