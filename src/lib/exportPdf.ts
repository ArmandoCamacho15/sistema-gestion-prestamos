/**
 * exportLoanPdf
 * Genera un PDF profesional (tamaño carta / landscape) del cronograma de pagos.
 * Importa jspdf y jspdf-autotable de forma dinámica para evitar errores en SSR.
 */

interface Installment {
  installment_number: number;
  due_date: string;
  capital_amount: number;
  interest_amount: number;
  total_amount: number;
  balance_after: number;
  status: string;
  paid_date?: string | null;
}

interface LoanForPdf {
  id: string;
  amount: number;
  total_amount: number;
  total_interest: number;
  installment_amount: number;
  term_months: number;
  interest_rate: number;
  rate_type: string;
  payment_frequency: string;
  start_date: string;
  first_payment_date: string;
  status: string;
  clients: {
    full_name: string;
    identification: string;
    phone?: string;
    email?: string;
  };
  installments: Installment[];
}

const STATUS_LABELS: Record<string, string> = {
  paid: "Pagada",
  pending: "Pendiente",
  late: "Morosa",
};

const COP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const FMT_DATE = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export async function exportLoanPdf(loan: LoanForPdf) {
  const jsPDF = (await import("jspdf")).default;
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();

  // ── HEADER ──────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 34, "F");

  // Logo / nombre
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PrestamosApp", 14, 13);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Sistema de Gestión de Préstamos", 14, 20);
  doc.text(`Generado: ${new Date().toLocaleDateString("es-CO")}`, 14, 27);

  // ID y estado (derecha del header)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(`Préstamo #${loan.id.substring(0, 8).toUpperCase()}`, pageW - 14, 13, { align: "right" });

  const stColor: [number, number, number] =
    loan.status === "pagado" ? [34, 197, 94] : loan.status === "moroso" ? [239, 68, 68] : [96, 165, 250];
  doc.setTextColor(...stColor);
  doc.text(loan.status.toUpperCase(), pageW - 14, 20, { align: "right" });

  // ── SECCIÓN CLIENTE + RESUMEN ──────────────────────────────
  const sy = 40; // section Y

  // Columna 1: cliente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("CLIENTE", 14, sy);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Nombre: ${loan.clients.full_name}`, 14, sy + 7);
  doc.text(`Doc: ${loan.clients.identification}`, 14, sy + 13);
  if (loan.clients.phone) doc.text(`Tel: ${loan.clients.phone}`, 14, sy + 19);
  if (loan.clients.email) doc.text(`Email: ${loan.clients.email}`, 14, sy + 25);

  // Columna 2: plan de pagos
  const c2 = pageW / 3;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("PLAN DE PAGOS", c2, sy);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Plazo: ${loan.term_months} meses`, c2, sy + 7);
  doc.text(`Tasa: ${loan.interest_rate}% mensual (${loan.rate_type})`, c2, sy + 13);
  doc.text(`Frecuencia: ${loan.payment_frequency}`, c2, sy + 19);
  doc.text(`Primer pago: ${FMT_DATE(loan.first_payment_date)}`, c2, sy + 25);

  // Columna 3: resumen financiero
  const c3 = (pageW / 3) * 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("RESUMEN FINANCIERO", c3, sy);

  const labels = ["Capital prestado:", "Intereses totales:", "Total a pagar:", "Valor cuota:"];
  const values = [COP(loan.amount), COP(loan.total_interest), COP(loan.total_amount), COP(loan.installment_amount)];
  labels.forEach((lbl, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(lbl, c3, sy + 7 + i * 6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(values[i], pageW - 14, sy + 7 + i * 6, { align: "right" });
  });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, sy + 32, pageW - 14, sy + 32);

  // ── TABLA CRONOGRAMA ──────────────────────────────────────────
  autoTable(doc, {
    startY: sy + 37,
    head: [["#", "Fecha Vcto.", "Capital", "Interés", "Cuota Total", "Saldo", "Estado", "Fecha Pago"]],
    body: loan.installments.map((inst) => [
      inst.installment_number,
      FMT_DATE(inst.due_date),
      COP(inst.capital_amount),
      COP(inst.interest_amount),
      COP(inst.total_amount),
      COP(inst.balance_after),
      STATUS_LABELS[inst.status] || inst.status,
      inst.paid_date ? FMT_DATE(inst.paid_date) : "-",
    ]),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right", fontStyle: "bold" },
      5: { halign: "right" },
      6: { halign: "center", cellWidth: 22 },
      7: { halign: "center" },
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    willDrawCell: (data) => {
      if (data.section !== "body" || data.column.index !== 6) return;
      const rowInst = loan.installments[data.row.index];
      if (!rowInst) return;
      if (rowInst.status === "paid") {
        data.cell.styles.fillColor = [220, 252, 231];
        data.cell.styles.textColor = [21, 128, 61];
      } else if (rowInst.status === "late") {
        data.cell.styles.fillColor = [254, 226, 226];
        data.cell.styles.textColor = [185, 28, 28];
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── PIE DE PÁGINA ─────────────────────────────────────────────
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Documento informativo generado por PrestamosApp. No constituye un título valor.",
      14,
      ph - 6
    );
    doc.setFont("helvetica", "normal");
    doc.text(`Pág. ${i} / ${pageCount}`, pageW - 14, ph - 6, { align: "right" });
  }

  const fileName = `prestamo_${loan.clients.full_name.replace(/\s+/g, "_")}_${loan.id.substring(0, 8)}.pdf`;
  doc.save(fileName);
}
