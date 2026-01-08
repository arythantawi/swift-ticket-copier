import { jsPDF } from 'jspdf';

interface TripOperation {
  id: string;
  trip_date: string;
  route_from: string;
  route_to: string;
  route_via: string | null;
  pickup_time: string;
  total_passengers: number;
  income_tickets: number;
  income_other: number;
  expense_fuel: number;
  expense_ferry: number;
  expense_snack: number;
  expense_meals: number;
  expense_driver_commission: number;
  expense_driver_meals: number;
  expense_toll: number;
  expense_parking: number;
  expense_other: number;
  notes: string | null;
  driver_name: string | null;
  vehicle_number: string | null;
}

export const generateOperationPdf = (trip: TripOperation): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  
  // Colors
  const headerBg: [number, number, number] = [41, 128, 185];
  const tableBorder: [number, number, number] = [189, 195, 199];
  const tableHeaderBg: [number, number, number] = [236, 240, 241];
  const black: [number, number, number] = [44, 62, 80];
  const white: [number, number, number] = [255, 255, 255];
  const greenText: [number, number, number] = [39, 174, 96];
  const redText: [number, number, number] = [192, 57, 43];
  const blueText: [number, number, number] = [41, 128, 185];
  
  // Helper for currency formatting
  const formatPrice = (price: number): string => {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(price);
  };
  
  // Helper for date formatting
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const formatDateLong = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Calculate totals
  const totalExpense = 
    trip.expense_fuel + 
    trip.expense_ferry + 
    trip.expense_snack + 
    trip.expense_meals + 
    trip.expense_driver_commission + 
    trip.expense_driver_meals + 
    trip.expense_toll + 
    trip.expense_parking + 
    trip.expense_other;
  
  const totalIncome = trip.income_tickets + trip.income_other;
  const profit = totalIncome - totalExpense;
  
  let y = margin;
  const rowHeight = 10;
  const colLabel = 70;
  const colValue = contentWidth - colLabel;
  
  // === HEADER ===
  doc.setFillColor(...headerBg);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TRAVEL EXPRESS', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('LAPORAN OPERASIONAL PERJALANAN', pageWidth / 2, 25, { align: 'center' });
  
  doc.setFontSize(8);
  doc.text('Denpasar | Surabaya | www.travelexpress.com', pageWidth / 2, 32, { align: 'center' });
  
  y = 45;
  
  // === DOCUMENT INFO ===
  doc.setTextColor(...black);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, margin, y);
  doc.text(`ID: ${trip.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, y, { align: 'right' });
  
  y += 10;
  
  // === TABLE HELPER ===
  const drawTableRow = (label: string, value: string, options?: { bold?: boolean; bgColor?: [number, number, number]; textColor?: [number, number, number] }) => {
    // Background
    if (options?.bgColor) {
      doc.setFillColor(...options.bgColor);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    
    // Borders
    doc.setDrawColor(...tableBorder);
    doc.setLineWidth(0.3);
    doc.rect(margin, y, colLabel, rowHeight, 'S');
    doc.rect(margin + colLabel, y, colValue, rowHeight, 'S');
    
    // Text
    doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...black);
    doc.text(label, margin + 4, y + 7);
    
    if (options?.textColor) {
      doc.setTextColor(...options.textColor);
    }
    doc.text(value, margin + colLabel + colValue - 4, y + 7, { align: 'right' });
    
    y += rowHeight;
  };
  
  const drawSectionHeader = (title: string) => {
    doc.setFillColor(...headerBg);
    doc.rect(margin, y, contentWidth, rowHeight + 2, 'F');
    
    doc.setTextColor(...white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 4, y + 8);
    
    y += rowHeight + 2;
  };
  
  // === INFORMASI TRIP ===
  drawSectionHeader('INFORMASI PERJALANAN');
  
  drawTableRow('Asal (Dari)', trip.route_from.toUpperCase(), { bgColor: tableHeaderBg });
  if (trip.route_via) {
    drawTableRow('Via', trip.route_via.toUpperCase());
  }
  drawTableRow('Tujuan (Ke)', trip.route_to.toUpperCase(), { bgColor: tableHeaderBg });
  drawTableRow('Tanggal Berangkat', formatDateLong(trip.trip_date));
  drawTableRow('Jam Penjemputan', trip.pickup_time);
  drawTableRow('Sopir', trip.driver_name || '-');
  drawTableRow('Nomor Kendaraan', trip.vehicle_number || '-');
  drawTableRow('Jumlah Penumpang', `${trip.total_passengers} Orang`, { bold: true });
  
  y += 5;
  
  // === PEMASUKAN ===
  drawSectionHeader('PEMASUKAN');
  
  drawTableRow('Uang Tiket', formatPrice(trip.income_tickets), { textColor: greenText });
  if (trip.income_other > 0) {
    drawTableRow('Pemasukan Lain-lain', formatPrice(trip.income_other), { textColor: greenText });
  }
  drawTableRow('TOTAL PEMASUKAN', formatPrice(totalIncome), { bold: true, bgColor: [212, 239, 223], textColor: greenText });
  
  y += 5;
  
  // === PENGELUARAN ===
  drawSectionHeader('PENGELUARAN');
  
  if (trip.expense_fuel > 0) drawTableRow('Solar / BBM', formatPrice(trip.expense_fuel));
  if (trip.expense_ferry > 0) drawTableRow('Penyebrangan (Ferry)', formatPrice(trip.expense_ferry));
  if (trip.expense_snack > 0) drawTableRow('Snack', formatPrice(trip.expense_snack));
  if (trip.expense_meals > 0) drawTableRow('Makan Penumpang', formatPrice(trip.expense_meals));
  if (trip.expense_driver_commission > 0) drawTableRow('Komisi Sopir', formatPrice(trip.expense_driver_commission));
  if (trip.expense_driver_meals > 0) drawTableRow('Uang Makan Sopir', formatPrice(trip.expense_driver_meals));
  if (trip.expense_toll > 0) drawTableRow('Tol', formatPrice(trip.expense_toll));
  if (trip.expense_parking > 0) drawTableRow('Parkir', formatPrice(trip.expense_parking));
  if (trip.expense_other > 0) drawTableRow('Pengeluaran Lain-lain', formatPrice(trip.expense_other));
  
  drawTableRow('TOTAL PENGELUARAN', formatPrice(totalExpense), { bold: true, bgColor: [250, 219, 216], textColor: redText });
  
  y += 8;
  
  // === RINGKASAN ===
  drawSectionHeader('RINGKASAN KEUANGAN');
  
  drawTableRow('Total Pemasukan', formatPrice(totalIncome), { textColor: greenText });
  drawTableRow('Total Pengeluaran', formatPrice(totalExpense), { textColor: redText });
  
  // Profit row with special styling
  const profitBg: [number, number, number] = profit >= 0 ? [212, 239, 223] : [250, 219, 216];
  const profitColor: [number, number, number] = profit >= 0 ? greenText : redText;
  drawTableRow('JUMLAH BERSIH (PROFIT)', formatPrice(profit), { bold: true, bgColor: profitBg, textColor: profitColor });
  
  // === CATATAN ===
  if (trip.notes) {
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...black);
    doc.text('Catatan:', margin, y);
    
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const notesLines = doc.splitTextToSize(trip.notes, contentWidth);
    doc.text(notesLines, margin, y);
  }
  
  // === FOOTER ===
  const footerY = 275;
  
  doc.setDrawColor(...tableBorder);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Dokumen ini digenerate secara otomatis oleh sistem Travel Express.', margin, footerY);
  doc.text(`© ${new Date().getFullYear()} Travel Express - All Rights Reserved`, pageWidth - margin, footerY, { align: 'right' });
  
  // Save file
  const fileName = `Laporan-${trip.route_from}-${trip.route_to}-${formatDate(trip.trip_date).replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
};
