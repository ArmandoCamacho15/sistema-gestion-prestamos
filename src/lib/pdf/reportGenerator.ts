import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

interface ReportData {
  summary: {
    capitalColocado: number;
    capitalRecuperado: number;
    interesesRecuperados: number;
    totalRecaudado: number;
    totalInteresProyectado: number;
    indiceMora: number;
    totalInyecciones: number;
    totalRetiros: number;
    gananciaNeta: number;
  };
  cashFlowData: { date: string; amount: number; retiro?: number }[];
  loansDistribution: { name: string; value: number }[];
  startDate: string;
  endDate: string;
}

export async function generateFinancialReportPDF(data: ReportData) {
  // Inicializamos jsPDF en orientación vertical
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Título
  doc.setFontSize(22);
  doc.setTextColor(33, 37, 41); // dark gray
  doc.text('Reporte Financiero', pageWidth / 2, 20, { align: 'center' });
  
  // Subtítulo con fecha
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // slate-500
  const periodo = `Periodo: ${data.startDate} al ${data.endDate}`;
  const generado = `Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
  doc.text(periodo, 14, 30);
  doc.text(generado, pageWidth - 14, 30, { align: 'right' });
  
  // Línea separadora
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(14, 35, pageWidth - 14, 35);
  
  // 1. Resumen de KPIs
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('1. Resumen de Rendimiento', 14, 45);
  
  const summaryBody = [
    ['Total Prestado', formatCurrency(data.summary.capitalColocado)],
    ['Intereses Recaudados', formatCurrency(data.summary.interesesRecuperados)],
    ['Capital Recuperado', formatCurrency(data.summary.capitalRecuperado)],
    ['Total Recaudado', formatCurrency(data.summary.totalRecaudado)],
    ['Ganancia Neta Real', formatCurrency(data.summary.gananciaNeta)],
    ['Índice de Mora', formatCurrency(data.summary.indiceMora)],
  ];
  
  // @ts-ignore - jspdf-autotable types issue
  autoTable(doc, {
    startY: 50,
    head: [['Indicador', 'Valor']],
    body: summaryBody,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  
  // 2. Distribución de Cartera
  // @ts-ignore
  let currentY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.text('2. Distribución de Cartera', 14, currentY);
  
  const distBody = data.loansDistribution.map(item => [item.name, item.value.toString()]);
  
  // @ts-ignore
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Estado', 'Cantidad de Préstamos']],
    body: distBody,
    theme: 'plain',
    headStyles: { fillColor: [226, 232, 240], textColor: [15, 23, 42] },
  });

  // 3. Movimientos de Capital
  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(14);
  doc.text('3. Movimientos de Capital', 14, currentY);

  const capitalBody = [
    ['Inyecciones de Capital', formatCurrency(data.summary.totalInyecciones || 0)],
    ['Retiros (Gastos)', formatCurrency(data.summary.totalRetiros || 0)],
  ];
  
  // @ts-ignore
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Tipo de Movimiento', 'Monto']],
    body: capitalBody,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] }, // emerald-500
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // 4. Flujo de Caja
  // @ts-ignore
  currentY = (doc as any).lastAutoTable.finalY + 15;
  
  // Verificar si hay espacio en la página, si no, crear nueva
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.text('4. Desglose de Recaudación vs Retiros', 14, currentY);
  
  const cashFlowBody = data.cashFlowData.map(item => [
    format(new Date(item.date + 'T00:00:00'), 'dd/MM/yyyy'), 
    formatCurrency(item.amount),
    formatCurrency(item.retiro || 0)
  ]);
  
  // @ts-ignore
  autoTable(doc, {
    startY: currentY + 5,
    head: [['Fecha', 'Recaudado', 'Retirado']],
    body: cashFlowBody,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }, // blue-500
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Guardar archivo
  doc.save(`Reporte_Financiero_${data.startDate}_al_${data.endDate}.pdf`);
}
