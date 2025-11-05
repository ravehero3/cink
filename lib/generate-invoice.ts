import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    borderBottom: '1 solid #000000',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: '40%',
    fontSize: 10,
  },
  value: {
    width: '60%',
    fontSize: 10,
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #000000',
    paddingBottom: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    paddingBottom: 6,
    marginBottom: 6,
  },
  colProduct: {
    width: '45%',
  },
  colSize: {
    width: '15%',
  },
  colQty: {
    width: '10%',
  },
  colPrice: {
    width: '15%',
    textAlign: 'right',
  },
  colTotal: {
    width: '15%',
    textAlign: 'right',
  },
  totalsSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: '1 solid #000000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 6,
  },
  totalLabel: {
    width: 120,
    textAlign: 'right',
    marginRight: 20,
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1 solid #000000',
    paddingTop: 15,
    fontSize: 8,
    color: '#666666',
  },
});

interface InvoiceItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingMethod: string;
  zasilkovnaName?: string;
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentStatus: string;
}

export const InvoiceDocument = ({ data }: { data: InvoiceData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>UFO SPORT</Text>
        <Text style={styles.subtitle}>FAKTURA / INVOICE</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFORMACE O OBJEDNÁVCE</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Číslo objednávky:</Text>
          <Text style={styles.value}>{data.orderNumber}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Datum:</Text>
          <Text style={styles.value}>{data.orderDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Stav platby:</Text>
          <Text style={styles.value}>
            {data.paymentStatus === 'PAID' ? 'Zaplaceno' : 
             data.paymentStatus === 'PENDING' ? 'Čeká na platbu' : 
             data.paymentStatus === 'FAILED' ? 'Neúspěšná platba' : 
             data.paymentStatus}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ZÁKAZNÍK</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Jméno:</Text>
          <Text style={styles.value}>{data.customerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>E-mail:</Text>
          <Text style={styles.value}>{data.customerEmail}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Telefon:</Text>
          <Text style={styles.value}>{data.customerPhone}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>DOPRAVA</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Způsob dopravy:</Text>
          <Text style={styles.value}>
            {data.shippingMethod === 'zasilkovna' ? 'Zásilkovna' : data.shippingMethod}
          </Text>
        </View>
        {data.zasilkovnaName && (
          <View style={styles.row}>
            <Text style={styles.label}>Výdejní místo:</Text>
            <Text style={styles.value}>{data.zasilkovnaName}</Text>
          </View>
        )}
      </View>

      <View style={styles.table}>
        <Text style={styles.sectionTitle}>POLOŽKY</Text>
        <View style={styles.tableHeader}>
          <Text style={styles.colProduct}>Produkt</Text>
          <Text style={styles.colSize}>Velikost</Text>
          <Text style={styles.colQty}>Počet</Text>
          <Text style={styles.colPrice}>Cena/ks</Text>
          <Text style={styles.colTotal}>Celkem</Text>
        </View>
        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.colProduct}>{item.name}</Text>
            <Text style={styles.colSize}>{item.size}</Text>
            <Text style={styles.colQty}>{item.quantity}</Text>
            <Text style={styles.colPrice}>{item.price} Kč</Text>
            <Text style={styles.colTotal}>{item.price * item.quantity} Kč</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalsSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Mezisoučet:</Text>
          <Text style={styles.totalValue}>{data.subtotal} Kč</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Doprava:</Text>
          <Text style={styles.totalValue}>{data.shipping} Kč</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.totalLabel}>CELKEM:</Text>
          <Text style={styles.totalValue}>{data.total} Kč</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>UFO Sport • ufosport.cz • Děkujeme za vaši objednávku!</Text>
      </View>
    </Page>
  </Document>
);

export default InvoiceDocument;
