import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';
import Papa from 'papaparse';

/**
 * Exporta conteúdo em PDF
 * @param {string} title - Título do documento
 * @param {string} content - Conteúdo a exportar
 * @param {string} filename - Nome do arquivo
 */
export const exportToPDF = (title, content, filename = 'export.pdf') => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const lineHeight = 7;
    let yPosition = margin;

    // Adicionar título
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    const titleLines = pdf.splitTextToSize(title, pageWidth - 2 * margin);
    pdf.text(titleLines, margin, yPosition);
    yPosition += titleLines.length * lineHeight + 10;

    // Adicionar conteúdo
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    const contentLines = pdf.splitTextToSize(content, pageWidth - 2 * margin);
    
    contentLines.forEach((line) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });

    pdf.save(filename);
    return { success: true, message: 'PDF exportado com sucesso!' };
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    return { success: false, message: 'Erro ao exportar PDF' };
  }
};

/**
 * Exporta conteúdo em Word (.docx)
 * @param {string} title - Título do documento
 * @param {string} content - Conteúdo a exportar
 * @param {string} filename - Nome do arquivo
 */
export const exportToWord = async (title, content, filename = 'export.docx') => {
  try {
    const paragraphs = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: {
          after: 200
        }
      })
    ];

    // Dividir conteúdo em parágrafos
    const contentParagraphs = content.split('\n').filter(p => p.trim());
    contentParagraphs.forEach(para => {
      paragraphs.push(
        new Paragraph({
          text: para,
          spacing: {
            after: 100
          }
        })
      );
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, filename);
    
    return { success: true, message: 'Word exportado com sucesso!' };
  } catch (error) {
    console.error('Erro ao exportar Word:', error);
    return { success: false, message: 'Erro ao exportar Word' };
  }
};

/**
 * Exporta conteúdo em Markdown
 * @param {string} title - Título do documento
 * @param {string} content - Conteúdo a exportar
 * @param {string} filename - Nome do arquivo
 */
export const exportToMarkdown = (title, content, filename = 'export.md') => {
  try {
    const markdownContent = `# ${title}\n\n${content}`;
    downloadText(markdownContent, filename, 'text/markdown');
    return { success: true, message: 'Markdown exportado com sucesso!' };
  } catch (error) {
    console.error('Erro ao exportar Markdown:', error);
    return { success: false, message: 'Erro ao exportar Markdown' };
  }
};

/**
 * Exporta conteúdo em JSON
 * @param {Object} data - Dados a exportar
 * @param {string} filename - Nome do arquivo
 */
export const exportToJSON = (data, filename = 'export.json') => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadText(jsonContent, filename, 'application/json');
    return { success: true, message: 'JSON exportado com sucesso!' };
  } catch (error) {
    console.error('Erro ao exportar JSON:', error);
    return { success: false, message: 'Erro ao exportar JSON' };
  }
};

/**
 * Exporta dados em CSV (ideal para tabelas)
 * @param {Array} data - Array de objetos para exportar
 * @param {string} filename - Nome do arquivo
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  try {
    const csv = Papa.unparse(data);
    downloadText(csv, filename, 'text/csv');
    return { success: true, message: 'CSV exportado com sucesso!' };
  } catch (error) {
    console.error('Erro ao exportar CSV:', error);
    return { success: false, message: 'Erro ao exportar CSV' };
  }
};

/**
 * Função auxiliar para baixar texto como arquivo
 * @param {string} content - Conteúdo a baixar
 * @param {string} filename - Nome do arquivo
 * @param {string} mimeType - Tipo MIME do arquivo
 */
const downloadText = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
};

/**
 * Função auxiliar para baixar blob
 * @param {Blob} blob - Blob a baixar
 * @param {string} filename - Nome do arquivo
 */
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Formata data para nome de arquivo
 * @returns {string} Data formatada (YYYY-MM-DD-HH-MM-SS)
 */
export const getFormattedDateForFilename = () => {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace(/:/g, '-');
};

/**
 * Gera nome de arquivo com timestamp
 * @param {string} baseFilename - Nome base do arquivo
 * @param {string} extension - Extensão do arquivo
 * @returns {string} Nome do arquivo com timestamp
 */
export const generateFilename = (baseFilename, extension) => {
  const timestamp = getFormattedDateForFilename();
  return `${baseFilename}-${timestamp}.${extension}`;
};

/**
 * Exporta geração completa com metadados
 * @param {Object} generation - Objeto de geração com title, description, type, model, generation
 * @param {string} format - Formato de exportação (pdf, docx, md, json, csv)
 */
export const exportGeneration = (generation, format = 'pdf') => {
  const { description = 'Geração', type = '', model = '', generation: content = '' } = generation;
  const baseFilename = description.toLowerCase().replace(/\s+/g, '-');
  
  const metadata = {
    title: description,
    type,
    model,
    exportedAt: new Date().toISOString(),
    content
  };

  switch (format.toLowerCase()) {
    case 'pdf':
      return exportToPDF(description, content, generateFilename(baseFilename, 'pdf'));
    
    case 'docx':
    case 'word':
      return exportToWord(description, content, generateFilename(baseFilename, 'docx'));
    
    case 'md':
    case 'markdown':
      return exportToMarkdown(description, content, generateFilename(baseFilename, 'md'));
    
    case 'json':
      return exportToJSON(metadata, generateFilename(baseFilename, 'json'));
    
    case 'csv':
      // Para CSV, extrair dados tabulares se disponível
      const csvData = [
        { Field: 'Título', Value: description },
        { Field: 'Tipo', Value: type },
        { Field: 'Modelo', Value: model },
        { Field: 'Exportado em', Value: new Date().toISOString() },
        { Field: 'Conteúdo', Value: content.substring(0, 500) }
      ];
      return exportToCSV(csvData, generateFilename(baseFilename, 'csv'));
    
    default:
      return { success: false, message: 'Formato não suportado' };
  }
};
