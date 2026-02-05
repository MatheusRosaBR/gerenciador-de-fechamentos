import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Contract, SaleContract, ReceiptStatus, SaleStatus } from '../types';
import { formatCurrencyBRL } from './formatters';

interface ReportOptions {
    title: string;
    filtroPeriodo?: string;
    userName?: string;
}

export class PDFReportGenerator {
    private doc: jsPDF;

    constructor() {
        this.doc = new jsPDF();
    }

    private addHeader(title: string, filtro?: string, userName: string = 'Corretor') {
        const doc = this.doc;
        // @ts-ignore
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const today = new Date().toLocaleDateString('pt-BR');

        // Header Background
        doc.setFillColor(109, 40, 217); // Brand Brand Accent (Deep Purple) - approximate
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Title
        doc.setFontSize(22);
        doc.setTextColor(255, 255, 255);
        doc.text(title, 14, 25);

        // Subtitle / Info
        doc.setFontSize(10);
        doc.setTextColor(240, 240, 240);
        const infoText = `Gerado em: ${today} | Por: ${userName}`;
        doc.text(infoText, 14, 35);

        if (filtro) {
            doc.text(`Filtro: ${filtro}`, pageWidth - 14, 35, { align: 'right' });
        }
    }

    private addFooter() {
        const doc = this.doc;
        // @ts-ignore - getNumberOfPages might be missing in some type definitions but exists at runtime or usage varies
        const pageCount = doc.internal.getNumberOfPages ? doc.internal.getNumberOfPages() : (doc.internal.pages.length - 1);
        // @ts-ignore - access width/height via properties or methods depending on version
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        // @ts-ignore
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            const footerText = `Página ${i} de ${pageCount} - Gerenciador de Fechamentos`;
            doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
    }

    public generateContractReport(contracts: Contract[], options: ReportOptions) {
        this.addHeader(options.title, options.filtroPeriodo, options.userName);

        const tableColumn = ["Cliente", "Imóvel", "Valor Locação", "Comissão", "Líquo (Est.)", "Status", "Recebimento"];
        const tableRows: any[] = [];

        let totalComissao = 0;
        let totalLiquido = 0;

        contracts.forEach(contract => {
            const comissaoLiquida = contract.comissaoLiquida || (contract.comissao - (contract.impostos || 0));
            totalComissao += contract.comissao;
            totalLiquido += comissaoLiquida;

            const contractData = [
                contract.cliente,
                contract.imovel,
                formatCurrencyBRL(contract.valorLocacao),
                formatCurrencyBRL(contract.comissao),
                formatCurrencyBRL(comissaoLiquida),
                contract.statusContrato,
                contract.statusRecebimento === ReceiptStatus.Sim ? 'Recebido' : 'Pendente',
            ];
            tableRows.push(contractData);
        });

        // Summary Row
        const summaryRow = [
            'TOTAL', '', '',
            formatCurrencyBRL(totalComissao),
            formatCurrencyBRL(totalLiquido),
            '', ''
        ];
        // @ts-ignore
        tableRows.push(summaryRow);

        // @ts-ignore
        autoTable(this.doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            styles: { fontSize: 9, cellPadding: 3 },
            foot: [summaryRow], // Use footer for totals properly if supported, but pushing to body is safer for basic implementation
            didParseCell: (data) => {
                if (data.row.index === tableRows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [229, 231, 235];
                }
            }
        });

        this.addFooter();
        this.doc.save('relatorio_locacoes.pdf');
    }

    public generateSaleReport(sales: SaleContract[], options: ReportOptions) {
        this.addHeader(options.title, options.filtroPeriodo, options.userName);

        const tableColumn = ["Cliente", "Imóvel", "Valor Venda", "Comissão", "Líquo (Est.)", "Status", "Recebimento"];
        const tableRows: any[] = [];

        let totalComissao = 0;
        let totalLiquido = 0;

        sales.forEach(sale => {
            const comissaoLiquida = sale.comissaoLiquida || (sale.comissao - (sale.impostos || 0));
            totalComissao += sale.comissao;
            totalLiquido += comissaoLiquida;

            const saleData = [
                sale.cliente,
                sale.imovel,
                formatCurrencyBRL(sale.valorVenda),
                formatCurrencyBRL(sale.comissao),
                formatCurrencyBRL(comissaoLiquida),
                sale.statusVenda,
                sale.statusRecebimento === ReceiptStatus.Sim ? 'Recebido' : 'Pendente',
            ];
            tableRows.push(saleData);
        });

        // Summary Row
        const summaryRow = [
            'TOTAL', '', '',
            formatCurrencyBRL(totalComissao),
            formatCurrencyBRL(totalLiquido),
            '', ''
        ];
        // @ts-ignore
        tableRows.push(summaryRow);

        // @ts-ignore
        autoTable(this.doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            styles: { fontSize: 9, cellPadding: 3 },
            didParseCell: (data) => {
                if (data.row.index === tableRows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [229, 231, 235];
                }
            }
        });

        this.addFooter();
        this.doc.save('relatorio_vendas.pdf');
    }
}
