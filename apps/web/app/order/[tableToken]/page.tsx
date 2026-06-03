import { MobileOrder } from "@/components/qr-order/mobile-order";

export default function QrOrderPage({ params }: { params: { tableToken: string } }) {
  return <MobileOrder token={params.tableToken} />;
}
