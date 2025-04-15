import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Tipos para os diferentes relatórios
export interface ServicoRelatorio {
  mes?: string;
  nome?: string;
  quantidade: number;
  valor: number;
  [key: string]: any;
}

export interface MecanicoRelatorio {
  nome: string;
  servicos: number;
  comissao: number;
  [key: string]: any;
}

export interface ValeRelatorio {
  mes?: string;
  quantidade: number;
  valor: number;
  [key: string]: any;
}

// Função para formatar valores monetários
const formatarValor = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

// Função para exportar como PDF
export const exportToPDF = (
  titulo: string,
  dados: Array<any>,
  colunas: { header: string; dataKey: string }[],
  orientacao: 'portrait' | 'landscape' = 'portrait'
): void => {
  const doc = new jsPDF({
    orientation: orientacao,
    unit: 'mm',
    format: 'a4'
  });

  // Adiciona título
  doc.setFontSize(16);
  doc.text(titulo, 14, 20);
  doc.setFontSize(10);
  doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
  
  // Prepara os dados para a tabela
  const tabelaDados = dados.map(item => {
    const linha: { [key: string]: any } = {};
    colunas.forEach(coluna => {
      let valor = item[coluna.dataKey];
      
      // Formata valores monetários
      if (typeof valor === 'number' && (coluna.dataKey.includes('valor') || coluna.dataKey.includes('comissao'))) {
        valor = formatarValor(valor);
      }
      
      linha[coluna.dataKey] = valor;
    });
    return Object.values(linha);
  });
  
  try {
    // Correto: Usar autoTable como função importada
    autoTable(doc, {
      head: [colunas.map(coluna => coluna.header)],
      body: tabelaDados,
      startY: 35,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 8
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });
    
    // Adiciona rodapé
    const pageCount = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
      doc.text('Sistema de Gestão de Oficina', 14, doc.internal.pageSize.height - 10);
    }
    
    // Salva o arquivo
    doc.save(`${titulo.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw error;
  }
};

// Função para exportar como Excel
export const exportToExcel = (
  titulo: string,
  dados: Array<any>,
  colunas: { header: string; dataKey: string }[]
): void => {
  // Prepara os dados para o Excel
  const dadosFormatados = dados.map(item => {
    const linha: { [key: string]: any } = {};
    colunas.forEach(coluna => {
      linha[coluna.header] = item[coluna.dataKey];
    });
    return linha;
  });
  
  // Cria uma planilha
  const ws = XLSX.utils.json_to_sheet(dadosFormatados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
  
  // Configura a largura das colunas
  const colWidths = colunas.map(() => ({ wch: 15 }));
  ws['!cols'] = colWidths;
  
  // Salva o arquivo
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, `${titulo.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Função para exportar relatório de serviços
export const exportarRelatorioServicos = (
  servicos: ServicoRelatorio[],
  formato: 'pdf' | 'excel'
): void => {
  const titulo = 'Relatório de Serviços';
  const colunas = [
    { header: 'Mês/Nome', dataKey: servicos[0].mes ? 'mes' : 'nome' },
    { header: 'Quantidade', dataKey: 'quantidade' },
    { header: 'Valor (R$)', dataKey: 'valor' }
  ];
  
  if (formato === 'pdf') {
    exportToPDF(titulo, servicos, colunas);
  } else {
    exportToExcel(titulo, servicos, colunas);
  }
};

// Função para exportar relatório de mecânicos
export const exportarRelatorioMecanicos = (
  mecanicos: MecanicoRelatorio[],
  formato: 'pdf' | 'excel'
): void => {
  const titulo = 'Relatório de Mecânicos';
  const colunas = [
    { header: 'Nome', dataKey: 'nome' },
    { header: 'Serviços Realizados', dataKey: 'servicos' },
    { header: 'Comissão (R$)', dataKey: 'comissao' }
  ];
  
  if (formato === 'pdf') {
    exportToPDF(titulo, mecanicos, colunas);
  } else {
    exportToExcel(titulo, mecanicos, colunas);
  }
};

// Função para exportar relatório de vales
export const exportarRelatorioVales = (
  vales: ValeRelatorio[],
  formato: 'pdf' | 'excel'
): void => {
  const titulo = 'Relatório de Vales';
  const colunas = [
    { header: 'Mês', dataKey: 'mes' },
    { header: 'Quantidade', dataKey: 'quantidade' },
    { header: 'Valor (R$)', dataKey: 'valor' }
  ];
  
  if (formato === 'pdf') {
    exportToPDF(titulo, vales, colunas);
  } else {
    exportToExcel(titulo, vales, colunas);
  }
};

// Função para exportar relatório completo
export const exportarRelatorioCompleto = (
  servicos: ServicoRelatorio[],
  mecanicos: MecanicoRelatorio[],
  vales: ValeRelatorio[],
  tiposServico: ServicoRelatorio[],
  formato: 'pdf' | 'excel'
): void => {
  const titulo = 'Relatório Gerencial Completo';
  
  if (formato === 'pdf') {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Título principal
    doc.setFontSize(18);
    doc.text(titulo, 14, 20);
    doc.setFontSize(10);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
    
    let yPos = 35;
    
    // Seção 1: Serviços por Mês
    doc.setFontSize(14);
    doc.text('Serviços por Mês', 14, yPos);
    yPos += 8;
    
    try {
      autoTable(doc, {
        head: [['Mês', 'Quantidade', 'Valor (R$)']],
        body: servicos.map(s => [
          s.mes,
          s.quantidade,
          formatarValor(s.valor)
        ]),
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255]
        }
      });
      
      // Usar didDrawPage para obter a última posição Y
      const finalY = (doc as any).lastAutoTable.finalY;
      yPos = finalY + 15;
      
      // Seção 2: Mecânicos
      doc.setFontSize(14);
      doc.text('Desempenho de Mecânicos', 14, yPos);
      yPos += 8;
      
      autoTable(doc, {
        head: [['Mecânico', 'Serviços', 'Comissão (R$)']],
        body: mecanicos.map(m => [
          m.nome,
          m.servicos,
          formatarValor(m.comissao)
        ]),
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255]
        }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Verifica se precisa de uma nova página
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      // Seção 3: Tipos de Serviços
      doc.setFontSize(14);
      doc.text('Tipos de Serviços', 14, yPos);
      yPos += 8;
      
      autoTable(doc, {
        head: [['Tipo', 'Quantidade', 'Valor (R$)']],
        body: tiposServico.map(t => [
          t.nome,
          t.quantidade,
          formatarValor(t.valor)
        ]),
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255]
        }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Verifica se precisa de uma nova página
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      // Seção 4: Vales
      doc.setFontSize(14);
      doc.text('Vales Emitidos', 14, yPos);
      yPos += 8;
      
      autoTable(doc, {
        head: [['Mês', 'Quantidade', 'Valor (R$)']],
        body: vales.map(v => [
          v.mes,
          v.quantidade,
          formatarValor(v.valor)
        ]),
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255]
        }
      });
      
      // Adiciona rodapé em todas as páginas
      const pageCount = (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
        doc.text('Sistema de Gestão de Oficina', 14, doc.internal.pageSize.height - 10);
      }
      
      // Salva o arquivo
      doc.save(`relatorio_completo_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF completo:", error);
      throw error;
    }
  } else {
    // Cria uma planilha para cada seção
    const wb = XLSX.utils.book_new();
    
    // Planilha de serviços por mês
    const wsServicos = XLSX.utils.json_to_sheet(servicos.map(s => ({
      "Mês": s.mes,
      "Quantidade": s.quantidade,
      "Valor (R$)": s.valor
    })));
    XLSX.utils.book_append_sheet(wb, wsServicos, 'Serviços por Mês');
    
    // Planilha de mecânicos
    const wsMecanicos = XLSX.utils.json_to_sheet(mecanicos.map(m => ({
      "Mecânico": m.nome,
      "Serviços": m.servicos,
      "Comissão (R$)": m.comissao
    })));
    XLSX.utils.book_append_sheet(wb, wsMecanicos, 'Mecânicos');
    
    // Planilha de tipos de serviços
    const wsTiposServico = XLSX.utils.json_to_sheet(tiposServico.map(t => ({
      "Tipo": t.nome,
      "Quantidade": t.quantidade,
      "Valor (R$)": t.valor
    })));
    XLSX.utils.book_append_sheet(wb, wsTiposServico, 'Tipos de Serviços');
    
    // Planilha de vales
    const wsVales = XLSX.utils.json_to_sheet(vales.map(v => ({
      "Mês": v.mes,
      "Quantidade": v.quantidade,
      "Valor (R$)": v.valor
    })));
    XLSX.utils.book_append_sheet(wb, wsVales, 'Vales');
    
    // Salva o arquivo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `relatorio_completo_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};

// Função para exportar relatório diário de mecânicos
export const exportarRelatorioDiarioMecanico = (
  mecanico: MecanicoRelatorio & {
    servicosDia: {
      descricao: string;
      valor: number;
      comissao: number;
    }[];
    vales: {
      data: string;
      valor: number;
      pago: boolean;
    }[];
    saldo: number;
    valorIssqn: number;
  },
  formato: 'pdf' | 'excel'
): void => {
  const titulo = `Relatório Diário - ${mecanico.nome}`;
  
  if (formato === 'pdf') {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Título principal
    doc.setFontSize(18);
    doc.text(titulo, 14, 20);
    doc.setFontSize(10);
    doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);
    
    let yPos = 35;
    
    // Resumo financeiro
    doc.setFontSize(14);
    doc.text('Resumo Financeiro', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.text(`Total de Serviços: ${mecanico.servicos}`, 14, yPos);
    yPos += 5;
    doc.text(`Valor Total: ${formatarValor(mecanico.comissao)}`, 14, yPos);
    yPos += 5;
    doc.text(`ISSQN (5%): ${formatarValor(mecanico.valorIssqn)}`, 14, yPos);
    yPos += 5;
    doc.text(`Total de Vales: ${formatarValor(mecanico.vales.reduce((acc, vale) => acc + (!vale.pago ? vale.valor : 0), 0))}`, 14, yPos);
    yPos += 5;
    doc.text(`Saldo Disponível: ${formatarValor(mecanico.saldo)}`, 14, yPos, { align: 'left' });
    yPos += 15;
    
    // Serviços do dia
    doc.setFontSize(14);
    doc.text('Serviços Realizados no Dia', 14, yPos);
    yPos += 8;
    
    autoTable(doc, {
      head: [['Descrição', 'Valor (R$)', 'Comissão (R$)']],
      body: mecanico.servicosDia.map(s => [
        s.descricao,
        formatarValor(s.valor),
        formatarValor(s.comissao)
      ]),
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255]
      }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Verifica se precisa de uma nova página
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }
    
    // Vales do mecânico
    if (mecanico.vales.length > 0) {
      doc.setFontSize(14);
      doc.text('Vales Pendentes', 14, yPos);
      yPos += 8;
      
      autoTable(doc, {
        head: [['Data', 'Valor (R$)', 'Status']],
        body: mecanico.vales.filter(v => !v.pago).map(v => [
          new Date(v.data).toLocaleDateString('pt-BR'),
          formatarValor(v.valor),
          v.pago ? 'Pago' : 'Pendente'
        ]),
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [66, 66, 66],
          textColor: [255, 255, 255]
        }
      });
    }
    
    // Adiciona rodapé em todas as páginas
    const pageCount = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
      doc.text('Sistema de Gestão de Oficina', 14, doc.internal.pageSize.height - 10);
    }
    
    // Salva o arquivo
    doc.save(`relatorio_diario_${mecanico.nome.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  } else {
    // Cria um workbook para Excel
    const wb = XLSX.utils.book_new();
    
    // Adiciona página com resumo
    const resumoData = [
      { "Item": "Total de Serviços", "Valor": mecanico.servicos },
      { "Item": "Valor Total", "Valor": mecanico.comissao },
      { "Item": "ISSQN (5%)", "Valor": mecanico.valorIssqn },
      { "Item": "Total de Vales", "Valor": mecanico.vales.reduce((acc, vale) => acc + (!vale.pago ? vale.valor : 0), 0) },
      { "Item": "Saldo Disponível", "Valor": mecanico.saldo }
    ];
    
    const wsResumo = XLSX.utils.json_to_sheet(resumoData);
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo');
    
    // Adiciona página com serviços
    const wsServicos = XLSX.utils.json_to_sheet(mecanico.servicosDia.map(s => ({
      "Descrição": s.descricao,
      "Valor (R$)": s.valor,
      "Comissão (R$)": s.comissao
    })));
    XLSX.utils.book_append_sheet(wb, wsServicos, 'Serviços do Dia');
    
    // Adiciona página com vales (se houver)
    if (mecanico.vales.length > 0) {
      const wsVales = XLSX.utils.json_to_sheet(mecanico.vales.filter(v => !v.pago).map(v => ({
        "Data": new Date(v.data).toLocaleDateString('pt-BR'),
        "Valor (R$)": v.valor,
        "Status": v.pago ? 'Pago' : 'Pendente'
      })));
      XLSX.utils.book_append_sheet(wb, wsVales, 'Vales');
    }
    
    // Salva o arquivo
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, `relatorio_diario_${mecanico.nome.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};
