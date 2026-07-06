'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';
import { generateFinancialReportPDF } from '@/lib/pdf/reportGenerator';
import { toast } from 'sonner';

interface ExportButtonsProps {
  summary: any;
  cashFlowData: any[];
  loansDistribution: any[];
  startDate: string;
  endDate: string;
}

export function ExportButtons({
  summary,
  cashFlowData,
  loansDistribution,
  startDate,
  endDate,
}: ExportButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsGenerating(true);
      await generateFinancialReportPDF({
        summary,
        cashFlowData,
        loansDistribution,
        startDate,
        endDate,
      });
      toast.success('Reporte generado exitosamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el reporte');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={handleExportPDF} 
        disabled={isGenerating}
        className="gap-2"
      >
        {isGenerating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Descargar PDF
      </Button>
      {/* Futuro: Botón para Excel/CSV si se requiere */}
    </div>
  );
}
