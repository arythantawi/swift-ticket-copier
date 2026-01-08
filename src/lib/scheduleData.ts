export interface Schedule {
  id: string;
  from: string;
  to: string;
  via?: string;
  pickupTime: string;
  category: string;
  price: number;
}

// Price constants (in thousands IDR)
const PRICE_DENPASAR = 300000;
const PRICE_JATIM = 170000;
const PRICE_BANYUWANGI = 220000;
const PRICE_JAKARTA = 550000;
const PRICE_JATENG = 200000;

export const schedules: Schedule[] = [
  // Jawa - Bali (Surabaya/Malang ke Denpasar)
  { id: 'sby-dps-16', from: 'Surabaya', to: 'Denpasar', pickupTime: '16.00', category: 'Jawa - Bali', price: PRICE_DENPASAR },
  { id: 'sby-dps-19', from: 'Surabaya', to: 'Denpasar', pickupTime: '19.00', category: 'Jawa - Bali', price: PRICE_DENPASAR },
  { id: 'sby-dps-20', from: 'Surabaya', to: 'Denpasar', pickupTime: '20.00', category: 'Jawa - Bali', price: PRICE_DENPASAR },
  { id: 'mlg-dps-16', from: 'Malang', to: 'Denpasar', pickupTime: '16.00', category: 'Jawa - Bali', price: PRICE_DENPASAR },
  { id: 'mlg-dps-19', from: 'Malang', to: 'Denpasar', pickupTime: '19.00', category: 'Jawa - Bali', price: PRICE_DENPASAR },
  { id: 'mlg-dps-20', from: 'Malang', to: 'Denpasar', pickupTime: '20.00', category: 'Jawa - Bali', price: PRICE_DENPASAR },
  
  // Malang - Surabaya (Jawa Timur)
  { id: 'mlg-sby-01', from: 'Malang', to: 'Surabaya', pickupTime: '01.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'mlg-sby-05', from: 'Malang', to: 'Surabaya', pickupTime: '05.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'mlg-sby-10', from: 'Malang', to: 'Surabaya', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-mlg-10', from: 'Surabaya', to: 'Malang', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-mlg-13', from: 'Surabaya', to: 'Malang', pickupTime: '13.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-mlg-16', from: 'Surabaya', to: 'Malang', pickupTime: '16.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-mlg-19', from: 'Surabaya', to: 'Malang', pickupTime: '19.00', category: 'Jawa Timur', price: PRICE_JATIM },
  
  // Blitar - Surabaya (Jawa Timur)
  { id: 'blt-sby-01', from: 'Blitar', to: 'Surabaya', pickupTime: '01.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'blt-sby-05', from: 'Blitar', to: 'Surabaya', pickupTime: '05.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'blt-sby-10', from: 'Blitar', to: 'Surabaya', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-blt-08', from: 'Surabaya', to: 'Blitar', pickupTime: '08.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-blt-10', from: 'Surabaya', to: 'Blitar', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-blt-13', from: 'Surabaya', to: 'Blitar', pickupTime: '13.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-blt-16', from: 'Surabaya', to: 'Blitar', pickupTime: '16.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-blt-19', from: 'Surabaya', to: 'Blitar', pickupTime: '19.00', category: 'Jawa Timur', price: PRICE_JATIM },
  
  // Kediri - Surabaya (Jawa Timur)
  { id: 'kdr-sby-01', from: 'Kediri', to: 'Surabaya', pickupTime: '01.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'kdr-sby-05', from: 'Kediri', to: 'Surabaya', pickupTime: '05.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'kdr-sby-08', from: 'Kediri', to: 'Surabaya', pickupTime: '08.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'kdr-sby-10', from: 'Kediri', to: 'Surabaya', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-kdr-08', from: 'Surabaya', to: 'Kediri', pickupTime: '08.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-kdr-10', from: 'Surabaya', to: 'Kediri', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-kdr-13', from: 'Surabaya', to: 'Kediri', pickupTime: '13.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-kdr-16', from: 'Surabaya', to: 'Kediri', pickupTime: '16.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-kdr-19', from: 'Surabaya', to: 'Kediri', pickupTime: '19.00', category: 'Jawa Timur', price: PRICE_JATIM },
  
  // Banyuwangi - Surabaya (Harga khusus Banyuwangi)
  { id: 'bwi-sby-17', from: 'Banyuwangi', to: 'Surabaya', pickupTime: '17.00', category: 'Jawa Timur', price: PRICE_BANYUWANGI },
  { id: 'bwi-sby-20', from: 'Banyuwangi', to: 'Surabaya', pickupTime: '20.00', category: 'Jawa Timur', price: PRICE_BANYUWANGI },
  { id: 'sby-bwi-16', from: 'Surabaya', to: 'Banyuwangi', pickupTime: '16.00', category: 'Jawa Timur', price: PRICE_BANYUWANGI },
  { id: 'sby-bwi-19', from: 'Surabaya', to: 'Banyuwangi', pickupTime: '19.00', category: 'Jawa Timur', price: PRICE_BANYUWANGI },
  { id: 'sby-bwi-21', from: 'Surabaya', to: 'Banyuwangi', pickupTime: '21.00', category: 'Jawa Timur', price: PRICE_BANYUWANGI },
  
  // Trenggalek - Surabaya (Jawa Timur)
  { id: 'trg-sby-07', from: 'Trenggalek', to: 'Surabaya', pickupTime: '07.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'trg-sby-10', from: 'Trenggalek', to: 'Surabaya', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-trg-10', from: 'Surabaya', to: 'Trenggalek', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-trg-13', from: 'Surabaya', to: 'Trenggalek', pickupTime: '13.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-trg-16', from: 'Surabaya', to: 'Trenggalek', pickupTime: '16.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-trg-19', from: 'Surabaya', to: 'Trenggalek', pickupTime: '19.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-trg-21', from: 'Surabaya', to: 'Trenggalek', pickupTime: '21.00', category: 'Jawa Timur', price: PRICE_JATIM },
  
  // Ponorogo - Madiun - Surabaya (Jawa Timur)
  { id: 'pnr-sby-01', from: 'Ponorogo', to: 'Surabaya', via: 'Madiun', pickupTime: '01.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'pnr-sby-05', from: 'Ponorogo', to: 'Surabaya', via: 'Madiun', pickupTime: '05.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'pnr-sby-08', from: 'Ponorogo', to: 'Surabaya', via: 'Madiun', pickupTime: '08.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'pnr-sby-10', from: 'Ponorogo', to: 'Surabaya', via: 'Madiun', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-pnr-10', from: 'Surabaya', to: 'Ponorogo', via: 'Madiun', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-pnr-13', from: 'Surabaya', to: 'Ponorogo', via: 'Madiun', pickupTime: '13.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-pnr-16', from: 'Surabaya', to: 'Ponorogo', via: 'Madiun', pickupTime: '16.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-pnr-19', from: 'Surabaya', to: 'Ponorogo', via: 'Madiun', pickupTime: '19.00', category: 'Jawa Timur', price: PRICE_JATIM },
  
  // Jember - Lumajang - Surabaya (Jawa Timur)
  { id: 'jbr-sby-20', from: 'Jember', to: 'Surabaya', via: 'Lumajang', pickupTime: '20.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'jbr-sby-01', from: 'Jember', to: 'Surabaya', via: 'Lumajang', pickupTime: '01.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'jbr-sby-05', from: 'Jember', to: 'Surabaya', via: 'Lumajang', pickupTime: '05.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'jbr-sby-10', from: 'Jember', to: 'Surabaya', via: 'Lumajang', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-jbr-10', from: 'Surabaya', to: 'Jember', via: 'Lumajang', pickupTime: '10.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-jbr-13', from: 'Surabaya', to: 'Jember', via: 'Lumajang', pickupTime: '13.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-jbr-16', from: 'Surabaya', to: 'Jember', via: 'Lumajang', pickupTime: '16.00', category: 'Jawa Timur', price: PRICE_JATIM },
  { id: 'sby-jbr-19', from: 'Surabaya', to: 'Jember', via: 'Lumajang', pickupTime: '19.00', category: 'Jawa Timur', price: PRICE_JATIM },
  
  // Jakarta - Surabaya (Harga khusus Jakarta)
  { id: 'jkt-sby-16', from: 'Jakarta', to: 'Surabaya', pickupTime: '16.00', category: 'Jawa - Jakarta', price: PRICE_JAKARTA },
  { id: 'jkt-sby-21', from: 'Jakarta', to: 'Surabaya', pickupTime: '21.00', category: 'Jawa - Jakarta', price: PRICE_JAKARTA },
  { id: 'jkt-sby-22', from: 'Jakarta', to: 'Surabaya', pickupTime: '22.00', category: 'Jawa - Jakarta', price: PRICE_JAKARTA },
  { id: 'sby-jkt-18', from: 'Surabaya', to: 'Jakarta', pickupTime: '18.00', category: 'Jawa - Jakarta', price: PRICE_JAKARTA },
  { id: 'sby-jkt-20', from: 'Surabaya', to: 'Jakarta', pickupTime: '20.00', category: 'Jawa - Jakarta', price: PRICE_JAKARTA },
  { id: 'sby-jkt-22', from: 'Surabaya', to: 'Jakarta', pickupTime: '22.00', category: 'Jawa - Jakarta', price: PRICE_JAKARTA },
  
  // Jogja - Solo - Surabaya (Jawa Tengah)
  { id: 'jog-sby-18', from: 'Jogja', to: 'Surabaya', via: 'Solo', pickupTime: '18.00', category: 'Jawa Tengah - DIY', price: PRICE_JATENG },
  { id: 'jog-sby-20', from: 'Jogja', to: 'Surabaya', via: 'Solo', pickupTime: '20.00', category: 'Jawa Tengah - DIY', price: PRICE_JATENG },
  { id: 'jog-sby-21', from: 'Jogja', to: 'Surabaya', via: 'Solo', pickupTime: '21.00', category: 'Jawa Tengah - DIY', price: PRICE_JATENG },
  { id: 'sby-jog-10', from: 'Surabaya', to: 'Jogja', via: 'Solo', pickupTime: '10.00', category: 'Jawa Tengah - DIY', price: PRICE_JATENG },
  { id: 'sby-jog-13', from: 'Surabaya', to: 'Jogja', via: 'Solo', pickupTime: '13.00', category: 'Jawa Tengah - DIY', price: PRICE_JATENG },
  { id: 'sby-jog-16', from: 'Surabaya', to: 'Jogja', via: 'Solo', pickupTime: '16.00', category: 'Jawa Tengah - DIY', price: PRICE_JATENG },
  { id: 'sby-jog-19', from: 'Surabaya', to: 'Jogja', via: 'Solo', pickupTime: '19.00', category: 'Jawa Tengah - DIY', price: PRICE_JATENG },
  { id: 'sby-jog-20', from: 'Surabaya', to: 'Jogja', via: 'Solo', pickupTime: '20.00', category: 'Jawa Tengah - DIY', price: PRICE_JATENG },
];

export const searchSchedules = (from: string, to: string): Schedule[] => {
  return schedules.filter(
    (s) => s.from.toLowerCase() === from.toLowerCase() && s.to.toLowerCase() === to.toLowerCase()
  );
};

export const getRoutePrice = (from: string, to: string): number => {
  const schedule = schedules.find(
    (s) => s.from.toLowerCase() === from.toLowerCase() && s.to.toLowerCase() === to.toLowerCase()
  );
  return schedule?.price || PRICE_JATIM;
};